const FORM_API_ENDPOINT = '/api/submit-request';

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('form[data-auto-submit]').forEach(form => {
    form.addEventListener('submit', submitRequest);
  });
});

function setStatus(form, type, message) {
  const box = form.querySelector('.status');
  if (!box) return;
  box.className = `status ${type}`;
  box.textContent = message;
}

async function submitRequest(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const button = form.querySelector('button[type="submit"]');
  const original = button?.textContent || 'Envoyer ma demande';
  if (button) {
    button.disabled = true;
    button.textContent = 'Transmission en cours…';
  }
  setStatus(form, 'success', 'Transmission sécurisée de votre formulaire et de votre fichier…');

  try {
    const data = new FormData(form);
    data.set('service', form.dataset.service || 'Demande depuis le site');

    const response = await fetch(FORM_API_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    let result = {};
    try { result = await response.json(); } catch (_) {}

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'La transmission automatique a échoué.');
    }

    setStatus(form, 'success', 'Votre demande a bien été transmise. Le formulaire et le fichier joint sont pris en charge automatiquement : vous n’avez rien à renvoyer dans WhatsApp.');
    form.reset();
  } catch (error) {
    setStatus(form, 'error', error.message || 'Impossible de transmettre la demande pour le moment. Merci de réessayer dans quelques instants.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = original;
    }
  }
}
