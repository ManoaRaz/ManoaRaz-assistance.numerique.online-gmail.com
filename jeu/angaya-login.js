/* ANGAYA CRUSH V11.31 — Magic URL: envoyer un lien, créer une session, puis ouvrir le jeu. */
(function () {
  'use strict';
  const auth = window.AngayaAuth;
  const form = document.getElementById('angaya-login-form');
  const email = document.getElementById('angaya-email');
  const send = document.getElementById('angaya-send');
  const message = document.getElementById('angaya-login-message');
  const checking = document.getElementById('angaya-checking');
  const panel = document.getElementById('angaya-login-fields');
  const retry = document.getElementById('angaya-retry');

  function inform(msg, kind='info') {
    message.textContent = msg;
    message.dataset.kind = kind;
  }
  function showForm() {
    checking.hidden = true;
    panel.hidden = false;
  }
  if (!auth) {
    showForm();
    send.disabled = true;
    inform('Impossible de charger Appwrite. Vérifiez Internet puis actualisez la page.', 'error');
    retry.hidden = false;
    return;
  }

  const params = new URLSearchParams(location.search);
  const userId = params.get('userId');
  const secret = params.get('secret');
  if (userId || secret) {
    // Retirer le jeton secret de la barre d'adresse aussitôt que possible.
    history.replaceState(null, '', location.pathname);
  }

  async function initialise() {
    if (userId || secret) {
      if (!userId || !secret) {
        showForm();
        inform('Lien incomplet. Demandez un nouveau lien magique.', 'error');
        return;
      }
      try {
        inform('Vérification de votre lien magique…');
        await auth.account.createSession({userId, secret});
        location.replace('./index.html');
        return;
      } catch (_) {
        showForm();
        inform('Ce lien est invalide, déjà utilisé ou expiré. Demandez-en un nouveau.', 'error');
        return;
      }
    }
    try {
      await auth.account.get();
      location.replace('./index.html');
    } catch (error) {
      showForm();
      if (error && Number(error.code) !== 401 && Number(error.code) !== 403) {
        inform('Nous n’arrivons pas à joindre Appwrite. Vérifiez votre connexion et réessayez.', 'error');
      }
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!email.reportValidity()) return;
    send.disabled = true;
    inform('Un petit instant, votre lien magique est en préparation…');
    try {
      // Relative to this very page: works with cvmemoire.click and GitHub Pages.
      const callback = new URL('./connexion.html', location.href);
      callback.search = ''; callback.hash = '';
      await auth.account.createMagicURLToken({
        userId: auth.uniqueId(),
        email: email.value.trim(),
        url: callback.toString()
      });
      inform('✨ Lien envoyé ! Ouvrez votre boîte e-mail (et les spams), puis cliquez sur le lien reçu. Vous reviendrez automatiquement dans ANGAYA CRUSH.', 'success');
      send.textContent = 'Renvoyer un lien magique';
    } catch (error) {
      inform('L’envoi a échoué. Vérifiez l’adresse, le domaine Web déclaré et que « Magic URL » est activé dans Appwrite. ' + (error && error.message ? error.message : ''), 'error');
    } finally {
      send.disabled = false;
    }
  });
  initialise();
})();
