<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3001',
    ],

    // Accès LAN : Next en dev sur http://<IP>:3000
    'allowed_origins_patterns' => [
        '#^http://192\.168\.\d{1,3}\.\d{1,3}:3000$#',
        '#^http://10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$#',
        '#^http://172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}:3000$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];

