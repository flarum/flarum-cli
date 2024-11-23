<?php

namespace Flarum\CliPhpSubsystem\NodeVisitors;

use Flarum\CliPhpSubsystem\NodeUtil;
use PhpParser\Node;
use PhpParser\NodeVisitorAbstract;

class AddUses extends NodeVisitorAbstract
{
    private $uses;

    public function __construct($replacements)
    {
        $this->uses = $replacements;
    }

    public function leaveNode(Node $node)
    {
        if ($node instanceof Node\Stmt\Namespace_) {
            NodeUtil::addUsesToNamespace($node, $this->uses);
        }
    }
}
