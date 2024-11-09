<?php

namespace <%= classNamespace %>;

use <%= eventClass %>;

class <%= className %>
{
    public function handle(<%= eventClassName %> $event)
    {
        // Add logic to handle the event here.
        // See https://docs.flarum.org/2.x/extend/backend-events.html for more information.
    }
}
