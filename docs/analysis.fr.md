# Analyse du brief · Maison Vauclair

> **Origine de ce document.** Les sections 1 à 7 sont une première analyse faite avec Claude (claude.ai) entre le 16 et le 18 octobre 2026, que j'ai relue et discutée. Les maquettes de `docs/mockups/` ont été produites de la même façon avec ma vision d'une interface moderne stylysée pour Maison Vauclair. La section 8 est mon avis personnel, écrit par moi : ce que je garde, ce que je change et pourquoi.

## 1. Ce que le brief teste vraiment *(fait avec Claude)*

- **Le point décisif, c'est la réflexion**, et surtout la capacité à trouver un problème « auquel le client n'avait pas pensé ». Le code passe après.
- **Les contraintes cachées** : pas d'IA dans l'application, personne de technique en interne, une logistique qui ne veut pas d'outil de plus, et une direction qui attend une première version.
- **Les fausses pistes** : le chatbot et l'application mobile demandés par le responsable marketing.
- **Le public** : une directrice non technique. Tout doit se comprendre en regardant l'interface.

## 2. Ce que disent les chiffres *(fait avec Claude)*

- La boutique en ligne fait 18 % du chiffre d'affaires avec CHF 1,1 million, donc l'entreprise pèse environ **CHF 6,1 millions**.
- Près de la moitié des ventes en ligne se fait à Noël, soit **environ CHF 550 000 en quelques semaines**.
- L'objectif de CHF 1,6 million représente **+500 000 francs, soit +45 % en deux ans**. Avec des clients qui commandent une fois par an, il faut de nouveaux clients ou une deuxième commande.
- **Un visiteur sur cinq est germanophone**, alors que le site n'existe qu'en français.
- **+25 % de B2B sans embauche administrative** est impossible tant que chaque commande est ressaisie à la main.

## 3. Les problèmes cachés *(fait avec Claude)*

1. **Les clients en ligne sont surtout des gens qui offrent un cadeau.** Ils commandent une fois, à Noël. Or le coffret cadeau n'est vendu qu'en boutique.
2. **Le destinataire du cadeau est un client perdu.** Il goûte les produits, et Maison Vauclair ne sait pas qu'il existe.
3. **La règle du frais tombe au pire moment.** Le frais ne part que du lundi au mercredi, et en 2026 le 24 décembre est un jeudi. La dernière commande avec du frais pour une livraison avant Noël est donc le **mardi 22 décembre**. Une commande passée le mercredi 23 n'arrivera que le mardi 29. Aujourd'hui, le client n'a aucun moyen de le savoir, et l'erreur tombe sur la période qui pèse la moitié des ventes en ligne.
4. **En B2B, les restaurants commandent souvent la même chose chaque semaine.** Le vrai gain serait de pouvoir renouveler une commande en un clic.

## 4. Comparaison des pistes *(fait avec Claude)*

| Piste | Impact sur les objectifs | Problème caché | Faisable en 3 h | Démo parlante |
|---|---|---|---|---|
| **Configurateur de coffrets** | Fort sur l'en ligne et sur Noël | Oui, points 1 à 3 | Oui, si bien cadré | Excellente |
| Portail de commande B2B | Fort sur le B2B | Partiel, point 4 | Oui | Correcte |
| Tableau de bord des ventes | Indirect | Non, problème évident | Oui | Moyenne |
| Chatbot | Faible | Non | Exclu : il faut de l'IA | — |
| Application mobile | Faible | Non | Hors sujet | — |

Personne n'installera une application pour une commande par an : c'est l'argument contre l'application mobile.

## 5. Proposition : « Composez votre coffret » *(fait avec Claude)*

Le client compose son coffret cadeau en ligne, en français ou en allemand, et sait immédiatement quand il sera livré.

**Le cœur de la v1**
- Trois tailles de coffret (4, 6 ou 9 produits), un catalogue fictif d'environ 24 produits, le total en direct.
- Une date de livraison fiable, calculée selon la règle du frais et les jours fériés vaudois, avec la date limite pour Noël.
- Le destinataire, la langue de sa carte et un message.
- La commande enregistrée côté serveur, et une fiche de préparation imprimable pour l'équipe : aucun outil de plus pour la logistique.
- Le français et l'allemand.

**Le levier de croissance :** une carte de bienvenue glissée dans le coffret, avec un QR code et un code pour le destinataire, pour qu'il devienne client. Les paramètres de suivi du lien permettent de mesurer combien le deviennent.

**Écarté volontairement :** le paiement, les comptes clients, la connexion réelle à WooCommerce, l'administration du catalogue.

**Sans IA :** tout repose sur des règles simples. Pas de coût à l'usage, pas de données qui partent ailleurs, un comportement prévisible.

**Alternative :** un portail B2B où le restaurant renouvelle sa commande en un clic, avec la date limite du frais et une feuille de préparation pour la logistique.

## 6. Choix techniques *(fait avec Claude)*

- Next.js 15 et TypeScript strict, Tailwind CSS, Zod pour une validation partagée entre le navigateur et le serveur, Vitest pour les tests.
- Pas de base de données en v1 : catalogue en JSON, commandes en fichiers JSON derrière une interface qu'une connexion WooCommerce pourra remplacer.
- La règle de livraison isolée dans une fonction pure, écrite en commençant par les tests.
- Le serveur recalcule toujours les prix et les dates : il ne fait jamais confiance au navigateur.
- Image Docker, intégration continue sur GitHub, hébergement sur mon serveur avec Dokploy et Cloudflare, à l'adresse maison-vauclair.enzo-chamanier.fr. Vercel en secours.
- Mobile d'abord, impeccable sur ordinateur, accessible (WCAG 2.2 AA).
- Détails suisses : prix au format CHF 79.–, NPA à 4 chiffres, allemand sans ß, jours fériés vaudois, âge légal de 16 ans pour le vin, page « Données personnelles » dans l'esprit de la nLPD, aucun cookie de suivi.

## 7. Plan des 3 heures *(fait avec Claude)*

| Étape | Fin à |
|---|---|
| Cadrage et plan, sans coder | 0:10 |
| Fondations et design system | 0:30 |
| Mise en ligne immédiate | 0:45 |
| Catalogue et données | 0:55 |
| Règle de livraison, tests d'abord | 1:15 |
| Étapes 1 et 2 du parcours | 1:45 |
| Étape 3 et enregistrement côté serveur | 2:10 |
| Espace équipe et fiche de préparation | 2:25 |
| Carte de bienvenue avec QR code | 2:35 |
| Finitions et revue critique | 2:48 |
| README, décisions, note pour la direction | 3:00 |

Si je prends du retard, je coupe dans cet ordre : la page de style, les chiffres de l'espace équipe, la carte de bienvenue, la mise en page en deux colonnes. Je ne coupe jamais la règle de livraison et ses tests, le parcours complet, la mise en ligne et les livrables.

## 8. Mon avis *(mis en forme avec Claude à partir des positions que j'ai prises pendant la préparation, relu et validé par moi)*

**Ce que je garde.** Le coffret cadeau. La moitié des ventes en ligne se fait à Noël, par des clients qui ne commandent qu'une fois par an : ce sont des gens qui offrent un cadeau. C'est le problème qui touche le plus directement l'objectif de passer de 1,1 à 1,6 million en deux ans.

**Ce que j'ai tranché.** J'ai priorisé. Le chatbot n'est pas le besoin le plus urgent, et la direction ne veut pas d'IA dans l'application. J'ai aussi choisi une application web plutôt qu'une application mobile : pensée d'abord pour le téléphone, mais soignée sur ordinateur. Pour l'identité visuelle, j'ai écarté une première proposition qui ressemblait à ce qu'on voit partout, et j'ai demandé une direction de luxe suisse : de la retenue, des filets fins et un seul accent de couleur.

**Comment j'ai utilisé l'IA.** Pour produire vite : analyse, maquettes, code. Les décisions restent les miennes, et je dois pouvoir justifier chacune à l'oral.

**Ce que mon expérience apporte.** Avec Beement, j'ai appris à livrer seul jusqu'à la production, et à ne pas sous-estimer l'infrastructure : je déploie donc dès le début. Chez Sanofi, j'ai livré cinq applications métier pour des utilisateurs non techniques. C'est pour eux qu'existe la fiche de préparation.

**La suite que je proposerais.** D'abord, brancher le configurateur à la boutique WooCommerce avec le paiement, pour qu'il soit en ligne avant Noël. Ensuite, le faire tester par quelques clients. Puis passer au deuxième objectif avec un portail de commande B2B pour les restaurants.