<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    private const DISK = 'public';
    private const PRODUCTS_PATH = 'products';

    /**
     * POST /api/super-admin/media/upload
     * Accept multiple image files, store in public/storage/products/
     * Return array of: { filename, url, size, mime }
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array'],
            'files.*' => ['required', 'image', 'max:5120'],
        ]);

        $files = $request->file('files');
        $uploaded = [];
        foreach ($files as $file) {
            $path = $file->store(self::PRODUCTS_PATH, self::DISK);
            $filename = basename($path);
            $fullPath = Storage::disk(self::DISK)->path($path);
            $uploaded[] = [
                'filename' => $filename,
                'url' => url('/storage/' . $path),
                'size' => (int) (is_file($fullPath) ? filesize($fullPath) : $file->getSize()),
                'mime' => $file->getMimeType(),
            ];
        }

        return response()->json(['files' => $uploaded], 201);
    }

    /**
     * GET /api/super-admin/media
     * Return all files in public/storage/products/
     * Each file: { filename, url, size, created_at }
     */
    public function index(): JsonResponse
    {
        $disk = Storage::disk(self::DISK);
        $directory = self::PRODUCTS_PATH;
        $files = [];

        if (!$disk->exists($directory)) {
            return response()->json(['files' => []]);
        }

        foreach ($disk->files($directory) as $path) {
            $filename = basename($path);
            $fullPath = $disk->path($path);
            $files[] = [
                'filename' => $filename,
                'url' => url('/storage/' . $path),
                'size' => (int) (is_file($fullPath) ? filesize($fullPath) : 0),
                'created_at' => is_file($fullPath) ? date('c', filemtime($fullPath)) : null,
            ];
        }

        usort($files, fn ($a, $b) => ($b['created_at'] ?? '') <=> ($a['created_at'] ?? ''));

        return response()->json(['files' => $files]);
    }

    /**
     * DELETE /api/super-admin/media/{filename}
     * Delete file from storage (filename only, no path traversal).
     */
    public function destroy(string $filename): JsonResponse
    {
        $filename = basename($filename);
        if (preg_match('/[^a-zA-Z0-9._-]/', $filename)) {
            return response()->json(['success' => false, 'message' => 'Invalid filename'], 400);
        }
        $path = self::PRODUCTS_PATH . '/' . $filename;
        if (!Storage::disk(self::DISK)->exists($path)) {
            return response()->json(['success' => false, 'message' => 'File not found'], 404);
        }
        Storage::disk(self::DISK)->delete($path);
        return response()->noContent();
    }
}
