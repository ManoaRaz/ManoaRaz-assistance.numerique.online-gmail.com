ASSISTANCE NUMERIQUE ONLINE — VERSION WHATSAPP AUTOMATIQUE

OBJECTIF
Le demandeur remplit uniquement le formulaire du site et joint son fichier directement dans le formulaire.
Il n'a plus besoin d'ouvrir WhatsApp, de recopier le message ou de joindre le fichier une seconde fois.
Les boutons d'envoi par email et les choix de livraison par email ont été retirés.

FONCTIONNEMENT DU SITE
1) CV gratuit
- formulaire en ligne unique
- ancien CV / photo / document facultatif joint directement dans le formulaire
- CV final prévu uniquement au format PDF
- numéro WhatsApp obligatoire pour le suivi et la livraison

2) Conversion PDF gratuite
- formulaire en ligne unique
- PDF joint directement dans le formulaire
- choix de sortie : Word (.docx), Excel (.xlsx) ou PowerPoint (.pptx)
- numéro WhatsApp obligatoire pour le suivi et la livraison

3) Assistance mémoire
- formulaire en ligne unique
- document académique facultatif joint directement dans le formulaire
- numéro WhatsApp obligatoire pour le suivi

RECEPTION AUTOMATIQUE SUR WHATSAPP
Le site contient maintenant une fonction serveur :
- api/submit-request.js

Cette fonction reçoit le formulaire et le fichier, puis les transmet automatiquement via l'API officielle WhatsApp Business Cloud API.

IMPORTANT : l'activation réelle nécessite les identifiants Meta WhatsApp Business Cloud API.
Variables d'environnement à configurer sur le serveur :
- WHATSAPP_PHONE_NUMBER_ID = identifiant du numéro WhatsApp Business API qui envoie les notifications
- WHATSAPP_ACCESS_TOKEN = jeton d'accès Meta / WhatsApp Cloud API
- WHATSAPP_ADMIN_NUMBER = 261389518788 (correspond à 0389518788 ; numéro qui reçoit les demandes)
- WHATSAPP_GRAPH_VERSION = v23.0 (optionnel)

Le numéro qui ENVOIE via l'API et le numéro ADMIN qui REÇOIT doivent être compatibles avec la configuration WhatsApp Business. Si +261 38 95 187 88 est lui-même utilisé comme numéro expéditeur Cloud API, utilisez un autre numéro WhatsApp comme destinataire administrateur.

HÉBERGEMENT
Cette version n'est plus un simple site statique : elle a besoin d'un backend pour protéger le jeton WhatsApp et transmettre les fichiers.
Le dossier contient package.json, vercel.json et /api/submit-request.js pour un déploiement sur Vercel.
GitHub Pages seul ne peut pas exécuter cette fonction serveur ni garder un jeton WhatsApp secret.

TAILLE DES FICHIERS
La version Vercel fournie limite chaque fichier à environ 4 Mo afin de rester compatible avec les limites de requête du serveur.

FICHIERS PRINCIPAUX
- index.html
- cv-gratuit.html
- conversion-pdf.html
- assistance-memoire.html
- styles.css
- app.js
- logo-3emi.png
- api/submit-request.js
- package.json
- vercel.json
- robots.txt
- sitemap.xml

SECURITE
Ne mettez jamais WHATSAPP_ACCESS_TOKEN dans index.html, app.js ou un autre fichier public.
Le jeton doit être configuré uniquement comme variable d'environnement côté serveur.


MISE A JOUR JURIDIQUE / CONFIANCE UTILISATEUR
- mentions-legales.html
- confidentialite.html
- conditions-utilisation.html
- CONFORMITE-A-LIRE-AVANT-MISE-EN-LIGNE.txt

Avant publication importante, lire impérativement le fichier de conformité et compléter
l'identité légale de l'exploitant, l'hébergeur réel et les formalités CMIL applicables.
