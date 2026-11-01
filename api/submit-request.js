'use strict';
/** CVMemoire V11.3 - WhatsApp Cloud API, fichiers et accusés d'acceptation Meta.
 * NOTE : l'API Meta confirme l'acceptation d'un message, pas sa livraison au téléphone.
 * Ne conservez jamais vos clés dans le code client.
 */
const { formidable } = require('formidable');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const path = require('node:path');

const MAX_BYTES = 4 * 1024 * 1024; // limite cumulée pour rester sous les 4,5 Mo de Vercel
const MAX_FILES = 4;
const VALID_SERVICES = new Set([
  'Demande de création de CV', 'Création / amélioration de CV gratuit',
  'Conversion PDF gratuite', 'Assistance mémoire DTS à Master',
  'Création de site vitrine — forfait 50 000 Ar', 'Demande de partenariat professionnel'
]);
const TYPES = Object.freeze({
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.png':'image/png',
  '.pdf':'application/pdf', '.txt':'text/plain',
  '.doc':'application/msword',
  '.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls':'application/vnd.ms-excel',
  '.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt':'application/vnd.ms-powerpoint',
  '.pptx':'application/vnd.openxmlformats-officedocument.presentationml.presentation'
});
const WAIT_MS = 7500;
function first(v) { return Array.isArray(v) ? v[0] : v; }
function clean(value, max=2000) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0,max);
}
function error(message,status=400, code='INVALID_REQUEST') {
  const e = new Error(message); e.status=status; e.code=code; return e;
}
function id() { return 'REQ-'+new Date().toISOString().replace(/\D/g,'').slice(0,14)+'-'+crypto.randomBytes(3).toString('hex').toUpperCase(); }
function getConfig() {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const sender = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const recipient = String(process.env.WHATSAPP_ADMIN_NUMBER || '').replace(/[^0-9]/g,'');
  const version = process.env.WHATSAPP_GRAPH_VERSION || 'v23.0';
  const mode = process.env.WHATSAPP_DELIVERY_MODE === 'template' ? 'template' : 'session';
  if (!token || !/^\d+$/.test(String(sender||'')) || !/^\d{8,15}$/.test(recipient)) {
    throw error('Réception WhatsApp non configurée sur le serveur. Contactez-nous directement sur WhatsApp.',503,'CONFIGURATION');
  }
  if (!/^v\d+\.0$/.test(version)) throw error('Version de l’API Meta incorrecte.',503,'CONFIGURATION');
  const senderNumber=String(process.env.WHATSAPP_SENDER_NUMBER||'').replace(/[^0-9]/g,'');
  if(senderNumber && senderNumber===recipient)throw error('Le numéro WhatsApp Business émetteur et le numéro de réception doivent être différents.',503,'CONFIGURATION');
  const config = { token, sender, recipient, version, mode, lang:process.env.WHATSAPP_TEMPLATE_LANGUAGE||'fr' };
  if (mode==='template') {
    config.textTemplate=process.env.WHATSAPP_TEXT_TEMPLATE_NAME;
    config.imageTemplate=process.env.WHATSAPP_IMAGE_TEMPLATE_NAME;
    config.documentTemplate=process.env.WHATSAPP_DOCUMENT_TEMPLATE_NAME;
    if (!config.textTemplate || !config.imageTemplate || !config.documentTemplate) {
      throw error('Modèles WhatsApp manquants dans la configuration du serveur.',503,'CONFIGURATION');
    }
  }
  return config;
}
function metaError(resp, payload, step) {
  const code=payload?.error?.code;
  const subcode=payload?.error?.error_subcode;
  let msg = 'Meta WhatsApp a refusé une étape de la transmission.';
  if (code===131047) msg='Fenêtre WhatsApp de 24 heures expirée. Configurez les modèles approuvés pour une réception permanente.';
  else if (code===190) msg='Jeton WhatsApp expiré ou invalide. Actualisez WHATSAPP_ACCESS_TOKEN sur Vercel.';
  else if (code===131030) msg='Ce numéro n’est pas autorisé à recevoir les messages du compte WhatsApp Business.';
  else if (code===131021) msg='Le numéro émetteur WhatsApp Business ne peut pas envoyer de message à lui-même. Configurez deux numéros distincts.';
  const e=error(msg, 502, 'META_REJECTED');
  e.metaCode=code||resp.status; e.metaSubcode=subcode; e.step=step; return e;
}
async function api(config, suffix, body, multipart=false, step='message') {
  let resp;
  try {
    resp=await fetch(`https://graph.facebook.com/${config.version}/${config.sender}/${suffix}`,{
      method:'POST',
      headers:{Authorization:`Bearer ${config.token}`,...(multipart?{}:{'Content-Type':'application/json'})},
      body:multipart?body:JSON.stringify(body),
      signal:AbortSignal.timeout(WAIT_MS)
    });
  } catch (_) { const e=error('Connexion à Meta interrompue. Vérifiez la référence avant de réessayer pour éviter un doublon.',502,'META_NETWORK');e.step=step;throw e; }
  let data={};try{data=await resp.json();}catch(_){}
  if (!resp.ok || data?.error) throw metaError(resp,data,step);
  return data;
}
function msgBase(config,type){return {messaging_product:'whatsapp',to:config.recipient,type};}
function template(config,name,bodyText,media){
  const components=[];
  if (media) components.push({type:'header',parameters:[{type:media.kind,[media.kind]:{id:media.id,}}]});
  components.push({type:'body',parameters:[{type:'text',text:bodyText}]});
  return {...msgBase(config,'template'),template:{name,language:{code:config.lang},components}};
}
async function sendText(config,text) {
  const data=await api(config,'messages',config.mode==='template'
    ?template(config,config.textTemplate,text)
    :{...msgBase(config,'text'),text:{body:text,preview_url:false}}, false,'texte');
  if (!data.messages?.[0]?.id) throw error('Meta n’a pas retourné de référence pour le texte.',502,'META_RESPONSE');
  return data.messages[0].id;
}
async function upload(config,file) {
  const fd=new FormData();
  fd.append('messaging_product','whatsapp');
  fd.append('file',new Blob([await fs.readFile(file.filepath)],{type:file.safeMime}),file.safeName);
  const data=await api(config,'media',fd,true,'téléversement');
  if (!data.id) throw error('Meta n’a pas confirmé l’enregistrement du fichier.',502,'META_RESPONSE');
  return data.id;
}
async function sendFile(config,file,mediaId,requestId,index,total) {
  const kind=file.safeMime.startsWith('image/')?'image':'document';
  const label=`${requestId} · pièce ${index}/${total} · ${file.safeName}`;
  const data=await api(config,'messages',config.mode==='template'
    ? template(config,kind==='image'?config.imageTemplate:config.documentTemplate,requestId,{kind,id:mediaId,filename:file.safeName})
    : {...msgBase(config,kind),[kind]:{id:mediaId,...(kind==='document'?{filename:file.safeName}:{caption:label.slice(0,300)})}},false,'pièce jointe');
  if (!data.messages?.[0]?.id) throw error('Meta n’a pas retourné de référence pour la pièce jointe.',502,'META_RESPONSE');
  return data.messages[0].id;
}
function detect(buffer,ext) {
  if (buffer.length<4)return false;
  if(ext==='.jpg'||ext==='.jpeg')return buffer[0]===0xff&&buffer[1]===0xd8&&buffer[2]===0xff;
  if(ext==='.png')return buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if(ext==='.pdf')return buffer.subarray(0,5).toString('ascii')==='%PDF-';
  if(['.docx','.xlsx','.pptx'].includes(ext))return buffer[0]===0x50&&buffer[1]===0x4b;
  if(['.doc','.xls','.ppt'].includes(ext))return buffer.subarray(0,8).equals(Buffer.from([208,207,17,224,161,177,26,225]));
  if(ext==='.txt')return !buffer.includes(0x00);
  return false;
}
async function validateFiles(files) {
  if(files.length>MAX_FILES)throw error('Quatre fichiers maximum par demande.',413,'FILE_LIMIT');
  if(files.reduce((s,f)=>s+(f.size||0),0)>MAX_BYTES)throw error('Les fichiers réunis ne doivent pas dépasser 4 Mo.',413,'SIZE_LIMIT');
  for(const f of files){
    const filename=path.basename(f.originalFilename||'fichier').replace(/[\u0000-\u001f\u007f\\/:*?"<>|]/g,'_').slice(0,120);
    const ext=path.extname(filename).toLowerCase();
    if (!TYPES[ext] || !f.filepath)throw error('Format de fichier non pris en charge. Utilisez JPG, PNG, PDF, Word, Excel, PowerPoint ou TXT.',415,'FILE_FORMAT');
    if(!f.size || f.size>MAX_BYTES)throw error('Fichier vide ou trop volumineux.',413,'SIZE_LIMIT');
    const bytes=await fs.readFile(f.filepath);
    if(!detect(bytes,ext))throw error(`Le fichier « ${filename} » ne correspond pas à son format.`,415,'FILE_FORMAT');
    f.safeName=filename;
    f.safeMime=TYPES[ext];
  }
}
function summarize(requestId,service,fields,files){
  const lines=[`NOUVELLE DEMANDE CVMemoire`,`Référence : ${requestId}`,`Service : ${service}`];
  for(const [k,v] of Object.entries(fields)){
    if(!v || k==='website' || k==='service' || k==='subject' || k.startsWith('accept_') || k.startsWith('autorisation_') || k==='integrite_academique' || k==='certification_exactitude_cv')continue;
    lines.push(`${k.replace(/_/g,' ')} : ${v}`);
  }
  if(files.length)lines.push(...files.map((f,i)=>`Pièce ${i+1}/${files.length} : ${f.safeName} (${Math.round(f.size/1024)} Ko)`));
  return lines.join('\n');
}
function splitMessage(text, mode) {
  const limit=mode==='template'?650:3600;
  const parts=[];
  // Pour les modèles : paramètres sur une ligne sans saut de ligne ; le template approuvé doit avoir UNE variable body {{1}}.
  const input=mode==='template'?text.replace(/\s*\n\s*/g,' | '):text;
  for(let pos=0;pos<input.length;){
    let end=Math.min(pos+limit,input.length);
    if(end<input.length){const i=input.lastIndexOf(mode==='template'?' | ':'\n',end);if(i>pos+limit*.55)end=i;}
    parts.push(input.slice(pos,end).trim());pos=end;
    while(input[pos]==='\n'||input[pos]===' '||input[pos]==='|')pos++;
  }
  return parts.length?parts:['Demande sans détails'];
}
function permittedOrigin(req){
  const origin=req.headers?.origin;
  if(!origin)return true; // certains clients légitimes n'envoient pas Origin
  try { const u=new URL(origin); const host=String(req.headers?.host||'').split(':')[0].toLowerCase();
    return u.protocol==='https:'&&u.hostname.toLowerCase()===host || (process.env.NODE_ENV!=='production'&&u.hostname==='localhost');
  } catch(_) { return false; }
}
function validateConsents(service,fields){
  if(fields.accept_confidentialite_conditions!=='oui') throw error('Veuillez accepter les conditions et la politique de confidentialité.',400,'CONSENT');
  if(/CV\b|curriculum vitae/i.test(service)&&fields.certification_exactitude_cv!=='oui')throw error('Veuillez confirmer l’exactitude des informations de votre CV.',400,'CONSENT');
  if(service==='Conversion PDF gratuite'&&fields.autorisation_document_conversion!=='oui')throw error('Veuillez confirmer votre autorisation de conversion.',400,'CONSENT');
  if(service==='Assistance mémoire DTS à Master' && (fields.integrite_academique!=='oui'||fields.autorisation_documents_memoire!=='oui'))throw error('Veuillez confirmer vos autorisations et l’intégrité académique.',400,'CONSENT');
}
module.exports=async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({success:false,message:'Méthode non autorisée'});}
  if(!permittedOrigin(req))return res.status(403).json({success:false,message:'Origine de la requête non autorisée.'});
  const f=formidable({maxFileSize:MAX_BYTES,maxTotalFileSize:MAX_BYTES,maxFiles:MAX_FILES,allowEmptyFiles:false,maxFields:55,maxFieldsSize:100*1024,keepExtensions:true});
  let files=[];let requestId;
  let textSent=0, mediaSent=0;
  try{
    const [rawFields,rawFiles]=await f.parse(req);
    files=Object.values(rawFiles||{}).flatMap(v=>Array.isArray(v)?v:[v]).filter(Boolean);
    if(first(rawFields.website)){return res.status(200).json({success:true,filtered:true});} // filtre anti-spam sans envoi
    if(Object.keys(rawFiles||{}).some(k=>k!=='attachment'))throw error('Champ de fichier inconnu.',400,'FILE_FIELD');
    const fields={};for(const [key,value] of Object.entries(rawFields||{}))fields[clean(key,80)]=clean(first(value),1800);
    const service=fields.service;
    if(!VALID_SERVICES.has(service))throw error('Service de formulaire inconnu.',400,'SERVICE');
    validateConsents(service,fields);
    await validateFiles(files);
    const config=getConfig();
    requestId=id();
    const messages=splitMessage(summarize(requestId,service,fields,files),config.mode);
    // Exigence de 30s max pour le serveur : limite le nombre de fragments envoyés.
    if(messages.length>7)throw error('Texte trop long. Réduisez les descriptions pour transmettre la demande.',413,'TEXT_LIMIT');
    // Téléversements en parallèle et tous attendus (pas de suppression de fichier pendant un upload).
    const uploadResults=await Promise.allSettled(files.map(file=>upload(config,file)));
    const uploadFailure=uploadResults.find(r=>r.status==='rejected');
    if(uploadFailure)throw uploadFailure.reason;
    const uploaded=uploadResults.map(r=>r.value);
    // On n'annonce un succès que lorsque tous les messages et fichiers sont acceptés par Meta.
    for(let i=0;i<messages.length;i++){
      const label=messages.length>1?`[${i+1}/${messages.length}] `:'';
      await sendText(config,label+messages[i]);textSent++;
    }
    for(let i=0;i<files.length;i++){
      await sendFile(config,files[i],uploaded[i],requestId,i+1,files.length);mediaSent++;
    }
    return res.status(200).json({success:true,requestId,acceptedByMeta:true,documentsSent:mediaSent,expectedDocuments:files.length,textsSent:textSent,message:'Meta a accepté les informations et toutes les pièces jointes. Leur livraison sur WhatsApp reste à confirmer.'});
  }catch(e){
    if(e?.code===1009||e?.code==='LIMIT_FILE_SIZE'||e?.code==='LIMIT_TOTAL_FILE_SIZE')e=error('La taille totale des fichiers dépasse 4 Mo. Réduisez-les avant l’envoi.',413,'SIZE_LIMIT');
    const partial=(textSent+mediaSent)>0;
    // Diagnostic technique minimal, jamais de contenu de formulaire ni de jeton dans les journaux.
    console.error('CVMemoire WhatsApp API', {requestId:requestId||null,code:e?.code||'PARSE',metaCode:e?.metaCode||null,step:e?.step||null,partial});
    return res.status(partial?502:(e?.status||400)).json({success:false,partial,requestId,documentsSent:mediaSent,textsSent:textSent,code:e?.code||'FORM_ERROR',message:partial?'Envoi partiel : certains messages ou fichiers ont été acceptés par Meta. Notez la référence et contactez-nous avant de réessayer pour éviter un doublon.':e?.message&&e.status?e.message:'Impossible de traiter la demande. Vérifiez le format et la taille des fichiers.'});
  }finally{
    for(const file of files){if(file.filepath)try{await fs.unlink(file.filepath);}catch(_){}}
  }
};
module.exports._test={splitMessage,detect,summarize,validateFiles,validateConsents,getConfig};
