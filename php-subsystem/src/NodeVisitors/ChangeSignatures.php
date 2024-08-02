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

        $this->custom && ($this->custom)($node);
    }
}
