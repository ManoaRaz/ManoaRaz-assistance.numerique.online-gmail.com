# CVMemoire – API WhatsApp V11.3 : configuration et vérification

## État réel de cette livraison

Le code a été corrigé et testé **sans vos identifiants privés**, avec des réponses Meta simulées. Il n'a pas été publié sur `cvmemoire.click`, et aucune demande réelle n'a été envoyée au numéro de réception durant ces tests. La vraie réception sur WhatsApp dépend des paramètres du compte Meta, de l'approbation des modèles et du déploiement.

## Ce qui a été corrigé

- Toutes les pièces jointes des formulaires sont récupérées, y compris les deux champs de la page CV (photo et ancien CV).
- Les images JPG/PNG sont envoyées comme **images**, les PDF/Word/Excel/PowerPoint/TXT comme **documents**.
- Le navigateur transforme les images GIF/WebP et les photos trop volumineuses en JPG avant l'envoi, si le navigateur peut les lire.
- Contrôle de format par signature de fichier, taille globale **4 Mo** (tous fichiers confondus), jusqu'à quatre fichiers.
- Plus aucun faux succès complet en cas d'échec d'une pièce jointe. Une transmission partielle est explicitement annoncée avec la référence de demande.
- Les réponses HTTP de Meta, codes d'erreur et références sont vérifiés. Les fichiers temporaires sont supprimés.
- Les contenus longs sont divisés en messages numérotés, sans être silencieusement tronqués. Les consentements obligatoires sont contrôlés côté serveur.
- Aucun jeton WhatsApp n'est inséré dans le navigateur. Les journaux techniques n'enregistrent ni textes des demandes ni contenu des fichiers.
- Les informations de réussite signifient **acceptation par Meta**, et non confirmation de livraison sur le téléphone. La confirmation effective exige des webhooks de statuts ou une vérification du téléphone.

## 1. Deux numéros distincts

Il vous faut un **numéro émetteur WhatsApp Business Cloud API** actif, associé à un `WHATSAPP_PHONE_NUMBER_ID` dans Meta Developers, et un **numéro récepteur** séparé : `+261 38 95 187 88`.

> Un numéro Cloud API ne peut pas s'envoyer des messages à lui-même. Si `+261 38 95 187 88` est aussi votre numéro émetteur, il faut choisir un autre numéro destinataire ou un autre numéro émetteur.

Le numéro récepteur doit être utilisable sur WhatsApp et autorisé à recevoir les notifications de votre entreprise. En environnement de test Meta, il doit figurer parmi les destinataires vérifiés/autorises.

## 2. Variables d'environnement Vercel

Dans **Vercel → Projet CVMemoire → Settings → Environment Variables** :

```env
WHATSAPP_ACCESS_TOKEN=<votre_jeton_permanent_Meta>
WHATSAPP_PHONE_NUMBER_ID=<identifiant_du_numero_EMETTEUR>
WHATSAPP_ADMIN_NUMBER=261389518788
WHATSAPP_SENDER_NUMBER=<numero_EMETTEUR_sans_plus_facultatif_pour_verification>
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_DELIVERY_MODE=template
WHATSAPP_TEMPLATE_LANGUAGE=fr
WHATSAPP_TEXT_TEMPLATE_NAME=cvm_request_text
WHATSAPP_IMAGE_TEMPLATE_NAME=cvm_request_image
WHATSAPP_DOCUMENT_TEMPLATE_NAME=cvm_request_document
```

Ne saisissez **jamais** le jeton privé dans HTML, JS public ou ChatGPT. Vérifiez que le jeton dispose de la permission `whatsapp_business_messaging` et que le numéro est correctement enregistré. Vérifiez la version Graph API prise en charge par votre application (la version ci-dessus conserve celle de votre projet existant).

## 3. Modèles Meta pour la réception permanente (mode `template` recommandé)

Dans **WhatsApp Manager → Modèles de message**, faites approuver trois modèles en **français (`fr`)**. Leurs noms et langues doivent correspondre exactement aux variables Vercel. Exemple de structure :

1. `cvm_request_text` : en-tête facultatif, corps « Nouvelle demande CVMemoire : {{1}} ». **Une variable texte dans le corps**. Le serveur envoie les détails par fragments dans cette variable.
2. `cvm_request_image` : **en-tête IMAGE**, corps « Nouvelle demande CVMemoire – référence {{1}}. Photo jointe. ». Une variable texte dans le corps.
3. `cvm_request_document` : **en-tête DOCUMENT**, corps « Nouvelle demande CVMemoire – référence {{1}}. Document joint. ». Une variable texte dans le corps.

Les modèles doivent être **approuvés et actifs**, et la catégorie de message doit être adaptée à l'usage déclaré. Les variables et en-têtes du modèle approuvé doivent correspondre exactement à la requête envoyée. Les noms fournis ci-dessus sont des EXEMPLES À CRÉER, pas des modèles déjà approuvés sur votre compte.

Cela permet de soumettre des messages et médias via des templates en dehors de la fenêtre de conversation classique de 24h, sous réserve de l'acceptation effective de Meta, du type de média permis et des règles de votre compte. Certaines combinaisons de médias et de modèles peuvent être refusées : faites le test de bout en bout décrit plus bas.

### Alternative : mode `session`

Si vous ne disposez pas de modèles approuvés, utilisez :

```env
WHATSAPP_DELIVERY_MODE=session
```

Ce mode transmet des messages texte et média libres seulement dans la fenêtre de service de **24 heures après le dernier message entrant du destinataire vers le numéro émetteur**. Ce mode n'assure donc **pas** une réception continue des demandes ; le code retourne une erreur explicite (notamment Meta `131047`) si la fenêtre est expirée.

## 4. Publication

1. Importer les fichiers de cette archive **à la racine** de votre dépôt/projet Vercel, et conserver `api/submit-request.js`, `package.json`, `app.js` et `vercel.json`.
2. Dans Vercel, installer les dépendances Node du projet (`formidable` est déclaré dans `package.json`), puis redéployer après avoir enregistré les variables.
3. Le projet doit utiliser les **fonctions serveur Vercel**. La publication sur GitHub Pages seule ne peut pas exécuter `/api/submit-request`.
4. Vérifier que `https://cvmemoire.click/api/submit-request` correspond au dernier déploiement (la méthode GET renverra 405, ce qui est normal pour une route POST).

## 5. Test réel indispensable

Sur une vraie installation, depuis un navigateur, envoyer **une demande de test autorisée** sur chacun des formulaires. Commencer par la page CV en ajoutant **photo JPG + PDF**, puis convertir un PDF et joindre plusieurs images au site vitrine (somme de tailles inférieure à 4 Mo). Contrôler directement sur le WhatsApp de réception :

- Les données sont complètes et lisibles, avec une référence `REQ-...`.
- Le texte ET tous les médias sont présents, avec le bon nombre de pièces jointes.
- Le numéro récepteur n'est pas identique au numéro Business émetteur.
- Dans **Vercel → Logs**, lire le code d'erreur Meta en cas d'échec ; ne jamais y publier vos jetons.
- Une réponse API « acceptée par Meta » n'est pas une preuve de réception. La livraison doit être vérifiée sur le téléphone ou par le webhook de statut Meta (non mis en place dans cette version, puisqu'aucune base persistante n'a été demandée/configurée).

## 6. Limites restantes

- **4,5 Mo** est la limite du corps d'une fonction Vercel. Le code limite les fichiers réunis à **4 Mo** ; les images sont réduites côté navigateur lorsque possible.
- Quatre pièces jointes maximum pour une demande. PDF complexes / images non lisibles non convertibles automatiquement par le navigateur doivent être envoyés en formats compatibles.
- Un fichier **WebP** n'est pas envoyé directement comme image WhatsApp : le navigateur tente de le convertir en JPG avant envoi. Un fichier WebP envoyé directement à l'API sans cette étape sera refusé.
- La Cloud API peut accepter une requête mais échouer à livrer un message ; le suivi par **webhook de statut** est la méthode fiable pour auditer la livraison. Le code actuel n'enregistre volontairement aucun dossier de demandes en base.
- Aucun outil ne peut garantir le fonctionnement réel sans les identifiants, l'approbation Meta, la publication du code et un test de réception sur le téléphone.
- Pour un volume public élevé, prévoir anti-spam avec stockage ou fournisseur spécialisé, un mécanisme de reprise sécurisé et un journal de statuts respectueux de la confidentialité.

**Ne partagez pas vos clés API, mots de passe ni jetons avec des tiers.**
