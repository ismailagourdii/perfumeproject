<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\JsonResponse;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        $allowedRoles = func_get_args();
        // $allowedRoles = [ $request, $next, 'role1', 'role2', ... ]
        $allowedRoles = array_slice($allowedRoles, 2);

        if (!$user || (count($allowedRoles) > 0 && !in_array($user->role, $allowedRoles, true))) {
            $response = [
                'success' => false,
                'message' => 'Accès refusé.',
            ];

            return new JsonResponse($response, 403);
        }

        return $next($request);
    }
}
