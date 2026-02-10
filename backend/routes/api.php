<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SocialMetricsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Auth
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/avatar', [AuthController::class, 'updateAvatar']);

    // Dashboards
    Route::apiResource('dashboards', DashboardController::class);
    Route::post('dashboards/{dashboard}/share', [DashboardController::class, 'share']);
    Route::delete('dashboards/{dashboard}/share', [DashboardController::class, 'unshare']);

    // Social Media Metrics
    Route::prefix('social')->group(function () {
        Route::get('/accounts', [SocialMetricsController::class, 'accounts']);
        Route::get('/overview', [SocialMetricsController::class, 'overview']);
        Route::get('/metrics', [SocialMetricsController::class, 'metrics']);
        Route::get('/posts', [SocialMetricsController::class, 'posts']);
        Route::post('/sync/{account}', [SocialMetricsController::class, 'sync']);
    });

    // Google Analytics
    Route::prefix('analytics')->group(function () {
        Route::get('/accounts', [AnalyticsController::class, 'accounts']);
        Route::get('/overview', [AnalyticsController::class, 'overview']);
        Route::get('/metrics', [AnalyticsController::class, 'metrics']);
        Route::get('/realtime', [AnalyticsController::class, 'realtime']);
        Route::get('/traffic-sources', [AnalyticsController::class, 'trafficSources']);
        Route::get('/top-pages', [AnalyticsController::class, 'topPages']);
        Route::post('/sync', [AnalyticsController::class, 'sync']);
    });

    // Reports
    Route::prefix('reports')->group(function () {
        Route::post('/generate', [ReportController::class, 'generate']);
        Route::get('/templates', [ReportController::class, 'templates']);
        Route::post('/schedule', [ReportController::class, 'schedule']);
        Route::get('/scheduled', [ReportController::class, 'scheduled']);
        Route::delete('/scheduled/{id}', [ReportController::class, 'deleteScheduled']);
    });
});

// Shared dashboard (public)
Route::get('/shared/{token}', [DashboardController::class, 'shared'])->name('dashboard.shared');
