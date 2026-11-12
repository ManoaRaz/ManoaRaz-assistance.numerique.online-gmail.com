const vm=require('vm'),fs=require('fs'),assert=require('assert');
const s=fs.readFileSync('/mnt/data/angaya_edit/jeu/angaya-chronicles.js','utf8').replace('escape:safe};','escape:safe,_buildStory:buildStory};');
const chapterNames=['Le bord de mer','Le Jardin d’amour','Le Cirque Rouge','Le lac Sacré','La plage de Mahajanga','Le port de Mahajanga','La descente d’Androva','Le Quai Orange','Le Village touristique','La Corniche','Le phare de Katsepi','L’avion de Mangarivotra'];
const CHAPTERS=chapterNames.map((name,i)=>({key:'k'+i,name,n:12,emoji:'🌞',hook:'Le mystère de '+name,desc:'Épopée à '+name}));
const ctx={
 window:{},document:{addEventListener:()=>{},getElementById:()=>null,querySelector:()=>null},
 state:{username:'<Aventurier>',adventureHistory:[{at:'2026-11-12T00:00:00.000Z',level:1,chapter:0,won:true,score:200,bonus:20,movesUsed:18,stars:2,usedTools:{coconut:1,hint:2}}],careerScore:200,careerGames:1,chapterScores:[200,...Array(11).fill(0)],chapterGames:[1,...Array(11).fill(0)],nextLevel:2},
 CHAPTERS,TOTAL_LEVELS:160,chapterRevealed:i=>i===0?12:0,completeCount:()=>1,isFinished:()=>false,
 scene:c=>'background:#eee',showModal:(html,cl)=>{ctx.lastModal=html;ctx.lastModalClass=cl;},
 stopAngayaFireworks:()=>{},save:()=>{},render:()=>{},toast:()=>{},console,setTimeout,clearTimeout,
};
vm.createContext(ctx);vm.runInContext(s,ctx);let api=ctx.window.AngayaChronicles;
assert(api,'chronicle loaded');
let profile=api.profileHtml();assert(profile.includes('&lt;Aventurier&gt;'));assert(!profile.includes('<Aventurier>'));
assert.equal((profile.match(/angaya-profile-chapter"/g)||[]).length,12);
api.showPalierSummary(0,{level:12,stars:3,reward:70,nextLevel:13,final:false});
assert.equal((ctx.lastModal.match(/<button/g)||[]).length,1);
assert(ctx.lastModal.includes('angaya-next-chapter'));assert(ctx.lastModal.includes('🥥 Noix de coco'));
api.showPalierSummary(11,{level:160,stars:3,reward:70,nextLevel:161,final:true});
assert(ctx.lastModal.includes('angaya-final-story'));
const story=api._buildStory();
assert.equal((story.match(/class="angaya-story-chapter"/g)||[]).length,12);
assert(story.includes('creators-angaya.webp')&&story.includes('CONTINUED'));
console.log('OK: 12 chapitres, profil échappé, un seul bouton Next, résumé final, montage avec créateurs, inventaire.');
