<?php

// autoload_static.php @generated by Composer

namespace Composer\Autoload;

class ComposerStaticInit033f1ff7c16740840897bb4dbdb77dd3
{
    public static $prefixLengthsPsr4 = array (
        'P' => 
        array (
            'PhpParser\\' => 10,
        ),
        'F' => 
        array (
            'Flarum\\CliPhpSubsystem\\' => 23,
        ),
    );

    public static $prefixDirsPsr4 = array (
        'PhpParser\\' => 
        array (
            0 => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser',
        ),
        'Flarum\\CliPhpSubsystem\\' => 
        array (
            0 => __DIR__ . '/../..' . '/src',
        ),
    );

    public static $classMap = array (
        'Composer\\InstalledVersions' => __DIR__ . '/..' . '/composer/InstalledVersions.php',
        'Flarum\\CliPhpSubsystem\\ExtenderVisitor' => __DIR__ . '/../..' . '/src/ExtenderVisitor.php',
        'Flarum\\CliPhpSubsystem\\ModifyExtend' => __DIR__ . '/../..' . '/src/ModifyExtend.php',
        'PhpParser\\Builder' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder.php',
        'PhpParser\\BuilderFactory' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/BuilderFactory.php',
        'PhpParser\\BuilderHelpers' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/BuilderHelpers.php',
        'PhpParser\\Builder\\Class_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Class_.php',
        'PhpParser\\Builder\\Declaration' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Declaration.php',
        'PhpParser\\Builder\\FunctionLike' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/FunctionLike.php',
        'PhpParser\\Builder\\Function_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Function_.php',
        'PhpParser\\Builder\\Interface_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Interface_.php',
        'PhpParser\\Builder\\Method' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Method.php',
        'PhpParser\\Builder\\Namespace_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Namespace_.php',
        'PhpParser\\Builder\\Param' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Param.php',
        'PhpParser\\Builder\\Property' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Property.php',
        'PhpParser\\Builder\\TraitUse' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/TraitUse.php',
        'PhpParser\\Builder\\TraitUseAdaptation' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/TraitUseAdaptation.php',
        'PhpParser\\Builder\\Trait_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Trait_.php',
        'PhpParser\\Builder\\Use_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Builder/Use_.php',
        'PhpParser\\Comment' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Comment.php',
        'PhpParser\\Comment\\Doc' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Comment/Doc.php',
        'PhpParser\\ConstExprEvaluationException' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ConstExprEvaluationException.php',
        'PhpParser\\ConstExprEvaluator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ConstExprEvaluator.php',
        'PhpParser\\Error' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Error.php',
        'PhpParser\\ErrorHandler' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ErrorHandler.php',
        'PhpParser\\ErrorHandler\\Collecting' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ErrorHandler/Collecting.php',
        'PhpParser\\ErrorHandler\\Throwing' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ErrorHandler/Throwing.php',
        'PhpParser\\Internal\\DiffElem' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Internal/DiffElem.php',
        'PhpParser\\Internal\\Differ' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Internal/Differ.php',
        'PhpParser\\Internal\\PrintableNewAnonClassNode' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Internal/PrintableNewAnonClassNode.php',
        'PhpParser\\Internal\\TokenStream' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Internal/TokenStream.php',
        'PhpParser\\JsonDecoder' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/JsonDecoder.php',
        'PhpParser\\Lexer' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer.php',
        'PhpParser\\Lexer\\Emulative' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/Emulative.php',
        'PhpParser\\Lexer\\TokenEmulator\\AttributeEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/AttributeEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\CoaleseEqualTokenEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/CoaleseEqualTokenEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\FlexibleDocStringEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/FlexibleDocStringEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\FnTokenEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/FnTokenEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\KeywordEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/KeywordEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\MatchTokenEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/MatchTokenEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\NullsafeTokenEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/NullsafeTokenEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\NumericLiteralSeparatorEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/NumericLiteralSeparatorEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\ReverseEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/ReverseEmulator.php',
        'PhpParser\\Lexer\\TokenEmulator\\TokenEmulator' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Lexer/TokenEmulator/TokenEmulator.php',
        'PhpParser\\NameContext' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NameContext.php',
        'PhpParser\\Node' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node.php',
        'PhpParser\\NodeAbstract' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeAbstract.php',
        'PhpParser\\NodeDumper' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeDumper.php',
        'PhpParser\\NodeFinder' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeFinder.php',
        'PhpParser\\NodeTraverser' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeTraverser.php',
        'PhpParser\\NodeTraverserInterface' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeTraverserInterface.php',
        'PhpParser\\NodeVisitor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor.php',
        'PhpParser\\NodeVisitorAbstract' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitorAbstract.php',
        'PhpParser\\NodeVisitor\\CloningVisitor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor/CloningVisitor.php',
        'PhpParser\\NodeVisitor\\FindingVisitor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor/FindingVisitor.php',
        'PhpParser\\NodeVisitor\\FirstFindingVisitor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor/FirstFindingVisitor.php',
        'PhpParser\\NodeVisitor\\NameResolver' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor/NameResolver.php',
        'PhpParser\\NodeVisitor\\NodeConnectingVisitor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor/NodeConnectingVisitor.php',
        'PhpParser\\NodeVisitor\\ParentConnectingVisitor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/NodeVisitor/ParentConnectingVisitor.php',
        'PhpParser\\Node\\Arg' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Arg.php',
        'PhpParser\\Node\\Attribute' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Attribute.php',
        'PhpParser\\Node\\AttributeGroup' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/AttributeGroup.php',
        'PhpParser\\Node\\Const_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Const_.php',
        'PhpParser\\Node\\Expr' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr.php',
        'PhpParser\\Node\\Expr\\ArrayDimFetch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ArrayDimFetch.php',
        'PhpParser\\Node\\Expr\\ArrayItem' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ArrayItem.php',
        'PhpParser\\Node\\Expr\\Array_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Array_.php',
        'PhpParser\\Node\\Expr\\ArrowFunction' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ArrowFunction.php',
        'PhpParser\\Node\\Expr\\Assign' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Assign.php',
        'PhpParser\\Node\\Expr\\AssignOp' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp.php',
        'PhpParser\\Node\\Expr\\AssignOp\\BitwiseAnd' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/BitwiseAnd.php',
        'PhpParser\\Node\\Expr\\AssignOp\\BitwiseOr' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/BitwiseOr.php',
        'PhpParser\\Node\\Expr\\AssignOp\\BitwiseXor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/BitwiseXor.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Coalesce' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Coalesce.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Concat' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Concat.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Div' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Div.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Minus' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Minus.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Mod' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Mod.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Mul' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Mul.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Plus' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Plus.php',
        'PhpParser\\Node\\Expr\\AssignOp\\Pow' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/Pow.php',
        'PhpParser\\Node\\Expr\\AssignOp\\ShiftLeft' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/ShiftLeft.php',
        'PhpParser\\Node\\Expr\\AssignOp\\ShiftRight' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignOp/ShiftRight.php',
        'PhpParser\\Node\\Expr\\AssignRef' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/AssignRef.php',
        'PhpParser\\Node\\Expr\\BinaryOp' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\BitwiseAnd' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/BitwiseAnd.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\BitwiseOr' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/BitwiseOr.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\BitwiseXor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/BitwiseXor.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\BooleanAnd' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/BooleanAnd.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\BooleanOr' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/BooleanOr.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Coalesce' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Coalesce.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Concat' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Concat.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Div' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Div.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Equal' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Equal.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Greater' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Greater.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\GreaterOrEqual' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/GreaterOrEqual.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Identical' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Identical.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\LogicalAnd' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/LogicalAnd.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\LogicalOr' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/LogicalOr.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\LogicalXor' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/LogicalXor.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Minus' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Minus.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Mod' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Mod.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Mul' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Mul.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\NotEqual' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/NotEqual.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\NotIdentical' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/NotIdentical.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Plus' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Plus.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Pow' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Pow.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\ShiftLeft' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/ShiftLeft.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\ShiftRight' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/ShiftRight.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Smaller' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Smaller.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\SmallerOrEqual' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/SmallerOrEqual.php',
        'PhpParser\\Node\\Expr\\BinaryOp\\Spaceship' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BinaryOp/Spaceship.php',
        'PhpParser\\Node\\Expr\\BitwiseNot' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BitwiseNot.php',
        'PhpParser\\Node\\Expr\\BooleanNot' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/BooleanNot.php',
        'PhpParser\\Node\\Expr\\Cast' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast.php',
        'PhpParser\\Node\\Expr\\Cast\\Array_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/Array_.php',
        'PhpParser\\Node\\Expr\\Cast\\Bool_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/Bool_.php',
        'PhpParser\\Node\\Expr\\Cast\\Double' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/Double.php',
        'PhpParser\\Node\\Expr\\Cast\\Int_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/Int_.php',
        'PhpParser\\Node\\Expr\\Cast\\Object_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/Object_.php',
        'PhpParser\\Node\\Expr\\Cast\\String_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/String_.php',
        'PhpParser\\Node\\Expr\\Cast\\Unset_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Cast/Unset_.php',
        'PhpParser\\Node\\Expr\\ClassConstFetch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ClassConstFetch.php',
        'PhpParser\\Node\\Expr\\Clone_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Clone_.php',
        'PhpParser\\Node\\Expr\\Closure' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Closure.php',
        'PhpParser\\Node\\Expr\\ClosureUse' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ClosureUse.php',
        'PhpParser\\Node\\Expr\\ConstFetch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ConstFetch.php',
        'PhpParser\\Node\\Expr\\Empty_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Empty_.php',
        'PhpParser\\Node\\Expr\\Error' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Error.php',
        'PhpParser\\Node\\Expr\\ErrorSuppress' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ErrorSuppress.php',
        'PhpParser\\Node\\Expr\\Eval_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Eval_.php',
        'PhpParser\\Node\\Expr\\Exit_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Exit_.php',
        'PhpParser\\Node\\Expr\\FuncCall' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/FuncCall.php',
        'PhpParser\\Node\\Expr\\Include_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Include_.php',
        'PhpParser\\Node\\Expr\\Instanceof_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Instanceof_.php',
        'PhpParser\\Node\\Expr\\Isset_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Isset_.php',
        'PhpParser\\Node\\Expr\\List_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/List_.php',
        'PhpParser\\Node\\Expr\\Match_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Match_.php',
        'PhpParser\\Node\\Expr\\MethodCall' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/MethodCall.php',
        'PhpParser\\Node\\Expr\\New_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/New_.php',
        'PhpParser\\Node\\Expr\\NullsafeMethodCall' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/NullsafeMethodCall.php',
        'PhpParser\\Node\\Expr\\NullsafePropertyFetch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/NullsafePropertyFetch.php',
        'PhpParser\\Node\\Expr\\PostDec' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/PostDec.php',
        'PhpParser\\Node\\Expr\\PostInc' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/PostInc.php',
        'PhpParser\\Node\\Expr\\PreDec' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/PreDec.php',
        'PhpParser\\Node\\Expr\\PreInc' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/PreInc.php',
        'PhpParser\\Node\\Expr\\Print_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Print_.php',
        'PhpParser\\Node\\Expr\\PropertyFetch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/PropertyFetch.php',
        'PhpParser\\Node\\Expr\\ShellExec' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/ShellExec.php',
        'PhpParser\\Node\\Expr\\StaticCall' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/StaticCall.php',
        'PhpParser\\Node\\Expr\\StaticPropertyFetch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/StaticPropertyFetch.php',
        'PhpParser\\Node\\Expr\\Ternary' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Ternary.php',
        'PhpParser\\Node\\Expr\\Throw_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Throw_.php',
        'PhpParser\\Node\\Expr\\UnaryMinus' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/UnaryMinus.php',
        'PhpParser\\Node\\Expr\\UnaryPlus' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/UnaryPlus.php',
        'PhpParser\\Node\\Expr\\Variable' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Variable.php',
        'PhpParser\\Node\\Expr\\YieldFrom' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/YieldFrom.php',
        'PhpParser\\Node\\Expr\\Yield_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Expr/Yield_.php',
        'PhpParser\\Node\\FunctionLike' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/FunctionLike.php',
        'PhpParser\\Node\\Identifier' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Identifier.php',
        'PhpParser\\Node\\MatchArm' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/MatchArm.php',
        'PhpParser\\Node\\Name' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Name.php',
        'PhpParser\\Node\\Name\\FullyQualified' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Name/FullyQualified.php',
        'PhpParser\\Node\\Name\\Relative' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Name/Relative.php',
        'PhpParser\\Node\\NullableType' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/NullableType.php',
        'PhpParser\\Node\\Param' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Param.php',
        'PhpParser\\Node\\Scalar' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar.php',
        'PhpParser\\Node\\Scalar\\DNumber' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/DNumber.php',
        'PhpParser\\Node\\Scalar\\Encapsed' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/Encapsed.php',
        'PhpParser\\Node\\Scalar\\EncapsedStringPart' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/EncapsedStringPart.php',
        'PhpParser\\Node\\Scalar\\LNumber' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/LNumber.php',
        'PhpParser\\Node\\Scalar\\MagicConst' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Class_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Class_.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Dir' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Dir.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\File' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/File.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Function_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Function_.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Line' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Line.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Method' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Method.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Namespace_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Namespace_.php',
        'PhpParser\\Node\\Scalar\\MagicConst\\Trait_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/MagicConst/Trait_.php',
        'PhpParser\\Node\\Scalar\\String_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Scalar/String_.php',
        'PhpParser\\Node\\Stmt' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt.php',
        'PhpParser\\Node\\Stmt\\Break_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Break_.php',
        'PhpParser\\Node\\Stmt\\Case_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Case_.php',
        'PhpParser\\Node\\Stmt\\Catch_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Catch_.php',
        'PhpParser\\Node\\Stmt\\ClassConst' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/ClassConst.php',
        'PhpParser\\Node\\Stmt\\ClassLike' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/ClassLike.php',
        'PhpParser\\Node\\Stmt\\ClassMethod' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/ClassMethod.php',
        'PhpParser\\Node\\Stmt\\Class_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Class_.php',
        'PhpParser\\Node\\Stmt\\Const_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Const_.php',
        'PhpParser\\Node\\Stmt\\Continue_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Continue_.php',
        'PhpParser\\Node\\Stmt\\DeclareDeclare' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/DeclareDeclare.php',
        'PhpParser\\Node\\Stmt\\Declare_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Declare_.php',
        'PhpParser\\Node\\Stmt\\Do_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Do_.php',
        'PhpParser\\Node\\Stmt\\Echo_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Echo_.php',
        'PhpParser\\Node\\Stmt\\ElseIf_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/ElseIf_.php',
        'PhpParser\\Node\\Stmt\\Else_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Else_.php',
        'PhpParser\\Node\\Stmt\\Expression' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Expression.php',
        'PhpParser\\Node\\Stmt\\Finally_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Finally_.php',
        'PhpParser\\Node\\Stmt\\For_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/For_.php',
        'PhpParser\\Node\\Stmt\\Foreach_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Foreach_.php',
        'PhpParser\\Node\\Stmt\\Function_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Function_.php',
        'PhpParser\\Node\\Stmt\\Global_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Global_.php',
        'PhpParser\\Node\\Stmt\\Goto_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Goto_.php',
        'PhpParser\\Node\\Stmt\\GroupUse' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/GroupUse.php',
        'PhpParser\\Node\\Stmt\\HaltCompiler' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/HaltCompiler.php',
        'PhpParser\\Node\\Stmt\\If_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/If_.php',
        'PhpParser\\Node\\Stmt\\InlineHTML' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/InlineHTML.php',
        'PhpParser\\Node\\Stmt\\Interface_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Interface_.php',
        'PhpParser\\Node\\Stmt\\Label' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Label.php',
        'PhpParser\\Node\\Stmt\\Namespace_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Namespace_.php',
        'PhpParser\\Node\\Stmt\\Nop' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Nop.php',
        'PhpParser\\Node\\Stmt\\Property' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Property.php',
        'PhpParser\\Node\\Stmt\\PropertyProperty' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/PropertyProperty.php',
        'PhpParser\\Node\\Stmt\\Return_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Return_.php',
        'PhpParser\\Node\\Stmt\\StaticVar' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/StaticVar.php',
        'PhpParser\\Node\\Stmt\\Static_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Static_.php',
        'PhpParser\\Node\\Stmt\\Switch_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Switch_.php',
        'PhpParser\\Node\\Stmt\\Throw_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Throw_.php',
        'PhpParser\\Node\\Stmt\\TraitUse' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/TraitUse.php',
        'PhpParser\\Node\\Stmt\\TraitUseAdaptation' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/TraitUseAdaptation.php',
        'PhpParser\\Node\\Stmt\\TraitUseAdaptation\\Alias' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/TraitUseAdaptation/Alias.php',
        'PhpParser\\Node\\Stmt\\TraitUseAdaptation\\Precedence' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/TraitUseAdaptation/Precedence.php',
        'PhpParser\\Node\\Stmt\\Trait_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Trait_.php',
        'PhpParser\\Node\\Stmt\\TryCatch' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/TryCatch.php',
        'PhpParser\\Node\\Stmt\\Unset_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Unset_.php',
        'PhpParser\\Node\\Stmt\\UseUse' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/UseUse.php',
        'PhpParser\\Node\\Stmt\\Use_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/Use_.php',
        'PhpParser\\Node\\Stmt\\While_' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/Stmt/While_.php',
        'PhpParser\\Node\\UnionType' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/UnionType.php',
        'PhpParser\\Node\\VarLikeIdentifier' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Node/VarLikeIdentifier.php',
        'PhpParser\\Parser' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Parser.php',
        'PhpParser\\ParserAbstract' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ParserAbstract.php',
        'PhpParser\\ParserFactory' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/ParserFactory.php',
        'PhpParser\\Parser\\Multiple' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Parser/Multiple.php',
        'PhpParser\\Parser\\Php5' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Parser/Php5.php',
        'PhpParser\\Parser\\Php7' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Parser/Php7.php',
        'PhpParser\\Parser\\Tokens' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/Parser/Tokens.php',
        'PhpParser\\PrettyPrinterAbstract' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/PrettyPrinterAbstract.php',
        'PhpParser\\PrettyPrinter\\Standard' => __DIR__ . '/..' . '/nikic/php-parser/lib/PhpParser/PrettyPrinter/Standard.php',
    );

    public static function getInitializer(ClassLoader $loader)
    {
        return \Closure::bind(function () use ($loader) {
            $loader->prefixLengthsPsr4 = ComposerStaticInit033f1ff7c16740840897bb4dbdb77dd3::$prefixLengthsPsr4;
            $loader->prefixDirsPsr4 = ComposerStaticInit033f1ff7c16740840897bb4dbdb77dd3::$prefixDirsPsr4;
            $loader->classMap = ComposerStaticInit033f1ff7c16740840897bb4dbdb77dd3::$classMap;

        }, null, ClassLoader::class);
    }
}
