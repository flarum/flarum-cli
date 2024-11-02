<?php

namespace Flarum\CliPhpSubsystem\NodeVisitors;

use Closure;
use Flarum\CliPhpSubsystem\NodeUtil;
use PhpParser\Node;
use PhpParser\Node\Stmt\Class_;
use PhpParser\NodeVisitorAbstract;

class ChangeSignatures extends NodeVisitorAbstract
{
    protected $changes = [];
    protected $custom = null;
    protected $valid = false;

    public function __construct(array $changes, Closure $custom = null)
    {
        $this->changes = $changes;
        $this->custom = $custom;
    }

    public function enterNode(Node $node)
    {
        if (! $this->valid && $node instanceof Class_) {
            $implements = array_map(function (Node\Name $interface) {
                return $interface->getAttribute('resolvedName')->name;
            }, $node->implements);

            $extends = $node->extends ? $node->extends->getAttribute('resolvedName')->name : null;

            if ($extends && isset($this->changes[$extends])) {
                $this->valid = true;
                return;
            }

            foreach ($implements as $interface) {
                if (isset($this->changes[$interface])) {
                    $this->valid = true;
                    return;
                }
            }
        }
    }

    public function leaveNode(\PhpParser\Node $node)
    {
        if (! $this->valid) {
            return;
        }

        if ($node instanceof \PhpParser\Node\Stmt\ClassMethod) {
            foreach ($this->changes as $methods) {
                foreach ($methods as $method => $types) {
                    // property not method.
                    if (strpos($method, '$') === 0) {
                        continue;
                    }

                    if ($method !== $node->name->name) {
                        continue;
                    }

                    if ($returnType = NodeUtil::makeType($types['return'] ?? [])) {
                        $node->returnType = $returnType;
                    }

                    foreach ($types['params'] ?? [] as $param => $paramTypes) {
                        foreach ($node->params as $paramNode) {
                            if ($paramNode->var->name === $param) {
                                if ($paramType = NodeUtil::makeType($paramTypes)) {
                                    $paramNode->type = $paramType;
                                }
                            }
                        }
                    }

                    if (isset($types['rename'])) {
                        $node->name->name = $types['rename'];
                    }
                }
            }
        }

        if ($node instanceof Node\Stmt\Property) {
            foreach ($this->changes as $properties) {
                foreach ($properties as $property => $changes) {
                    if (strpos($property, '$') !== 0) {
                        continue;
                    }

                    if ($property !== '$' . $node->props[0]->name->name) {
                        continue;
                    }

                    if (! empty($changes['type']) && ($type = NodeUtil::makeType($changes['type']))) {
                        $node->type = $type;
                    }
                }
            }
        }

        $this->custom && ($this->custom)($node);
    }
}
