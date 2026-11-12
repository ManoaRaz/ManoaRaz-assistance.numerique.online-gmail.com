# CVMemoire V11.9 — Publicités dans Angaya Crush

## Modifications

- Le jeu (`/jeu/`) reprend la zone **Monetag In-Page Push 11802765** déjà utilisée par CVMemoire.
- Les publicités sont **facultatives** dans le jeu : choix Accepter / Refuser dans l'accueil et sous Réglages.
- Le script est chargé au plus une fois, uniquement après acceptation et lorsque la page est en HTTPS. Aucun appel publicitaire en mode fichier local ou hors connexion.
- Le refus après acceptation recharge le jeu pour arrêter le script du fournisseur. Les niveaux restent sauvegardés normalement par le navigateur.
- Pas d'insertion artificielle d'annonces dans les 49 cases du plateau, ni d'exigence de visionner une annonce pour continuer.
- Aucun changement aux 160 niveaux, à la navigation ou aux effets spéciaux de R9.
- L'accès « Jeu Angaya » reste dans le menu du site, dans un nouvel onglet, sans menu CVMemoire à l'intérieur du jeu.
- Les pages de traduction restent supprimées depuis la V11.8.

## Publication

Téléverser le **contenu** du ZIP à la racine du site, en conservant `/jeu/` et ses fichiers.
Le code publicitaire de la V11.9 ne sera actif en ligne qu'après déploiement et acceptation par le joueur.
Consulter votre espace Monetag pour confirmer que la zone 11802765 est toujours active et autorisée sur votre domaine.
Le format In-Page Push est administré par Monetag : sa position, fréquence et son rendu ne sont pas entièrement contrôlables depuis le code du jeu.
Sur navigateur avec bloqueur de publicité, les annonces peuvent ne pas apparaître.

## Vérifications conseillées

1. Ouvrir `https://cvmemoire.click/jeu/` en navigation privée.
2. Refuser les annonces : vérifier l'absence de requête vers `nap5k.com/tag.min.js`.
3. Dans Réglages, accepter : vérifier le chargement du script Monetag ; il ne doit apparaître qu'une fois dans la page.
4. Tester la carte, le niveau 1 et le retour à l'accueil via le logo 3EMI.
5. Dans Réglages, refuser de nouveau : la page se recharge sans lancer Monetag et la progression est préservée.

La visibilité réelle des annonces et les revenus éventuels ne peuvent pas être garantis par les fichiers seuls.
