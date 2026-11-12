/* ANGAYA CRUSH V12 — profil, palier récapitulatif, générique cinématographique.
   Chargé uniquement après confirmation de la session Appwrite.
   Les sauvegardes de cette version restent sur cet appareil, isolées par compte. */
(function () {
 'use strict';
 const NAMES={coconut:'🥥 Noix de coco',fishing:'🎣 Canne à pêche',shovel:'🪏 Pelle',cross:'🌞 Boum',shuffle:'🌊 Mix',hint:'💡 Indice'};
 const $local=(s,root=document)=>root.querySelector(s);
 const safe=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const fmt=n=>Math.max(0,Math.floor(Number(n)||0)).toLocaleString('fr-FR');
 const records=()=>Array.isArray(state.adventureHistory)?state.adventureHistory:[];
 const name=()=>safe(state.username||'Aventurier');
 const allTools=(entries)=>entries.reduce((acc,r)=>{
   Object.keys(NAMES).forEach(k=>{acc[k]=(acc[k]||0)+Math.max(0,Math.floor(Number(r.usedTools?.[k])||0));});
   return acc;
 },{});
 const toolsText=(obj)=>Object.entries(NAMES).filter(([k])=>obj?.[k]>0).map(([k,label])=>`${label} ×${fmt(obj[k])}`).join(' · ')||'Aucun objet consommé';
 const escapedName=()=>name();
 let movie=null;

 function showNamePrompt(edit=false) {
  if($local('#angaya-name-prompt'))return;
  const dialog=document.createElement('div');dialog.id='angaya-name-prompt';dialog.className='angaya-name-overlay';
  dialog.innerHTML=`<section class="angaya-name-panel" role="dialog" aria-modal="true" aria-labelledby="angaya-name-heading">
    <span class="angaya-name-crest">✧ ⚜ ✧</span><div class="angaya-name-icon">🧭</div>
    <p class="angaya-name-eyebrow">LE REGISTRE DES LÉGENDES</p><h2 id="angaya-name-heading">${edit?'Ton nom d’aventurier':'Toute légende commence par un nom'}</h2>
    <p>${edit?'Choisis le nom qui te représentera dans les prochains défis.':'Choisis le nom qui sera gravé dans tes scores, ton profil et les récits de tes victoires.'}</p>
    <form id="angaya-name-form"><label for="angaya-name-field">Ton pseudo de joueur</label><input id="angaya-name-field" type="text" minlength="2" maxlength="24" required autocomplete="nickname" placeholder="Ex. Héros de Mahajanga" value="${edit?name():''}">
    <div class="angaya-name-error" id="angaya-name-error" role="alert"></div><button type="submit" class="angaya-name-start">${edit?'ENREGISTRER MON NOM':'GRAVER MON NOM ✦'}</button></form>
    ${edit?'<button type="button" class="angaya-name-cancel" id="angaya-name-cancel">Annuler</button>':'<small>Tu pourras modifier ton pseudo depuis ton profil.</small>'}
  </section>`;
  document.body.appendChild(dialog);
  const input=$local('#angaya-name-field',dialog);
  input.focus();input.select();
  $local('#angaya-name-form',dialog).addEventListener('submit',e=>{
   e.preventDefault();const val=input.value.trim().replace(/\s+/g,' ');
   if(val.length<2){$local('#angaya-name-error',dialog).textContent='Saisis au moins deux caractères.';input.focus();return;}
   state.username=val.slice(0,24);save();dialog.remove();render();
   toast('✨ Bienvenue dans la légende, '+state.username+' !');
  });
  $local('#angaya-name-cancel',dialog)?.addEventListener('click',()=>dialog.remove());
 }

 function profileHtml(){
  const data=records(),won=data.filter(r=>r.won),used=allTools(data),nameValue=name();
  const initials=(state.username||'A').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
  const chapters=CHAPTERS.map((ch,i)=>{
    const success=chapterRevealed(i)===ch.n;
    const scores=Number(state.chapterScores?.[i])||0;
    const runs=data.filter(r=>r.chapter===i);
    return `<li class="angaya-profile-chapter"><span class="angaya-profile-chapter-emoji">${ch.emoji}</span><div><strong>${safe(ch.name)}</strong><small>${chapterRevealed(i)}/${ch.n} niveaux · ${runs.length?'Parties répertoriées : '+runs.length:'Historique détaillé indisponible'}</small></div><b>${fmt(scores)} pts</b><span class="angaya-profile-status">${success?'✓':'◌'}</span></li>`;
  }).join('');
  const history=data.length?data.slice(-35).reverse().map(r=>`<li><span>${r.won?'🏆':'⚡'} Niveau ${fmt(r.level)} · ${r.won?'Victoire':'Défaite'} ${r.replay?'(rejoué)':''}</span><strong>${fmt(r.score)} pts</strong><small>${Object.values(r.usedTools||{}).reduce((a,b)=>a+(+b||0),0)} objets/aides · ${new Date(r.at).toLocaleDateString('fr-FR')}</small></li>`).join(''):'<li>Ton histoire détaillée commencera après ta prochaine partie terminée.</li>';
  return `<section class="angaya-profile">
   <p class="eyebrow">📜 CHRONIQUES DE L’AVENTURIER</p><h1 class="title">Mon profil</h1>
   <div class="angaya-profile-hero"><div class="angaya-avatar" aria-hidden="true">${safe(initials)}</div><div><span>EXPLORATEUR DE MAHAJANGA</span><h2>${nameValue}</h2><p>Ton aventure, ton héritage.</p></div><button type="button" data-action="angaya-edit-name">✎ Modifier</button></div>
   <div class="angaya-profile-stats"><div><span>✦ POINTS CARRIÈRE</span><strong>${fmt(state.careerScore)}</strong></div><div><span>🏅 NIVEAUX DÉBLOQUÉS</span><strong>${fmt(completeCount())} / ${TOTAL_LEVELS}</strong></div><div><span>🎮 PARTIES TERMINÉES</span><strong>${fmt(state.careerGames)}</strong></div><div><span>🏝️ LIEUX DÉCOUVERTS</span><strong>${fmt(CHAPTERS.filter((c,i)=>chapterRevealed(i)===c.n).length)} / ${CHAPTERS.length}</strong></div></div>
   <article class="angaya-profile-card"><h3>🎒 Objets et aides utilisés</h3><p>${safe(toolsText(used))}</p><small>Décompte disponible à partir de cette mise à jour.</small></article>
   <article class="angaya-profile-card"><h3>🗺️ Les douze chapitres</h3><ul class="angaya-profile-chapters">${chapters}</ul></article>
   <article class="angaya-profile-card"><h3>✍️ Journal de route</h3><p class="angaya-profile-intro">${fmt(won.length)} victoires répertoriées depuis cette version · Historique des 35 dernières parties affiché</p><ul class="angaya-profile-history">${history}</ul></article>
   <p class="angaya-profile-note">🔐 Cette sauvegarde est stockée sur ce navigateur et séparée selon le compte Appwrite connecté. Elle n’est pas encore synchronisée sur plusieurs appareils.</p>
   ${isFinished()?'<button type="button" class="angaya-profile-cinema" data-action="angaya-final-story">🎬 Revoir mon histoire</button>':''}
  </section>`;
 }

 function showPalierSummary(ci,ctx){
  const ch=CHAPTERS[ci],history=records().filter(r=>r.chapter===ci),won=history.filter(r=>r.won),used=allTools(history),points=Number(state.chapterScores?.[ci])||0;
  const all=records(),globalUsed=allTools(all);
  const chapterComplete=chapterRevealed(ci)===ch.n;
  const nextLabel=ctx.final?'NEXT · MA LÉGENDE':`NEXT · PALIER ${ci+2}`;
  const body=`<div class="angaya-palier-summary"><span class="angaya-sum-ornament">✦ ⚜ ✦</span><p class="angaya-sum-kicker">CHAPITRE ${ci+1} / ${CHAPTERS.length} · ${chapterComplete?'ACCOMPLI':'REJOUÉ'}</p>
   <h2>La légende de ${name()}</h2><p class="angaya-sum-sub">« ${safe(ch.hook)} »</p>
   <div class="angaya-sum-cover" style='${scene(ch)}' role="img" aria-label="${safe(ch.name)}"></div>
   <h3>${ch.emoji} ${safe(ch.name)}</h3>
   <p class="angaya-sum-body">${safe(ch.desc)}</p>
   <div class="angaya-sum-stats"><div><span>POINTS DU PALIER</span><strong>${fmt(points)}</strong></div><div><span>POINTS CARRIÈRE</span><strong>${fmt(state.careerScore)}</strong></div><div><span>NIVEAUX VALIDÉS</span><strong>${ch.n} / ${ch.n}</strong></div><div><span>PARTIES DU PALIER</span><strong>${fmt(state.chapterGames?.[ci])}</strong></div></div>
   <div class="angaya-sum-detail"><h4>🎒 Objets et aides consommés</h4><p>${safe(toolsText(used))}</p></div>
   <div class="angaya-sum-detail"><h4>🏆 Parcours consigné</h4><p>${fmt(won.length)} victoires enregistrées depuis V12 dans ce palier · ${fmt(history.length)} parties documentées</p><p>Objets et aides sur toute la carrière : ${safe(toolsText(globalUsed))}</p></div>
   <div class="angaya-sum-detail"><h4>✨ La récompense du voyage</h4><p>${fmt(ctx.stars)} étoiles pour la dernière victoire · ${fmt(ctx.reward)} pièces gagnées · ${fmt(completeCount())} niveaux débloqués sur ${TOTAL_LEVELS}.</p></div>
   <button type="button" class="angaya-next-only" data-action="${ctx.final?'angaya-final-story':'angaya-next-chapter'}" data-level="${ctx.nextLevel}">${nextLabel} <span>➜</span></button>
  </div>`;
  showModal(body,'angaya-palier-modal');
  if(ctx.final){stopAngayaFireworks();}
 }

 function lifetimeStats(){
  const past=records();
  const saved=state.adventureTotals?.schema===1?state.adventureTotals:null;
  if(saved)return saved;
  return {
   usedTools:allTools(past),
   toolsTrackedGames:past.filter(r=>r.usedTools&&typeof r.usedTools==='object').length,
   comboTrackedGames:past.filter(r=>r.comboTracked===true).length,
   alignments:past.reduce((sum,r)=>sum+(r.comboTracked===true?(Number(r.alignments)||0):0),0),
   combos:past.reduce((sum,r)=>sum+(r.comboTracked===true?(Number(r.comboCount)||0):0),0)
  };
 }
 const objectCount=used=>['coconut','fishing','shovel','cross','shuffle'].reduce((sum,k)=>sum+Math.max(0,Math.floor(Number(used?.[k])||0)),0);

 // Affiche exclusivement le score du niveau 160 avant le bilan global.
 function showLastLevelScore(finishedGame,ctx){
  const used=finishedGame.usedTools||{},series=finishedGame.comboHistory||[];
  const combos=series.filter(c=>c.chain>=2||c.removed>=5).length;
  const body=`<section class="angaya-final-level-card">
   <span class="angaya-sum-ornament">✦ ⚜ ✦</span>
   <p class="angaya-sum-kicker">DERNIER NIVEAU · ${fmt(ctx.level)} / ${TOTAL_LEVELS}</p>
   <div class="angaya-final-level-icon" aria-hidden="true">🏆</div>
   <h2>Dernière victoire !</h2>
   <p class="angaya-final-greeting">${name()}, tu viens de terminer le dernier défi d’Angaya Crush.</p>
   <div class="angaya-final-stars" aria-label="${ctx.stars} étoiles">${'★'.repeat(ctx.stars)}<span>${'★'.repeat(3-ctx.stars)}</span></div>
   ${scoreTallyHtml(finishedGame)}
   <div class="angaya-final-level-extras"><div><span>🎒 Objets utilisés</span><strong>${fmt(objectCount(used))}</strong></div><div><span>⚡ Grands combos</span><strong>${fmt(combos)}</strong></div><div><span>💎 Pièces gagnées</span><strong>${fmt(ctx.reward)}</strong></div></div>
   <p class="angaya-final-level-note">Voici le résultat de ce dernier niveau. Clique sur Next pour découvrir le bilan de toute ton aventure.</p>
   <button type="button" class="angaya-next-only" data-action="angaya-global-summary">NEXT <span>➜</span></button>
  </section>`;
  showModal(body,'angaya-final-level-modal');
 }

 // Un seul bilan : scores des 12 paliers, objets, combos et détail des niveaux.
 function showGlobalAdventureSummary(){
  const history=records(),stats=lifetimeStats(),used=stats.usedTools||{};
  const chapters=CHAPTERS.map((ch,i)=>`<li class="angaya-global-chapter"><span class="angaya-global-chapter-emoji">${ch.emoji}</span><div><strong>${safe(ch.name)}</strong><small>${ch.n} niveaux</small></div><b>${fmt(state.chapterScores?.[i])} pts</b></li>`).join('');
  const byLevel=new Map();
  history.forEach(r=>{
   const level=Number(r.level);if(!Number.isInteger(level)||level<1||level>TOTAL_LEVELS)return;
   const d=byLevel.get(level)||{score:0,played:0};d.score+=Math.max(0,Number(r.score)||0);d.played++;byLevel.set(level,d);
  });
  const levelRows=Array.from({length:TOTAL_LEVELS},(_,i)=>{
   const entry=byLevel.get(i+1);
   return `<li><span>Niveau ${i+1}</span><strong>${entry?fmt(entry.score)+' pts':'—'}</strong></li>`;
  }).join('');
  const comboTracked=Math.max(0,Number(stats.comboTrackedGames)||0),careerGames=Math.max(0,Number(state.careerGames)||0);
  const toolsTracked=Math.max(0,Number(stats.toolsTrackedGames)||0);
  const allComboStats=comboTracked>=careerGames;
  const allToolStats=toolsTracked>=careerGames;
  const note=[];
  if(!allComboStats)note.push(`Les combos sont recensés pour ${fmt(comboTracked)} parties sur ${fmt(careerGames)} ; les anciennes parties sans suivi ne peuvent pas être reconstituées.`);
  if(!allToolStats)note.push(`Les objets sont recensés pour ${fmt(toolsTracked)} parties sur ${fmt(careerGames)}.`);
  if(history.length<careerGames)note.push('Le détail par niveau est basé sur le journal disponible (600 dernières parties maximum) ; le score total et les scores des paliers conservent l’historique complet.');
  const body=`<section class="angaya-global-wrap">
   <span class="angaya-sum-ornament">✦ ⚜ ✦</span>
   <p class="angaya-sum-kicker">LE GRAND BILAN · 12 PALIERS TERMINÉS</p>
   <h2>Ton aventure en chiffres</h2>
   <p class="angaya-global-intro">${name()}, voici le parcours accompli à travers les <strong>${TOTAL_LEVELS} niveaux</strong> de Mahajanga.</p>
   <div class="angaya-global-highlight"><span>✦ SCORE CUMULÉ DE L’AVENTURE ✦</span><strong>${fmt(state.careerScore)}</strong><small>points sur toutes les parties terminées, y compris les niveaux rejoués</small></div>
   <div class="angaya-global-stats"><div><span>🏅 NIVEAUX ACHEVÉS</span><strong>${fmt(completeCount())} / ${TOTAL_LEVELS}</strong></div><div><span>🎮 PARTIES TERMINÉES</span><strong>${fmt(careerGames)}</strong></div><div><span>🎒 OBJETS UTILISÉS</span><strong>${fmt(objectCount(used))}${allToolStats?'':' *'}</strong></div><div><span>⚡ GRANDS COMBOS</span><strong>${fmt(stats.combos)}${allComboStats?'':' *'}</strong></div><div><span>✧ ALIGNEMENTS</span><strong>${fmt(stats.alignments)}${allComboStats?'':' *'}</strong></div><div><span>💡 INDICES UTILISÉS</span><strong>${fmt(used.hint)}${allToolStats?'':' *'}</strong></div></div>
   <div class="angaya-global-detail"><h3>🎒 Inventaire des objets consommés</h3><p>${safe(toolsText(used))}</p></div>
   <div class="angaya-global-detail"><h3>🗺️ Points cumulés des 12 paliers</h3><ul class="angaya-global-chapters">${chapters}</ul></div>
   <details class="angaya-global-per-level"><summary>Consulter le score enregistré de chacun des ${TOTAL_LEVELS} niveaux</summary><p>Les tirets correspondent aux niveaux dont le journal détaillé n’est plus disponible. Les niveaux rejoués sont cumulés.</p><ul>${levelRows}</ul></details>
   ${note.length?`<p class="angaya-global-note">* ${safe(note.join(' '))}</p>`:''}
   <p class="angaya-global-endline">Une aventure se mesure en souvenirs. Une légende se mesure en courage.</p>
   <button type="button" class="angaya-next-only" data-action="angaya-final-story">NEXT <span>➜</span></button>
  </section>`;
  showModal(body,'angaya-global-modal');
 }

 function buildStory(){
  const history=records(),player=name();
  const slides=CHAPTERS.map((c,i)=>{
   const attempts=history.filter(h=>h.chapter===i),used=allTools(attempts),wins=attempts.filter(h=>h.won),score=state.chapterScores?.[i]||0;
   const count=chapterRevealed(i),isDone=count===c.n;
   return `<section class="angaya-story-chapter" data-chapter-index="${i}" aria-label="Chapitre ${i+1}">
     <div class="angaya-story-chapter-top"><span>CHAPITRE ${String(i+1).padStart(2,'0')}</span><span>✦ ${i+1} / ${CHAPTERS.length}</span></div>
     <div class="angaya-story-photo" style='${scene(c)}' role="img" aria-label="${safe(c.name)}"></div>
     <div class="angaya-story-chapter-copy"><div class="angaya-story-emblem">${c.emoji}</div><h2>${safe(c.name)}</h2><blockquote>${safe(c.hook)}</blockquote>
     <p>${safe(c.desc)}</p>
     <div class="angaya-story-results"><span>✦ ${fmt(score)} points au palier</span><span>◇ ${fmt(count)}/${c.n} étapes</span><span>🏆 ${fmt(wins.length)} victoires consignées</span></div>
     <div class="angaya-story-item">🎒 ${safe(toolsText(used))}</div>
     <p class="angaya-story-quote">${isDone?'Tu as écrit ton histoire là où d’autres auraient rebroussé chemin.':'Chaque trésor attend son heure — un nouveau chapitre reste à écrire.'}</p></div>
   </section>`;
  }).join('');
  const total=fmt(state.careerScore),done=fmt(completeCount()),used=allTools(history);
  return `<section class="angaya-story-opening"><div class="angaya-story-small">ANGAYA CRUSH · L’ÉPOPÉE</div><div class="angaya-story-crest">✧ ⚜ ✧</div><h1>Il était une fois<br><em>${player}</em></h1><p>Un aventurier. Douze destinations. Cent soixante défis. Et une légende dont chaque étoile garde le souvenir.</p>
   <div class="angaya-story-summary">✦ ${total} POINTS · ${done} NIVEAUX DÉBLOQUÉS</div><p class="angaya-story-opening-foot">Tourne les pages de ton destin…</p></section>
   ${slides}
   <section class="angaya-story-epilogue"><div class="angaya-story-crest">✦ ⚜ ✦</div><h2>Le livre n’a pas dit son dernier mot.</h2>
   <p>${player} a traversé ${done} défis. Les points accumulés portent sa marque : <strong>${total}</strong>.</p><p>Objets et aides utilisés : ${safe(toolsText(used))}.</p><blockquote>« Les plus belles légendes ne s’achèvent jamais. Elles attendent leur prochain héros. »</blockquote></section>
   <section id="angaya-story-end" class="angaya-story-end" aria-label="Fin du générique">
    <div class="angaya-continued" aria-hidden="true">TO BE<br>CONTINUED</div>
    <div class="angaya-story-end-foreground"><img src="./assets/creators-angaya.webp" alt="Arison, développement et conseil, et Manoa, conception et idée — créateurs d’Angaya Crush">
     <div class="angaya-story-final-title">L’aventure ne fait que commencer.</div>
     <p class="angaya-story-final-message">Restez à l’affût des prochaines mises à jour, avec de nouveaux endroits inédits.</p>
     <button type="button" id="angaya-cinema-home" class="angaya-cinema-home" hidden>⌂ ACCUEIL</button></div>
   </section>`;
 }

 function launchFinale(){
  if(movie)return;
  closeModal();stopAngayaFireworks();stopNatureAmbience();stopAmbientVisuals();stopMusic();
  const box=document.createElement('div');box.id='angaya-cinema';box.setAttribute('role','region');box.setAttribute('aria-label','Générique final, cliquer pour passer à la fin');
  box.innerHTML=`<div class="angaya-cinema-backdrop angaya-cinema-backdrop-a is-visible" aria-hidden="true"></div><div class="angaya-cinema-backdrop angaya-cinema-backdrop-b" aria-hidden="true"></div><div class="angaya-cinema-vignette"></div><div id="angaya-cinema-scroller"><div class="angaya-cinema-track">${buildStory()}</div></div><div class="angaya-cinema-skip">▸ Clique n’importe où pour passer à la fin</div><button type="button" class="angaya-cinema-audio-retry" hidden aria-label="Lancer la musique du générique">♫ Écouter la musique</button>`;
  document.body.appendChild(box);document.body.classList.add('angaya-finale-playing');
  const scroll=$local('#angaya-cinema-scroller',box);
  const audio=new Audio('./audio/music/finale_heroes.mp3');audio.loop=true;audio.preload='auto';audio.volume=.7;
  const layers=[$local('.angaya-cinema-backdrop-a',box),$local('.angaya-cinema-backdrop-b',box)];
  let currentLayer=0,currentChapter=0;
  layers[0].style.backgroundImage=`url("${photoUrl(CHAPTERS[0])}")`;
  function fadeToChapter(i){
   if(i===currentChapter||i<0||i>=CHAPTERS.length)return;
   const next=1-currentLayer;
   layers[next].style.backgroundImage=`url("${photoUrl(CHAPTERS[i])}")`;
   layers[next].classList.add('is-visible');layers[currentLayer].classList.remove('is-visible');
   currentLayer=next;currentChapter=i;
  }
  const context={box,scroll,audio,raf:0,last:0,done:false,homeTimeout:null,observer:null};movie=context;
  // La lecture est déclenchée directement par le clic sur NEXT, sans message au-dessus du film.
  // Si un navigateur la bloque, seul un discret bouton en bas permet de relancer le son.
  const retry=$local('.angaya-cinema-audio-retry',box);
  audio.play().catch(()=>{if(movie===context&&!context.done)retry.hidden=false;});
  retry.addEventListener('click',e=>{e.stopPropagation();audio.play().then(()=>retry.hidden=true).catch(()=>{});});
  const chapters=[...box.querySelectorAll('.angaya-story-chapter')];
  if('IntersectionObserver' in window){
   context.observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(entry.isIntersecting){
      entry.target.classList.add('angaya-chapter-visible');
      fadeToChapter(Number(entry.target.dataset.chapterIndex));
     }
    }
   },{root:scroll,rootMargin:'-18% 0px -19% 0px',threshold:0.12});
   chapters.forEach(ch=>context.observer.observe(ch));
  }else chapters.forEach(ch=>ch.classList.add('angaya-chapter-visible'));
  function finish(){
   if(movie!==context||context.done)return;
   context.done=true;cancelAnimationFrame(context.raf);
   context.observer?.disconnect();
   scroll.scrollTop=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
   box.classList.add('angaya-story-complete');
   retry.hidden=true;
   $local('.angaya-cinema-skip',box)?.remove();
   context.homeTimeout=setTimeout(()=>{if(movie!==context)return;const home=$local('#angaya-cinema-home',box);if(home){home.hidden=false;home.focus({preventScroll:true});}},3500);
  }
  function frame(t){
   if(movie!==context||context.done)return;
   if(!context.last)context.last=t;
   const dt=Math.min(.12,(t-context.last)/1000);context.last=t;
   if(!document.hidden){
    scroll.scrollTop+=dt*54; // environ 54 px/s : générique volontairement lent.
    if(scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-3){finish();return;}
   }
   context.raf=requestAnimationFrame(frame);
  }
  // Un clic sur le générique saute instantanément à la photo finale.
  box.addEventListener('click',event=>{
   if(event.target.closest('#angaya-cinema-home')){event.stopPropagation();returnHome();return;}
   if(!context.done){event.preventDefault();finish();}
  });
  box.addEventListener('keydown',event=>{if(!context.done&&(event.key==='Enter'||event.key==='Escape'||event.key===' ')){event.preventDefault();finish();}});
  box.tabIndex=0;box.focus({preventScroll:true});
  scroll.scrollTop=0;context.raf=requestAnimationFrame(frame);
 }

 function returnHome(){
  if(!movie)return;
  const ctx=movie;movie=null;cancelAnimationFrame(ctx.raf);clearTimeout(ctx.homeTimeout);
  ctx.observer?.disconnect();ctx.audio.pause();ctx.audio.src='';ctx.box.remove();
  document.body.classList.remove('angaya-finale-playing');
  setPage('home',true);
 }

 document.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');if(!target)return;
  const action=target.dataset.action;
  if(action==='angaya-edit-name'){event.preventDefault();showNamePrompt(true);}
  if(action==='angaya-next-chapter'){
   event.preventDefault();const level=Number(target.dataset.level);
   showNextChapter(level);
  }
  if(action==='angaya-global-summary'){event.preventDefault();showGlobalAdventureSummary();}
  if(action==='angaya-final-story'){event.preventDefault();launchFinale();}
 });
 window.AngayaChronicles={profileHtml,showPalierSummary,showLastLevelScore,showGlobalAdventureSummary,launchFinale,showNamePrompt,escape:safe};
 // Le premier rendu du noyau précède le chargement de cette extension.
 // Mettre immédiatement à jour le nom sur la page d'accueil.
 render();
 // After the initial cloud animation is finished, ask for a nickname once.
 if(!state.username){
  const intro=document.getElementById('angaya-fog-intro');
  if(intro){
   const observer=new MutationObserver(()=>{
    if(!document.contains(intro)){observer.disconnect();if(!state.username)showNamePrompt();}
   });observer.observe(document.body,{childList:true,subtree:false});
   if(!document.contains(intro)){observer.disconnect();showNamePrompt();}
  }else showNamePrompt();
 }
})();
