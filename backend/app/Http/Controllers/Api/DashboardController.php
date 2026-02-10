<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Models\Dashboard;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $dashboards = $request->user()->dashboards()->get();
        return DashboardResource::collection($dashboards);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'layout_config' => 'nullable|array',
            'widgets' => 'nullable|array',
            'is_default' => 'boolean',
        ]);

        if ($validated['is_default'] ?? false) {
            $request->user()->dashboards()->update(['is_default' => false]);
        }

        $dashboard = $request->user()->dashboards()->create($validated);

        return new DashboardResource($dashboard);
    }

    public function show(Request $request, Dashboard $dashboard)
    {
        $this->authorize('view', $dashboard);
        return new DashboardResource($dashboard);
    }

    public function update(Request $request, Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'layout_config' => 'nullable|array',
            'widgets' => 'nullable|array',
            'is_default' => 'boolean',
        ]);

        if (($validated['is_default'] ?? false) && !$dashboard->is_default) {
            $request->user()->dashboards()->update(['is_default' => false]);
        }

        $dashboard->update($validated);

        return new DashboardResource($dashboard);
    }

    public function destroy(Dashboard $dashboard)
    {
        $this->authorize('delete', $dashboard);
        $dashboard->delete();
        return response()->noContent();
    }

    public function share(Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        if (!$dashboard->share_token) {
            $dashboard->update([
                'share_token' => Str::random(32),
                'is_shared' => true,
            ]);
        }

        return response()->json([
            'share_url' => url('/shared/' . $dashboard->share_token),
        ]);
    }

    public function unshare(Dashboard $dashboard)
    {
        $this->authorize('update', $dashboard);

        $dashboard->update([
            'share_token' => null,
            'is_shared' => false,
        ]);

        return response()->noContent();
    }
}
