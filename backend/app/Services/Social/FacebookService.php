<?php

namespace App\Services\Social;

use App\Models\SocialAccount;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookService
{
    protected $baseUrl = 'https://graph.facebook.com/v18.0';

    public function syncMetrics(SocialAccount $account): void
    {
        try {
            $this->syncPageMetrics($account);
            $this->syncPosts($account);
        } catch (\Exception $e) {
            Log::error('Facebook sync error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function syncPageMetrics(SocialAccount $account): void
    {
        $metrics = [
            'page_fan_adds',
            'page_impressions',
            'page_engaged_users',
            'page_views_total',
            'page_actions_post_reactions_total',
            'page_posts_impressions',
        ];

        $endDate = Carbon::now()->subDays(1);
        $startDate = Carbon::now()->subDays(90);

        foreach ($metrics as $metric) {
            $response = Http::get("{$this->baseUrl}/{$account->account_id}/insights", [
                'access_token' => $account->access_token,
                'metric' => $metric,
                'period' => 'day',
                'since' => $startDate->format('Y-m-d'),
                'until' => $endDate->format('Y-m-d'),
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->storeMetrics($account, $metric, $data['data'] ?? []);
            }
        }

        // Update followers count
        $pageInfo = Http::get("{$this->baseUrl}/{$account->account_id}", [
            'access_token' => $account->access_token,
            'fields' => 'fan_count,name,picture',
        ]);

        if ($pageInfo->successful()) {
            $info = $pageInfo->json();
            $account->update([
                'followers_count' => $info['fan_count'] ?? 0,
                'account_name' => $info['name'] ?? $account->account_name,
                'profile_picture' => $info['picture']['data']['url'] ?? null,
            ]);
        }
    }

    protected function syncPosts(SocialAccount $account): void
    {
        $response = Http::get("{$this->baseUrl}/{$account->account_id}/posts", [
            'access_token' => $account->access_token,
            'fields' => 'id,message,created_time,full_picture,attachments{type,media_type},insights.metric(post_impressions,post_engaged_users,post_reactions_by_type_total)',
            'limit' => 100,
        ]);

        if (!$response->successful()) {
            return;
        }

        $posts = $response->json()['data'] ?? [];

        foreach ($posts as $post) {
            $insights = $post['insights']['data'] ?? [];
            $impressions = 0;
            $engagedUsers = 0;
            $reactions = 0;

            foreach ($insights as $insight) {
                switch ($insight['name']) {
                    case 'post_impressions':
                        $impressions = $insight['values'][0]['value'] ?? 0;
                        break;
                    case 'post_engaged_users':
                        $engagedUsers = $insight['values'][0]['value'] ?? 0;
                        break;
                    case 'post_reactions_by_type_total':
                        $reactions = array_sum($insight['values'][0]['value'] ?? []);
                        break;
                }
            }

            $postType = 'text';
            if (isset($post['attachments']['data'][0])) {
                $attachment = $post['attachments']['data'][0];
                $postType = match ($attachment['type'] ?? '') {
                    'video' => 'video',
                    'photo' => 'image',
                    'album' => 'carousel',
                    default => 'link',
                };
            }

            $engagementRate = $impressions > 0 ? ($engagedUsers / $impressions) * 100 : 0;

            $account->posts()->updateOrCreate(
                ['post_id' => $post['id']],
                [
                    'content' => $post['message'] ?? '',
                    'media_url' => $post['full_picture'] ?? null,
                    'post_type' => $postType,
                    'published_at' => Carbon::parse($post['created_time']),
                    'views_count' => $impressions,
                    'reach_count' => $impressions,
                    'likes_count' => $reactions,
                    'engagement_rate' => $engagementRate,
                    'metadata' => [
                        'raw_insights' => $insights,
                    ],
                ]
            );
        }
    }

    protected function storeMetrics(SocialAccount $account, string $metricType, array $data): void
    {
        $metricMap = [
            'page_fan_adds' => 'followers',
            'page_impressions' => 'impressions',
            'page_engaged_users' => 'engagement',
            'page_views_total' => 'views',
            'page_actions_post_reactions_total' => 'likes',
            'page_posts_impressions' => 'reach',
        ];

        $mappedType = $metricMap[$metricType] ?? $metricType;

        foreach ($data as $item) {
            if (isset($item['values'])) {
                foreach ($item['values'] as $value) {
                    $date = Carbon::parse($value['end_time']);
                    
                    $account->metrics()->updateOrCreate(
                        [
                            'metric_type' => $mappedType,
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

    public function getPageInsights(SocialAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        $response = Http::get("{$this->baseUrl}/{$account->account_id}/insights", [
            'access_token' => $account->access_token,
            'metric' => 'page_fan_adds,page_impressions,page_engaged_users,page_views_total',
            'period' => 'day',
            'since' => $startDate->format('Y-m-d'),
            'until' => $endDate->format('Y-m-d'),
        ]);

        if ($response->successful()) {
            return $response->json()['data'] ?? [];
        }

        return [];
    }
}
