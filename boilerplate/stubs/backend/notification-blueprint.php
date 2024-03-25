<?php

namespace <%= classNamespace %>;

use Flarum\Database\AbstractModel;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\User\User;

class <%= className %> implements BlueprintInterface
{
    public function __construct(

    ) {
    }

    public function getFromUser(): ?User
    {
        // @TODO: implement
    }

    public function getSubject(): ?AbstractModel
    {
        // @TODO: implement
    }

    public function getData(): array
    {
        return [];
    }

    public static function getType(): string
    {
        return '<%= type %>';
    }

    public static function getSubjectModel(): string
    {
        // @TODO: implement
    }
}
