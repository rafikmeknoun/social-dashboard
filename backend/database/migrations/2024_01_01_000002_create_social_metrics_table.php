<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('social_account_id')->constrained()->onDelete('cascade');
            $table->enum('metric_type', [
                'followers',
                'views',
                'reach',
                'impressions',
                'engagement',
                'likes',
                'comments',
                'shares',
                'saves',
                'clicks',
                'profile_views',
                'website_clicks',
                'minutes_watched',
                'subscribers',
                'revenue',
                'watch_time',
                'average_view_duration',
                'audience_retention',
            ]);
            $table->decimal('metric_value', 20, 2);
            $table->date('metric_date');
            $table->enum('period', ['daily', 'weekly', 'monthly', 'yearly'])->default('daily');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['social_account_id', 'metric_type', 'metric_date']);
            $table->index('metric_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_metrics');
    }
};
