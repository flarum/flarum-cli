<?php

namespace Flarum\CliPhpSubsystem\NodeVisitors;

use PhpParser\NodeVisitor;
use PhpParser\NodeVisitorAbstract;

class ReplaceUses extends NodeVisitorAbstract
{
    private $replacements;

    public function __construct($replacements)
    {
        $this->replacements = $replacements;
    }

    public function leaveNode(\PhpParser\Node $node)
    {
        if ($node instanceof \PhpParser\Node\Stmt\Use_) {
            foreach ($node->uses as $use) {
                foreach ($this->replacements as $replacement) {
                    if ($use->name->name === $replacement['from']) {
                        $use->name->name = $replacement['to'];
                    }
                }
            }
        }

        if ($node instanceof \PhpParser\Node\Expr\New_) {
            foreach ($this->replacements as $replacement) {
                $exploded = explode('\\', $replacement['from']);

                if ($node->class->name === array_pop($exploded)) {
                    $exploded = explode('\\', $replacement['to']);
                    $node->class->name = array_pop($exploded);
                }
            }
        }

        return $node;
    }
}
