<?php

namespace Flarum\CliPhpSubsystem\Upgrade\TwoPointOh;

use Flarum\CliPhpSubsystem\NodeVisitors\ReplaceUses;
use Flarum\CliPhpSubsystem\Upgrade\Replacement;
use Flarum\CliPhpSubsystem\Upgrade\ReplacementResult;
use PhpParser\NodeVisitor;

class Filesystem extends Replacement
{
    protected function operations(): array
    {
        return ['replaceUses', 'run'];
    }

    protected function replaceUses(string $file, string $code, array $ast): ?ReplacementResult
    {
        $traverser = $this->traverser();

        // replace NullAdapter with InMemoryFilesystemAdapter (League\Flysystem\Adapter\NullAdapter -> League\Flysystem\Adapter\InMemoryFilesystemAdapter)
        // replace Local with LocalFilesystemAdapter (League\Flysystem\Adapter\Local -> League\Flysystem\Local\LocalFilesystemAdapter)
        // replace MemoryAdapter with InMemoryFilesystemAdapter (League\Flysystem\Memory\MemoryAdapter -> League\Flysystem\InMemory\InMemoryFilesystemAdapter)
        $traverser->addVisitor(new ReplaceUses([
            [
                'from' => 'League\\Flysystem\\Adapter\\NullAdapter',
                'to' => 'League\\Flysystem\\InMemory\\InMemoryFilesystemAdapter'
            ],
            [
                'from' => 'League\\Flysystem\\Adapter\\Local',
                'to' => 'League\\Flysystem\\Local\\LocalFilesystemAdapter'
            ],
            [
                'from' => 'League\\Flysystem\\Memory\\MemoryAdapter',
                'to' => 'League\\Flysystem\\InMemory\\InMemoryFilesystemAdapter'
            ],
            [
                'from' => 'League\\Flysystem\\AdapterInterface',
                'to' => 'League\\Flysystem\\FilesystemAdapter'
            ],
            [
                'from' => 'League\\Flysystem\\AwsS3v3\\AwsS3Adapter',
                'to' => 'League\\Flysystem\\AwsS3V3\\AwsS3V3Adapter'
            ]
        ]));

        return new ReplacementResult($traverser->traverse($ast));
    }

    function run(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        $traverser = $this->traverser();

        // before
        // new FilesystemAdapter(new Filesystem(new LocalAdapter($path)));
        //
        // after
        // new FilesystemAdapter(new Filesystem($adapter = new LocalAdapter($path)), $adapter);
        $traverser->addVisitor(new class () extends \PhpParser\NodeVisitorAbstract {
            public function enterNode(\PhpParser\Node $node)
            {
                if ($node instanceof \PhpParser\Node\Expr\New_) {
                    if ($node->class->name === 'FilesystemAdapter' && count($node->args) === 1) {
                        $filesystem = $node->args[0]->value;

                        if ($filesystem instanceof \PhpParser\Node\Expr\New_ && $filesystem->class->name === 'Filesystem') {
                            $adapter = $filesystem->args[0]->value;

                            if ($adapter instanceof \PhpParser\Node\Expr\New_) {
                                // Turn into a variable assignment
                                $filesystem->args[0] = new \PhpParser\Node\Arg(new \PhpParser\Node\Expr\Assign($var = new \PhpParser\Node\Expr\Variable('adapter'), $adapter));
                            } else {
                                $var = $adapter;
                            }

                            // Add the new argument
                            $node->args[] = new \PhpParser\Node\Arg($var);

                            return NodeVisitor::DONT_TRAVERSE_CHILDREN;
                        }
                    }
                }
            }
        });

        return new ReplacementResult($traverser->traverse($ast));
    }
}
