<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'social_account_id',
        'post_id',
        'content',
        'media_url',
        'post_type',
        'published_at',
        'likes_count',
        'comments_count',
        'shares_count',
        'views_count',
        'reach_count',
        'engagement_rate',
        'is_published',
        'metadata',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'shares_count' => 'integer',
        'views_count' => 'integer',
        'reach_count' => 'integer',
        'engagement_rate' => 'decimal:4',
        'is_published' => 'boolean',
        'metadata' => 'array',
    ];

    public function socialAccount()
    {
        return $this->belongsTo(SocialAccount::class);
    }

    public function scopeByPlatform($query, $platform)
    {
        return $query->whereHas('socialAccount', function ($q) use ($platform) {
            $q->where('platform', $platform);
        });
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('published_at', [$startDate, $endDate]);
    }
}
