<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Connexion : email + password, retourne user + token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants invalides.'],
            ]);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    /**
     * Inscription (à implémenter selon besoins).
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:191',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Déconnexion : révoque le token courant.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie.',
            'data' => null,
        ]);
    }

    /**
     * Utilisateur connecté.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => null,
            'data' => new UserResource($request->user()),
        ]);
    }
}
