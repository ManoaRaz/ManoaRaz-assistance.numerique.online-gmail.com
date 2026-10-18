# CVMemoire V10.1 — Ajustements ciblés

- Page CV : suppression du mini-formulaire intermédiaire et de la carte de légende superflue, conservation d’un formulaire unique avec aperçu instantané dans la même section. Les sélections de modèles pilotent ce formulaire et l’aperçu. L’export PDF utilise l’impression du navigateur.
- Conversion PDF : suppression du panneau « Choisissez le format selon votre besoin ». Le choix du format dans le formulaire reste actif.
- Accueil : section « 7 possibilités de partenariat » avec sept liens vers la page Professionnels et chaque rubrique spécifique.
- Professionnels : page refaite sur les styles du site et formulaire de demande de partenariat réellement branché sur l’API /api/submit-request **uniquement si le serveur WhatsApp est configuré et déployé sur un hébergement Node compatible**. Aucun paiement/abonnement, fichier de candidats ou automatisation de recrutement n’est activé.
- Les scripts de publicité historiques des pages existantes sont conservés. Aucune modification volontaire des identifiants Monetag. Les pages nouvelles n’activent pas automatiquement le script sur des rubriques qui n’en avaient pas. Faire vérifier les obligations publicitaires et consentements selon les territoires ciblés.
- Le code GitHub Pages ne suffit pas pour les routes /api : un hébergement adapté ou une architecture serveur distincte est nécessaire.
- Protection des données : pas de mise à disposition automatique des profils aux recruteurs. Aucun consentement de recrutement implicite.
- Légal : identité de l’exploitant à renseigner là où elle est légalement obligatoire et réglementation des opérations de recrutement à vérifier avant lancement.
- Important : tester l’affichage et le fonctionnement des formulaires sur une adresse de préproduction avant mise en ligne.
