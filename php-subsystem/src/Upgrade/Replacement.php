<?php

namespace Flarum\CliPhpSubsystem\Upgrade;

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

    protected function run(string $file, string $code, array $ast, array $data): ?ReplacementResult {
        return null;
    }

    public function handle(string $file, ?string $code, array $data = []): array
    {
        $parser = (new ParserFactory())->createForHostVersion();
        $printer = new PrettyPrinter\Standard();

        $code = $code ?: file_get_contents($file);

        foreach ($this->operations() as $operation) {
            $ast = $parser->parse($code);
            $tokens = $parser->getTokens();

            /** @var ReplacementResult $result */
            $result = $this->$operation($file, $code, $ast, $data);

            if ($result) {
                $code = is_string($result->updated)
                    ? $result->updated
                    : $printer->printFormatPreserving($result->updated, $ast, $tokens);

                $data = array_merge($data, $result->data);
            }
        }

        return array_merge(compact('code'), $data);
    }

    protected function traverser(): NodeTraverser
    {
        return new NodeTraverser(new CloningVisitor());
    }
}
