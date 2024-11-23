<?php

namespace Flarum\CliPhpSubsystem\Upgrade;

class ReplacementResult
{
    /** @var string|array */
    public $updated;

    public $data;

    public function __construct($updated, $data = [])
    {
        $this->updated = $updated;
        $this->data = $data;
    }
}
