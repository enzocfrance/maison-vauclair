[English](README.md) · **Français**

# Maison Vauclair · Composez votre coffret

> Projet de démonstration · entreprise fictive. Réalisé en 3 heures pour la mise en situation CS Digital du 21 octobre 2026.

**Démo en ligne :** <https://maison-vauclair.enzo-chamanier.fr>

## Le problème

Près de la moitié des ventes en ligne de Maison Vauclair se fait à Noël, par des clients qui ne commandent qu'une fois par an pour offrir un cadeau. Or :

- le coffret cadeau, produit le plus rentable, ne se compose qu'en boutique ;
- le frais ne part que du lundi au mercredi et, en 2026, le 24 décembre tombe un jeudi : personne ne sait jusqu'à quand commander ;
- chaque coffret arrive chez un destinataire dont la maison n'entend jamais parler.

## Ce que fait l'application

1. **Composer un coffret**, en français ou en allemand : choisir 4, 6 ou 9 produits et voir le prix complet en direct (les produits, plus un forfait coffret qui couvre l'emballage et l'envoi).
2. **Savoir quand il arrive** : une date de livraison qui respecte la règle du frais et les jours fériés vaudois, et la date limite pour Noël (mardi 22 décembre 2026).
3. **Écrire au destinataire** : adresse en Suisse, langue de la carte, message. Le vin demande une confirmation 16+.
4. **Préparer sans nouvel outil** : l'espace équipe liste les commandes par jour d'expédition et imprime une fiche de préparation A4.
5. **Faire du destinataire un client** : une carte de bienvenue imprimable avec un code personnel et un QR code, mesurée sans cookie.

L'application ne contient aucune IA : tout repose sur des règles explicites et testées.

## L'essayer

| Quoi                         | Où                                                   |
| ---------------------------- | ---------------------------------------------------- |
| Parcours client              | `/fr` ou `/de` (`/` choisit la langue du navigateur) |
| Date limite de Noël dépassée | ajouter `?date=2026-12-23` (mode démo)               |
| Espace équipe                | `/equipe` (mot de passe transmis à part)             |
| Données personnelles         | `/fr/donnees-personnelles`, `/de/datenschutz`        |

En mode démo (`DEMO_MODE=true`), `?date=AAAA-MM-JJ` simule la date du jour pendant tout le parcours, et un bandeau l'affiche sur chaque page pour que personne ne la prenne pour la vraie date.

## Le lancer en local

Prérequis : Node.js 22.12 ou plus récent, npm.

```bash
npm ci
npm run dev   # http://localhost:3000
```

| Variable        | Rôle                                       | Par défaut                                   |
| --------------- | ------------------------------------------ | -------------------------------------------- |
| `SITE_URL`      | Adresse publique, utilisée dans le QR code | `http://localhost:3000`                      |
| `DEMO_MODE`     | Accepte une date simulée (`?date=`)        | désactivé                                    |
| `TEAM_PASSWORD` | Mot de passe de l'espace équipe            | ouvert en développement, fermé en production |
| `ORDERS_DIR`    | Dossier où les commandes sont écrites      | `./data/orders`                              |

| Script                 | Ce qu'il fait                                     |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Serveur de développement                          |
| `npm run build`        | Build de production (sortie autonome pour Docker) |
| `npm test`             | Tests (Vitest)                                    |
| `npm run typecheck`    | Types des routes et TypeScript                    |
| `npm run lint`         | ESLint, y compris les règles entre couches        |
| `npm run format:check` | Prettier                                          |

## Choix de design

- **Le luxe par la précision, pas par la décoration** : noir, blanc et un seul accent rouge, Archivo, filets fins et cercles ; ni dégradés, ni ombres, ni cartes arrondies.
- **Logo** : conçu avec Claude pendant la préparation. Un cadran de montre, qui rappelle aussi la meule et son poinçon, avec au centre le V de Vauclair en plein et délié, et un seul point rouge à midi : l'heure juste, comme la date de livraison.
- **Détails** : le compteur du coffret est un cadran, les produits AOP, AOC et IGP portent un poinçon rond, les prix sont en chiffres tabulaires, et chaque mouvement dure moins de 250 ms et s'arrête si le visiteur préfère réduire les animations.

## Architecture

Une seule application Next.js 15 (App Router, TypeScript strict, Tailwind CSS v4, Zod), découpée en couches qu'ESLint garde séparées :

```
src/
├── app/           Routage uniquement : pages, layouts, routes d'API. Il assemble les couches.
├── frontend/      Interface : composants, parcours du coffret, espace équipe, dictionnaires FR/DE.
├── backend/       Serveur uniquement : cas d'usage, dépôts, configuration, contrôle d'accès.
├── shared/        Pur, utilisé des deux côtés : règles métier, schémas Zod, table des routes.
└── middleware.ts  Langue, URL traduites, mot de passe de l'espace équipe.
```

- `frontend` n'importe jamais `backend` : le navigateur envoie les commandes à `POST /api/orders`.
- Le catalogue et les commandes sont derrière `CatalogRepository` et `OrderRepository` : des fichiers JSON aujourd'hui, une connexion WooCommerce demain, à remplacer dans `src/backend/container.ts` seulement.
- Les URL sont traduites (`/fr/coffret/livraison`, `/de/geschenkbox/lieferung`) à partir d'une seule table, `src/shared/i18n/routes.ts` ; le middleware les sert depuis des routes internes en anglais.

| Où regarder                                      | Fichier                                            |
| ------------------------------------------------ | -------------------------------------------------- |
| Règle de livraison et date limite de Noël        | `src/shared/delivery/delivery.ts`                  |
| Jours fériés vaudois (calculés, Pâques comprise) | `src/shared/delivery/holidays.ts`                  |
| Prix et format CHF                               | `src/shared/pricing.ts`, `src/shared/money.ts`     |
| Contrat de commande partagé navigateur/serveur   | `src/shared/order/order-request.ts`                |
| Création de commande (prix et dates recalculés)  | `src/backend/orders/create-order.ts`               |
| Stockage et numérotation des commandes           | `src/backend/orders/json-file-order-repository.ts` |
| Commandes de démonstration de la présentation    | `src/backend/orders/demo-orders.ts`                |

Les raisons de chaque choix sont dans [docs/decisions.fr.md](docs/decisions.fr.md).

## Qualité

- **102 tests** : règle de livraison (écrite avant le code), jours fériés, prix, format CHF, contrat de commande, stockage avec commandes simultanées, création de commande, commandes de démonstration, accès équipe, limite de débit, routes.
- **CI à chaque push** : format, lint, types, tests, `npm audit` des dépendances de production, build, puis l'image Docker est construite, démarrée et sondée.
- **Sécurité** : le serveur recalcule prix et dates et refuse les champs inconnus ; la page de confirmation exige la clé secrète de la commande ; l'espace équipe a un mot de passe et reste fermé sans lui ; les numéros de commande sont vérifiés avant de toucher au disque ; la taille des requêtes et le nombre de commandes sont limités ; en-têtes de sécurité (CSP, `nosniff`, pas d'intégration en iframe, politique de référent, HSTS).
- **Accessibilité** (objectif WCAG 2.2 AA) : contrôles natifs, focus visible, lien d'évitement, erreurs liées à leur champ avec le focus sur la première, annonces en direct du contenu du coffret, `autocomplete`, attributs `lang`, focus jamais masqué par les barres fixes, mode couleurs forcées.
- **Données personnelles** : aucun cookie, polices servies par le site lui-même, aucune donnée envoyée à des tiers ni à un service d'IA.
- **Photos** : chaque produit et chaque catégorie a une photo de Wikimedia Commons sous licence libre (CC0, domaine public, CC BY, CC BY-SA), recadrée et compressée en WebP dans `public/images` ; auteurs et licences sont crédités sur `/fr/credits-photos` et `/de/bildnachweis`.

## Déploiement

- Image Docker construite depuis le `Dockerfile` : serveur Next.js autonome, utilisateur non root, contrôle de santé sur `/api/health`.
- Sur `main`, une fois toutes les vérifications passées, la CI demande à Dokploy de déployer par son API (secrets GitHub `DOKPLOY_URL`, `DOKPLOY_API_KEY`, `DOKPLOY_APPLICATION_ID`).
- Les commandes sont écrites dans `/app/data/orders` : y monter un volume persistant.
- Quand le serveur démarre sur un stockage de commandes vide, il ajoute 12 commandes fictives pour la présentation du 21 octobre 2026, passées par les vraies règles de commande ; un stockage qui contient déjà des commandes n'est jamais touché.

## Limites connues de la v1

- **Les jours fériés du canton du destinataire ne sont pas gérés** : les jours fériés vaudois s'appliquent à l'expédition comme à la livraison.
- Les commandes sont des fichiers JSON : un seul serveur, et la limite de débit est gardée en mémoire.
- La CSP autorise les scripts en ligne, nécessaires à Next.js sans système de nonce.
- Pas de paiement, pas d'e-mail envoyé, pas de compte client, pas de connexion à WooCommerce ; l'avantage de bienvenue de 10 % est fictif.
- Les textes allemands n'ont pas été relus par un germanophone.
- L'accessibilité est intégrée et relue, mais pas encore testée avec un lecteur d'écran.
- ESLint 9, imposé par `eslint-config-next` 15, n'est plus maintenu.

## Documents

Chaque document existe en anglais et en français (`.fr.md`).

- [Brief du client](docs/brief.fr.md)
- [Analyse et plan](docs/analysis.fr.md)
- [Maquettes validées](docs/mockups/)
- [Décisions et compromis](docs/decisions.fr.md)
- [Note d'une page pour la directrice](docs/director-note.fr.md)

## Utilisation de l'IA

L'analyse et les maquettes ont été préparées avec Claude (claude.ai), et l'application a été construite avec Claude Code sous ma direction : j'ai fixé le plan, pris chaque décision et vérifié chaque étape avant de passer à la suivante. Les exports des conversations sont fournis à part.
