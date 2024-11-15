<?php

namespace Flarum\CliPhpSubsystem\NodeVisitors;

use PhpParser\Node;
use PhpParser\NodeAbstract;
use PhpParser\NodeVisitor;
use PhpParser\NodeVisitorAbstract;

class ReplaceUses extends NodeVisitorAbstract
{
    private $replacements;

    private $uses = [];

    public function __construct($replacements)
    {
        $this->replacements = $replacements;
    }

    public function enterNode(Node $node)
    {
        if ($node instanceof \PhpParser\Node\Stmt\Namespace_) {
            foreach ($node->stmts as $stmt) {
                if ($stmt instanceof \PhpParser\Node\Stmt\Use_) {
                    foreach ($stmt->uses as $use) {
                        $this->uses[] = $use->name->name;
                    }
                }
            }
        }
    }

    public function leaveNode(\PhpParser\Node $node)
    {
        if ($node instanceof \PhpParser\Node\Stmt\Use_) {
            foreach ($node->uses as $i => $use) {
                foreach ($this->replacements as $replacement) {
                    $wouldBecome = $this->replace($use->name->name, $replacement);

                    if ($use->name->name !== $wouldBecome && in_array($wouldBecome, $this->uses)) {
                        if (count($node->uses) === 1) {
                            return NodeVisitor::REMOVE_NODE;
                        } else {
                            unset($node->uses[$i]);
                        }
                    } elseif (! in_array($wouldBecome, $this->uses)) {
                        $use->name->name = $wouldBecome;
                    }
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\New_) {
            foreach ($this->replacements as $replacement) {
                $node->class->name = $this->replace($node->class->name, $replacement);
            }
        }

        if ($node instanceof \PhpParser\Node\Stmt\Class_) {
            foreach ($this->replacements as $replacement) {
                if ($node->extends) {
                    $node->extends->name = $this->replace($node->extends->name, $replacement);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\FunctionLike) {
            $this->replaceOnType($node->getReturnType());

            foreach ($node->getParams() as $param) {
                $this->replaceOnType($param->type);
            }
        }

        if ($node instanceof Node\Stmt\Property) {
            $this->replaceOnType($node->type);
        }

        if ($node instanceof \PhpParser\Node\Expr\Instanceof_) {
            foreach ($this->replacements as $replacement) {
                $node->class->name = $this->replace($node->class->name, $replacement);
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\ClassConstFetch) {
            foreach ($this->replacements as $replacement) {
                if ($node->class instanceof \PhpParser\Node\Scalar\InterpolatedString ) {
                    $node->class->parts[0] = $this->replace($node->class->parts[0], $replacement);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\StaticCall) {
            foreach ($this->replacements as $replacement) {
                if ($node->class instanceof \PhpParser\Node\Scalar\InterpolatedString) {
                    $node->class->parts[0] = $this->replace($node->class->parts[0], $replacement);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\MethodCall) {
            foreach ($this->replacements as $replacement) {
                if ($node->var instanceof \PhpParser\Node\Expr\Variable) {
                    $node->var->name = $this->replace($node->var->name, $replacement);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\PropertyFetch) {
            foreach ($this->replacements as $replacement) {
                if ($node->var instanceof \PhpParser\Node\Expr\Variable) {
                    $node->var->name = $this->replace($node->var->name, $replacement);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\StaticPropertyFetch) {
            foreach ($this->replacements as $replacement) {
                if ($node->class instanceof \PhpParser\Node\Scalar\InterpolatedString) {
                    $node->class->parts[0] = $this->replace($node->class->parts[0], $replacement);
                }
            }
        }

        return $node;
    }

    protected function replaceOnType(?NodeAbstract $type): void
    {
        if (! $type) {
            return;
        }

        foreach ($this->replacements as $replacement) {
            if ($type instanceof \PhpParser\Node\UnionType || $type instanceof \PhpParser\Node\IntersectionType) {
                foreach ($type->types as $type) {
                    $type->name = $this->replace($type->name, $replacement);
                }
            } elseif ($type instanceof \PhpParser\Node\NullableType) {
                $type->type->name = $this->replace($type->type->name, $replacement);
            } else {
                $type->name = $this->replace($type->name, $replacement);
            }
        }
    }

    protected function replace(string $value, array $replacement): string
    {
        $from = $replacement['from'];
        $to = $replacement['to'];
        $partial = $replacement['partial'] ?? false;

        if ($value === $from) {
            return $to;
        }

        if ($partial && strpos($value, $from) !== false) {
            $new = str_replace($from, $to, $value);

            if (! in_array($new, $this->uses)) {
                return $new;
            }
        }

        $exploded = explode('\\', $from);

        if ($value === array_pop($exploded)) {
            $exploded = explode('\\', $to);
            return array_pop($exploded);
        }

        return $value;
    }
}
