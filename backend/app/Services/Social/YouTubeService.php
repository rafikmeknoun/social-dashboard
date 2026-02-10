<?php

namespace App\Services\Social;

use App\Models\SocialAccount;
use Carbon\Carbon;
use Google\Client;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use Illuminate\Support\Facades\Log;

class YouTubeService
{
    protected $client;
    protected $youtube;
    protected $analytics;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setDeveloperKey(config('services.youtube.api_key'));
        $this->youtube = new YouTube($this->client);
    }

    public function syncMetrics(SocialAccount $account): void
    {
        try {
            $this->syncChannelMetrics($account);
            $this->syncVideos($account);
        } catch (\Exception $e) {
            Log::error('YouTube sync error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function syncChannelMetrics(SocialAccount $account): void
    {
        // Get channel info
        $response = $this->youtube->channels->listChannels(
            'snippet,statistics,contentDetails',
            ['id' => $account->account_id]
        );

        if (empty($response['items'])) {
            return;
        }

        $channel = $response['items'][0];
        $statistics = $channel['statistics'];
        $snippet = $channel['snippet'];

        $account->update([
            'followers_count' => $statistics['subscriberCount'] ?? 0,
            'account_name' => $snippet['title'] ?? $account->account_name,
            'profile_picture' => $snippet['thumbnails']['default']['url'] ?? null,
        ]);

        // Store metrics
        $metrics = [
            'followers' => $statistics['subscriberCount'] ?? 0,
            'views' => $statistics['viewCount'] ?? 0,
            'videos' => $statistics['videoCount'] ?? 0,
        ];

        foreach ($metrics as $type => $value) {
            $account->metrics()->updateOrCreate(
                [
                    'metric_type' => $type,
                    'metric_date' => Carbon::today(),
                    'period' => 'daily',
                ],
                [
                    'metric_value' => $value,
                ]
            );
        }
    }

    protected function syncVideos(SocialAccount $account): void
    {
        $response = $this->youtube->search->listSearch('id,snippet', [
            'channelId' => $account->account_id,
            'order' => 'date',
            'maxResults' => 50,
            'type' => 'video',
        ]);

        $videoIds = [];
        foreach ($response['items'] as $item) {
            $videoIds[] = $item['id']['videoId'];
        }

        if (empty($videoIds)) {
            return;
        }

        // Get video statistics
        $videosResponse = $this->youtube->videos->listVideos(
            'statistics,snippet,contentDetails',
            ['id' => implode(',', $videoIds)]
        );

        foreach ($videosResponse['items'] as $video) {
            $snippet = $video['snippet'];
            $statistics = $video['statistics'];
            $contentDetails = $video['contentDetails'];

            $duration = $this->parseDuration($contentDetails['duration'] ?? 'PT0S');
            $views = $statistics['viewCount'] ?? 0;
            $likes = $statistics['likeCount'] ?? 0;
            $comments = $statistics['commentCount'] ?? 0;

            // Estimate watch time (average view duration * views)
            $avgViewDuration = $duration * 0.5; // Estimate 50% retention
            $watchTime = ($avgViewDuration * $views) / 60; // in minutes

            $engagementRate = $views > 0 ? (($likes + $comments) / $views) * 100 : 0;

            $account->posts()->updateOrCreate(
                ['post_id' => $video['id']],
                [
                    'content' => $snippet['title'] . "\n" . ($snippet['description'] ?? ''),
                    'media_url' => $snippet['thumbnails']['high']['url'] ?? null,
                    'post_type' => 'video',
                    'published_at' => Carbon::parse($snippet['publishedAt']),
                    'views_count' => $views,
                    'likes_count' => $likes,
                    'comments_count' => $comments,
                    'engagement_rate' => $engagementRate,
                    'metadata' => [
                        'duration' => $duration,
                        'watch_time_minutes' => $watchTime,
                        'tags' => $snippet['tags'] ?? [],
                        'category_id' => $snippet['categoryId'] ?? null,
                    ],
                ]
            );
        }
    }

    protected function parseDuration(string $duration): int
    {
        $interval = new \DateInterval($duration);
        return ($interval->h * 3600) + ($interval->i * 60) + $interval->s;
    }

    public function getAnalytics(SocialAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        try {
            $analytics = new YouTubeAnalytics($this->client);
            
            $response = $analytics->reports->query([
                'ids' => 'channel==' . $account->account_id,
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost',
                'dimensions' => 'day',
            ]);

            return $response->getRows() ?? [];
        } catch (\Exception $e) {
            Log::error('YouTube Analytics error: ' . $e->getMessage());
            return [];
        }
    }

    public function getVideoAnalytics(SocialAccount $account, string $videoId, Carbon $startDate, Carbon $endDate): array
    {
        try {
            $analytics = new YouTubeAnalytics($this->client);
            
            $response = $analytics->reports->query([
                'ids' => 'channel==' . $account->account_id,
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => 'views,estimatedMinutesWatched,averageViewPercentage,averageViewDuration,subscribersGained',
                'dimensions' => 'video',
                'filters' => 'video==' . $videoId,
            ]);

            return $response->getRows() ?? [];
        } catch (\Exception $e) {
            Log::error('YouTube Video Analytics error: ' . $e->getMessage());
            return [];
        }
    }

    public function getTopVideos(SocialAccount $account, int $limit = 10): array
    {
        $response = $this->youtube->search->listSearch('id,snippet', [
            'channelId' => $account->account_id,
            'order' => 'viewCount',
            'maxResults' => $limit,
            'type' => 'video',
        ]);

        return $response['items'] ?? [];
    }
}
