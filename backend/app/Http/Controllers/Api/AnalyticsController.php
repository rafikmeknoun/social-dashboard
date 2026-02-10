<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnalyticsMetricResource;
use App\Services\Analytics\GoogleAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(GoogleAnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    public function accounts(Request $request)
    {
        $accounts = $request->user()
            ->analyticsAccounts()
            ->active()
            ->get();

        return response()->json($accounts);
    }

    public function overview(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'property_id' => 'nullable|string',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        $query = $request->user()->analyticsAccounts()->active();
        
        if (!empty($validated['property_id'])) {
            $query->where('property_id', $validated['property_id']);
        }

        $accounts = $query->get();
        $overview = [
            'total_sessions' => 0,
            'total_users' => 0,
            'total_pageviews' => 0,
            'avg_bounce_rate' => 0,
            'avg_session_duration' => 0,
            'new_users' => 0,
            'returning_users' => 0,
            'conversions' => 0,
            'revenue' => 0,
            'traffic_sources' => [],
            'top_pages' => [],
            'devices' => [],
        ];

        $bounceRates = [];
        $sessionDurations = [];

        foreach ($accounts as $account) {
            try {
                $metrics = $this->analyticsService->getOverviewMetrics(
                    $account,
                    $startDate,
                    $endDate
                );

                $overview['total_sessions'] += $metrics['sessions'] ?? 0;
                $overview['total_users'] += $metrics['users'] ?? 0;
                $overview['total_pageviews'] += $metrics['pageviews'] ?? 0;
                $overview['new_users'] += $metrics['new_users'] ?? 0;
                $overview['returning_users'] += $metrics['returning_users'] ?? 0;
                $overview['conversions'] += $metrics['conversions'] ?? 0;
                $overview['revenue'] += $metrics['revenue'] ?? 0;

                if (isset($metrics['bounce_rate'])) {
                    $bounceRates[] = $metrics['bounce_rate'];
                }
                if (isset($metrics['session_duration'])) {
                    $sessionDurations[] = $metrics['session_duration'];
                }

                // Merge traffic sources
                if (isset($metrics['traffic_sources'])) {
                    foreach ($metrics['traffic_sources'] as $source => $value) {
                        $overview['traffic_sources'][$source] = 
                            ($overview['traffic_sources'][$source] ?? 0) + $value;
                    }
                }

                // Merge devices
                if (isset($metrics['devices'])) {
                    foreach ($metrics['devices'] as $device => $value) {
                        $overview['devices'][$device] = 
                            ($overview['devices'][$device] ?? 0) + $value;
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Analytics sync error: ' . $e->getMessage());
            }
        }

        // Calculate averages
        if (count($bounceRates) > 0) {
            $overview['avg_bounce_rate'] = array_sum($bounceRates) / count($bounceRates);
        }
        if (count($sessionDurations) > 0) {
            $overview['avg_session_duration'] = array_sum($sessionDurations) / count($sessionDurations);
        }

        return response()->json($overview);
    }

    public function metrics(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'property_id' => 'nullable|string',
            'metric_types' => 'nullable|array',
            'dimensions' => 'nullable|array',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        $query = $request->user()->analyticsAccounts()->active();
        
        if (!empty($validated['property_id'])) {
            $query->where('property_id', $validated['property_id']);
        }

        $accounts = $query->with(['metrics' => function ($q) use ($startDate, $endDate, $validated) {
            $q->whereBetween('metric_date', [$startDate, $endDate]);
            if (!empty($validated['metric_types'])) {
                $q->whereIn('metric_type', $validated['metric_types']);
            }
        }])->get();

        $data = [];
        foreach ($accounts as $account) {
            $data[$account->property_id] = [
                'property_name' => $account->property_name,
                'website_url' => $account->website_url,
                'metrics' => AnalyticsMetricResource::collection($account->metrics),
            ];
        }

        return response()->json($data);
    }

    public function realtime(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|string',
        ]);

        $account = $request->user()
            ->analyticsAccounts()
            ->where('property_id', $validated['property_id'])
            ->firstOrFail();

        try {
            $realtimeData = $this->analyticsService->getRealtimeMetrics($account);
            return response()->json($realtimeData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur de récupération des données temps réel',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function sync(Request $request)
    {
        $validated = $request->validate([
            'property_id' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $account = $request->user()
            ->analyticsAccounts()
            ->where('property_id', $validated['property_id'])
            ->firstOrFail();

        try {
            $this->analyticsService->syncMetrics(
                $account,
                Carbon::parse($validated['start_date']),
                Carbon::parse($validated['end_date'])
            );

            return response()->json(['message' => 'Synchronisation réussie']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur de synchronisation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function trafficSources(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'property_id' => 'nullable|string',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);

        $query = $request->user()->analyticsAccounts()->active();
        
        if (!empty($validated['property_id'])) {
            $query->where('property_id', $validated['property_id']);
        }

        $accounts = $query->get();
        $trafficSources = [];

        foreach ($accounts as $account) {
            try {
                $sources = $this->analyticsService->getTrafficSources(
                    $account,
                    $startDate,
                    $endDate
                );
                
                foreach ($sources as $source => $value) {
                    $trafficSources[$source] = ($trafficSources[$source] ?? 0) + $value;
                }
            } catch (\Exception $e) {
                \Log::error('Traffic sources error: ' . $e->getMessage());
            }
        }

        return response()->json($trafficSources);
    }

    public function topPages(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'property_id' => 'required|string',
            'limit' => 'integer|min:1|max:50',
        ]);

        $account = $request->user()
            ->analyticsAccounts()
            ->where('property_id', $validated['property_id'])
            ->firstOrFail();

        try {
            $topPages = $this->analyticsService->getTopPages(
                $account,
                Carbon::parse($validated['start_date']),
                Carbon::parse($validated['end_date']),
                $validated['limit'] ?? 10
            );

            return response()->json($topPages);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur de récupération des pages',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
