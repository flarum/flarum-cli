<?php

namespace <%= classNamespace %>;

use Flarum\Post\Exception\FloodingException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface as Middleware;
use Psr\Http\Server\RequestHandlerInterface as Handler;

class <%= className %> implements Middleware
{
    public function process(Request $request, Handler $handler): Response
    {
        // do something with the request

        return $handler->handle($request);
    }
}
