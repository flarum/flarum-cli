<?php

namespace <%= classNamespace %>;

use Flarum\User\User;

class <%= className %>
{
    public function __construct(<% if (!['create', 'none'].includes(classType)) { %>
        public int $modelId;
<% } %>
        public User $actor;
        public array $data;
    ) {
    }
}
