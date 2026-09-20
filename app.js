
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
async function submitRequest(event){
  event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
  const button=form.querySelector('button[type="submit"]');const original=button?.textContent||'Envoyer ma demande';
  if(button){button.disabled=true;button.textContent='Transmission en cours…'}
  setStatus(form,'success','Envoi du formulaire et du fichier en cours…');
  try{const data=new FormData(form);data.set('service',form.dataset.service||'Demande depuis le site');
    const response=await fetch(FORM_API_ENDPOINT,{method:'POST',body:data,headers:{Accept:'application/json'}});let result={};try{result=await response.json()}catch(_){ }
    if(!response.ok||!result.success)throw new Error(result.message||'La transmission automatique a échoué.');
    setStatus(form,'success','Votre demande a bien été envoyée. Le suivi se fera sur WhatsApp.');form.reset();
  }catch(error){setStatus(form,'error',error.message||'Impossible de transmettre la demande pour le moment. Merci de réessayer.');}
  finally{if(button){button.disabled=false;button.textContent=original}}
}
