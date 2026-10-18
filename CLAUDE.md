# CLAUDE.md · Maison Vauclair, « Composez votre coffret »

## Contexte

Mise en situation pour CS Digital (entretien le 21 octobre 2026) : livrer en 3 heures la première version d'une mini-application pour Maison Vauclair, fromagerie et épicerie fine vaudoise **fictive**. Enzo pilote, vérifie et tranche.

Références dans `docs/` :
- `BRIEF.md` : le brief du client, reproduit tel quel ;
- `ANALYSE.md` : l'analyse, le plan des 3 heures et l'ordre de coupe ;
- `maquettes/` : 4 maquettes HTML validées (parcours mobile en 390 px, fiche de préparation au format A4).

## Le problème

Près de la moitié des ventes en ligne se fait à Noël, par des clients qui ne commandent qu'une fois par an pour offrir un cadeau, alors que le coffret cadeau n'est vendu qu'en boutique. Le frais ne part que du lundi au mercredi et, en 2026, le 24 décembre tombe un jeudi : personne ne sait jusqu'à quand commander. Enfin, chaque coffret fait découvrir la maison à un destinataire qui n'est pas encore client.

## Périmètre de la v1

1. Composer un coffret en ligne : choisir une taille (4, 6 ou 9 produits), le remplir, voir le total.
2. Afficher une date de livraison fiable, qui respecte la règle du frais, et la date limite pour Noël.
3. Saisir le destinataire, la langue de sa carte et un message.
4. Enregistrer la commande côté serveur et produire une fiche de préparation imprimable pour l'équipe, sans outil de plus à apprendre.
5. Produire une carte de bienvenue avec QR code pour transformer le destinataire en client.
6. Fonctionner en français et en allemand.

**Hors périmètre, volontairement** : paiement, comptes clients, connexion réelle à WooCommerce, chatbot, application mobile native.

## Contraintes non négociables

- Aucune IA ni appel à un modèle dans l'application (exigence de la direction).
- Pas de base de données en v1 : catalogue en JSON, commandes en fichiers JSON dans `data/orders/` (jamais versionnés), derrière une interface remplaçable par une connexion WooCommerce.
- Mobile d'abord, mais impeccable sur ordinateur : la démo se fait sur grand écran.
- Accessible : WCAG 2.2 AA.
- Données inventées, avec la mention « Projet de démonstration · entreprise fictive » sur chaque page, impression comprise.

## Stack

- Next.js 15 (App Router) et TypeScript strict
- Tailwind CSS v4
- Zod pour la validation partagée entre client et serveur
- Vitest pour les tests
- Docker pour l'image, déploiement sur le VPS via Dokploy, sous `maison-vauclair.enzo-chamanier.fr`

Versions fixées : `next` et `eslint-config-next` 15.5.28, `typescript` 5.x (la 7 n'est pas prise en charge par Next 15), `eslint` 9.x (`eslint-config-next` 15 refuse la 10).

## Conventions

- Code et noms (fichiers, variables, types, routes internes) en anglais.
- Textes d'interface en français et en allemand, jamais en dur dans les composants.
- TypeScript strict, sans `any`.
- Montants en centimes, en entiers (`priceCents: 1450`) ; le formatage en CHF n'a lieu qu'à l'affichage.
- Dates métier au format `AAAA-MM-JJ`.
- Commits au format Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`…).
- **Demander à Enzo avant d'ajouter une dépendance.**

## Règles de travail

- Le serveur recalcule toujours les prix et les dates : il ne fait jamais confiance au navigateur.
- La règle de livraison est isolée dans une fonction pure, écrite en commençant par les tests.
- Ne jamais lire un fichier `.env` ; n'écrire aucun secret dans le dépôt. Variables d'environnement : `TEAM_PASSWORD`, `DEMO_MODE`, `SITE_URL`.

## Architecture

Une seule application Next.js, découpée en couches séparées :

```
src/
├── app/           Routage Next.js uniquement : pages, layouts, routes d'API. Fin, il assemble les couches.
├── frontend/      Interface : composants, parcours du coffret, dictionnaires FR/DE.
├── backend/       Serveur uniquement : cas d'usage, dépôts (catalogue, commandes), configuration.
├── shared/        Pur, utilisé des deux côtés : règles métier, schémas Zod, table des routes localisées.
└── middleware.ts  Langue, URL localisées, mot de passe de l'espace équipe.
```

Règles d'import, vérifiées par ESLint :
- `shared` n'importe ni `frontend`, ni `backend`, ni React, ni Next ;
- `frontend` n'importe jamais `backend` : les composants clients passent par l'API HTTP (`/api/...`) ;
- `backend` n'importe jamais `frontend` ;
- seul `app` assemble : une page serveur peut appeler un service du backend et passer le résultat à un composant du frontend.

Le catalogue et les commandes sont derrière des interfaces (`CatalogRepository`, `OrderRepository`) : implémentation en fichiers JSON en v1, WooCommerce ensuite.

## URL et langues

- La langue est le premier segment de l'URL (`/fr/...`, `/de/...`). `/` redirige selon la langue du navigateur, en français par défaut.
- Les chemins sont traduits. Une table unique dans `shared` fait correspondre chaque page à son chemin FR et DE ; le middleware réécrit vers les routes internes en anglais, et les liens sont générés à partir de cette table. Les chemins internes ne sont pas exposés.
- Le sélecteur de langue mène à la même page dans l'autre langue (liens avec `hreflang`), `<html lang>` suit la langue, et les métadonnées déclarent les alternatives.

| Page | FR | DE |
|---|---|---|
| Étape 1 : la taille | `/fr` | `/de` |
| Étape 2 : remplir | `/fr/coffret/composer` | `/de/geschenkbox/zusammenstellen` |
| Étape 3 : livraison | `/fr/coffret/livraison` | `/de/geschenkbox/lieferung` |
| Confirmation | `/fr/coffret/confirmation/{n°}` | `/de/geschenkbox/bestaetigung/{n°}` |
| Bienvenue (cible du QR) | `/fr/bienvenue` | `/de/willkommen` |
| Données personnelles | `/fr/donnees-personnelles` | `/de/datenschutz` |
| Espace équipe (français) | `/equipe`, `/equipe/commandes/{n°}`, `/equipe/commandes/{n°}/carte` | — |

## Décisions validées

**Prix**
- Total = somme des produits + forfait coffret, affiché sur une ligne à part : Petit (4) CHF 9.–, Classique (6) CHF 12.–, Grand (9) CHF 15.–. Le forfait couvre la boîte, le calage isotherme, la carte et l'envoi : aucun autre frais.
- Étape 1 : « dès CHF … » = les produits les moins chers du catalogue pour la taille + le forfait.
- Un exemplaire au plus par produit ; on ne continue qu'avec un coffret plein.

**Livraison** (fonction pure, tests d'abord)
- Jour ouvré : du lundi au vendredi, hors jours fériés vaudois.
- Expédition au plus tôt le lendemain de la commande, sans heure limite.
- Coffret contenant au moins un produit frais : expédition du lundi au mercredi, et seulement si la livraison du lendemain tombe un jour ouvré. Test obligatoire : mercredi 13 mai 2026, veille de l'Ascension.
- Coffret sans produit frais : expédition n'importe quel jour ouvré, livraison le jour ouvré suivant.
- Livré le 24 décembre = à temps pour Noël. Date limite de Noël 2026 : mardi 22 décembre ; une commande du mercredi 23 est livrée le mardi 29.
- « Aujourd'hui » est la date du jour à Europe/Zurich, passée en paramètre aux fonctions.
- Limite de la v1, à écrire dans le README : les jours fériés du canton du destinataire ne sont pas gérés.

**Étape 3 : le formulaire**
- Destinataire : nom, rue, NPA (4 chiffres), localité, avec la mention « Livraison en Suisse uniquement ».
- Langue de la carte (FR ou DE), par défaut celle de l'interface ; message de longueur limitée ; carte de bienvenue.
- Acheteur : nom et e-mail.
- Si le coffret contient du vin, case obligatoire : « L'acheteur et le destinataire ont 16 ans ou plus. »

**Après la validation**
- Le client voit une page de confirmation (numéro, date de livraison, aperçu de la carte). La fiche de préparation est réservée à l'espace équipe.
- Si la date recalculée par le serveur diffère de celle affichée, la confirmation le dit clairement.

**Espace équipe**
- Protégé par un mot de passe HTTP géré par le middleware, avec sa valeur dans `TEAM_PASSWORD` (variables Dokploy). Variable absente en production : l'espace reste fermé.
- En français. Fiche de préparation A4 et carte de bienvenue A6 imprimables.

**Carte de bienvenue** : un code aléatoire par commande, un QR code vers la page « Bienvenue » dans la langue de la carte, avec des paramètres `utm_*`, sans cookie, et un avantage fictif de 10 % sur la première commande.

**Mode démonstration**
- Une date simulée passée en paramètre d'URL, sans cookie, acceptée par le serveur seulement si `DEMO_MODE` est activé.
- Elle reste active pendant tout le parcours : liens, état du coffret, envoi de la commande.
- Un bandeau visible sur chaque page affiche « Mode démonstration · date simulée : … ».
- La commande garde sa date réelle de création à côté de la date simulée, et la fiche signale la simulation.

## Règles et détails suisses

- Prix au format `CHF 79.–` et `CHF 14.50`, NPA à 4 chiffres, allemand sans « ß », jours fériés vaudois, âge légal de 16 ans pour le vin, page « Données personnelles » dans l'esprit de la nLPD, aucun cookie de suivi.

## Direction visuelle (issue des maquettes)

Luxe suisse : de la retenue, des filets fins, un seul accent de couleur.
- Couleurs : encre `#111111`, texte secondaire `#6E6E6A`, filets `#E3E2DE`, fond produit `#F4F3F0`, accent unique `#D52B1E`, réservé aux signaux (date de livraison, frais, « le plus offert »).
- Police Archivo (300 à 600) : titres légers à interlettrage serré, libellés en petites capitales espacées, montants en chiffres tabulaires.
- Filets de 1 px, aucun arrondi sauf les pastilles, zones tactiles d'au moins 44 px.
- Les maquettes sont en 390 px : sur ordinateur, deux colonnes dès 1024 px aux étapes 2 et 3 (catalogue, récapitulatif fixe).

## Priorités en cas de retard

Couper dans cet ordre : la page de style, les chiffres de l'espace équipe, la carte de bienvenue, la mise en page en deux colonnes.
Ne jamais couper : la règle de livraison et ses tests, le parcours complet, la mise en ligne, les livrables.
