
const LANGUAGE_NAMES={fr:'French',mg:'Malagasy',en:'English',ar:'Arabic',es:'Spanish',de:'German',it:'Italian',pt:'Portuguese',sw:'Swahili',hi:'Hindi',ur:'Urdu',zh:'Chinese',ja:'Japanese',ko:'Korean',ru:'Russian',tr:'Turkish',nl:'Dutch',id:'Indonesian',vi:'Vietnamese',th:'Thai',pl:'Polish',ro:'Romanian',el:'Greek',he:'Hebrew'};
const MODES={natural:'natural, fluent and idiomatic',formal:'formal and professional',academic:'academic and precise',cv:'professional and suitable for a CV or job application',simple:'clear and easy to understand'};
function extractOutputText(data){if(typeof data.output_text==='string')return data.output_text.trim();for(const item of(data.output||[])){for(const c of(item.content||[])){if(c.type==='output_text'&&c.text)return c.text.trim()}}return''}
async function openAITranslate(text,source,target,mode){
  const sourceName=LANGUAGE_NAMES[source]||source,targetName=LANGUAGE_NAMES[target]||target,style=MODES[mode]||MODES.natural;
  const instruction=`You are a high-quality translation engine. Translate the user's text from ${sourceName} to ${targetName}. The result must be ${style}. Preserve meaning, names, numbers, paragraph breaks, lists and formatting. Do not explain, comment, quote the source, or add facts. Return only the translation.`;
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_TRANSLATE_MODEL||'gpt-5-mini',instructions:instruction,input:text})});
  if(!response.ok)throw new Error(`AI provider error ${response.status}`);const data=await response.json();const out=extractOutputText(data);if(!out)throw new Error('Empty AI translation');return{translation:out,alternatives:[],provider:'CVMemoire AI'}
}
async function myMemoryTranslate(text,source,target){const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(source+'|'+target)}`;const r=await fetch(url,{headers:{'User-Agent':'CVMemoire-Translate/1.0'}});if(!r.ok)throw new Error('Fallback provider unavailable');const data=await r.json();const main=(data?.responseData?.translatedText||'').trim();if(!main)throw new Error('No translation');const alternatives=(data?.matches||[]).map(x=>x.translation).filter(Boolean).filter(x=>x.toLowerCase()!==main.toLowerCase()).filter((x,i,a)=>a.indexOf(x)===i).slice(0,4);return{translation:main,alternatives,provider:'Traduction standard'}}
module.exports = async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({message:'Méthode non autorisée'});
  res.setHeader('Cache-Control','no-store');
  try{const {text,source,target,mode='natural'}=req.body||{};if(typeof text!=='string'||!text.trim())return res.status(400).json({message:'Texte manquant'});if(text.length>5000)return res.status(413).json({message:'Texte trop long (5000 caractères maximum)'});if(!LANGUAGE_NAMES[source]||!LANGUAGE_NAMES[target])return res.status(400).json({message:'Langue non prise en charge'});
    let result;if(process.env.OPENAI_API_KEY){try{result=await openAITranslate(text.trim(),source,target,mode)}catch(e){result=await myMemoryTranslate(text.trim(),source,target)}}else{result=await myMemoryTranslate(text.trim(),source,target)}
    return res.status(200).json(result);
  }catch(err){return res.status(500).json({message:'La traduction est temporairement indisponible.'})}
}
