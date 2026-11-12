# CVMemoire + ANGAYA CRUSH — V11.27

## Nouvelle bande sonore d'accueil

- Remplacement de la musique d'accueil « Les Reflets du Lagon » par la bande sonore « Bande sonore épique et enchanteresse - Google Gemini.mp4 », fournie par le propriétaire du site.
- Extraction de la piste audio et conversion en MP3 stéréo de 192 kb/s, compatible avec les navigateurs modernes.
- Conservation des trois minutes de musique, diffusée en boucle à l'accueil du jeu.
- Mise à jour de l'audio intégré directement dans le fichier HTML du jeu pour la lecture locale et hors connexion.
- Invalidation du cache du service worker, désormais `angaya-crush-v11-27-intro-enchanteresse`, pour que la nouvelle musique soit récupérée après publication.
- Modification du nom de la piste d'accueil dans le lecteur audio du jeu.

## Éléments préservés

- Musique SUNSHINE DROP pendant les niveaux.
- Fanfare READY → GO, tambours des combos, applaudissements, bruitages et sons de parchemin.
- Les 160 niveaux, les sauvegardes des joueurs, la galerie, les menus, le système Tally, les pages de contact et les autres services CVMemoire.

## Mise en ligne GitHub Pages

1. Décompressez le ZIP complet ; importez les fichiers et dossiers dans le dépôt (pas le ZIP lui-même).
2. Patientez jusqu'à la fin du déploiement GitHub Pages.
3. Ouvrez le jeu et actualisez une fois, puis si nécessaire une seconde fois : l'ancien service worker peut d'abord afficher la version en cache.
4. Activez la musique si elle est coupée. Par sécurité, les navigateurs peuvent attendre un premier clic du joueur avant d'autoriser le son.
5. Testez l'accueil puis ouvrez un niveau pour confirmer que SUNSHINE DROP reste bien la musique du plateau.

Note : le jeu n'est pas modifié pour démarrer automatiquement une lecture sonore contre les règles d'autoplay des navigateurs.
