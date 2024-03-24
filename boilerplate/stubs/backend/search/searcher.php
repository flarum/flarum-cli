<?php

namespace <%= classNamespace %>;

use Flarum\Search\Filter\FilterManager;
use Flarum\Search\SearchCriteria;
use Flarum\Search\SearcherInterface;
use Flarum\Search\SearchResults;
use Flarum\Search\SearchState;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

abstract class <%= className %> implements SearcherInterface
{
    public function __construct(
        protected FilterManager $filters,
        /** @var array<callable> */
        protected array $mutators
    ) {
    }

    public function search(SearchCriteria $criteria): SearchResults
    {
        $state = new SearchState($criteria->actor, $criteria->isFulltext());

        $this->filters->apply($state, $criteria->filters);

        $this->applySort($state, $criteria);

        foreach ($this->mutators as $mutator) {
            $mutator($state, $criteria);
        }

        // $records = ...
        // $totalCount = ...
        // $areMoreResults = ...

        return new SearchResults($records, $areMoreResults, fn () => $totalCount);
    }
}
