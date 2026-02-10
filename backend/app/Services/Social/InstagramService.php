<?php

namespace App\Services\Social;

use App\Models\SocialAccount;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InstagramService
{
    protected $baseUrl = 'https://graph.facebook.com/v18.0';

    public function syncMetrics(SocialAccount $account): void
    {
        try {
            $this->syncAccountMetrics($account);
            $this->syncMedia($account);
        } catch (\Exception $e) {
            Log::error('Instagram sync error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function syncAccountMetrics(SocialAccount $account): void
    {
        // Get account info
        $response = Http::get("{$this->baseUrl}/{$account->account_id}", [
            'access_token' => $account->access_token,
            'fields' => 'followers_count,media_count,profile_picture_url,username,name',
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $account->update([
                'followers_count' => $data['followers_count'] ?? 0,
                'account_name' => $data['name'] ?? $data['username'] ?? $account->account_name,
                'account_username' => $data['username'] ?? $account->account_username,
                'profile_picture' => $data['profile_picture_url'] ?? null,
            ]);
        }

        // Get insights for business accounts
        $insights = Http::get("{$this->baseUrl}/{$account->account_id}/insights", [
            'access_token' => $account->access_token,
            'metric' => 'impressions,reach,profile_views,website_clicks',
            'period' => 'day',
            'since' => Carbon::now()->subDays(90)->format('Y-m-d'),
            'until' => Carbon::now()->subDays(1)->format('Y-m-d'),
        ]);

        if ($insights->successful()) {
            $data = $insights->json()['data'] ?? [];
            $this->storeInsights($account, $data);
        }
    }

    protected function syncMedia(SocialAccount $account): void
    {
        $response = Http::get("{$this->baseUrl}/{$account->account_id}/media", [
            'access_token' => $account->access_token,
            'fields' => 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,insights.metric(impressions,reach,engagement,saved)',
            'limit' => 100,
        ]);

        if (!$response->successful()) {
            return;
        }

        $media = $response->json()['data'] ?? [];

        foreach ($media as $item) {
            $insights = $item['insights']['data'] ?? [];
            $impressions = 0;
            $reach = 0;
            $engagement = 0;
            $saves = 0;

            foreach ($insights as $insight) {
                $value = $insight['values'][0]['value'] ?? 0;
                switch ($insight['name']) {
                    case 'impressions':
                        $impressions = $value;
                        break;
                    case 'reach':
                        $reach = $value;
                        break;
                    case 'engagement':
                        $engagement = $value;
                        break;
                    case 'saved':
                        $saves = $value;
                        break;
                }
            }

            $engagementRate = $reach > 0 ? ($engagement / $reach) * 100 : 0;

            $postType = match ($item['media_type'] ?? '') {
                'VIDEO' => 'video',
                'CAROUSEL_ALBUM' => 'carousel',
                'REELS' => 'reel',
                'STORY' => 'story',
                default => 'image',
            };

            $account->posts()->updateOrCreate(
                ['post_id' => $item['id']],
                [
                    'content' => $item['caption'] ?? '',
                    'media_url' => $item['media_url'] ?? $item['thumbnail_url'] ?? null,
                    'post_type' => $postType,
                    'published_at' => Carbon::parse($item['timestamp']),
                    'likes_count' => $item['like_count'] ?? 0,
                    'comments_count' => $item['comments_count'] ?? 0,
                    'views_count' => $impressions,
                    'reach_count' => $reach,
                    'engagement_rate' => $engagementRate,
                    'metadata' => [
                        'permalink' => $item['permalink'] ?? null,
                        'saves' => $saves,
                    ],
                ]
            );
        }
    }

    protected function storeInsights(SocialAccount $account, array $data): void
    {
        $metricMap = [
            'impressions' => 'impressions',
            'reach' => 'reach',
            'profile_views' => 'profile_views',
            'website_clicks' => 'website_clicks',
        ];

        foreach ($data as $item) {
            $metricType = $metricMap[$item['name']] ?? $item['name'];
            
            if (isset($item['values'])) {
                foreach ($item['values'] as $value) {
                    $date = Carbon::parse($value['end_time']);
                    
                    $account->metrics()->updateOrCreate(
                        [
                            'metric_type' => $metricType,
                            'metric_date' => $date,
                            'period' => 'daily',
                        ],
                        [
                            'metric_value' => $value['value'] ?? 0,
                        ]
                    );
                }
            }
        }
    }

    public function getStories(SocialAccount $account): array
    {
        $response = Http::get("{$this->baseUrl}/{$account->account_id}/stories", [
            'access_token' => $account->access_token,
            'fields' => 'id,media_type,media_url,timestamp,insights.metric(exits,replies,taps_forward,taps_back)',
        ]);

        if ($response->successful()) {
            return $response->json()['data'] ?? [];
        }

        return [];
    }
}
