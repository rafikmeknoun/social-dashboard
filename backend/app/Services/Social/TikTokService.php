<?php

namespace App\Services\Social;

use App\Models\SocialAccount;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TikTokService
{
    protected $baseUrl = 'https://open.tiktokapis.com/v2';

    public function syncMetrics(SocialAccount $account): void
    {
        try {
            $this->syncUserInfo($account);
            $this->syncVideos($account);
        } catch (\Exception $e) {
            Log::error('TikTok sync error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function syncUserInfo(SocialAccount $account): void
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $account->access_token,
        ])->get("{$this->baseUrl}/user/info/", [
            'fields' => 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count',
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to fetch TikTok user info: ' . $response->body());
        }

        $data = $response->json()['data'] ?? [];
        $user = $data['user'] ?? [];

        $account->update([
            'followers_count' => $user['follower_count'] ?? 0,
            'account_name' => $user['display_name'] ?? $account->account_name,
            'profile_picture' => $user['avatar_url'] ?? null,
        ]);

        // Store metrics
        $metrics = [
            'followers' => $user['follower_count'] ?? 0,
            'following' => $user['following_count'] ?? 0,
            'likes' => $user['likes_count'] ?? 0,
            'videos' => $user['video_count'] ?? 0,
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
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $account->access_token,
        ])->get("{$this->baseUrl}/video/list/", [
            'fields' => 'id,title,video_description,duration,create_time,cover_image_url,view_count,like_count,comment_count,share_count',
            'max_count' => 20,
        ]);

        if (!$response->successful()) {
            Log::error('TikTok video sync error: ' . $response->body());
            return;
        }

        $data = $response->json()['data'] ?? [];
        $videos = $data['videos'] ?? [];

        foreach ($videos as $video) {
            $views = $video['view_count'] ?? 0;
            $likes = $video['like_count'] ?? 0;
            $comments = $video['comment_count'] ?? 0;
            $shares = $video['share_count'] ?? 0;

            $engagementRate = $views > 0 ? (($likes + $comments + $shares) / $views) * 100 : 0;

            $account->posts()->updateOrCreate(
                ['post_id' => $video['id']],
                [
                    'content' => $video['title'] ?? $video['video_description'] ?? '',
                    'media_url' => $video['cover_image_url'] ?? null,
                    'post_type' => 'video',
                    'published_at' => Carbon::createFromTimestamp($video['create_time'] ?? time()),
                    'views_count' => $views,
                    'likes_count' => $likes,
                    'comments_count' => $comments,
                    'shares_count' => $shares,
                    'engagement_rate' => $engagementRate,
                    'metadata' => [
                        'duration' => $video['duration'] ?? 0,
                    ],
                ]
            );
        }
    }

    public function getVideoInsights(SocialAccount $account, string $videoId): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $account->access_token,
        ])->post("{$this->baseUrl}/video/query/", [
            'filters' => [
                'video_ids' => [$videoId],
            ],
            'fields' => 'id,view_count,like_count,comment_count,share_count,reach_count,
                        average_view_duration,total_play_time,traffic_source_types,
                        audience_countries,audience_genders,audience_ages',
        ]);

        if ($response->successful()) {
            $data = $response->json()['data'] ?? [];
            return $data['videos'][0] ?? [];
        }

        return [];
    }

    public function getFollowerInsights(SocialAccount $account): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $account->access_token,
        ])->get("{$this->baseUrl}/research/user/followers/", [
            'fields' => 'follower_count,follower_growth,follower_demographics',
        ]);

        if ($response->successful()) {
            return $response->json()['data'] ?? [];
        }

        return [];
    }

    public function refreshToken(SocialAccount $account): bool
    {
        $response = Http::post('https://open.tiktokapis.com/v2/oauth/token/', [
            'client_key' => config('services.tiktok.client_key'),
            'client_secret' => config('services.tiktok.client_secret'),
            'grant_type' => 'refresh_token',
            'refresh_token' => $account->refresh_token,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $account->update([
                'access_token' => $data['access_token'],
                'refresh_token' => $data['refresh_token'] ?? $account->refresh_token,
                'token_expires_at' => Carbon::now()->addSeconds($data['expires_in'] ?? 7200),
            ]);
            return true;
        }

        return false;
    }
}
