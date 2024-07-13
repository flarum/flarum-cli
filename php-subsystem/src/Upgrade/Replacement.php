<?php

namespace Flarum\CliPhpSubsystem\Upgrade;

use Flarum\CliPhpSubsystem\NodeVisitors\ReplaceUses;
use PhpParser\NodeTraverser;
use PhpParser\NodeVisitor\CloningVisitor;
use PhpParser\ParserFactory;
use PhpParser\PrettyPrinter;

abstract class Replacement
{
    protected function operations(): array
    {
        return ['run'];
    }

    protected function run(string $file, string $code, array $ast): ?ReplacementResult {
        return null;
    }

    public function handle(string $file): string
    {
        $parser = (new ParserFactory())->createForHostVersion();
        $printer = new PrettyPrinter\Standard();

        $code = file_get_contents($file);

        foreach ($this->operations() as $operation) {
            $ast = $parser->parse($code);
            $tokens = $parser->getTokens();

            $result = $this->$operation($file, $code, $ast);

            if ($result) {
                $code = is_string($result->updated)
                    ? $result->updated
                    : $printer->printFormatPreserving($result->updated, $ast, $tokens);
            }
        }

        return $code;
    }

    protected function traverser(): NodeTraverser
    {
        return new NodeTraverser(new CloningVisitor());
    }
}
