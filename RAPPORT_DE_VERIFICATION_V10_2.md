# V10.2 — Contrôles de qualité

## Corrigé
- Menu unifié sur 14 pages ; ancien menu en deux lignes supprimé.
- Menu burger responsive testé sur mobile et fermeture via Échap.
- Illustrations locales dans assets/visuals ; les photos externes de l'accueil possèdent des images de secours locales.
- Pied de page et navigation cohérents sur tous les services.
- Page Tous les services remaniée et ancienne note de développement retirée.
- Page Accompagnement CV : encadré redondant avant formulaire supprimé.
- Scripts publicitaires Monetag initiaux non modifiés.
- Pages CV, PDF et services professionnels fonctionnellement conservées.

## Vérifications effectuées
- 14 pages HTML : en-tête et footer présents.
- 0 lien ou ressource locale manquants et 0 ancre interne manquante dans le contenu HTML.
- Tests du menu, carrousel, choix des modèles et aperçu CV, présélection B2B, présentation PDF : réussis.
- Tests de largeur mobile (390px) : aucun débordement horizontal relevé.
- Syntaxe JavaScript de app.js, translate.js et api/submit-request.js validée par Node.

## Limites
- Le chargement réel de publicités et l'API /api/submit-request doivent être validés en préproduction sur Vercel (pas GitHub Pages seul).
- Les photos de l'accueil sont externes et remplacées automatiquement par des illustrations locales si elles échouent.
- Testez aussi les performances, la réception des demandes, le mobile réel et les annonces avant mise en ligne.
- Les partenariats RH restent informatifs et n'autorisent aucun partage automatique de CV.
