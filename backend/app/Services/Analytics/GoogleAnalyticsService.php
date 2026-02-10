<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsAccount;
use Carbon\Carbon;
use Google\Analytics\Data\V1beta\BetaAnalyticsDataClient;
use Google\Analytics\Data\V1beta\DateRange;
use Google\Analytics\Data\V1beta\Dimension;
use Google\Analytics\Data\V1beta\Metric;
use Google\Analytics\Data\V1beta\RunReportRequest;
use Illuminate\Support\Facades\Log;

class GoogleAnalyticsService
{
    protected $client;

    public function __construct()
    {
        $credentialsPath = config('services.google.credentials_path');
        
        if ($credentialsPath && file_exists($credentialsPath)) {
            $this->client = new BetaAnalyticsDataClient([
                'credentials' => $credentialsPath,
            ]);
        }
    }

    public function syncMetrics(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): void
    {
        if (!$this->client) {
            throw new \Exception('Google Analytics client not initialized');
        }

        try {
            $this->syncSessionMetrics($account, $startDate, $endDate);
            $this->syncTrafficSourceMetrics($account, $startDate, $endDate);
            $this->syncDeviceMetrics($account, $startDate, $endDate);
            $this->syncPageMetrics($account, $startDate, $endDate);
        } catch (\Exception $e) {
            Log::error('Google Analytics sync error: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function syncSessionMetrics(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): void
    {
        $request = new RunReportRequest([
            'property' => 'properties/' . $account->property_id,
            'date_ranges' => [new DateRange([
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ])],
            'metrics' => [
                new Metric(['name' => 'sessions']),
                new Metric(['name' => 'totalUsers']),
                new Metric(['name' => 'newUsers']),
                new Metric(['name' => 'screenPageViews']),
                new Metric(['name' => 'bounceRate']),
                new Metric(['name' => 'averageSessionDuration']),
                new Metric(['name' => 'conversions']),
                new Metric(['name' => 'totalRevenue']),
            ],
            'dimensions' => [new Dimension(['name' => 'date'])],
        ]);

        $response = $this->client->runReport($request);

        foreach ($response->getRows() as $row) {
            $date = Carbon::parse($row->getDimensionValues()[0]->getValue());
            $metrics = $row->getMetricValues();

            $metricData = [
                'sessions' => $metrics[0]->getValue(),
                'users' => $metrics[1]->getValue(),
                'new_users' => $metrics[2]->getValue(),
                'pageviews' => $metrics[3]->getValue(),
                'bounce_rate' => $metrics[4]->getValue(),
                'session_duration' => $metrics[5]->getValue(),
                'conversions' => $metrics[6]->getValue(),
                'revenue' => $metrics[7]->getValue(),
            ];

            foreach ($metricData as $type => $value) {
                $account->metrics()->updateOrCreate(
                    [
                        'metric_type' => $type,
                        'metric_date' => $date,
                        'period' => 'daily',
                    ],
                    [
                        'metric_value' => $value,
                    ]
                );
            }
        }
    }

    protected function syncTrafficSourceMetrics(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): void
    {
        $request = new RunReportRequest([
            'property' => 'properties/' . $account->property_id,
            'date_ranges' => [new DateRange([
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ])],
            'metrics' => [new Metric(['name' => 'sessions'])],
            'dimensions' => [
                new Dimension(['name' => 'date']),
                new Dimension(['name' => 'sessionDefaultChannelGroup']),
            ],
        ]);

        $response = $this->client->runReport($request);

        $trafficData = [];
        foreach ($response->getRows() as $row) {
            $dimensions = $row->getDimensionValues();
            $date = $dimensions[0]->getValue();
            $channel = $dimensions[1]->getValue();
            $value = $row->getMetricValues()[0]->getValue();

            if (!isset($trafficData[$date])) {
                $trafficData[$date] = [];
            }
            $trafficData[$date][$channel] = $value;
        }

        foreach ($trafficData as $date => $channels) {
            $parsedDate = Carbon::parse($date);
            
            foreach ($channels as $channel => $value) {
                $metricType = $this->mapChannelToMetricType($channel);
                
                $account->metrics()->updateOrCreate(
                    [
                        'metric_type' => $metricType,
                        'metric_date' => $parsedDate,
                        'period' => 'daily',
                    ],
                    [
                        'metric_value' => $value,
                        'dimension_value' => $channel,
                    ]
                );
            }
        }
    }

    protected function syncDeviceMetrics(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): void
    {
        $request = new RunReportRequest([
            'property' => 'properties/' . $account->property_id,
            'date_ranges' => [new DateRange([
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ])],
            'metrics' => [new Metric(['name' => 'sessions'])],
            'dimensions' => [
                new Dimension(['name' => 'date']),
                new Dimension(['name' => 'deviceCategory']),
            ],
        ]);

        $response = $this->client->runReport($request);

        foreach ($response->getRows() as $row) {
            $dimensions = $row->getDimensionValues();
            $date = Carbon::parse($dimensions[0]->getValue());
            $device = $dimensions[1]->getValue();
            $value = $row->getMetricValues()[0]->getValue();

            $account->metrics()->updateOrCreate(
                [
                    'metric_type' => 'device_' . strtolower($device),
                    'metric_date' => $date,
                    'period' => 'daily',
                ],
                [
                    'metric_value' => $value,
                    'dimension_value' => $device,
                ]
            );
        }
    }

    protected function syncPageMetrics(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): void
    {
        $request = new RunReportRequest([
            'property' => 'properties/' . $account->property_id,
            'date_ranges' => [new DateRange([
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ])],
            'metrics' => [
                new Metric(['name' => 'screenPageViews']),
                new Metric(['name' => 'averageSessionDuration']),
            ],
            'dimensions' => [
                new Dimension(['name' => 'pagePath']),
                new Dimension(['name' => 'pageTitle']),
            ],
        ]);

        $response = $this->client->runReport($request);

        // Store top pages in metadata
        $topPages = [];
        foreach ($response->getRows() as $row) {
            $dimensions = $row->getDimensionValues();
            $metrics = $row->getMetricValues();
            
            $topPages[] = [
                'path' => $dimensions[0]->getValue(),
                'title' => $dimensions[1]->getValue(),
                'views' => $metrics[0]->getValue(),
                'avg_duration' => $metrics[1]->getValue(),
            ];
        }

        // Store in cache or database for quick access
        cache()->put(
            "analytics:{$account->id}:top_pages",
            $topPages,
            now()->addHours(6)
        );
    }

    public function getOverviewMetrics(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        if (!$this->client) {
            return [];
        }

        try {
            $request = new RunReportRequest([
                'property' => 'properties/' . $account->property_id,
                'date_ranges' => [new DateRange([
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                ])],
                'metrics' => [
                    new Metric(['name' => 'sessions']),
                    new Metric(['name' => 'totalUsers']),
                    new Metric(['name' => 'newUsers']),
                    new Metric(['name' => 'screenPageViews']),
                    new Metric(['name' => 'bounceRate']),
                    new Metric(['name' => 'averageSessionDuration']),
                    new Metric(['name' => 'conversions']),
                    new Metric(['name' => 'totalRevenue']),
                ],
            ]);

            $response = $this->client->runReport($request);
            $row = $response->getRows()[0] ?? null;

            if (!$row) {
                return [];
            }

            $metrics = $row->getMetricValues();

            return [
                'sessions' => (int) $metrics[0]->getValue(),
                'users' => (int) $metrics[1]->getValue(),
                'new_users' => (int) $metrics[2]->getValue(),
                'pageviews' => (int) $metrics[3]->getValue(),
                'bounce_rate' => (float) $metrics[4]->getValue(),
                'session_duration' => (float) $metrics[5]->getValue(),
                'conversions' => (int) $metrics[6]->getValue(),
                'revenue' => (float) $metrics[7]->getValue(),
            ];
        } catch (\Exception $e) {
            Log::error('GA4 overview error: ' . $e->getMessage());
            return [];
        }
    }

    public function getRealtimeMetrics(AnalyticsAccount $account): array
    {
        if (!$this->client) {
            return [];
        }

        try {
            $request = new RunReportRequest([
                'property' => 'properties/' . $account->property_id,
                'date_ranges' => [new DateRange([
                    'start_date' => 'today',
                    'end_date' => 'today',
                ])],
                'metrics' => [
                    new Metric(['name' => 'activeUsers']),
                    new Metric(['name' => 'screenPageViews']),
                ],
            ]);

            $response = $this->client->runReport($request);
            $row = $response->getRows()[0] ?? null;

            if (!$row) {
                return ['active_users' => 0, 'pageviews' => 0];
            }

            $metrics = $row->getMetricValues();

            return [
                'active_users' => (int) $metrics[0]->getValue(),
                'pageviews' => (int) $metrics[1]->getValue(),
            ];
        } catch (\Exception $e) {
            Log::error('GA4 realtime error: ' . $e->getMessage());
            return ['active_users' => 0, 'pageviews' => 0];
        }
    }

    public function getTrafficSources(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate): array
    {
        if (!$this->client) {
            return [];
        }

        try {
            $request = new RunReportRequest([
                'property' => 'properties/' . $account->property_id,
                'date_ranges' => [new DateRange([
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                ])],
                'metrics' => [new Metric(['name' => 'sessions'])],
                'dimensions' => [new Dimension(['name' => 'sessionDefaultChannelGroup'])],
            ]);

            $response = $this->client->runReport($request);

            $sources = [];
            foreach ($response->getRows() as $row) {
                $channel = $row->getDimensionValues()[0]->getValue();
                $value = $row->getMetricValues()[0]->getValue();
                $sources[$channel] = (int) $value;
            }

            return $sources;
        } catch (\Exception $e) {
            Log::error('GA4 traffic sources error: ' . $e->getMessage());
            return [];
        }
    }

    public function getTopPages(AnalyticsAccount $account, Carbon $startDate, Carbon $endDate, int $limit = 10): array
    {
        // Try to get from cache first
        $cached = cache()->get("analytics:{$account->id}:top_pages");
        if ($cached) {
            return array_slice($cached, 0, $limit);
        }

        return [];
    }

    protected function mapChannelToMetricType(string $channel): string
    {
        return match (strtolower($channel)) {
            'organic search' => 'organic_search',
            'direct' => 'direct_traffic',
            'referral' => 'referral_traffic',
            'organic social' => 'social_traffic',
            'paid search', 'paid social' => 'paid_traffic',
            default => 'other_traffic',
        };
    }
}
