const {formidable}=require('formidable');
const fs=require('fs/promises');
const crypto=require('crypto');

function scalar(v){return Array.isArray(v)?v[0]:v}
function safe(value,max=1200){return String(value??'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,max)}
function makeId(prefix='REQ'){
  const stamp=new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14);
  return `${prefix}-${stamp}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
function normalizeFields(fields){
  const out={};
  for(const [k,v] of Object.entries(fields||{})){
    if(k==='website')continue;
    out[safe(k,80)]=safe(scalar(v),1800);
  }
  return out;
}
async function sendTextWhatsApp(text){
  const token=process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to=process.env.WHATSAPP_ADMIN_NUMBER;
  if(!token||!phoneId||!to)return false;
  const version=process.env.WHATSAPP_GRAPH_VERSION||'v23.0';
  const r=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body:text.slice(0,3900)}})});
  return r.ok;
}
async function sendDocumentWhatsApp(file){
  const token=process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID;
  const to=process.env.WHATSAPP_ADMIN_NUMBER;
  if(!token||!phoneId||!to||!file?.filepath)return false;
  const version=process.env.WHATSAPP_GRAPH_VERSION||'v23.0';
  const bytes=await fs.readFile(file.filepath);
  const fd=new FormData();
  fd.append('messaging_product','whatsapp');
  fd.append('file',new Blob([bytes],{type:file.mimetype||'application/octet-stream'}),file.originalFilename||'document');
  const up=await fetch(`https://graph.facebook.com/${version}/${phoneId}/media`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body:fd});
  if(!up.ok)return false;
  const media=await up.json();
  if(!media.id)return false;
  const r=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',to,type:'document',document:{id:media.id,filename:file.originalFilename||'document'}})});
  return r.ok;
}
function buildSummary(id,service,fields,file){
  const lines=[`Nouvelle demande CVMemoire`,`Référence : ${id}`,`Service : ${service}`];
  for(const [k,v] of Object.entries(fields)){
    if(!v||k.startsWith('accept_')||k.includes('autorisation')||k.includes('integrite')||k.includes('certification'))continue;
    lines.push(`${k.replace(/_/g,' ')} : ${v}`);
  }
  if(file)lines.push(`Fichier : ${file.originalFilename||'joint'} (${Math.round((file.size||0)/1024)} Ko)`);
  return lines.join('\n');
}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({success:false,message:'Méthode non autorisée'});
  res.setHeader('Cache-Control','no-store');
  const form=formidable({maxFileSize:4*1024*1024,maxFiles:1,keepExtensions:true,allowEmptyFiles:false});
  let file;
  try{
    const [fields,files]=await form.parse(req);
    if(scalar(fields.website))return res.status(200).json({success:true});
    const service=safe(scalar(fields.service)||'Demande depuis le site',160);
    const requestId=makeId('REQ');
    const clean=normalizeFields(fields);
    delete clean.service;
    file=Array.isArray(files.attachment)?files.attachment[0]:files.attachment;
    let whatsapp=false,documentSent=false;
    try{
      whatsapp=await sendTextWhatsApp(buildSummary(requestId,service,clean,file));
      if(file&&whatsapp)documentSent=await sendDocumentWhatsApp(file);
    }catch(_){ }
    if(!whatsapp)return res.status(503).json({success:false,message:'La réception WhatsApp du site n’est pas encore configurée. Merci de contacter directement CVMemoire sur WhatsApp.'});
    return res.status(200).json({success:true,requestId,whatsappSent:true,documentSent});
  }catch(err){
    return res.status(400).json({success:false,message:err?.code==='LIMIT_FILE_SIZE'?'Fichier trop volumineux (4 Mo maximum).':'Impossible de traiter cette demande pour le moment.'});
  }finally{
    try{if(file?.filepath)await fs.unlink(file.filepath)}catch(_){ }
  }
};
