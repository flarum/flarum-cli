<?php

namespace <%= classNamespace %>;

use Flarum\User\User;
use Illuminate\Database\Eloquent\Builder;
use <%= modelClass %>;

class <%= className %>
{
    public function query(): Builder
    {
        return <%= modelClassName %>::query();
    }

    public function findOrFail(int|string $id, User $actor = null): <%= modelClassName %>
    {
        return <%= modelClassName %>::findOrFail($id);
    }
}
