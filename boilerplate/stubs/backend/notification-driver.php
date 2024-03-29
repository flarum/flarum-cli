<?php

namespace <%= classNamespace %>;

use Flarum\Notification\Blueprint\BlueprintInterface;
use Flarum\Notification\Driver\NotificationDriverInterface;
use Illuminate\Contracts\Queue\Queue;
use <%= packageNamespace %>\Jobs\SendNotificationsJob;

class <%= className %> implements NotificationDriverInterface
{
    public function __construct(
        protected Queue $queue
    ) {
    }

    public function send(BlueprintInterface $blueprint, array $users): void
    {
        // The `send` method is responsible for determining any notifications need to be sent.
        // If not (for example, if there are no users to send to), there's no point in scheduling a job.
        // We HIGHLY recommend that notifications are sent via a queue job for performance reasons.
        if (count($users)) {
            $this->queue->push(new SendNotificationsJob($blueprint, $users));
        }
    }

    public function registerType(string $blueprintClass, array $driversEnabledByDefault): void
    {
        // This method is generally used to register a user preference for this notification.
        // This is optional.
    }
}
