
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
