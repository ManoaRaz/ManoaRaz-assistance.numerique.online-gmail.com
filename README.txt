CVMEMOIRE.CLICK — VERSION 7

CHANGEMENT PRINCIPAL
- Le registre / mémoire en ligne des demandes a été complètement retiré.
- Aucun fichier de demandes n’est créé dans GitHub.
- Aucun tableau administrateur de demandes n’est inclus.
- Aucun suivi des téléchargements d’eBooks ou des traductions n’est enregistré dans une mémoire CVMemoire.
- Les formulaires sont transmis directement au WhatsApp administrateur configuré.

FORMULAIRES
Endpoint : /api/submit-request
Variables Vercel nécessaires :
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_ADMIN_NUMBER=...
WHATSAPP_GRAPH_VERSION=v23.0   (facultatif)

Important : le site ne crée pas de copie structurée supplémentaire de la demande. Les messages transmis à WhatsApp peuvent toutefois être conservés par WhatsApp/Meta selon la configuration du compte et leurs politiques.

TRADUCTION
Endpoint : /api/translate
Variables Vercel facultatives :
OPENAI_API_KEY=...
OPENAI_TRANSLATE_MODEL=gpt-5-mini
Sans clé OpenAI, le service de secours MyMemory est utilisé.
Aucun journal CVMemoire des traductions n’est enregistré côté serveur.
L’historique visible sur la page de traduction reste local au navigateur de l’utilisateur.

EBOOKS
Les PDF sont dans assets/ebooks/.
Aucun téléchargement d’eBook n’est inscrit dans un registre CVMemoire.

FICHIERS SUPPRIMÉS EN V7
- memoire-demandes.html
- memory-admin.js
- api/request-memory.js
- api/admin-login.js
- api/admin-status.js
- api/admin-logout.js
- lib/request-memory.js
- lib/admin-auth.js
- documentation de stockage GitHub / mémoire privée

DÉPLOIEMENT
Déployez le contenu de ce dossier à la racine du projet Vercel associé à cvmemoire.click.
Si des variables GITHUB_STORAGE_*, CVMEMOIRE_STORAGE_SECRET ou CVMEMOIRE_ADMIN_* existent encore dans Vercel, elles ne sont plus utilisées et peuvent être supprimées.
