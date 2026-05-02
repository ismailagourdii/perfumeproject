# Design system SCENTARA (frontend shop)

## Thème

- **Fond principal** : `#080604`
- **Surfaces** :
  - surface 1 : `#0f0c08`
  - surface 2 : `#1a1610`
- **Or** :
  - or principal : `#c8960a`
  - or clair : `#f0c040`
- **Texte** :
  - crème : `#f5f0e8`
  - muté : `#a09070`

## Typographie

- **Titres / hero** : `Cormorant Garamond`, serif
- **Corps** : `DM Sans`, sans-serif

Utiliser Cormorant Garamond pour les titres et chiffres clés, DM Sans pour tous les textes de contenu, boutons et formulaires.

## Composants UI

Les primitives suivantes sont fournies par `@/components/ui` et doivent être importées plutôt que recréées :

- `Button` : boutons primaire / secondaire / ghost
- `Card` : cartes produit, pack, stat
- `Modal` : modales de sélection et confirmation
- `Input` : champs de saisie formulaires
- `Badge` : badges de statut (commandes)

Toutes les nouvelles pages doivent :

- Utiliser le fond sombre (`colors.bg`)
- Mettre en avant les accents dorés (`colors.gold`, `colors.goldLight`)
- Garder une mise en page aérée, avec des grilles régulières et de grands visuels produits.

