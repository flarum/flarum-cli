<?php

namespace <%= classNamespace %>;

use Flarum\Search\Database\DatabaseSearchState;
use Flarum\Search\Filter\FilterInterface;
use Flarum\Search\SearchState;
use Flarum\User\User;
use Illuminate\Database\Query\Builder;

/**
 * @implements FilterInterface<DatabaseSearchState>
 */
class <%= className %> implements FilterInterface
{
    public function getFilterKey(): string
    {
        return '<%= filterKey %>';
    }

    public function filter(SearchState $state, string|array $value, bool $negate): void
    {
        // @TODO: implement filter logic
    }
}
