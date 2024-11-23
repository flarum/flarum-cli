<?php

namespace <%= classNamespace %>;

use Flarum\Foundation\AbstractServiceProvider;
use Illuminate\Contracts\Container\Container;

class <%= className %> extends AbstractServiceProvider
{
    public function register()
    {
        // See https://docs.flarum.org/2.x/extend/service-provider.html#service-provider for more information.
    }

    public function boot(Container $container)
    {
        // ...
    }
}
