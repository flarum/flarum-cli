<?php

namespace <%= classNamespace %>;

use Flarum\Console\AbstractCommand;

class <%= className %> extends AbstractCommand
{
    protected function configure()
    {
        $this
            ->setName('<%= commandName %>')
            ->setDescription('<%= commandDescription %>');
    }

    protected function fire(): int
    {
        // See https://docs.flarum.org/2.x/extend/console.html#console and
        // https://symfony.com/doc/current/console.html#configuring-the-command for more information.
    }
}
