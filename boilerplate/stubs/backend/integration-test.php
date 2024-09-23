<?php

namespace <%= classNamespace %>;

use Carbon\Carbon;
use Flarum\Discussion\Discussion;
use Flarum\Testing\integration\RetrievesAuthorizedUsers;
use Flarum\Testing\integration\TestCase;
use Flarum\User\User;
use PHPUnit\Framework\Attributes\Test;

class <%= className %> extends TestCase
{
    use RetrievesAuthorizedUsers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->extension('<%= extensionId %>');

        $this->prepareDatabase([
            User::class => [
                ['id' => 3, 'username' => 'Muralf', 'email' => 'muralf@machine.local', 'is_email_confirmed' => 1],
            ],
            Discussion::class => [
                ['id' => 1, 'title' => __CLASS__, 'created_at' => Carbon::now(), 'last_posted_at' => Carbon::now(), 'user_id' => 3, 'first_post_id' => 1, 'comment_count' => 1],
            ],
        ]);
    }

    #[Test]
    public function works_as_expected()
    {
        // See https://docs.flarum.org/extend/testing.html#backend-tests for more information.
    }
}
