<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalyticsMetricResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'metric_type' => $this->metric_type,
            'metric_value' => $this->metric_value,
            'dimension_value' => $this->dimension_value,
            'metric_date' => $this->metric_date,
            'period' => $this->period,
            'created_at' => $this->created_at,
        ];
    }
}
