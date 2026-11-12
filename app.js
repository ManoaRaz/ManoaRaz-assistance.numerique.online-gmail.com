
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
  document.querySelectorAll('form[data-auto-submit]').forEach(form => {
    setupWhatsAppDirect(form);
    form.addEventListener('submit', submitRequest);
  });
  setupWhatsAppFloatingContact();
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
        <h2 id="request-success-title">Demande acceptée pour envoi</h2>
        <p id="request-success-message">
          Les informations et toutes les pièces jointes ont été acceptées par Meta WhatsApp. La livraison sur notre téléphone reste à confirmer. Conservez votre référence pour tout suivi.
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

// Moyen de contact indépendant de l'API serveur. Aucun CV ni donnée privée
// n'est placé dans l'URL : le visiteur confirme lui-même l'envoi sur WhatsApp.
const CVM_WHATSAPP_CONTACT = '261389518788';
function whatsappDirectUrl(form) {
  const service = (form.dataset.service || 'un service CVMemoire').slice(0, 120);
  const message = 'Bonjour CVMemoire, je souhaite vous contacter au sujet de : ' + service + '. Pouvez-vous me préciser comment transmettre ma demande et mes éventuelles pièces jointes ?';
  return 'https://wa.me/' + CVM_WHATSAPP_CONTACT + '?text=' + encodeURIComponent(message);
}
function setupWhatsAppFloatingContact() {
  if (document.querySelector('.cvm-whatsapp-floating')) return;
  const anchor = document.createElement('a');
  anchor.className = 'cvm-whatsapp-floating';
  anchor.textContent = 'WhatsApp';
  anchor.href = 'https://wa.me/' + CVM_WHATSAPP_CONTACT + '?text=' + encodeURIComponent('Bonjour CVMemoire, je souhaite avoir des renseignements sur vos services.');
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.setAttribute('aria-label', 'Contacter CVMemoire directement sur WhatsApp au 038 95 187 88');
  document.body.appendChild(anchor);
}
function setupWhatsAppDirect(form) {
  if (form.querySelector('.cvm-whatsapp-direct')) return;
  const panel = document.createElement('div');
  panel.className = 'cvm-whatsapp-direct';
  panel.innerHTML = `
    <p><strong>Autre moyen de contact :</strong> écrivez-nous directement sur WhatsApp au 038 95 187 88, même si le formulaire automatique est indisponible.</p>
    <a class="btn cvm-whatsapp-direct__link" href="#" target="_blank" rel="noopener noreferrer">Ouvrir WhatsApp</a>
    <small>Dans WhatsApp, appuyez sur « Envoyer ». Vos renseignements saisis ici et vos fichiers ne sont pas transférés automatiquement par ce lien : transmettez-les dans la discussion.</small>`;
  const anchor = panel.querySelector('a');
  anchor.href = whatsappDirectUrl(form);
  const status = form.querySelector('.status');
  if (status) status.insertAdjacentElement('afterend', panel);
  else form.append(panel);
}

const CVM_MAX_REQUEST_BYTES = 4 * 1024 * 1024;
async function optimizeAttachment(file) {
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  const supportedFiles=['pdf','doc','docx','xls','xlsx','ppt','pptx','txt'];
  if(!file.type.startsWith('image/') && !['jpg','jpeg','png','gif','webp','bmp','heic','heif'].includes(ext)) {
    if (!supportedFiles.includes(ext)) throw new Error('Format non accepté : utilisez une image, un PDF ou un document bureautique.');
    return file;
  }
  if(['jpg','jpeg','png'].includes(ext) && file.size <= 1400 * 1024) return file;
  let image;
  const url=URL.createObjectURL(file);
  try {
    image=new Image();image.src=url;await image.decode();
    const scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const ctx=canvas.getContext('2d');
    if(!ctx) throw new Error('Conversion de photo impossible dans ce navigateur.');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.79));
    if(!blob) throw new Error('La photo ne peut pas être convertie. Choisissez un JPG ou PNG.');
    const base=file.name.replace(/\.[^.]+$/,'').slice(0,90).replace(/[^a-z0-9-_]/gi,'_') || 'photo';
    return new File([blob],base+'.jpg',{type:'image/jpeg',lastModified:Date.now()});
  } catch(e) {throw new Error('Impossible de préparer « '+file.name+' ». Essayez une image JPG ou PNG.');}
  finally {URL.revokeObjectURL(url);}
}
async function buildRequestData(form) {
  const data=new FormData(form);data.set('service',form.dataset.service||'Demande depuis le site');
  const inputs=form.querySelectorAll('input[type="file"][name="attachment"]');
  const selected=[];
  inputs.forEach(el=>{for(const file of el.files||[])if(file.size>0)selected.push(file);});
  if(selected.length>4) throw new Error('Quatre fichiers maximum par demande.');
  data.delete('attachment');
  let total=0;
  for(const file of selected){
    const prepared=await optimizeAttachment(file);
    total+=prepared.size;
    if(total>CVM_MAX_REQUEST_BYTES)throw new Error('Les pièces jointes réunies dépassent 4 Mo. Réduisez les fichiers ou envoyez moins de documents.');
    data.append('attachment',prepared,prepared.name);
  }
  return data;
}
async function submitRequest(event){
  event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
  const button=form.querySelector('button[type="submit"]');const original=button?.textContent||'Envoyer ma demande';
  if(button){button.disabled=true;button.textContent='Transmission en cours…'}
  setStatus(form,'info','Vérification et transmission des informations et pièces jointes…');
  try{
    const data=await buildRequestData(form);
    const response=await fetch(FORM_API_ENDPOINT,{method:'POST',body:data,headers:{Accept:'application/json'}});
    let result={};try{result=await response.json()}catch(_){}
    if(!response.ok || !result.success){
      const suffix=result.requestId?` Référence : ${result.requestId}.`:'';
      const detail = (response.status===404 || response.status===405)
        ? 'Le service de transmission automatique n’est pas disponible sur cet hébergement.'
        : result.message || ('La transmission automatique a échoué (HTTP '+response.status+').');
      throw new Error(detail + suffix + ' Vous pouvez nous joindre par le bouton « Ouvrir WhatsApp » ci-dessous.');
    }
    if(result.filtered){throw new Error('Votre demande n’a pas pu être enregistrée.');}
    const requestId=result.requestId||'';
    const note=`Meta WhatsApp a accepté la demande${requestId?' (référence '+requestId+')':''} et ${result.documentsSent||0} pièce(s) jointe(s). La livraison reste à confirmer.`;
    setStatus(form,'success',note);form.reset();showSuccessModal(requestId);
  }catch(e){setStatus(form,'error',(e.message||'Transmission impossible.')+' La demande et ses pièces jointes ne sont PAS confirmées comme livrées. Utilisez WhatsApp directement ci-dessous si nécessaire.');}
  finally{if(button){button.disabled=false;button.textContent=original;}}
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
