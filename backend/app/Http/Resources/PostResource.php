<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'content' => $this->content,
            'media_url' => $this->media_url,
            'post_type' => $this->post_type,
            'published_at' => $this->published_at,
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'shares_count' => $this->shares_count,
            'views_count' => $this->views_count,
            'reach_count' => $this->reach_count,
            'engagement_rate' => $this->engagement_rate,
            'social_account' => new SocialAccountResource($this->whenLoaded('socialAccount')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
