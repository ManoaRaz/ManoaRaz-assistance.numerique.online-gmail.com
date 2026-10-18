# CVMemoire V10.2 — harmonisation intégrale

Cette version corrige les menus et l'affichage de toutes les pages HTML à partir de la V10.1, tout en conservant l'accueil, le carrousel, les sept offres B2B, les formulaires historiques et les API d'origine.

- Menu commun aux 14 pages, responsive, accessible au clavier et utilisable sur écran tactile ; même pied de page.
- Page « Services » et « Accompagnement CV » réalignées sur le style global, plus de menu V9 cassé ni de blocs non stylisés.
- Visuels de secours originaux **locaux** dans `assets/visuals/` pour les photos de l'accueil (si indisponibles) et pour les autres pages, sans dépendance à une banque d'images externe.
- La page d'accueil conserve la composition V10.1 appréciée, avec des images de secours lorsque les photos distantes échouent.
- Les scripts Monetag et les identifiants existants sont maintenus dans les pages concernées.
- La création CV, PDF, demandes commerciales et traduction requièrent une recette métier réelle avant publication ; les routes `/api/` ont besoin d'un hébergement Node/Vercel adapté.
- Les offres de monétisation n'incluent pas encore de paiement ou d'accès recruteur et ne donnent pas accès aux données privées des candidats.
- Les obligations d'identification légale, de déclaration fiscale et, selon l'activité, d'agrément ne sont pas effacées par la charte graphique.

Pour déployer sur Vercel ou un hébergeur compatible, utilisez la racine de cette archive. Conservez une sauvegarde de la V10.1.
