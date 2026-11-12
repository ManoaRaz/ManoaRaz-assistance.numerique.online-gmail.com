# CVMemoire / ANGAYA CRUSH V11.23 — Correction WhatsApp

## Ce qui a été corrigé dans cette version

- Un bouton « WhatsApp » permanent apparaît sur les pages CVMemoire (pas sur le jeu), pour écrire directement au 038 95 187 88 (`https://wa.me/261389518788`).
- Les six formulaires CVMemoire proposent aussi un lien direct indépendant de `/api/submit-request`.
- Si l'API ne fonctionne pas, le message d'erreur est clair : la demande automatique n'est pas confirmée comme livrée et l'utilisateur peut contacter directement CVMemoire.
- Les documents joints ne sont **pas** transférés par le lien direct : le visiteur doit les joindre dans WhatsApp. L'utilisateur doit lui-même toucher « Envoyer » dans WhatsApp.
- Aucun document privé ni donnée du formulaire n'est mis dans l'URL WhatsApp ; seule une courte demande générique indiquant le service apparaît.
- L'API existante et le jeu sont conservés.

## Les deux modes de réception

### Option simple et fiable pour commencer : contact direct WhatsApp

Vous pouvez déployer le site statique sur un hébergeur compatible. Les utilisateurs ouvrent WhatsApp par les nouveaux boutons, saisissent/envoient leur demande et ajoutent les éventuels documents. **Il ne s'agit pas d'un transfert automatique du formulaire.**

### Option avancée : formulaires transmis automatiquement

`/api/submit-request` est une fonction Node pour Vercel (ou un hébergeur Node compatible), pas pour GitHub Pages.

1. Mettre le code dans GitHub (dépôt privé recommandé).
2. Importer le projet dans Vercel et configurer les variables d'environnement en **Production** (ne jamais les mettre dans GitHub) :
   - `WHATSAPP_ACCESS_TOKEN` : jeton permanent de l'API Cloud Meta, autorisé pour l'envoi.
   - `WHATSAPP_PHONE_NUMBER_ID` : identifiant de numéro émetteur fourni par Meta.
   - `WHATSAPP_ADMIN_NUMBER=261389518788` : numéro de réception (à confirmer dans WhatsApp Business).
   - `WHATSAPP_SENDER_NUMBER` : numéro émetteur au format international (différent du destinataire).
   - `WHATSAPP_GRAPH_VERSION` : version d'API supportée par Meta.
   - `WHATSAPP_DELIVERY_MODE=template` : pour envoyer une notification à l'administrateur hors fenêtre de 24 h.
   - `WHATSAPP_TEMPLATE_LANGUAGE=fr` (ou la langue exacte des modèles approuvés).
   - `WHATSAPP_TEXT_TEMPLATE_NAME`, `WHATSAPP_IMAGE_TEMPLATE_NAME`, `WHATSAPP_DOCUMENT_TEMPLATE_NAME` : noms des trois modèles Meta approuvés correspondant à un corps avec la variable `{{1}}` ; les modèles média nécessitent l'en-tête de type approprié.
3. **Faire approuver** les modèles Meta : le code seul ne peut pas lever la restriction des 24 h. Les modèles de texte et de média doivent correspondre au format attendu par le code ; il faudra ajuster le code ou les modèles si leurs paramètres ne correspondent pas.
4. Redéployer le site après changement des variables.
5. Envoyer une **demande de test** et vérifier dans les journaux Vercel et dans Meta si le message a été accepté **et livré** (des webhooks de statut sont nécessaires pour suivre la livraison). Vérifier la réception réelle sur le téléphone.

### Comprendre les erreurs

- `HTTP 404` ou `405` pour `/api/submit-request` : l'hébergement n'exécute pas la fonction ou la route est mal publiée.
- `HTTP 503` / `CONFIGURATION` : identifiants WhatsApp absents, mal formés ou modèles non fournis.
- `131047` (WhatsApp Cloud API) : message libre hors fenêtre de 24 h ; utiliser un modèle approuvé.
- `190` : jeton Meta invalide ou expiré.
- `131030` : destinataire non autorisé (compte de test).
- `131021` : tentative d'envoyer à soi-même depuis le même numéro API.

⚠️ Ce ZIP ne configure **pas** ton compte Meta ou Vercel et ne garantit **pas** la réception automatique. Il fournit une voie de contact direct utilisable sans API. Si les publicités Meta ouvrent déjà une conversation WhatsApp directement, elles ne passent pas par ces formulaires : inspecter plutôt la destination de la publicité et le nombre de conversations entamées.
