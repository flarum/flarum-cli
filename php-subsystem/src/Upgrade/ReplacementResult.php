<?php

namespace Flarum\CliPhpSubsystem\Upgrade;

class ReplacementResult
{
    /** @var string|array */
    public $updated;

    public function __construct($updated)
    {
        $this->updated = $updated;
    }
}
