/* Photo CV : aperçu local uniquement, sans stockage dans le navigateur. */
document.addEventListener('DOMContentLoaded',()=>{
  const upload=document.getElementById('cvPhotoFile');
  const mode=document.getElementById('photo');
  const slot=document.getElementById('cvPhotoSlot');
  const img=document.getElementById('cvPreviewPhoto');
  const form=upload?.closest('form');
  if(!upload||!mode||!slot||!img||!form)return;
  let imageUrl=null;
  const clear=()=>{if(imageUrl){URL.revokeObjectURL(imageUrl);imageUrl=null;} img.removeAttribute('src');slot.hidden=true;};
  function refresh(){
    const file=upload.files&&upload.files[0];
    const show=file&&mode.value!=='Non';
    if(!show){slot.hidden=true;return;}
    if(!imageUrl)imageUrl=URL.createObjectURL(file);
    img.src=imageUrl;slot.hidden=false;
  }
  upload.addEventListener('change',()=>{
    clear();upload.setCustomValidity('');
    const file=upload.files&&upload.files[0];
    if(file&&(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024)){
      upload.setCustomValidity('Choisissez une photo JPG, PNG ou WebP de 4 Mo maximum.');
      upload.reportValidity();return;
    }
    refresh();
  });
  mode.addEventListener('change',refresh);
  form.addEventListener('reset',()=>{clear();upload.setCustomValidity('');});
  window.addEventListener('pagehide',()=>{if(imageUrl)URL.revokeObjectURL(imageUrl);});
});
