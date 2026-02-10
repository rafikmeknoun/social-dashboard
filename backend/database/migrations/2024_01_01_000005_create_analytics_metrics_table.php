<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_metrics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('analytics_account_id')->constrained()->onDelete('cascade');
            $table->enum('metric_type', [
                'sessions',
                'users',
                'pageviews',
                'bounce_rate',
                'session_duration',
                'new_users',
                'returning_users',
                'conversions',
                'revenue',
                'transactions',
                'average_order_value',
                'pages_per_session',
                'exit_rate',
                'organic_search',
                'direct_traffic',
                'referral_traffic',
                'social_traffic',
                'paid_traffic',
            ]);
            $table->decimal('metric_value', 20, 4);
            $table->string('dimension_value')->nullable();
            $table->date('metric_date');
            $table->enum('period', ['daily', 'weekly', 'monthly', 'yearly'])->default('daily');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['analytics_account_id', 'metric_type', 'metric_date']);
            $table->index('metric_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_metrics');
    }
};
