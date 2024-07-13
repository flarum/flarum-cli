<?php

use Flarum\CliPhpSubsystem\ExtenderUtil;

require __DIR__ . '/vendor/autoload.php';

$input = json_decode(file_get_contents("php://stdin"), true);

switch ($input['op']) {
    case 'extender.add':
        $output = (new ExtenderUtil($input['extend.php']))->add($input['params']);
        break;

    case 'upgrade.2-0.misc':
        $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\Misc())->handle($input['file']);
        break;

    case 'upgrade.2-0.filesystem':
        $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\Filesystem())->handle($input['file']);
        break;
}

echo $output;


