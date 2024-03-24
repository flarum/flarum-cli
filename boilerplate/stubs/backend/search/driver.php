<?php

namespace <%= classNamespace %>;

use Flarum\Search\AbstractDriver;

class <%= className %> extends AbstractDriver
{
    public static function name(): string
    {
        return '<%= driverName %>';
    }
}
