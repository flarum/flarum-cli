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
    protected $carbonDiffMethods = [
        'diffAsDateInterval',
        'diffAsCarbonInterval',
        'diffInUnit',
        'diffInYears',
        'diffInQuarters',
        'diffInMonths',
        'diffInWeeks',
        'diffInDays',
        'diffInWeekdays',
        'diffInWeekendDays',
        'diffInHours',
        'diffInMinutes',
        'diffInSeconds',
        'diffInMicroseconds',
        'diffInMilliseconds',
    ];
    protected $carbonDiffMethodsWithClosure = [
        'diffInDaysFiltered',
        'diffInHoursFiltered',
    ];
    protected $carbonDiffMethodsWithClosureAndInterval = [
        'diffFiltered'
    ];

    protected function operations(): array
    {
        return ['run', 'types', 'alertable'];
    }

    function run(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, 'extend.php') !== false) {
            return new ReplacementResult(
                $this->removeSecondArgFromNotificationTypeExtender($ast)
            );
        }

        return new ReplacementResult(
            $this->misc($ast)
        );
    }

    private function misc(array $ast): array
    {
        $traverser = $this->traverser();

        $traverser->addVisitor(new NodeVisitor\NameResolver(null, [
            'replaceNodes' => false,
        ]));

        $traverser->addVisitor(new class ($this->carbonDiffMethods, $this->carbonDiffMethodsWithClosure, $this->carbonDiffMethodsWithClosureAndInterval) extends \PhpParser\NodeVisitorAbstract {
            protected $carbonDiffMethods;
            protected $carbonDiffMethodsWithClosure;
            protected $carbonDiffMethodsWithClosureAndInterval;

            public function __construct(array $carbonDiffMethods, array $carbonDiffMethodsWithClosure, array $carbonDiffMethodsWithClosureAndInterval)
            {
                $this->carbonDiffMethods = $carbonDiffMethods;
                $this->carbonDiffMethodsWithClosure = $carbonDiffMethodsWithClosure;
                $this->carbonDiffMethodsWithClosureAndInterval = $carbonDiffMethodsWithClosureAndInterval;
            }

            public function leaveNode(\PhpParser\Node $node)
            {
                if ($node instanceof Node\Stmt\Namespace_) {
                    foreach ($node->stmts as $index => $stmt) {
                        if ($stmt instanceof Node\Stmt\Use_) {
                            if ($stmt->uses[0]->name->name === 'Staudenmeir\EloquentEagerLimit\HasEagerLimit') {
                                unset($node->stmts[$index]);
                            }
                        }
                    }
                }

                if ($node instanceof \PhpParser\Node\Stmt\Class_) {
                    $dates = null;
                    $datesIndex = null;

                    foreach ($node->stmts as $index => $stmt) {
                        if ($stmt instanceof Node\Stmt\TraitUse) {
                            foreach ($stmt->traits as $trait) {
                                if ($trait->getAttribute('resolvedName')->name === 'Staudenmeir\EloquentEagerLimit\HasEagerLimit') {
                                    unset($node->stmts[$index]);
                                }
                            }
                        }

                        if ($stmt instanceof \PhpParser\Node\Stmt\Property) {
                            if ($stmt->props[0]->name->name === 'dates') {
                                $dates = $stmt->props[0]->default->items;
                                $datesIndex = $index;
                            }
                        }
                    }

                    /*
                     * convert $dates to $casts
                     */
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
                    }
                }

                // Make the $absolute argument true (that was the default in v2, was changed to false in v3 :`)
                if ($node instanceof Node\Expr\MethodCall) {
                    // here it's the second argument.
                    if (in_array($node->name->name, $this->carbonDiffMethods) && empty($node->args[1])) {
                        if (empty($node->args[0])) {
                            $node->args[0] = new Node\Arg(new Node\Expr\ConstFetch(new Node\Name('null')));
                        }

                        $node->args[1] = new Node\Arg(new Node\Expr\ConstFetch(new Node\Name('true')));
                    }

                    // here it's the third argument.
                    if (in_array($node->name->name, $this->carbonDiffMethodsWithClosure) && empty($node->args[2])) {
                        if (empty($node->args[0])) {
                            return; // impossible
                        }

                        if (empty($node->args[1])) {
                            $node->args[1] = new Node\Arg(new Node\Expr\ConstFetch(new Node\Name('null')));
                        }

                        $node->args[2] = new Node\Arg(new Node\Expr\ConstFetch(new Node\Name('true')));
                    }

                    // here it's the fourth argument.
                    if (in_array($node->name->name, $this->carbonDiffMethodsWithClosureAndInterval) && empty($node->args[3])) {
                        if (empty($node->args[0])) {
                            return; // impossible
                        }

                        if (empty($node->args[1])) {
                            return; // impossible
                        }

                        if (empty($node->args[2])) {
                            $node->args[2] = new Node\Arg(new Node\Expr\ConstFetch(new Node\Name('null')));
                        }

                        $node->args[3] = new Node\Arg(new Node\Expr\ConstFetch(new Node\Name('true')));
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
            'Flarum\\Post\\MergeableInterface' => [
                'saveAfter' => [
                    'return' => ['static']
                ],
            ],
            'Flarum\\Post\\AbstractEventPost' => [
                '$type' => [
                    'type' => ['string']
                ],
            ],
            'Flarum\\Foundation\\AbstractValidator' => [
                'getRules' => [
                    'return' => ['array']
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

    function alertable(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, 'extend.php') !== false) {
            return null;
        }

        $traverser = $this->traverser();

        $traverser->addVisitor(new NodeVisitor\NameResolver(null, [
            'replaceNodes' => false,
        ]));
        $traverser->addVisitor(new NodeVisitor\ParentConnectingVisitor());

        $traverser->addVisitor(new class () extends \PhpParser\NodeVisitorAbstract {
            protected $valid = false;

            public function enterNode(Node $node)
            {
                // Does this class implement the Flarum\Notification\Blueprint\BlueprintInterface ?
                if ($node instanceof Node\Stmt\Class_) {
                    foreach ($node->implements as $interface) {
                        if ($interface->getAttribute('resolvedName')->name === 'Flarum\Notification\Blueprint\BlueprintInterface') {
                            $this->valid = true;
                            break;
                        }
                    }
                }
            }

            public function leaveNode(\PhpParser\Node $node)
            {
                if (! $this->valid) {
                    return;
                }

                if ($node instanceof Node\Stmt\Namespace_) {
                    // Add the Flarum\Notification\AlertableInterface import
                    $node->stmts = array_merge(
                        [
                            new Node\Stmt\Use_([
                                new Node\Stmt\UseUse(new Node\Name('Flarum\Notification\AlertableInterface'))
                            ])
                        ],
                        $node->stmts
                    );
                }

                if ($node instanceof \PhpParser\Node\Stmt\Class_) {
                    // Add the AlertableInterface implementation
                    $node->implements[] = new Node\Name('AlertableInterface');
                }
            }
        });

        return new ReplacementResult($traverser->traverse($ast));
    }
}
