[English](decisions.md) · **Français**

# Décisions et compromis

Chaque décision ci-dessous a été prise pendant l'exercice ; le compromis, c'est ce qu'elle coûte et pourquoi c'est acceptable pour une première version.

## Produit

| Décision | Pourquoi | Compromis |
|---|---|---|
| Un configurateur de coffrets, plutôt qu'un chatbot, une application mobile ou un portail B2B | Il répond au problème qui pèse le plus sur l'objectif : la moitié des ventes en ligne à Noël, par des clients qui offrent un cadeau une fois par an ([analyse](analysis.fr.md)) | Le B2B, deuxième objectif, attend une étape suivante |
| Une application web, pensée d'abord pour le téléphone | Personne n'installe une application pour une commande par an ; la démo se fait sur grand écran, d'où deux colonnes sur ordinateur | Pas de mode hors ligne |
| Un prix complet : produits + forfait coffret par taille (CHF 9.–, 12.–, 15.–) sur une ligne à part | La première question de la directrice sera « et le port ? » : le forfait couvre boîte, calage isotherme, carte et envoi | La maison doit vérifier que le forfait couvre ses coûts réels |
| La date de livraison affichée avant la commande, avec la date limite de Noël | La règle du frais (lundi à mercredi) et un 24 décembre un jeudi rendent la date limite impossible à deviner | — |
| Une carte de bienvenue avec un code personnel et un QR code | Chaque coffret arrive chez quelqu'un qui n'est pas encore client | L'avantage de 10 % est fictif ; la maison doit fixer le vrai |
| Une fiche de préparation imprimée, pas un back-office | La responsable logistique ne veut pas d'un outil de plus | Les commandes se lisent à l'écran et se préparent sur papier |

## Règles

| Décision | Pourquoi | Compromis |
|---|---|---|
| La règle de livraison est une fonction pure, écrite en commençant par les tests | C'est la promesse faite au client : elle doit être prouvable | — |
| Un coffret frais ne part que si la livraison du lendemain tombe un jour ouvré | Un fromage ne doit pas attendre dans un dépôt un jour férié (Ascension 2026) | Certaines semaines offrent moins de jours d'expédition |
| Les jours fériés vaudois sont calculés, Pâques comprise, et non listés | Une liste en dur expirerait sans prévenir | Les jours fériés du canton du destinataire ne sont pas gérés en v1 |
| « Aujourd'hui » est calculé à l'heure de Zurich et passé en paramètre | Le serveur tourne en UTC : autour de minuit, la date serait fausse d'un jour | — |
| Le serveur recalcule prix et dates ; le schéma refuse les champs inconnus | On ne fait jamais confiance au navigateur | Si la date a changé entre-temps, la confirmation le dit |
| Montants en centimes entiers, dates au format `AAAA-MM-JJ` | Pas d'erreurs d'arrondi, pas de surprise de fuseau horaire | — |

## Architecture

| Décision | Pourquoi | Compromis |
|---|---|---|
| Une seule application Next.js découpée en `app`, `frontend`, `backend`, `shared`, contrôlée par ESLint | Une séparation nette sans deux services, deux images et du CORS à gérer en 3 heures | La séparation repose sur des règles de lint, pas sur des déploiements distincts |
| Le navigateur n'atteint le backend que par `POST /api/orders` | Un contrat explicite qu'un backend séparé pourrait reprendre | — |
| Pas de base de données : catalogue en JSON, un fichier JSON par commande, derrière `CatalogRepository` et `OrderRepository` | Exigé pour la v1 ; WooCommerce peut les remplacer dans un seul fichier | Un seul serveur |
| Numéros de commande réservés par un lien physique vers un fichier temporaire complet | Deux commandes simultanées n'ont jamais le même numéro, personne ne lit un fichier à moitié écrit | — |
| URL traduites (`/fr/coffret/…`, `/de/geschenkbox/…`) servies depuis des routes internes en anglais | Les germanophones lisent des URL en allemand ; le code reste en anglais | Un middleware et une table de routes à entretenir |
| Le coffret en cours est gardé dans le `sessionStorage` | Il survit au rechargement, sans cookie, sans rien envoyer | Il disparaît à la fermeture de l'onglet |
| Mode démo : une date simulée dans l'URL, acceptée seulement si `DEMO_MODE=true`, avec un bandeau | Montre la date limite de Noël en octobre, sans que personne ne la prenne pour la vraie date | À désactiver pour un usage réel |
| 12 commandes fictives ajoutées par `createOrder` quand le serveur démarre sur un stockage de commandes vide | L'espace équipe n'est jamais vide pendant la présentation, en dev comme en prod, et leurs prix et dates suivent les vraies règles | Leurs dates sont les 20 et 21 octobre 2026 ; supprimer toutes les commandes les fait revenir au démarrage suivant |

## Sécurité et données personnelles

| Décision | Pourquoi | Compromis |
|---|---|---|
| Page de confirmation protégée par une clé secrète | Les numéros se suivent : personne ne doit pouvoir lire l'adresse d'un autre client en devinant un numéro | Le lien doit être conservé |
| Espace équipe derrière un mot de passe HTTP, fermé s'il n'est pas configuré | Les commandes contiennent des adresses ; une variable oubliée ne doit pas les ouvrir | Un mot de passe partagé, pas de comptes individuels |
| Limites de taille des requêtes et du nombre de commandes | Un script pourrait remplir le disque et l'espace équipe | La limite est gardée en mémoire |
| En-têtes de sécurité, avec une CSP qui autorise les scripts en ligne | Bloque les sources externes, l'intégration en iframe et les formulaires envoyés ailleurs | Les scripts en ligne restent permis : Next.js en a besoin sans nonces |
| Polices auto-hébergées, aucun cookie, aucun tiers, aucune IA | L'exigence de la direction sur les coûts et la maîtrise des données, et l'esprit de la nLPD | — |

## Outillage et livraison

| Décision | Pourquoi | Compromis |
|---|---|---|
| Next.js 15.5.28, TypeScript 5.9, ESLint 9 avec `@eslint/eslintrc` | La stack choisie ; TypeScript 7 et ESLint 10 ne sont pas pris en charge par Next 15 | ESLint 9 n'est plus maintenu |
| PostCSS imposé en 8.5.30 par `overrides` | La version incluse dans Next 15 a des failles connues | Une contrainte à surveiller lors des mises à jour de Next |
| Peu de dépendances : pas de bibliothèque d'i18n, de dates, d'interface ni de test d'interface | Intl et des dictionnaires typés suffisent ; les tests visent la logique métier | Le comportement de l'interface est vérifié à la main, pas par des tests automatisés |
| Déploiement déclenché par la CI via l'API de Dokploy, seulement si tout est vert | Le webhook de Dokploy ne se déclenchait pas ; la production ne reçoit plus que des versions vérifiées | Trois secrets GitHub à gérer |
| Image Docker : serveur autonome, non root, contrôle de santé, construite et sondée en CI | L'image testée est l'image déployée | — |
