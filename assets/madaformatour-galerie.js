/* Carrousel MadaFormatour · deux visuels + aperçu latéral · 7 secondes. */
(() => {
  'use strict';
  const track = document.getElementById('mpg-track');
  const dialog = document.getElementById('mpg-lightbox');
  if (!track || !dialog) return;

  const originals = Array.from(track.querySelectorAll('.mpg-card'));
  const counter = document.getElementById('mpg-current');
  const fullImage = document.getElementById('mpg-large-image');
  const fullTitle = document.getElementById('mpg-large-title');
  const fullNumber = document.getElementById('mpg-large-number');
  const download = document.getElementById('mpg-download');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const images = [
    {src: 'assets/images/madaformatour/formation-professionnelle.jpg', title:'Séance de formation', alt:'Participants réunis autour d’une table lors d’une séance de formation', filename:'Madaformatour-formation-professionnelle.jpg'},
    {src: 'assets/images/madaformatour/visite-de-terrain.jpg', title:'Activité sur le terrain', alt:'Groupe de participants réunis en extérieur pour une activité collective', filename:'Madaformatour-visite-de-terrain.jpg'},
    {src: 'assets/images/madaformatour/echange-participatif.jpg', title:'Échanges participatifs', alt:'Un participant prend la parole au cours d’une séance de formation', filename:'Madaformatour-echange-participatif.jpg'},
    {src: 'assets/images/madaformatour/animation-pedagogique.jpg', title:'Animation pédagogique', alt:'Une animatrice présente un schéma sur un tableau de formation', filename:'Madaformatour-animation-pedagogique.jpg'}
  ];
  const count = originals.length;
  if (count !== 4) return;
  const prefixCount = 3; // donne un petit aperçu de la photo précédente
  originals.forEach((card, index) => { card.dataset.photoIndex = String(index); });
  const copyCard = card => card.cloneNode(true);
  const before = document.createDocumentFragment();
  originals.slice(-prefixCount).forEach(card => before.appendChild(copyCard(card)));
  track.insertBefore(before, originals[0]);
  originals.slice(0, 3).forEach(card => track.appendChild(copyCard(card)));
  const cards = Array.from(track.querySelectorAll('.mpg-card'));
  const viewport = track.parentElement;

  let position = 0; // indice logique dans les quatre photos
  let physical = prefixCount; // position avec les copies de bord
  let activeImage = 0;
  let animating = false;
  let hovered = false;
  let focusWithin = false;
  let currentTrigger = null;
  let settleTimer = null;
  const normalize = index => (index % count + count) % count;

  function syncCounter() {
    if (counter) counter.textContent = String(position + 1).padStart(2, '0');
    cards.forEach((card, index) => {
      const visible = index === physical || index === physical + 1;
      card.setAttribute('aria-hidden', String(!visible));
      card.querySelectorAll('a').forEach(link => { link.tabIndex = visible ? 0 : -1; });
    });
  }

  function paint() {
    const styles = getComputedStyle(viewport);
    const peek = parseFloat(styles.getPropertyValue('--mpg-peek')) || 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const firstFullCard = cards[physical];
    if (!firstFullCard) return;
    const left = peek + gap - firstFullCard.offsetLeft;
    track.style.transform = `translate3d(${left}px,0,0)`;
  }

  function settle() {
    if (!animating) return;
    window.clearTimeout(settleTimer);
    animating = false;
    // La copie à droite/gauche fait une boucle fluide, sans saut visible.
    if (physical >= prefixCount + count) physical -= count;
    if (physical < prefixCount) physical += count;
    track.classList.add('mpg-no-motion');
    paint();
    // Applique la remise à zéro invisible avant la prochaine transition.
    void track.offsetWidth;
    window.requestAnimationFrame(() => track.classList.remove('mpg-no-motion'));
    syncCounter();
  }

  function move(direction) {
    if (animating || (direction !== -1 && direction !== 1)) return;
    physical += direction;
    position = normalize(position + direction);
    syncCounter();
    if (reduceMotion.matches) {
      // Pas d'animation imposée aux visiteurs qui la désactivent.
      track.classList.add('mpg-no-motion');
      paint();
      void track.offsetWidth;
      track.classList.remove('mpg-no-motion');
      animating = true;
      settle();
      return;
    }
    animating = true;
    paint();
    settleTimer = window.setTimeout(settle, 900);
  }

  track.addEventListener('transitionend', event => {
    if (event.target === track && event.propertyName === 'transform') settle();
  });
  document.getElementById('mpg-prev').addEventListener('click', () => move(-1));
  document.getElementById('mpg-next').addEventListener('click', () => move(1));
  viewport.addEventListener('mouseenter', () => { hovered = true; });
  viewport.addEventListener('mouseleave', () => { hovered = false; });
  viewport.addEventListener('focusin', () => { focusWithin = true; });
  viewport.addEventListener('focusout', () => {
    window.setTimeout(() => { focusWithin = viewport.contains(document.activeElement); }, 0);
  });
  viewport.addEventListener('keydown', event => {
    if (event.target.closest('a,button')) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
  });

  // Navigation tactile horizontale sans empêcher le défilement vertical.
  let swipeStart = null;
  viewport.addEventListener('touchstart', event => {
    if (event.touches.length === 1) swipeStart = {x:event.touches[0].clientX, y:event.touches[0].clientY};
  }, {passive:true});
  viewport.addEventListener('touchend', event => {
    if (!swipeStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - swipeStart.x;
    const dy = event.changedTouches[0].clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) >= 42 && Math.abs(dx) > Math.abs(dy)*1.2) move(dx < 0 ? 1 : -1);
  }, {passive:true});

  // Avance à droite toutes les 7 secondes, après 4 retourne à 1.
  window.setInterval(() => {
    if (hovered || focusWithin || animating || dialog.open || document.hidden || reduceMotion.matches) return;
    move(1);
  }, 7000);
  window.addEventListener('resize', () => window.requestAnimationFrame(paint), {passive:true});
  track.classList.add('mpg-no-motion');
  paint();
  syncCounter();
  void track.offsetWidth;
  window.requestAnimationFrame(() => track.classList.remove('mpg-no-motion'));

  function displayLarge(index) {
    activeImage = normalize(index);
    const item = images[activeImage];
    fullImage.src = item.src;
    fullImage.alt = item.alt;
    fullTitle.textContent = item.title;
    fullNumber.textContent = `Photo ${activeImage + 1} sur ${images.length}`;
    download.href = item.src;
    download.download = item.filename;
  }
  track.addEventListener('click', event => {
    const link = event.target.closest('.mpg-photo-link');
    if (!link || !track.contains(link)) return;
    event.preventDefault();
    const index = Number(link.dataset.mpgIndex);
    currentTrigger = link;
    displayLarge(index);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else window.open(images[index].src, '_blank', 'noopener');
  });
  document.getElementById('mpg-close').addEventListener('click', () => dialog.close());
  document.getElementById('mpg-light-prev').addEventListener('click', () => displayLarge(activeImage - 1));
  document.getElementById('mpg-light-next').addEventListener('click', () => displayLarge(activeImage + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); displayLarge(activeImage + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); displayLarge(activeImage - 1); }
  });
  dialog.addEventListener('close', () => { if (currentTrigger) currentTrigger.focus({preventScroll:true}); });
})();
