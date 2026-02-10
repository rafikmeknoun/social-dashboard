<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('social_account_id')->constrained()->onDelete('cascade');
            $table->string('post_id');
            $table->text('content')->nullable();
            $table->string('media_url')->nullable();
            $table->enum('post_type', ['image', 'video', 'carousel', 'story', 'reel', 'short', 'text', 'link']);
            $table->timestamp('published_at');
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('comments_count')->default(0);
            $table->unsignedBigInteger('shares_count')->default(0);
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('reach_count')->default(0);
            $table->decimal('engagement_rate', 8, 4)->default(0);
            $table->boolean('is_published')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['social_account_id', 'post_id']);
            $table->index('published_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_posts');
    }
};
