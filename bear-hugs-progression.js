(() => {
'use strict';
const KEY='cuteBunnyBearSelectedFriend:v1', LOVE_KEY='cuteBunnyBearLove:v1';
const REWARDS=[
 {level:2,name:'Enchanted Forest',icon:'🌲',detail:'A peaceful forest scene'},
 {level:3,name:'Little Picnic Basket',icon:'🧺',detail:'A shared picnic accessory',coming:true},
 {level:4,name:'Matching Flower Crowns',icon:'🌼',detail:'A tiny crown for each bear',coming:true},
 {level:5,name:'Matching Cute Caps',icon:'🧢',detail:'One cute cap for each bear'}
];
const $=(s,r=document)=>r.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const friendsNow=()=>typeof friends!=='undefined'&&Array.isArray(friends)?friends:[];
const userNow=()=>typeof me!=='undefined'?me:null;
const supa=()=>typeof sb!=='undefined'?sb:null;
const points=()=>Math.max(0,Number(localStorage.getItem(LOVE_KEY))||0);
let chosen=localStorage.getItem(KEY)||'',channel=null,topic='',ready=false,originalTrigger=null;
function levelInfo(p){
 let level=1,previous=0,next=100;
 if(p>=100){level=2;previous=100;next=150}
 if(p>=150){level=3;previous=150;next=200}
 if(p>=200){level=4;previous=200;next=350}
 if(p>=350){level=5;previous=350;next=650}
 if(p>=650){level=5+Math.floor((p-350)/300);previous=350+(level-5)*300;next=previous+300}
 return {level,previous,next,percent:Math.max(0,Math.min(100,(p-previous)/(next-previous)*100))};
}
function updateUI(){
 const root=$('#coupleBearGame');if(!root)return;
 const p=points(),v=levelInfo(p),meter=$('.bear-love-meter',root);
 if(meter)meter.innerHTML='<div class="bear-level-heading"><span class="bear-level-heart">♡</span><span><small>YOUR LITTLE LOVE JOURNEY</small><b>Level '+v.level+'</b></span><strong>'+p+' <small>love points</small></strong></div><div class="bear-level-track" role="progressbar" aria-label="Progress to next Bear Hugs level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(v.percent)+'"><span style="width:'+v.percent+'%"></span></div><p class="bear-level-next">'+(v.next-p)+' points to level '+(v.level+1)+'</p>';
 let rewards=$('.bear-rewards',root);
 if(!rewards){rewards=document.createElement('section');rewards.className='bear-rewards';rewards.innerHTML='<div class="bear-rewards-heading"><span>🎁</span><div><b>Little level rewards</b><small>Collect sweet things as your love grows</small></div></div><div class="bear-rewards-list"></div>';root.appendChild(rewards)}
 $('.bear-rewards-list',rewards).innerHTML=REWARDS.map(r=>'<article class="bear-reward '+(v.level>=r.level?'is-unlocked':'is-locked')+'"><span class="bear-reward-icon">'+r.icon+'</span><span class="bear-reward-copy"><b>'+r.name+'</b><small>'+r.detail+'</small></span><span class="bear-reward-status">'+(v.level>=r.level?'Unlocked':r.coming?'Coming soon':'Locked')+'</span></article>').join('');
 const scene=$('.couple-bears-scene',root);if(scene){scene.classList.toggle('bear-forest-unlocked',v.level>=2);scene.classList.toggle('bear-caps-unlocked',v.level>=5)}
}
function ensurePicker(){
 if($('#bearFriendPicker'))return;
 const modal=document.createElement('div');modal.id='bearFriendPicker';modal.className='bear-friend-picker hidden';
 modal.innerHTML='<section class="bear-friend-picker-card" role="dialog" aria-modal="true" aria-labelledby="bearFriendPickerTitle"><button type="button" class="bear-friend-picker-close" aria-label="Close">×</button><span class="bear-picker-art">🐻 ♡ 🐻</span><small>A LITTLE MOMENT TOGETHER</small><h3 id="bearFriendPickerTitle">Who should join you?</h3><p>Choose a friend to connect your two bears. Both of you will see each other’s actions live.</p><div class="bear-friend-picker-list"></div><p class="bear-picker-footnote">You can change your Bear Hugs partner any time.</p></section>';
 document.body.appendChild(modal);
 modal.addEventListener('click',e=>{
  if(e.target===modal||e.target.closest('.bear-friend-picker-close'))modal.classList.add('hidden');
  const b=e.target.closest('[data-bear-friend-id]');if(b)void chooseFriend(b.dataset.bearFriendId);
 });
}
function openPicker(){
 ensurePicker();const modal=$('#bearFriendPicker'),list=$('.bear-friend-picker-list',modal);
 const items=friendsNow().filter(f=>f&&f.id&&String(f.id)!==String(userNow()?.id||''));
 list.innerHTML=items.length?items.map(f=>'<button type="button" class="bear-friend-choice '+(String(f.id)===chosen?'is-selected':'')+'" data-bear-friend-id="'+esc(f.id)+'"><span class="bear-friend-avatar">'+esc(f.mascot||'🐰')+'</span><span><b>'+esc(f.display_name||f.displayName||f.username||'Friend')+'</b><small>@'+esc(f.username||'')+'</small></span><span class="bear-friend-check">'+(String(f.id)===chosen?'✓':'♡')+'</span></button>').join(''):'<div class="bear-no-friends">Your little circle is empty. Add a friend in the Friends tab first. ♡</div>';
 modal.classList.remove('hidden');
}
function selected(){return friendsNow().find(f=>String(f.id)===chosen)}
async function connect(){
 const f=selected(),u=userNow(),s=supa();if(!f||!u?.id||!s)return;
 const ids=[String(u.id),String(f.id)].sort(),next='cute-bunny-bear-pair-'+ids.join('-');
 if(topic===next&&channel)return;
 if(channel){try{await s.removeChannel(channel)}catch{}}
 topic=next;ready=false;
 channel=s.channel(topic,{config:{broadcast:{self:false,ack:true}}})
 .on('broadcast',{event:'bear-action'},({payload})=>{
  if(!payload||String(payload.userId)===String(u.id)||String(payload.pairKey||'')!==ids.join(':'))return;
  const action=String(payload.action||'');if(!['hug','kiss','hands','dance','pet','feed','sleep','idle'].includes(action))return;
  const scene=$('#coupleBearGame .couple-bears-scene');if(!scene)return;
  scene.dataset.action=action;
  if(typeof bearPoseEngine!=='undefined')bearPoseEngine?.play(action,String(payload.gender||'').toLowerCase()==='female'?1:0);
  const status=$('#coupleBearStatus');if(status)status.textContent=(payload.displayName||'Your friend')+' chose '+(action==='hands'?'to hold paws':action)+'. ♡';
  document.querySelectorAll('#coupleBearGame [data-couple-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.coupleAction===action)));
 })
 .subscribe(status=>{ready=status==='SUBSCRIBED';if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status))ready=false});
}
async function chooseFriend(id){
 const f=friendsNow().find(x=>String(x.id)===String(id));if(!f)return;
 chosen=String(f.id);localStorage.setItem(KEY,chosen);$('#bearFriendPicker')?.classList.add('hidden');
 const status=$('#coupleBearStatus');if(status)status.textContent='Connected with '+(f.display_name||f.displayName||f.username)+'. Choose a little action together. ♡';
 await connect();partnerChip();
}
function partnerChip(){
 const root=$('#coupleBearGame');if(!root)return;
 let chip=$('.bear-partner-chip',root);
 if(!chip){chip=document.createElement('button');chip.type='button';chip.className='bear-partner-chip';root.insertBefore(chip,$('.couple-bears-scene',root));chip.addEventListener('click',openPicker)}
 const f=selected();chip.textContent=f?'♡ Playing with '+(f.display_name||f.displayName||f.username)+' · Change':'♡ Choose a friend to play together';
}
async function send(action){
 const f=selected(),u=userNow(),s=supa();if(!f||!u?.id||!s){openPicker();return}
 await connect();if(!channel||!ready){const st=$('#coupleBearStatus');if(st)st.textContent='Connecting your two little bears… try again in a moment. ♡';return}
 const ids=[String(u.id),String(f.id)].sort();
 const payload={action,userId:String(u.id),pairKey:ids.join(':'),gender:u.gender||null,displayName:u.display_name||u.displayName||u.username||'Your friend',sentAt:Date.now()};
 const result=await channel.send({type:'broadcast',event:'bear-action',payload});if(result!=='ok')console.warn('Bear Hugs action delivery:',result);
}
function install(){
 const root=$('#coupleBearGame');if(!root||root.dataset.bearProgressReady==='true')return;
 ensurePicker();
 if(!originalTrigger&&typeof window.triggerBearAction==='function')originalTrigger=window.triggerBearAction;
 if(typeof window.startBearRealtime==='function')window.startBearRealtime=()=>{};
 if(typeof window.publishBearAction==='function')window.publishBearAction=()=>{};
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-couple-action]');if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  if(!selected()){openPicker();return}
  if(originalTrigger)originalTrigger(b.dataset.coupleAction);
  void send(b.dataset.coupleAction);
 },true);
 if(chosen&&!selected())chosen='';
 if(chosen)void connect();
 partnerChip();updateUI();root.dataset.bearProgressReady='true';
 const observer=new MutationObserver(updateUI);observer.observe(root,{childList:true,subtree:true,characterData:true});
 window.addEventListener('storage',e=>{if(e.key===LOVE_KEY)updateUI()});
}
function boot(){install()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('click',e=>{if(e.target.closest('[data-page="home"]'))setTimeout(install,100)});
window.addEventListener('focus',()=>{if(chosen)void connect()});
})();