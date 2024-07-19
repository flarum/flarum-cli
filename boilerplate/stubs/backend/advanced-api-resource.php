<?php

namespace <%= classNamespace %>;

use Flarum\Api\Context;
use Flarum\Api\Endpoint;
use Flarum\Api\Resource;
use Flarum\Api\Schema;
use Flarum\Api\Sort\SortColumn;
use <%= modelClass %>;
use Illuminate\Database\Eloquent\Builder;
use Tobyz\JsonApiServer\Context as OriginalContext;

/**
 * @extends Resource\AbstractDatabaseResource<<%= modelClassName %>>
 */
class <%= className %> extends Resource\AbstractDatabaseResource
{
    public function type(): string
    {
        return '<%= modelType %>';
    }

    public function model(): string
    {
        return <%= modelClassName %>::class;
    }

    public function scope(Builder $query, OriginalContext $context): void
    {
        $query->whereVisibleTo($context->getActor());
    }

    public function endpoints(): array
    {
        return [<% if (endpoints.includes('create')) { %>
            Endpoint\Create::make()
                ->can('create<%= modelClassName %>'),<% } %><% if (endpoints.includes('update')) { %>
            Endpoint\Update::make()
                ->can('update'),<% } %><% if (endpoints.includes('delete')) { %>
            Endpoint\Delete::make()
                ->can('delete'),<% } %><% if (endpoints.includes('show')) { %>
            Endpoint\Show::make()
                ->authenticated(),<% } %><% if (endpoints.includes('list')) { %>
            Endpoint\Index::make()
                ->paginate(),<% } %>
        ];
    }

    public function fields(): array
    {
        return [

            /**
             * @todo migrate logic from old serializer and controllers to this API Resource.
             * @see https://docs.flarum.org/extend/api#api-resources
             */

            // Example:
            Schema\Str::make('name')
                ->requiredOnCreate()
                ->minLength(3)
                ->maxLength(255)
                ->writable(),

<% (relations || []).forEach(([name,type]) => { %>
            Schema\Relationship\<% if (type === 'hasOne') { %>ToOne<% } else { %>ToMany<% } %>::make('<%= name %>')
                ->includable()
                // ->inverse('?') // the inverse relationship name if any.
                ->type('<%= name %>s'), // the serialized type of this relation (type of the relation model's API resource).<% }) %>
        ];
    }

    public function sorts(): array
    {
        return [
            // SortColumn::make('createdAt'),
        ];
    }
}
