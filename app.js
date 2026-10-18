
const FORM_API_ENDPOINT = '/api/submit-request';
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.querySelector('.nav-links');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false');
    }));
  }
  document.querySelectorAll('form[data-auto-submit]').forEach(form => form.addEventListener('submit', submitRequest));
  document.querySelectorAll('img:not([loading])').forEach((img, i) => {
    if (!img.closest('.hero') && !img.closest('.page-hero')) img.loading = 'lazy';
    img.decoding = 'async';
  });
});
function setStatus(form,type,message){const box=form.querySelector('.status');if(!box)return;box.className=`status ${type}`;box.textContent=message}

function closeSuccessModal(){
  const modal=document.getElementById('request-success-modal');
  if(!modal)return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
}

function showSuccessModal(requestId=''){
  let modal=document.getElementById('request-success-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='request-success-modal';
    modal.className='request-modal';
    modal.setAttribute('aria-hidden','true');
    modal.innerHTML=`
      <div class="request-modal__backdrop" data-close-success-modal></div>
      <div class="request-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="request-success-title" aria-describedby="request-success-message">
        <div class="request-modal__icon" aria-hidden="true">✓</div>
        <h2 id="request-success-title">Demande envoyée avec succès</h2>
        <p id="request-success-message">
          Votre demande a bien été envoyée. Notre équipe la traite actuellement et reviendra vers vous aussi rapidement que possible.
          Merci de noter que plusieurs personnes utilisent le service en même temps ; nous vous remercions donc de bien vouloir patienter.
        </p>
        <p class="request-modal__reference" hidden></p>
        <button class="btn btn-primary request-modal__ok" type="button">OK</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('.request-modal__ok').addEventListener('click',closeSuccessModal);
    modal.querySelector('[data-close-success-modal]').addEventListener('click',closeSuccessModal);
    modal.addEventListener('keydown',event=>{if(event.key==='Escape')closeSuccessModal()});
  }
  const reference=modal.querySelector('.request-modal__reference');
  if(reference){
    reference.textContent=requestId?`Référence de votre demande : ${requestId}`:'';
    reference.hidden=!requestId;
  }
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  requestAnimationFrame(()=>modal.querySelector('.request-modal__ok')?.focus());
}

async function submitRequest(event){
  event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
  const button=form.querySelector('button[type="submit"]');const original=button?.textContent||'Envoyer ma demande';
  if(button){button.disabled=true;button.textContent='Transmission en cours…'}
  setStatus(form,'success','Envoi du formulaire et du fichier en cours…');
  try{const data=new FormData(form);data.set('service',form.dataset.service||'Demande depuis le site');
    const response=await fetch(FORM_API_ENDPOINT,{method:'POST',body:data,headers:{Accept:'application/json'}});let result={};try{result=await response.json()}catch(_){ }
    if(!response.ok||!result.success)throw new Error(result.message||'La transmission automatique a échoué.');
    const requestId=result.requestId||result.request_id||'';
    setStatus(form,'success',requestId?`Votre demande a bien été envoyée. Référence : ${requestId}.`:'Votre demande a bien été envoyée.');
    form.reset();
    showSuccessModal(requestId);
  }catch(error){setStatus(form,'error',error.message||'Impossible de transmettre la demande pour le moment. Merci de réessayer.');}
  finally{if(button){button.disabled=false;button.textContent=original}}
}


// ===== V10 interactions =====
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-scroll-left]').forEach(btn => btn.addEventListener('click', () => {
    const rail = document.querySelector(btn.dataset.scrollLeft); if (rail) rail.scrollBy({left: -rail.clientWidth * 0.85, behavior: 'smooth'});
  }));
  document.querySelectorAll('[data-scroll-right]').forEach(btn => btn.addEventListener('click', () => {
    const rail = document.querySelector(btn.dataset.scrollRight); if (rail) rail.scrollBy({left: rail.clientWidth * 0.85, behavior: 'smooth'});
  }));

  const templateButtons = document.querySelectorAll('.template-card-pro');
  const styleSelect = document.getElementById('style');
  const cvPaper = document.getElementById('cvPaper');
  templateButtons.forEach(btn => btn.addEventListener('click', () => {
    templateButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    if (styleSelect) styleSelect.value = btn.dataset.styleValue || styleSelect.value;
    if (cvPaper) {
      cvPaper.classList.remove('modern','classic','elegant','balanced');
      cvPaper.classList.add(btn.dataset.previewTheme || 'modern');
    }
  }));

  const bindPreview = (inputId, outputId, fallback) => {
    const input = document.getElementById(inputId); const output = document.getElementById(outputId);
    if (!input || !output) return;
    const render = () => output.textContent = input.value.trim() || fallback;
    input.addEventListener('input', render); render();
  };
  bindPreview('quickNom','previewName','Votre nom complet');
  bindPreview('quickTitre','previewTitle','Votre poste visé');
  bindPreview('quickTel','previewTel','Téléphone');
  bindPreview('quickMail','previewMail','E-mail');
  bindPreview('quickProfil','previewProfil','Présentez brièvement votre profil, vos qualités et votre objectif professionnel.');
  bindPreview('quickExp','previewExp','Décrivez ici vos expériences principales ou stages significatifs.');
  bindPreview('quickComp','previewComp','Listez vos compétences les plus utiles pour le poste ciblé.');

  const printBtn = document.getElementById('printCvPreview');
  if (printBtn) printBtn.addEventListener('click', () => window.print());
});


/* CVMemoire V10.1: formulaire unique, aperçu du CV et navigation partenaire */
document.addEventListener('DOMContentLoaded',()=>{
  const pairs=[
   ['nom','previewName','Votre nom complet'],['objectif','previewTitle','Votre poste visé'],
   ['telephone','previewTel','Téléphone'],['localisation','previewMail','Ville / pays'],
   ['profil','previewProfil','Votre présentation personnelle apparaîtra ici.'],
   ['etudes','previewEtudes','Vos diplômes et formations.'],
   ['experiences','previewExp','Vos stages et expériences.'],
   ['competences','previewComp','Vos principales compétences.'],
   ['langues','previewLangues','Langues et niveaux.']
  ];
  pairs.forEach(([inputId,outputId,fallback])=>{
   const input=document.getElementById(inputId), output=document.getElementById(outputId);
   if(!input||!output)return;
   function render(){output.textContent=input.value.trim()||fallback;}
   input.addEventListener('input',render);render();
  });
  const paper=document.getElementById('cvPaper'),style=document.getElementById('style');
  const map={'Moderne et sobre':'modern','Classique et administratif':'classic','Élégant et créatif':'elegant','Je vous laisse choisir':'balanced'};
  if(style&&paper){
    function updateStyle(){paper.classList.remove('modern','classic','elegant','balanced');paper.classList.add(map[style.value]||'modern');}
    style.addEventListener('change',updateStyle);updateStyle();
  }
  const print=document.getElementById('printFullCv');
  if(print&&paper){
    print.addEventListener('click',()=>{
      // Validation des deux conditions obligatoires, y compris pour le PDF gratuit.
      const form=document.querySelector('form[data-service="Demande de création de CV"]');
      const a=form?.querySelector('[name="accept_confidentialite_conditions"]');
      const b=form?.querySelector('[name="certification_exactitude_cv"]');
      const missing=[a,b].find(input=>input && !input.checked);
      if(missing){missing.closest('.consent-box')?.scrollIntoView({behavior:'smooth',block:'center'});missing.focus();missing.reportValidity();return;}
      document.body.classList.add('cv-print-mode');window.print();setTimeout(()=>document.body.classList.remove('cv-print-mode'),1500);
    });
    window.addEventListener('afterprint',()=>document.body.classList.remove('cv-print-mode'));
  }
  document.querySelectorAll('[data-partner]').forEach(link=>link.addEventListener('click',()=>{
    const sel=document.getElementById('partenaire-objet');if(sel)sel.value=link.dataset.partner;
  }));
});


// V10.2: navigation clavier et robuste sur toutes les pages
window.addEventListener('DOMContentLoaded',()=>{
 const toggle=document.querySelector('.site-header .menu-btn');
 const nav=document.querySelector('.site-header .nav-links');
 if(toggle&&nav){
  const close=()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Ouvrir le menu')};
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  document.addEventListener('pointerdown',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!toggle.contains(e.target))close()});
  window.addEventListener('resize',()=>{if(window.innerWidth>1210)close()});
 }
});

// V10.6 : exactement deux profils CV, sans conservation dans le navigateur.
document.addEventListener('DOMContentLoaded', () => {
  const choices = [...document.querySelectorAll('[data-cv-type]')].filter(el => el.classList.contains('cv-type-card'));
  const hidden = document.querySelector('#cvTypeHidden');
  const cv = document.querySelector('#cvPaper');
  const name = document.querySelector('#cvTypePreviewName');
  const etudes = document.querySelector('#previewEtudes')?.closest('.cv-section-mini');
  const experiences = document.querySelector('#previewExp')?.closest('.cv-section-mini');
  const choose = value => {
    choices.forEach(el => { const selected = el.dataset.cvType === value; el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected)); });
    if (hidden) hidden.value = value === 'etudiant' ? 'Étudiant' : 'Professionnel';
    if (cv) {cv.classList.remove('modern','classic','elegant','balanced');cv.classList.toggle('cv-student',value === 'etudiant');cv.classList.toggle('cv-professional',value !== 'etudiant');cv.dataset.cvType=value;}
    if (name) name.textContent=value === 'etudiant' ? 'CV ÉTUDIANT' : 'CV PROFESSIONNEL';
    if (etudes) etudes.style.order=value === 'etudiant' ? '1' : '2';
    if (experiences) experiences.style.order=value === 'etudiant' ? '2' : '1';
    const title=document.querySelector('label[for="objectif"]');
    if (title) title.textContent=value === 'etudiant' ? 'Formation, stage ou premier poste visé(e)' : 'Poste, concours ou emploi visé';
  };
  choices.forEach(el=>el.addEventListener('click',()=>choose(el.dataset.cvType)));
  if (choices.length) choose('etudiant');
});
