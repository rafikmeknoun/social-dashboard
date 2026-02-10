<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dashboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'layout_config',
        'widgets',
        'is_default',
        'is_shared',
        'share_token',
    ];

    protected $casts = [
        'layout_config' => 'array',
        'widgets' => 'array',
        'is_default' => 'boolean',
        'is_shared' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeShared($query)
    {
        return $query->where('is_shared', true);
    }
}
