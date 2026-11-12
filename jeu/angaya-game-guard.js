/* ANGAYA CRUSH V11.31 — chargement du jeu après contrôle de session uniquement.
   L'interface reste inaccessible tant que Appwrite n'a pas validé l'identité. */
(function () {
  'use strict';
  const gate = document.getElementById('angaya-auth-gate');
  const message = document.getElementById('angaya-auth-gate-text');
  const actions = document.getElementById('angaya-auth-gate-actions');
  const spinner = gate && gate.querySelector('.angaya-gate-spinner');
  const auth = window.AngayaAuth;
  if (!gate || !message || !actions) return;

  function showFailure(msg) {
    message.textContent = msg;
    if (spinner) spinner.hidden = true;
    actions.hidden = false;
    actions.replaceChildren();
    const retry = document.createElement('button');
    retry.type = 'button'; retry.textContent = 'Réessayer';
    retry.addEventListener('click', () => location.reload());
    const back = document.createElement('a');
    back.href = '../index.html'; back.textContent = 'Retour à CVMemoire';
    actions.append(retry, back);
  }

  if (!auth) {
    showFailure('Le service de connexion n’a pas pu se charger. Vérifiez votre connexion Internet.');
    return;
  }

  auth.account.get().then(() => {
    message.textContent = 'Bienvenue ! Chargement de votre aventure…';
    // Le moteur (et donc la musique / le brouillard) ne démarre pas avant l'authentification.
    const core = document.createElement('script');
    core.src = './angaya-game-core.js';
    core.onload = () => {
      document.body.classList.remove('angaya-auth-loading');
      gate.remove();
      // Le jeu peut être lancé après DOMContentLoaded ; son écouteur window.load
      // d'origine peut avoir été installé trop tard, d'où cet enregistrement explicite.
      if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {});
      }
    };
    core.onerror = () => showFailure('Impossible de charger le jeu. Vérifiez Internet et réessayez.');
    document.body.appendChild(core);
  }).catch((error) => {
    const code = Number(error && error.code);
    if (code === 401 || code === 403) {
      location.replace('./connexion.html');
    } else {
      showFailure('Impossible de vérifier votre session. Vérifiez la connexion et le domaine autorisé dans Appwrite.');
    }
  });

  // Déconnexion explicite depuis les réglages du jeu, sans toucher au localStorage
  // des niveaux et scores actuels.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="logout-angaya"]');
    if (!button) return;
    event.preventDefault();
    if (!window.confirm('Se déconnecter d’ANGAYA CRUSH ? Vos niveaux sauvegardés sur cet appareil seront conservés.')) return;
    button.disabled = true;
    auth.account.deleteSession({sessionId: 'current'})
      .then(() => location.replace('./connexion.html'))
      .catch(() => { button.disabled = false; window.alert('Déconnexion impossible. Réessayez.'); });
  });
})();
