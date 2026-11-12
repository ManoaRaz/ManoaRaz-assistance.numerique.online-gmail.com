# ANGAYA CRUSH V12 — Les Chroniques de Mahajanga

Édition du projet CVMemoire V11.31 transmis le 12 novembre 2026.

## Nouveautés du jeu uniquement

- **Pseudo d'aventurier** : au premier accès après le brouillard d'accueil, saisie d'un nom de 2 à 24 caractères. Le nom peut être modifié dans **Profil**.
- **Profil joueur** : statistiques de carrière, nombre de niveaux atteints, avancement des 12 chapitres, objets et aides consommés, historique des 35 dernières parties terminées, avec distinction victoire / défaite / niveau rejoué.
- **Fin de chaque palier** : un écran récapitulatif spacieux avec pseudo, photo, description, score du palier, score de carrière, parties du palier, objets utilisés, et **un seul bouton Next**. Les victoires des autres niveaux ont également un unique bouton de poursuite.
- **Après le dernier palier** : ce bouton lance un générique épique en plein écran, à défilement lent, couvrant les **12 destinations**, toutes avec une image, un récit, les points et les objets utilisés. Le menu est masqué pendant le générique.
- **Audio du générique** : piste MP3 extraite de la vidéo MP4 fournie. Elle démarre à partir du clic sur Next (si la musique est activée dans les réglages), puis se répète si la durée du film dépasse celle de la piste.
- **Fin du film** : visuel fourni d'**Arison et Manoa**, grand texte **TO BE CONTINUED** en arrière-plan, apparition du bouton **Accueil** après 3,5 secondes.
- **Raccourci** : un clic dans le générique, ou Échap / Entrée / Espace, saute directement à la photo finale, sans afficher le bouton Accueil avant le délai prévu.
- **Difficulté** : 2 coups de moins en moyenne, objectifs de couleurs légèrement relevés à partir des paliers avancés et maximum deux indices par partie. Les aides, bonus et le principe des niveaux restent présents.
- **Progression conservée** : les données de l'ancien stockage local sont importées **une seule fois**, dans la sauvegarde du premier compte connecté à cette version. Ensuite les différents comptes Appwrite sur le même navigateur ont des données locales distinctes.

## Précisions importantes sur les scores et la sauvegarde

- Le **score de carrière** et les **scores de palier** préexistants sont conservés ; le décompte exact des **objets déjà utilisés** et l'historique des parties ne peuvent être reconstruits rétroactivement avant cette version. Ces éléments commencent à être collectés en V12.
- Les scores comptabilisent les parties terminées, gagnées ou perdues, conformément au registre existant ; l'abandon ne valide pas les récompenses d'un niveau.
- L'authentification reste **Appwrite Magic URL** : aucune clé secrète dans le HTML, aucun changement sur les pages CVMemoire.
- **Ce n'est pas encore une sauvegarde cloud inter-appareils.** Les données restent dans le navigateur et sont séparées par compte Appwrite. Supabase n'est pas connecté : il faudrait ajouter ses paramètres publics et une table sécurisée avec politiques RLS pour synchroniser les comptes entre appareils.

## Nouveaux fichiers du jeu

- `jeu/angaya-chronicles.js` — interface profil, récapitulatifs et générique
- `jeu/angaya-chronicles.css` — styles responsive
- `jeu/assets/creators-angaya.webp` — photo des créateurs transmise
- `jeu/audio/music/finale_heroes.mp3` — audio de la vidéo transmise

Fichiers du jeu mis à jour : `jeu/index.html`, `jeu/angaya-game-core.js`, `jeu/angaya-game-guard.js`, `jeu/service-worker.js`.

## Installation / mise en ligne

1. Décompresser l'archive complète à la racine du dépôt hébergeant `cvmemoire.click` (GitHub Pages, etc.), en conservant **les chemins de dossiers**.
2. Vérifier côté Appwrite que `cvmemoire.click` est autorisé en tant que plateforme Web, que **Magic URL** est activé et que les e-mails sont reçus.
3. Ouvrir `https://cvmemoire.click/jeu/connexion.html`, s'authentifier, saisir le pseudo et tester un niveau puis un palier complet.
4. En cas d'ancienne version du jeu mise en cache, fermer et rouvrir l'application PWA ou actualiser la page. Le cache passe à `angaya-crush-v12-chroniques-cinema`.
5. Tester sur mobile : profil et historique, Next de fin de palier, films, son, saut au clic, retour Accueil, reprise de progression.

## Vérifications réalisées

- Syntaxe JS du noyau et de l'extension, structure des nouveaux fichiers et intégrité des nouveaux médias.
- Test de navigation en navigateur de simulation : pseudo, profil avec 12 chapitres, résumé avec un Next, générique avec 12 destinations, saut direct, apparition différée d'Accueil et retour vers la page d'accueil. Aucune erreur JavaScript dans ce test.
- Ce test ne simule pas une authentification réelle Appwrite, un hébergement public, ni une campagne de tests sur 160 niveaux : effectuer un test de recette sur `cvmemoire.click` après publication.

**Droits des médias :** confirmer que les pistes audio et images transmises peuvent être diffusées publiquement dans le jeu.
