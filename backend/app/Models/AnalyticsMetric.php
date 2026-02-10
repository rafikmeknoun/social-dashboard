<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'analytics_account_id',
        'metric_type',
        'metric_value',
        'dimension_value',
        'metric_date',
        'period',
        'metadata',
    ];

    protected $casts = [
        'metric_date' => 'date',
        'metric_value' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function analyticsAccount()
    {
        return $this->belongsTo(AnalyticsAccount::class);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('metric_type', $type);
    }

    public function scopeByPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }
}
