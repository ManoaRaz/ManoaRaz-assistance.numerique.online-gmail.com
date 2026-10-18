# V10.4 — Correctif définitif du décalage des listes de menu

**Cause du problème V10.3 :** les 11 liens se trouvaient dans une barre `overflow-x:auto`, donc seuls certains étaient visibles sans défilement. La portion affichée pouvait donner l’impression d’un menu différent d’une page à l’autre.

**V10.4 :** suppression du défilement horizontal de navigation et des flèches du menu. La liste est identique (11 liens dans le même ordre) sur **les 14 pages**. Sur les écrans d’au moins 1100 px, les 11 liens sont tous visibles et peuvent se répartir sur deux rangées. Sur les écrans plus étroits, un seul bouton « Menu » ouvre toute la liste dans une grille de 2 ou 3 colonnes, sans perte d’options. Le bouton garde le même comportement partout.

Les changements ont été appliqués depuis un modèle commun dans le script de génération. Le menu est écrit directement en HTML sur chaque page : aucune dépendance à JavaScript pour l’affichage des liens sur ordinateur ; le script n’intervient que pour la version mobile.

L’accueil V10.3, ses services, les scripts publicitaires, les formulaires et l’API sont conservés. L’onglet actif change uniquement de style selon la page, et non de position ou d’intitulé.

## Tests de validation
- 14 fichiers HTML : 11 intitulés et liens identiques, même ordre et même structure.
- 98 rendus navigateur Chromium en largeur 320, 390, 768, 1024, 1100, 1280 et 1440 px ; tous les liens visibles lorsque le menu est ouvert sur mobile ou affiché sur ordinateur.
- Aucun débordement horizontal de page lors de ces rendus.
- Bouton de menu contrôlé (ouverture, fermeture, attribut ARIA), et liens de navigation vérifiés.
- Invariants contrôlés : scripts Monetag, champs des formulaires, app.js et les deux API inchangés.
- Tests visuels réalisés hors réseau via intégration locale de CSS/JS dans Chromium ; les services tiers et le déploiement sur le domaine public ne sont pas testés.
