<?php

namespace Flarum\CliPhpSubsystem\Upgrade\TwoPointOh;

use Flarum\CliPhpSubsystem\Upgrade\Replacement;
use Flarum\CliPhpSubsystem\Upgrade\ReplacementResult;
use PhpParser\Modifiers;
use PhpParser\Node\ArrayItem;
use PhpParser\Node\PropertyItem;
use PhpParser\NodeVisitor;

class Misc extends Replacement
{
    function run(string $file, string $code, array $ast): ?ReplacementResult
    {
        if (strpos($file, 'extend.php') !== false) {
            return new ReplacementResult(
                $this->removeSecondArgFromNotificationTypeExtender($ast)
            );
        }

        return new ReplacementResult(
            $this->updateDatesToCasts($ast)
        );
    }

    private function updateDatesToCasts(array $ast): array
    {
        $traverser = $this->traverser();

        $traverser->addVisitor(new class () extends \PhpParser\NodeVisitorAbstract {
            public function enterNode(\PhpParser\Node $node)
            {
                if ($node instanceof \PhpParser\Node\Stmt\Class_) {
                    $dates = null;
                    $datesIndex = null;

                    foreach ($node->stmts as $index => $stmt) {
                        if ($stmt instanceof \PhpParser\Node\Stmt\Property) {
                            if ($stmt->props[0]->name->name === 'dates') {
                                $dates = $stmt->props[0]->default->items;
                                $datesIndex = $index;
                            }
                        }
                    }

                    if ($dates) {
                        $datesAsCasts = array_map(function (ArrayItem $date) {
                            return new \PhpParser\Node\Expr\ArrayItem(
                                new \PhpParser\Node\Scalar\String_('datetime'),
                                new \PhpParser\Node\Scalar\String_($date->value->value)
                            );
                        }, $dates);

                        $castsFound = false;

                        foreach ($node->stmts as $stmt) {
                            if ($stmt instanceof \PhpParser\Node\Stmt\Property) {
                                if ($stmt->props[0]->name->name === 'casts') {
                                    $stmt->props[0]->default->items = array_merge($stmt->props[0]->default->items, $datesAsCasts);
                                    unset($node->stmts[$datesIndex]);
                                    $castsFound = true;
                                }
                            }
                        }

                        if (! $castsFound) {
                            $node->stmts[$datesIndex] = new \PhpParser\Node\Stmt\Property(
                                Modifiers::PROTECTED,
                                [new PropertyItem('casts', new \PhpParser\Node\Expr\Array_($datesAsCasts))]
                            );
                        }

                        return NodeVisitor::STOP_TRAVERSAL;
                    }
                }
            }
        });

        return $traverser->traverse($ast);
    }

    private function removeSecondArgFromNotificationTypeExtender(array $ast): array
    {
        $traverser = $this->traverser();

        $traverser->addVisitor(new class () extends \PhpParser\NodeVisitorAbstract {
            public function enterNode(\PhpParser\Node $node)
            {
                if ($node instanceof \PhpParser\Node\Expr\MethodCall) {
                    if ($class = $this->getClass($node)) {
                        if ($class === 'Extend\Notification') {
                            if ($node->name->name === 'type') {
                                $args = $node->args;
                                unset($args[1]);
                                $node->args = array_values($args);
                            }
                        }
                    }
                }
            }

            private function getClass(\PhpParser\Node\Expr\MethodCall $node): ?string
            {
                if ($node->var instanceof \PhpParser\Node\Expr\New_ && $node->var->class instanceof \PhpParser\Node\Name) {
                    return $node->var->class->toString();
                }

                if ($node->var instanceof \PhpParser\Node\Expr\MethodCall) {
                    return $this->getClass($node->var);
                }

                return null;
            }
        });

        return $traverser->traverse($ast);
    }
}
