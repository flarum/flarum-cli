<?php

namespace Flarum\CliPhpSubsystem\Upgrade\TwoPointOh;

use Flarum\CliPhpSubsystem\NodeVisitors\ChangeSignatures;
use Flarum\CliPhpSubsystem\Upgrade\Replacement;
use Flarum\CliPhpSubsystem\Upgrade\ReplacementResult;
use PhpParser\Modifiers;
use PhpParser\Node;
use PhpParser\Node\ArrayItem;
use PhpParser\Node\PropertyItem;
use PhpParser\NodeVisitor;

class EmailViews extends Replacement
{
    protected function operations(): array
    {
        return ['run'];
    }

    function run(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, 'extend.php') !== false || strpos($file, '.blade.php') !== false) {
            return null;
        }

        $traverser = $this->traverser();

        $traverser->addVisitor(new NodeVisitor\NameResolver(null, [
            'replaceNodes' => false,
        ]));

        $traverser->addVisitor($visitor = new class () extends \PhpParser\NodeVisitorAbstract {
            public $collect = [];

            protected $interface = 'Flarum\Notification\MailableInterface';

            public function enterNode(\PhpParser\Node $node)
            {
                if ($node instanceof \PhpParser\Node\Stmt\Class_ && (!$node->implements || ! in_array($this->interface, array_map(function ($interface) { return $interface->getAttribute('resolvedName')->name; }, $node->implements)))) {
                    return NodeVisitor::DONT_TRAVERSE_CHILDREN;
                }

                // Find the getEmailViews method, and extract the array returned as a value.
                if ($node instanceof \PhpParser\Node\Stmt\ClassMethod && $node->name->name === 'getEmailViews' && ! empty($node->stmts) && count($node->stmts) === 1 && $node->stmts[0] instanceof \PhpParser\Node\Stmt\Return_) {
                    foreach ($node->stmts[0]->expr->items as $item) {
                        if ($item instanceof ArrayItem && $item->key instanceof Node\Scalar\String_ && in_array($item->key->value, ['text', 'html'])) {
                            $this->collect[$item->key->value] = $item->value->value;
                        }
                    }
                }
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof \PhpParser\Node\Stmt\Class_ && (!$node->implements || ! in_array($this->interface, array_map(function ($interface) { return $interface->getAttribute('resolvedName')->name; }, $node->implements)))) {
                    return NodeVisitor::STOP_TRAVERSAL;
                }

                // Find the getEmailViews method, and extract the array returned as a value.
                if ($node instanceof \PhpParser\Node\Stmt\ClassMethod && $node->name->name === 'getEmailViews' && ! empty($node->stmts) && count($node->stmts) === 1 && $node->stmts[0] instanceof \PhpParser\Node\Stmt\Return_) {
                    $hasViews = [];

                    foreach ($node->stmts[0]->expr->items as $item) {
                        if ($item instanceof ArrayItem && $item->key instanceof Node\Scalar\String_ && in_array($item->key->value, ['text', 'html'])) {
                            $hasViews[] = $item->key->value;
                        }
                    }

                    if (count($hasViews) === 1) {
                        $view = $node->stmts[0]->expr->items[0]->value->value;
                        $viewNamespace = explode('::', $view)[0];
                        $viewName = explode('::', $view)[1];
                        $newView = $viewNamespace . '::email.{type}.' . $viewName;
                        $node->stmts[0]->expr->items[0]->value->value = str_replace('{type}', $node->stmts[0]->expr->items[0]->key->value, $newView);
                        $otherType = $node->stmts[0]->expr->items[0]->key->value === 'text' ? 'html' : 'text';

                        $node->stmts[0]->expr->items[] = new ArrayItem(
                            new Node\Scalar\String_(str_replace('{type}', $otherType, $newView)),
                            new Node\Scalar\String_($otherType)
                        );
                    }
                }
            }
        });

        $ast = $traverser->traverse($ast);

        $collected = $visitor->collect;

        return new ReplacementResult($ast, compact('collected'));
    }
}
