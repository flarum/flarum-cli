<?php

use Flarum\CliPhpSubsystem\ExtenderUtil;

require __DIR__ . '/vendor/autoload.php';

$input = json_decode(file_get_contents("php://stdin"), true);

try {
    switch ($input['op']) {
        case 'extender.add':
            $output = (new ExtenderUtil($input['extend.php']))->add($input['params']);
            break;

        case 'upgrade.2-0.misc':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\Misc())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;

        case 'upgrade.2-0.email-views':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\EmailViews())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;

        case 'upgrade.2-0.filesystem':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\Filesystem())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;

        case 'upgrade.2-0.intervention-image':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\InterventionImage())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;

        case 'upgrade.2-0.json-api':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\JsonApi())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;

        case 'upgrade.2-0.search':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\Search())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;

        case 'upgrade.2-0.phpunit':
            $output = (new Flarum\CliPhpSubsystem\Upgrade\TwoPointOh\PhpUnit())->handle($input['file'], $input['code'] ?? null, $input['data'] ?? []);
            break;
    }

    echo json_encode($output);
} catch (Throwable $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}


