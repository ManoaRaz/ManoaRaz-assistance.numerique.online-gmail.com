# CVMemoire V11.8 — Angaya Crush intégré / traduction retirée

**Contenu de ce ZIP : site CVMemoire complet prêt à redéployer**, à partir de l'archive V11.7 reçue.

## Modifications
- Nouveau lien « 🎮 Jeu Angaya » dans le menu de chaque page (ordinateur et mobile), ouvrant un nouvel onglet vers `jeu/index.html`.
- Page de jeu autonome : `jeu/index.html`, accessible en production à `https://cvmemoire.click/jeu/`.
- Carte d'accès au jeu sur l'accueil et sur la page Tous les services.
- Le jeu garde sa propre interface, sa carte au trésor, ses niveaux, ses sons et son logo 3EMI renvoyant à l'accueil du site.
- La page `traduction.html`, le script `translate.js` et l'API `api/translate.js` ont été supprimés, ainsi que les visuels propres à la traduction.
- Liens et mentions de traduction retirés des pages, services, politique de confidentialité, conditions et sitemap.
- Redirection permanente de l'ancienne page traduction vers `services.html` pour les anciens liens.
- Service worker du jeu limité à ses caches (`angaya-crush-*`), sans effacer d'autres caches du domaine.

## Publication
1. Décompresser l'archive.
2. Publier **le contenu du dossier décompressé** à la racine du projet hébergé sur Vercel (ou l'hébergement statique et API équivalent).
3. Vérifier `https://cvmemoire.click/`, puis l'accès au jeu depuis le menu.
4. Vérifier `https://cvmemoire.click/jeu/` sur ordinateur et téléphone.
5. Vérifier que l'ancien `traduction.html` redirige vers la page Services et qu'aucun lien traduction n'est présent.

**Attention :** cette livraison modifie les fichiers source, pas la version actuellement en ligne. Aucune action sur le domaine ou l'hébergement n'a été réalisée depuis cette conversation.

**Technique :** `vercel.json` conserve `api/submit-request.js` pour les demandes existantes. Les secrets de production ne sont pas inclus. Les obligations légales et les coordonnées de l'éditeur doivent être vérifiées avant publication.
