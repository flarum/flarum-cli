<?php

namespace <%= classNamespace %>;

use Illuminate\Support\Arr;<% if (locals.repositoryClassName) { %>
use <%= repositoryClass %>;<% } %><% if (locals.validatorClassName) { %>
use <%= validatorClass %>;<% } %>

class <%= className %>
{
    public function __construct(<% if (locals.repositoryClassName) { %>
        protected <%= repositoryClassName %> $repository;
<% } %><% if (locals.validatorClassName) { %>
        protected <%= validatorClassName %> $validator;
<% } %>) {
    }

    public function handle(<%= handlerCommandClassName %> $command)
    {
        $actor = $command->actor;
        $data = $command->data;

        $actor->assertCan('...');

        // ...

        return $model;
    }
}
