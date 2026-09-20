CVMEMOIRE.CLIC — VERSION AVEC TRADUCTION + EBOOKS + SEO

NOUVELLES PAGES
- traduction.html : traduction automatique sans compte et sans bouton de validation.
- ebooks-prompts.html : bibliothèque d’eBooks gratuits téléchargeables en un clic.

TRADUCTION
La page appelle /api/translate.
- Si OPENAI_API_KEY est configurée sur Vercel, le moteur IA est utilisé (modèle par défaut : gpt-5-mini).
- Sinon, l’API bascule automatiquement vers MyMemory comme fournisseur de secours.

Variables Vercel optionnelles :
OPENAI_API_KEY=...
OPENAI_TRANSLATE_MODEL=gpt-5-mini

Important : ne placez jamais la clé API dans translate.js ou dans une page HTML.

EBOOKS
Les PDF sont dans : assets/ebooks/
Les couvertures sont dans : assets/images/
Pour ajouter un livre, copiez son PDF et ajoutez une carte dans ebooks-prompts.html.

SEO APPLIQUÉ
- Domaine canonique : https://cvmemoire.clic/
- Titres et meta descriptions uniques
- Open Graph / Twitter sur les nouvelles pages
- Données structurées WebSite, Organization, SoftwareApplication, CollectionPage/Book
- sitemap.xml et robots.txt mis à jour
- Liens internes vers Traduction et eBooks ajoutés dans la navigation et le pied de page
- Contenu descriptif crawlable autour des outils
- Images non critiques en lazy-loading

DÉPLOIEMENT
Déployez le contenu de ce dossier à la racine du projet Vercel associé à cvmemoire.clic.
Après mise en ligne, soumettez https://cvmemoire.clic/sitemap.xml dans Google Search Console.
