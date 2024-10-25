<?php

namespace <%= classNamespace %>;

use Flarum\Database\AbstractModel;
use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Notification\AlertableInterface;
// use Flarum\Notification\MailableInterface;
use Flarum\User\User;

class <%= className %> implements BlueprintInterface, AlertableInterface/*, MailableInterface*/
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
