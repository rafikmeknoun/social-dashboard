<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'property_id',
        'property_name',
        'website_url',
        'credentials_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $hidden = [
        'credentials_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function metrics()
    {
        return $this->hasMany(AnalyticsMetric::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
