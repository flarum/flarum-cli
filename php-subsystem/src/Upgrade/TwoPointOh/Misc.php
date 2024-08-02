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

class Misc extends Replacement
{
    protected function operations(): array
    {
        return ['run', 'types'];
    }

    function run(string $file, string $code, array $ast, array $data): ?ReplacementResult
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

    function types(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        $traverser = $this->traverser();

        $traverser->addVisitor(new NodeVisitor\NameResolver(null, [
            'replaceNodes' => false,
        ]));
        $traverser->addVisitor(new NodeVisitor\ParentConnectingVisitor());

        $traverser->addVisitor(new ChangeSignatures([
            'Flarum\\Notification\\Blueprint\\BlueprintInterface' => [
                'getFromUser' => [
                    'return' => ['\Flarum\User\User', 'null']
                ],
                'getSubject' => [
                    'return' => ['\Flarum\Database\AbstractModel', 'null']
                ],
                'getData' => [
                    'return' => ['mixed']
                ],
                'getType' => [
                    'return' => ['string']
                ],
                'getSubjectModel' => [
                    'return' => ['string']
                ],
            ],
            'Flarum\\Notification\\MailableInterface' => [
                'getEmailView' => [
                    'rename' => 'getEmailViews',
                    'return' => ['array']
                ],
                'getEmailSubject' => [
                    'params' => [
                        'translator' => ['\Flarum\Locale\TranslatorInterface'],
                    ],
                    'return' => ['string']
                ],
            ],
        ], function (Node $node) {
            if ($node instanceof Node\Stmt\Return_
                && $node->expr instanceof Node\Scalar\String_
                && $node->getAttribute('parent') instanceof Node\Stmt\ClassMethod
                && in_array($node->getAttribute('parent')->name->name, ['getEmailView', 'getEmailViews'])
            ) {
                $node->expr = new Node\Expr\Array_([
                    new Node\Expr\ArrayItem(
                        $node->expr,
                        new Node\Scalar\String_('text')
                    ),
                ]);
            }

            if ($node instanceof Node\Stmt\ClassMethod
                && $node->name->name == 'getData'
                && empty($node->stmts)
            ) {
                // return []
                $node->stmts = [
                    new Node\Stmt\Return_(
                        new Node\Expr\Array_([], ['kind' => Node\Expr\Array_::KIND_SHORT])
                    )
                ];
            }
        }));

        return new ReplacementResult($traverser->traverse($ast));
    }
}
