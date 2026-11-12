# CVMemoire + ANGAYA CRUSH V11.31 — Connexion Appwrite par lien magique

## Périmètre strict
- **ANGAYA CRUSH uniquement** : un visiteur qui clique « Jeu Angaya » accède à `jeu/connexion.html`.
- Les pages CV, PDF, assistance mémoire, site vitrine et contact restent **publiques et inchangées** (sauf l'URL des liens pointant vers le jeu).
- L'entrée directe dans `jeu/index.html` vérifie la session avec `account.get()` avant de charger le moteur du jeu.
- Le lien magique créé par Appwrite est validé par `account.createSession({userId, secret})`.
- Un bouton « Déconnexion » est disponible dans les **Réglages** du jeu et n'efface pas la progression locale.

## Configuration du projet
- API Endpoint public : `https://fra.cloud.appwrite.io/v1`
- Project ID public : `6af5897e000bfa6b82ab`
- Aucune clé privée ni secret Google dans les sources.

## À effectuer dans Appwrite Cloud avant usage
1. **Project → Add platform → Web** : hostname `cvmemoire.click` (et `www.cvmemoire.click` si utilisé).
2. **Auth → Settings → Auth methods** : activer **Magic URL** et autoriser les nouveaux utilisateurs.
3. Vérifier que les e-mails d'authentification Appwrite arrivent bien (spams compris).
4. Pour tester en `localhost`, ajouter temporairement un hostname `localhost` comme plateforme Web.

## Fichiers nouveaux / modifiés
- Nouveau : `jeu/connexion.html`, `jeu/angaya-appwrite.js`, `jeu/angaya-login.js`, `jeu/angaya-game-guard.js`, `jeu/angaya-game-core.js`.
- Modifiés : `jeu/index.html`, `jeu/service-worker.js`, et **seulement les liens du jeu** sur les pages du site.
- Le moteur du jeu a été extrait de l'ancien `jeu/index.html` dans `jeu/angaya-game-core.js` sans changement de sa logique, sauf le lien « Déconnexion » dans Réglages.
- Nuages, musique synchronisée, niveaux et toutes les sauvegardes `localStorage` restent en place.

## Important : sauvegardes
- Le login crée des **sessions Appwrite**, mais ne synchronise pas encore les niveaux entre appareils.
- Les niveaux/scores restent enregistrés sur chaque appareil comme auparavant. Les comptes différents sur un même navigateur ne sont pas encore séparés dans le stockage local : une synchronisation par compte nécessitera une prochaine étape.
- GitHub Pages est statique : la vérification dans le navigateur empêche l'accès normal au jeu depuis l'interface, mais **ne rend pas ses fichiers JS privés**.

## Test de mise en ligne
1. Publier le contenu **complet** du ZIP à la racine du dépôt via GitHub Desktop.
2. Ouvrir `https://cvmemoire.click/jeu/connexion.html` dans une fenêtre privée, saisir une adresse et demander un lien magique.
3. Cliquer sur le lien reçu, vérifier la redirection vers `jeu/index.html`, les nuages puis la musique.
4. Dans le jeu, ouvrir Réglages → Déconnexion, vérifier le retour au login et la conservation des niveaux locaux.
5. Tester les services CV, Mémoire, PDF et Site Web pour confirmer l'absence de login.
