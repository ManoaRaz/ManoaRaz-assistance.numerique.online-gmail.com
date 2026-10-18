# CVMemoire V10.6 — Deux types de CV et option emploi

## Modifications
- Choix CV : **Étudiant** ou **Professionnel**, sans les quatre anciens modèles.
- Aperçu et champ type_cv synchronisés. La formation est mise en avant pour le CV Étudiant ; l’expérience pour le CV Professionnel.
- Deux cases obligatoires inchangées : conditions/confidentialité et déclaration d’exactitude.
- Troisième case facultative et non cochée par défaut : demande d’être contacté pour un éventuel parrainage de candidature.
- Vérification côté API des deux cases requises sur toute demande de CV ; export PDF gratuit également bloqué tant que les deux cases requises ne sont pas cochées.
- Le serveur normalise l’option à oui/non, transmise seulement au gestionnaire du service CV avec la demande existante.
- **Aucun envoi de CV à un recruteur n’est programmé.** Une autorisation spécifique avant transmission à un recruteur et la conformité de l’activité sont nécessaires.
- Politique de confidentialité mise à jour.
- Illustrations locales HD (WebP) et originales sur toutes les pages de service, pour éviter les images indisponibles en absence de réseau. Code source SVG d’origine conservé.
- Menu simplifié V10.5 et scripts publicitaires préservés.

## Déploiement et conformité
Ne pas déployer le module d’intermédiation avec des recruteurs comme une activité effective avant vérification des règles malagasy sur le recrutement et la protection des données. Les obligations d’immatriculation et d’identification de l’exploitant ne disparaissent pas en utilisant la marque CVMemoire.

L’API actuelle utilise des fonctions serveur (Vercel). GitHub Pages seul ne fait pas fonctionner les formulaires.

Contrôler en préproduction : présentation des cases, consentement libre, affichage mobile, WhatsApp, scripts publicitaires et conformité juridique.
