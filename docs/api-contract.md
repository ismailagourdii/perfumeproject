# Contrat d’API SCENTARA (frontend shop)

## Produits

### GET /api/products

Retourne la liste paginée des parfums.

- **Query** :
  - `page` (number, optionnel)
  - `per_page` (number, optionnel)
  - `category` (`homme` | `femme` | `mixte`, optionnel)

- **Réponse** (`200`) :
  - `data`: `Perfume[]`
  - `meta`:
    - `current_page`: number
    - `per_page`: number
    - `total`: number
    - `last_page`: number

### GET /api/products/:slug

Retourne le détail d’un parfum + recommandations.

- **Paramètres** :
  - `slug`: string

- **Réponse** (`200`) :
  - `perfume`: `Perfume`
  - `related`: `Perfume[]` (même catégorie, max 4)

## Villes & livraison

### GET /api/cities

Retourne la liste des villes disponibles pour la livraison.

- **Réponse** (`200`) :
  - `cities`: `City[]`

## Paramètres boutique

### GET /api/settings/shop

Retourne la configuration boutique utile au checkout.

- **Réponse** (`200`) :
  - `settings`: `ShopSettings`

## Commandes

### POST /api/orders

Crée une nouvelle commande depuis le panier courant.

- **Body** :
  - `items`: `CartItem[]`
  - `city_id`: number
  - `address_line1`: string
  - `address_line2`?: string
  - `customer_name`: string
  - `customer_phone`: string
  - `payment_method`: `PaymentMethodCode`

- **Réponse** (`201`) :
  - `order`: `OrderSummary`

### GET /api/orders/:id

Retourne le récapitulatif d’une commande existante.

- **Paramètres** :
  - `id`: number

- **Réponse** (`200`) :
  - `order`: `OrderSummary`

