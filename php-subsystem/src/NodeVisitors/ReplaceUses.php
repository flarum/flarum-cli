<?php

namespace Flarum\CliPhpSubsystem\NodeVisitors;

use PhpParser\Node;
use PhpParser\NodeAbstract;
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
        if ($node instanceof \PhpParser\Node\Stmt\UseUse) {
            $this->uses[] = $node->name->name;
        }
    }

    public function leaveNode(\PhpParser\Node $node)
    {
        if ($node instanceof \PhpParser\Node\Stmt\UseUse) {
            foreach ($this->replacements as $replacement) {
                if (in_array($replacement['to'], $this->uses)) {
                    $node->name->name = $this->replace($node->name->name, $replacement['from'], $replacement['to']);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\New_) {
            foreach ($this->replacements as $replacement) {
                $node->class->name = $this->replace($node->class->name, $replacement['from'], $replacement['to']);
            }
        }

        if ($node instanceof \PhpParser\Node\Stmt\Class_) {
            foreach ($this->replacements as $replacement) {
                if ($node->extends) {
                    $node->extends->name = $this->replace($node->extends->name, $replacement['from'], $replacement['to']);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\FunctionLike) {
            $this->replaceOnType($node->getReturnType());

            foreach ($node->getParams() as $param) {
                $this->replaceOnType($param->type);
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\ClassConstFetch) {
            foreach ($this->replacements as $replacement) {
                if ($node->class instanceof \PhpParser\Node\Scalar\InterpolatedString ) {
                    $node->class->parts[0] = $this->replace($node->class->parts[0], $replacement['from'], $replacement['to']);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\StaticCall) {
            foreach ($this->replacements as $replacement) {
                if ($node->class instanceof \PhpParser\Node\Scalar\InterpolatedString) {
                    $node->class->parts[0] = $this->replace($node->class->parts[0], $replacement['from'], $replacement['to']);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\MethodCall) {
            foreach ($this->replacements as $replacement) {
                if ($node->var instanceof \PhpParser\Node\Expr\Variable) {
                    $node->var->name = $this->replace($node->var->name, $replacement['from'], $replacement['to']);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\PropertyFetch) {
            foreach ($this->replacements as $replacement) {
                if ($node->var instanceof \PhpParser\Node\Expr\Variable) {
                    $node->var->name = $this->replace($node->var->name, $replacement['from'], $replacement['to']);
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\StaticPropertyFetch) {
            foreach ($this->replacements as $replacement) {
                if ($node->class instanceof \PhpParser\Node\Scalar\InterpolatedString) {
                    $node->class->parts[0] = $this->replace($node->class->parts[0], $replacement['from'], $replacement['to']);
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
                    $type->name = $this->replace($type->name, $replacement['from'], $replacement['to']);
                }
            } elseif ($type instanceof \PhpParser\Node\NullableType) {
                $type->type->name = $this->replace($type->type->name, $replacement['from'], $replacement['to']);
            } else {
                $type->name = $this->replace($type->name, $replacement['from'], $replacement['to']);
            }
        }
    }

    protected function replace(string $value, string $from, string $to): string
    {
        if ($value === $from) {
            return $to;
        }

        $exploded = explode('\\', $from);

        if ($value === array_pop($exploded)) {
            $exploded = explode('\\', $to);
            return array_pop($exploded);
        }

        return $value;
    }
}
