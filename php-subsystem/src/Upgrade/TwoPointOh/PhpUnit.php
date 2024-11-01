<?php

namespace Flarum\CliPhpSubsystem\Upgrade\TwoPointOh;

use Flarum\CliPhpSubsystem\NodeUtil;
use Flarum\CliPhpSubsystem\NodeVisitors\AddUses;
use Flarum\CliPhpSubsystem\Upgrade\Replacement;
use Flarum\CliPhpSubsystem\Upgrade\ReplacementResult;
use PhpParser\Comment\Doc;
use PhpParser\Modifiers;
use PhpParser\Node;
use PhpParser\NodeVisitor;

class PhpUnit extends Replacement
{
    protected $dataProviders = [];

    protected $usedModels = [];

    protected function operations(): array
    {
        return ['run', 'postRun', 'tablesToModels', 'postTablesToModels'];
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

    function tablesToModels(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, '.php') === false) {
            return null;
        }

        $traverser = $this->traverser();

        // Replace the following example:
        // $this->prepareDatabase([
        //     'users' => [...],
        //     'discussions' => [...],
        // ]);
        // with:
        // $this->prepareDatabase([
        //     User::class => [...],
        //     Discussion::class => [...],
        // ]);

        $traverser->addVisitor($visitor = new class extends \PhpParser\NodeVisitorAbstract {
            protected $models = [
                'users' => 'Flarum\\User\\User',
                'discussions' => 'Flarum\\Discussion\\Discussion',
                'groups' => 'Flarum\\Group\\Group',
                'tags' => 'Flarum\\Tags\\Tag',
                'flags' => 'Flarum\\Flags\\Flag',
                'posts' => 'Flarum\\Post\\Post',
                'access_tokens' => 'Flarum\\Http\\AccessToken',
            ];

            public $usedModels = [];

            public function leaveNode(Node $node)
            {
                if ($node instanceof Node\Expr\MethodCall) {
                    if ($node->var instanceof Node\Expr\Variable && $node->var->name === 'this') {
                        if ($node->name instanceof Node\Identifier && $node->name->name === 'prepareDatabase') {
                            if ($node->args[0]->value instanceof Node\Expr\Array_) {
                                foreach ($node->args[0]->value->items as $item) {
                                    if ($item->key instanceof Node\Scalar\String_) {
                                        $table = $item->key->value;

                                        if (isset($this->models[$table])) {
                                            $exploded = explode('\\', $this->models[$table]);
                                            $className = end($exploded);
                                            $item->key = new Node\Expr\ClassConstFetch(new Node\Name($className), 'class');
                                            $this->usedModels[$this->models[$table]] = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        $ast = $traverser->traverse($ast);

        $this->usedModels = $visitor->usedModels;

        return new ReplacementResult($ast);
    }

    function postTablesToModels(string $file, string $code, array $ast, array $data): ?ReplacementResult
    {
        if (strpos($file, '.php') === false) {
            return null;
        }

        if (empty($this->usedModels)) {
            return null;
        }

        $traverser = $this->traverser();

        $traverser->addVisitor(new AddUses(array_keys($this->usedModels)));

        return new ReplacementResult($traverser->traverse($ast));
    }
}
