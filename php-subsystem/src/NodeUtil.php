<?php

namespace Flarum\CliPhpSubsystem;

use PhpParser\Node;
use PhpParser\Node\Identifier;
use PhpParser\Node\Name;
use PhpParser\Node\NullableType;
use PhpParser\Node\UnionType;

class NodeUtil
{
    public static function makeType(array $types): ?Node
    {
        $realTypes = array_map(function ($type) {
            if (strpos($type, '\\') !== false || preg_match('/[A-Z]/', $type[0])) {
                return new Name($type, [
                    'resolvedName' => new Name($type)
                ]);
            }

            return new Identifier($type);
        }, array_filter($types, function ($type) {
            return $type !== 'null';
        }));

        $returnType = null;

        if (count($realTypes) > 1) {
            $returnType = new UnionType($realTypes);
        } elseif (! empty($realTypes[0])) {
            $returnType = $realTypes[0];
        }

        if (in_array('null', $types)) {
            $returnType = new NullableType($returnType);
        }

        return $returnType;
    }
}
