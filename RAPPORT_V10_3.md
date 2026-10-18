# CVMemoire V10.3 — correction de la navigation

## Anomalie d'origine
L'ancienne barre de menu changeait soudainement entre un menu complet et un menu réduit, selon la largeur de l'écran, en raison de plusieurs règles CSS superposées. Certaines pages indiquaient également la mauvaise rubrique active. L'apparence des parties supérieures de trois pages était irrégulière.

## Modifications effectuées
- Exactement **11 options de navigation**, avec les mêmes intitulés, le même ordre et la même structure sur les 14 pages HTML.
- Bandeau de navigation à défilement horizontal avec flèches sur **tous les écrans**, sans menu différent sur téléphone.
- Indication active corrigée sur chaque page ; les pages légales sont regroupées sous « Informations ».
- Header et footer strictement identiques sur toutes les pages, sauf le choix de l'onglet actif.
- Feuille de style et script de navigation dédiés : `assets/navigation-uniforme.css` et `assets/navigation-uniforme.js`.
- Pages Services, Traduction et eBooks : textes et visuels rassemblés dans des blocs bien alignés, sans espacement vertical excessif.
- Correction du débordement sur petits écrans des en-têtes concernés.
- Accueil, carrousel des services, formulaires et sept offres professionnelles maintenus.
- Les scripts publicitaires présents dans la V10.2, le formulaire serveur `/api/submit-request` et les ressources existantes sont conservés.

## Vérifications
- Contrôle statique : 14/14 pages, menus et pieds de page identiques ; un seul onglet actif par page ; 0 lien local manquant.
- Tests Chromium locaux via contenu rendu : 36 contrôles sur les largeurs 320, 390, 1024 et 1440 px. Aucune option du bandeau n'est masquée par les styles ; aucune largeur de page excédant l'écran dans les contrôles.
- Défilement par flèche testé aux largeurs où le bandeau déborde.
- Tests visuels en mode local, sans chargement des services tiers ni soumission réelle des formulaires.

## Précautions
Cette version n'est pas déployée sur le domaine public. Tester la réception des formulaires, le choix des publicités et les ressources externes en préproduction avant la mise en ligne. Les exigences légales antérieures restent à respecter.
