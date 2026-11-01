'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const Module=require('node:module');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cvm-test-'));
let formPayload=[];
const originalLoad=Module._load;
Module._load=function(name,parent,isMain){if(name==='formidable')return {formidable:()=>({parse:async()=>formPayload})};return originalLoad.call(this,name,parent,isMain);};
const handler=require('../api/submit-request.js');
Module._load=originalLoad;
function config(mode='session'){
  process.env.WHATSAPP_ACCESS_TOKEN='TEST_TOKEN_NOT_REAL';
  process.env.WHATSAPP_PHONE_NUMBER_ID='111222333';
  process.env.WHATSAPP_ADMIN_NUMBER='261389518788';
  process.env.WHATSAPP_GRAPH_VERSION='v23.0';
  process.env.WHATSAPP_DELIVERY_MODE=mode;
  process.env.WHATSAPP_TEMPLATE_LANGUAGE='fr';
  process.env.WHATSAPP_TEXT_TEMPLATE_NAME='cvm_request_text';
  process.env.WHATSAPP_IMAGE_TEMPLATE_NAME='cvm_request_image';
  process.env.WHATSAPP_DOCUMENT_TEMPLATE_NAME='cvm_request_document';
}
function file(ext,mime,bytes){const p=path.join(temp,'f-'+Math.random().toString(16).slice(2)+ext);fs.writeFileSync(p,bytes);return {filepath:p,originalFilename:'test'+ext,size:bytes.length,mimetype:mime};}
function res(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.code=c;return this},json(data){this.data=data;return this}};}
const consent={service:['Demande de création de CV'],accept_confidentialite_conditions:['oui'],certification_exactitude_cv:['oui'],nom_complet:['Madagascar Test'],telephone:['261340000000']};
function setup(fields,files={}){formPayload=[fields,files];return {method:'POST',headers:{host:'cvmemoire.click',origin:'https://cvmemoire.click'}};}
function fakeMeta(shouldFail){let i=0;const calls=[];
  global.fetch=async (url,opts)=>{
    const kind=url.endsWith('/media')?'media':'messages';
    const b=kind==='media'?'MULTIPART':JSON.parse(opts.body);
    calls.push({kind,body:b});i++;
    if(shouldFail&&shouldFail({i,kind,body:b}))return {ok:false,status:400,json:async()=>({error:{code:131047}})};
    return {ok:true,status:200,json:async()=>kind==='media'?{id:'MEDIA'+i}:{messages:[{id:'wamid.'+i}]}};
  };return calls;
}

test('CV texte sans fichier : Meta doit accepter la demande',async()=>{
  config();const calls=fakeMeta();const r=res();await handler(setup(consent),r);
  assert.equal(r.code,200);assert.equal(r.data.success,true);assert.equal(r.data.acceptedByMeta,true);
  assert.equal(r.data.documentsSent,0);assert.equal(calls.length,1);
  assert.equal(calls[0].body.to,'261389518788');
});
test('deux pièces jointes CV distinctes (photo + PDF) doivent arriver en deux messages',async()=>{
  config();const calls=fakeMeta();
  const jpg=file('.jpg','image/jpeg',Buffer.from([0xff,0xd8,0xff,0xe0,0,0,4,5]));
  const pdf=file('.pdf','application/pdf',Buffer.from('%PDF-1.5\n%%EOF'));
  const r=res();await handler(setup(consent,{attachment:[jpg,pdf]}),r);
  assert.equal(r.code,200);assert.equal(r.data.documentsSent,2);
  assert.equal(calls.filter(c=>c.kind==='media').length,2);
  assert.equal(calls.filter(c=>c.kind==='messages'&&c.body.type==='image').length,1);
  assert.equal(calls.filter(c=>c.kind==='messages'&&c.body.type==='document').length,1);
  assert.equal(fs.existsSync(jpg.filepath),false);assert.equal(fs.existsSync(pdf.filepath),false);
});
test('échec d’une pièce jointe : jamais de succès trompeur',async()=>{
  config();const calls=fakeMeta(({kind,body})=>kind==='messages'&&body.type==='document');
  const pdf=file('.pdf','application/pdf',Buffer.from('%PDF-1.5\n%%EOF'));
  const r=res();await handler(setup(consent,{attachment:[pdf]}),r);
  assert.equal(r.code,502);assert.equal(r.data.success,false);assert.equal(r.data.partial,true);
  assert.equal(r.data.documentsSent,0);assert.ok(r.data.requestId);
  assert.equal(calls.filter(c=>c.kind==='messages').length,2);
});
test('modèles approuvés : texte et en-tête image/document',async()=>{
  config('template');const calls=fakeMeta();
  const jpg=file('.jpg','image/jpeg',Buffer.from([0xff,0xd8,0xff,0xe0,0,0,4,5]));
  const pdf=file('.pdf','application/pdf',Buffer.from('%PDF-1.5\n%%EOF'));
  const r=res();await handler(setup(consent,{attachment:[jpg,pdf]}),r);
  assert.equal(r.data.success,true);
  const sent=calls.filter(c=>c.kind==='messages').map(c=>c.body);
  assert.ok(sent.every(s=>s.type==='template'));
  assert.equal(sent[1].template.components[0].parameters[0].type,'image');
  assert.equal(sent[2].template.components[0].parameters[0].type,'document');
});
test('consentement manquant : aucune requête sortante',async()=>{
  config();const calls=fakeMeta();const r=res();
  await handler(setup({...consent,certification_exactitude_cv:['non']}),r);
  assert.equal(r.code,400);assert.equal(r.data.success,false);assert.equal(calls.length,0);
});
test('fichier WebP non pris en charge directement, sans requête Meta',async()=>{
  config();const calls=fakeMeta();const webp=file('.webp','image/webp',Buffer.from('RIFFxxWEBP'));
  const r=res();await handler(setup(consent,{attachment:[webp]}),r);
  assert.equal(r.code,415);assert.equal(r.data.success,false);assert.equal(calls.length,0);
});
test('service non reconnu : bloqué pour limiter les abus',async()=>{
  config();const calls=fakeMeta();const r=res();await handler(setup({...consent,service:['Autre']}),r);
  assert.equal(r.code,400);assert.equal(calls.length,0);
});
test('texte long : plusieurs messages et aucun tronquage silencieux',async()=>{
  config();const calls=fakeMeta();const r=res();
  await handler(setup({...consent,profil_personnel:['Très motivé. '.repeat(240)],experiences:['Assistant CV. '.repeat(240)]}),r);
  assert.equal(r.code,200);assert.ok(r.data.textsSent>1);
  assert.equal(calls.filter(c=>c.kind==='messages').length,r.data.textsSent);
});
test('serveur non configuré : pas de faux succès',async()=>{
  config();delete process.env.WHATSAPP_ACCESS_TOKEN;const calls=fakeMeta();const r=res();
  await handler(setup(consent),r);assert.equal(r.code,503);assert.equal(r.data.success,false);assert.equal(calls.length,0);
});
test('échec du téléversement : aucun message de demande annoncé',async()=>{
  config();const calls=fakeMeta(({kind})=>kind==='media');
  const pdf=file('.pdf','application/pdf',Buffer.from('%PDF-1.5\n%%EOF'));
  const r=res();await handler(setup(consent,{attachment:[pdf]}),r);
  assert.equal(r.data.success,false);assert.equal(r.data.partial,false);
  assert.equal(calls.filter(c=>c.kind==='messages').length,0);
});
test('numéro émetteur = numéro récepteur : configuration refusée',async()=>{
  config();process.env.WHATSAPP_SENDER_NUMBER='261389518788';const calls=fakeMeta();
  const r=res();await handler(setup(consent),r);
  assert.equal(r.code,503);assert.equal(r.data.success,false);assert.equal(calls.length,0);
  delete process.env.WHATSAPP_SENDER_NUMBER;
});
