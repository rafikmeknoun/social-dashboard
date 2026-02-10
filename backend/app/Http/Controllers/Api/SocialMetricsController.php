<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MetricResource;
use App\Http\Resources\PostResource;
use App\Http\Resources\SocialAccountResource;
use App\Models\SocialAccount;
use App\Services\Social\FacebookService;
use App\Services\Social\InstagramService;
use App\Services\Social\TikTokService;
use App\Services\Social\YouTubeService;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SocialMetricsController extends Controller
{
    protected $facebookService;
    protected $instagramService;
    protected $tiktokService;
    protected $youtubeService;

    public function __construct(
        FacebookService $facebookService,
        InstagramService $instagramService,
        TikTokService $tiktokService,
        YouTubeService $youtubeService
    ) {
        $this->facebookService = $facebookService;
        $this->instagramService = $instagramService;
        $this->tiktokService = $tiktokService;
        $this->youtubeService = $youtubeService;
    }

    public function accounts(Request $request)
    {
        $accounts = $request->user()
            ->socialAccounts()
            ->active()
            ->get();

        return SocialAccountResource::collection($accounts);
    }

    public function overview(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'platforms' => 'nullable|array',
            'platforms.*' => 'in:facebook,instagram,tiktok,youtube,twitter,linkedin',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $platforms = $validated['platforms'] ?? [];

        $query = $request->user()->socialAccounts()->active();
        
        if (!empty($platforms)) {
            $query->whereIn('platform', $platforms);
        }

        $accounts = $query->get();
        $overview = [
            'total_followers' => 0,
            'total_views' => 0,
            'total_reach' => 0,
            'total_engagement' => 0,
            'total_likes' => 0,
            'total_comments' => 0,
            'total_shares' => 0,
            'platforms' => [],
        ];

        foreach ($accounts as $account) {
            $metrics = $this->getMetricsForAccount($account, $startDate, $endDate);
            
            $overview['total_followers'] += $metrics['followers'] ?? 0;
            $overview['total_views'] += $metrics['views'] ?? 0;
            $overview['total_reach'] += $metrics['reach'] ?? 0;
            $overview['total_engagement'] += $metrics['engagement'] ?? 0;
            $overview['total_likes'] += $metrics['likes'] ?? 0;
            $overview['total_comments'] += $metrics['comments'] ?? 0;
            $overview['total_shares'] += $metrics['shares'] ?? 0;

            $overview['platforms'][$account->platform] = [
                'followers' => $metrics['followers'] ?? 0,
                'views' => $metrics['views'] ?? 0,
                'reach' => $metrics['reach'] ?? 0,
                'engagement_rate' => $metrics['engagement_rate'] ?? 0,
            ];
        }

        return response()->json($overview);
    }

    public function metrics(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'platforms' => 'nullable|array',
            'platforms.*' => 'in:facebook,instagram,tiktok,youtube,twitter,linkedin',
            'metric_types' => 'nullable|array',
            'period' => 'in:daily,weekly,monthly',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $platforms = $validated['platforms'] ?? [];
        $metricTypes = $validated['metric_types'] ?? [];
        $period = $validated['period'] ?? 'daily';

        $query = $request->user()->socialAccounts()->active();
        
        if (!empty($platforms)) {
            $query->whereIn('platform', $platforms);
        }

        $accounts = $query->with(['metrics' => function ($q) use ($startDate, $endDate, $metricTypes) {
            $q->whereBetween('metric_date', [$startDate, $endDate]);
            if (!empty($metricTypes)) {
                $q->whereIn('metric_type', $metricTypes);
            }
        }])->get();

        $data = [];
        foreach ($accounts as $account) {
            $data[$account->platform] = [
                'account' => new SocialAccountResource($account),
                'metrics' => MetricResource::collection($account->metrics),
            ];
        }

        return response()->json($data);
    }

    public function posts(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'platforms' => 'nullable|array',
            'platforms.*' => 'in:facebook,instagram,tiktok,youtube,twitter,linkedin',
            'sort_by' => 'in:published_at,views,likes,engagement',
            'sort_order' => 'in:asc,desc',
            'limit' => 'integer|min:1|max:100',
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['end_date']);
        $platforms = $validated['platforms'] ?? [];
        $sortBy = $validated['sort_by'] ?? 'published_at';
        $sortOrder = $validated['sort_order'] ?? 'desc';
        $limit = $validated['limit'] ?? 50;

        $query = \App\Models\SocialPost::query()
            ->whereHas('socialAccount', function ($q) use ($request, $platforms) {
                $q->where('user_id', $request->user()->id);
                if (!empty($platforms)) {
                    $q->whereIn('platform', $platforms);
                }
            })
            ->whereBetween('published_at', [$startDate, $endDate]);

        $query->orderBy($sortBy, $sortOrder);

        $posts = $query->paginate($limit);

        return PostResource::collection($posts);
    }

    public function sync(Request $request, SocialAccount $account)
    {
        $this->authorize('view', $account);

        try {
            switch ($account->platform) {
                case 'facebook':
                    $this->facebookService->syncMetrics($account);
                    break;
                case 'instagram':
                    $this->instagramService->syncMetrics($account);
                    break;
                case 'tiktok':
                    $this->tiktokService->syncMetrics($account);
                    break;
                case 'youtube':
                    $this->youtubeService->syncMetrics($account);
                    break;
            }

            return response()->json(['message' => 'Synchronisation réussie']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur de synchronisation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function getMetricsForAccount(SocialAccount $account, Carbon $startDate, Carbon $endDate)
    {
        return $account->metrics()
            ->whereBetween('metric_date', [$startDate, $endDate])
            ->get()
            ->groupBy('metric_type')
            ->map(function ($items) {
                return $items->sum('metric_value');
            })
            ->toArray();
    }
}
