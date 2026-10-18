/* CVMemoire V10.5 — gestion d’un seul menu commun */
(() => {
 const boot = () => {
  const header = document.getElementById('cvm-global-header');
  if (!header) return;
  const button = header.querySelector('.cvm-menu-toggle');
  const menu = header.querySelector('#cvm-primary-menu');
  if (!button || !menu) return;
  const setOpen = (open) => {
   header.classList.toggle('menu-open',open);
   button.setAttribute('aria-expanded',String(open));
   button.setAttribute('aria-label',open?'Fermer le menu principal':'Afficher le menu principal');
   const icon=button.querySelector('.cvm-menu-icon'); if(icon) icon.textContent=open?'×':'☰';
  };
  setOpen(false);
  button.addEventListener('click',()=>setOpen(!header.classList.contains('menu-open')));
  document.addEventListener('click',(e)=>{if(!header.contains(e.target))setOpen(false)});
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape' && header.classList.contains('menu-open')){setOpen(false);button.focus()}});
  menu.addEventListener('click',(e)=>{if(e.target.closest('a'))setOpen(false)});
  window.addEventListener('resize',()=>{if(window.innerWidth>1050)setOpen(false)},{passive:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
