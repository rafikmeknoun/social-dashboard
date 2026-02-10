<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocialMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'social_account_id',
        'metric_type',
        'metric_value',
        'metric_date',
        'period',
        'metadata',
    ];

    protected $casts = [
        'metric_date' => 'date',
        'metric_value' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function socialAccount()
    {
        return $this->belongsTo(SocialAccount::class);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('metric_type', $type);
    }

    public function scopeByPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }

    public function scopeDaily($query)
    {
        return $query->where('period', 'daily');
    }

    public function scopeWeekly($query)
    {
        return $query->where('period', 'weekly');
    }

    public function scopeMonthly($query)
    {
        return $query->where('period', 'monthly');
    }
}
