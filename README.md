# perfumeproject

## Fichiers média (Laravel)

Après installation du backend, créer le lien symbolique vers le stockage public :

```bash
cd backend && php artisan storage:link
```

Les images uploadées (`storage/app/public/products`, `banners`, etc.) sont alors servies sous `APP_URL/storage/...`.

## Frontend (Next.js)

Copier `frontend/.env.example` vers `frontend/.env.local` et définir `NEXT_PUBLIC_API_URL` sur la même base que `APP_URL` du backend (sans `/api`).
