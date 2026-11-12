/* ANGAYA CRUSH V11.31 — configuration publique Appwrite. Pas de secret serveur ici. */
(function () {
  'use strict';
  if (!window.Appwrite || typeof window.Appwrite.Client !== 'function') return;
  const client = new Appwrite.Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6af5897e000bfa6b82ab');
  window.AngayaAuth = Object.freeze({
    account: new Appwrite.Account(client),
    uniqueId: () => Appwrite.ID.unique()
  });
})();
