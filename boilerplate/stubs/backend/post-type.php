<?php

namespace <%= classNamespace %>;

use Carbon\Carbon;
use Flarum\Post\AbstractEventPost;
use Flarum\Post\MergeableInterface; // implement if a new post type can be merged into a previous one.
use Flarum\Post\Post;

class <%= className %> extends AbstractEventPost
{
    public static string $type = '<%= postType %>';

    /*
     * Use this method to create the new post type.
     */
    public static function reply(int $discussionId, int $userId): static
    {
        $post = new static;

        $post->content = static::buildContent();
        $post->created_at = Carbon::now();
        $post->discussion_id = $discussionId;
        $post->user_id = $userId;

        return $post;
    }

    public static function buildContent(): array
    {
        return [
            // Add the content of the post type here.
        ];
    }
}
