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
        <%- dependencies.map(item => `$this->${item[1]} = $${item[1]};`).join("\n\t\t") %>
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
