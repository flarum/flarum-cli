<?php

namespace Flarum\CliPhpSubsystem\Upgrade\TwoPointOh;

use Flarum\CliPhpSubsystem\NodeUtil;
use Flarum\CliPhpSubsystem\Upgrade\Replacement;
use Flarum\CliPhpSubsystem\Upgrade\ReplacementResult;
use PhpParser\Comment\Doc;
use PhpParser\Modifiers;
use PhpParser\Node;
use PhpParser\NodeVisitor;

class PhpUnit extends Replacement
{
    protected $dataProviders = [];

    protected function operations(): array
    {
        return ['run', 'postRun'];
    }

    function run(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, '.php') === false) {
            return null;
        }

        $traverser = $this->traverser();

        // In the first traversal, we collect all the data providers and tests.
        $traverser->addVisitor($visitor = new class extends \PhpParser\NodeVisitorAbstract {
            public $dataProviders = [];
            public $tests = [];

            public function enterNode(Node $node)
            {
                if ($node instanceof Node\Stmt\ClassMethod) {
                    $docComment = $node->getDocComment();

                    if (preg_match('/\*\s*@test\b/', $docComment)) {
                        $this->tests[] = $node;
                    }

                    if (preg_match('/\*\s*@dataProvider\s+([a-zA-Z0-9_]+)/', $docComment, $matches)) {
                        $this->dataProviders[] = $matches[1];
                    }

                    return NodeVisitor::DONT_TRAVERSE_CHILDREN;
                }
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof Node\Stmt\Namespace_) {
                    $uses = [];

                    if (! empty($this->dataProviders)) {
                        $uses[] = 'PHPUnit\Framework\Attributes\DataProvider';
                    }

                    if (! empty($this->tests)) {
                        $uses[] = 'PHPUnit\Framework\Attributes\Test';
                    }

                    if (! empty($uses)) {
                        NodeUtil::addUsesToNamespace($node, $uses);
                    }
                }

                if ($node instanceof Node\Stmt\ClassMethod) {
                    // replace
                    // @test => \PHPUnit\Metadata\Test
                    // @dataProvider => \PHPUnit\Metadata\DataProvider

                    $docComment = $node->getDocComment();

                    if (preg_match('/\*\s*@test\b/', $docComment)) {
                        $node->attrGroups[] = new Node\AttributeGroup([
                            new Node\Attribute(new Node\Name('Test')),
                        ]);
                    }

                    if (preg_match('/\*\s*@dataProvider\s+([a-zA-Z0-9_]+)/', $docComment, $matches)) {
                        $node->attrGroups[] = new Node\AttributeGroup([
                            new Node\Attribute(new Node\Name('DataProvider'), [
                                new Node\Arg(new Node\Scalar\String_($matches[1])),
                            ]),
                        ]);
                    }

                    // Can we remove the doc comment?
                    $docComment = preg_replace('/^\s*\/?\**\s*@test\b(\*\/)?.*$/m', '', $docComment);
                    $docComment = preg_replace('/^\s*\/?\**\s*@dataProvider\b(\*\/)?.*$/m', '', $docComment);

                    if (! preg_match('/[A-z]/', $docComment)) {
                        $comments = $node->getComments();

                        foreach ($comments as $i => $comment) {
                            if ($comment instanceof Doc) {
                                unset($comments[$i]);
                            }
                        }

                        $node->setAttribute('comments', $comments);
                    } else {
                        $node->setDocComment(new Doc($docComment));
                    }
                }

                return $node;
            }
        });

        $ast = $traverser->traverse($ast);

        $this->dataProviders = $visitor->dataProviders;

        return new ReplacementResult($ast);
    }

    function postRun(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, '.php') === false) {
            return null;
        }

        $traverser = $this->traverser();

        // In the second traversal, we make the data providers static.
        $traverser->addVisitor(new class ($this->dataProviders) extends \PhpParser\NodeVisitorAbstract {
            protected $dataProviders = [];

            public function __construct(array $dataProviders)
            {
                $this->dataProviders = $dataProviders;
            }

            public function leaveNode(Node $node)
            {
                if ($node instanceof Node\Stmt\ClassMethod) {
                    $name = $node->name->name;

                    if (in_array($name, $this->dataProviders)) {
                        // data providers must now be static
                        if (! $node->isStatic()) {
                            $node->flags |= Modifiers::STATIC;
                        }
                    }
                }

                return $node;
            }
        });

        return new ReplacementResult($traverser->traverse($ast));
    }
}
