
function mountBearfriendWorld(root){
  if(!root)return null;
  if(root.__bearfriendDestroy)root.__bearfriendDestroy();
  let destroyed=false;
  const intervals=new Set(),timeouts=new Set(),rafs=new Set(),listeners=[];
  const window=root.ownerDocument.defaultView;
  const document=root.ownerDocument;
  const localStorage=window.localStorage;
  const performance=window.performance;
  const devicePixelRatio=window.devicePixelRatio||1;
  const CustomEvent=window.CustomEvent;
  const setTimeout=(fn,ms,...args)=>{let id;id=window.setTimeout(()=>{timeouts.delete(id);if(!destroyed)fn(...args)},ms);timeouts.add(id);return id};
  const clearTimeout=id=>{window.clearTimeout(id);timeouts.delete(id)};
  const setInterval=(fn,ms,...args)=>{const id=window.setInterval(()=>{if(!destroyed)fn(...args)},ms);intervals.add(id);return id};
  const clearInterval=id=>{window.clearInterval(id);intervals.delete(id)};
  const requestAnimationFrame=fn=>{let id;id=window.requestAnimationFrame(time=>{rafs.delete(id);if(!destroyed)fn(time)});rafs.add(id);return id};
  const cancelAnimationFrame=id=>{window.cancelAnimationFrame(id);rafs.delete(id)};
  const addEventListener=(type,handler,options)=>{window.addEventListener(type,handler,options);listeners.push([type,handler,options])};

const bearSoundStorageKey='bf-home-sound';
/* Upgraded createBearPoseEngine: replace the whole function of the same name in app.js with this. */
function createBearPoseEngine(svg) {
  "use strict";
  const $B = id => svg.querySelector('#' + id);
  const R=Math.PI/180,G=318,CX=[200,400],S=[1,-1],L1=24,L2=20,NAME=["Brown Bear","White Bear"];
  const COL=[{fur:"#9b6a47",st:"#6e4529",bel:"#c99a74",muz:"#e9cfb3",ear:"#d79a86",bow:"#8d7bd0"},
  {fur:"#fffaf3",st:"#dcc5b4",bel:"#fffdf9",muz:"#f6e6dc",ear:"#f7c3d1",bow:"#ef8fb1"}];
  const ACTS=[["hug","🤗","Hug"],["kiss","💋","Kiss"],["flykiss","😘","Flying Kiss"],["slap","🖐️","Playful Slap"],["hands","🫶","Hold Hands"],["feed","🍓","Feed"],["sleep","💤","Sleep"],["dance","💃","Dance"],["pet","🐾","Pet"],["tummy","🫳","Scratch Tummy"],["idle","🌸","Relax"]];
  const reduceMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??false;
  let active=true,rafId=0,snd=localStorage.getItem(bearSoundStorageKey)!=="off";

  function bear(i){
    const c=COL[i],st=`stroke="${c.st}" stroke-width="2.6"`;
    const arm=n=>`<path id="${n}${i}o" fill="none" stroke="${c.st}" stroke-width="24.5" stroke-linecap="round" stroke-linejoin="round"/><circle id="${n}${i}co" r="14.2" fill="${c.st}"/><path id="${n}${i}f" fill="none" stroke="${c.fur}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><g id="${n}${i}p"><circle r="12" fill="${c.fur}"/><ellipse cx="-3.5" cy="-3.5" rx="4.5" ry="3" fill="#fff" opacity=".25"/></g>`;
    const eye=k=>`<g id="e${i}${k}"><ellipse id="ee${i}${k}" rx="4.4" ry="5.4" fill="#3d2f2d"/><circle cx="1.4" cy="-1.8" r="1.9" fill="#fff"/><circle cx="-1.9" cy="2.1" r=".9" fill="#fff" opacity=".75"/><path id="ea${i}${k}" fill="none" stroke="#3d2f2d" stroke-width="2.4" stroke-linecap="round" opacity="0"/></g>`;
    return `<ellipse id="sh${i}" cy="${G+8}" rx="48" ry="8" fill="#9a6a86" opacity=".16"/>
<g id="s${i}"><g id="p${i}"><g id="bd${i}">
<g id="lg${i}l"><ellipse cx="-22" cy="-13" rx="19" ry="14" fill="${c.fur}" ${st}/><ellipse cx="-22" cy="-10" rx="9.5" ry="6.5" fill="${c.ear}" opacity=".85"/></g>
<g id="lg${i}r"><ellipse cx="22" cy="-13" rx="19" ry="14" fill="${c.fur}" ${st}/><ellipse cx="22" cy="-10" rx="9.5" ry="6.5" fill="${c.ear}" opacity=".85"/></g>
<ellipse cy="-50" rx="38" ry="40" fill="${c.fur}" ${st}/><ellipse cy="-46" rx="24" ry="28" fill="${c.bel}"/></g>
<g id="a${i}">${arm("o"+0)}${arm("i"+0)}</g>
<g id="h${i}"><g id="er${i}l"><circle cx="-43" cy="-76" r="15" fill="${c.fur}" ${st}/><circle cx="-43" cy="-76" r="8" fill="${c.ear}"/></g><g id="er${i}r"><circle cx="43" cy="-76" r="15" fill="${c.fur}" ${st}/><circle cx="43" cy="-76" r="8" fill="${c.ear}"/></g>
<ellipse cy="-38" rx="58" ry="48" fill="${c.fur}" ${st}/>
${i?`<g transform="translate(40 -88) rotate(20)"><path d="M0 0L-13-8 -13 8Z M0 0L13-8 13 8Z" fill="${c.bow}" stroke="#d3688f" stroke-width="1.5" stroke-linejoin="round"/><circle r="4" fill="#f9b6cd"/></g>`:""}
<ellipse id="bl${i}l" cx="-39" cy="-27" rx="10" ry="6" fill="#ff8fb0" opacity=".5"/><ellipse id="bl${i}r" cx="39" cy="-27" rx="10" ry="6" fill="#ff8fb0" opacity=".5"/>
<ellipse cy="-26" rx="15" ry="10.5" fill="${c.muz}"/><ellipse cy="-30" rx="5" ry="3.4" fill="#4a3433"/><circle cx="-1.3" cy="-31" r="1" fill="#fff" opacity=".7"/>
<path id="mo${i}" transform="translate(0 -22)" fill="#b2606d" stroke="#4a3433" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
${eye("l")}${eye("r")}</g></g></g>`;
  }

  svg.innerHTML=`<defs><radialGradient id="gl" cx=".5" cy=".4"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="300" cy="150" rx="280" ry="150" fill="url(#gl)"/>
<path d="M0 270Q110 215 230 262T440 250T600 240V380H0Z" fill="#f6d6e4" opacity=".75"/><path d="M0 300Q140 255 300 290T600 280V380H0Z" fill="#eadcf7" opacity=".8"/>
<g fill="#fff" opacity=".7"><ellipse cx="150" cy="160" rx="38" ry="12"/><ellipse cx="176" cy="152" rx="24" ry="12"/><ellipse cx="450" cy="172" rx="42" ry="12"/><ellipse cx="478" cy="163" rx="24" ry="11"/></g>
<ellipse cx="300" cy="${G+10}" rx="280" ry="36" fill="#fdeedd" stroke="#e9c6da" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round"/>
<ellipse id="pil" cx="300" cy="${G-14}" rx="112" ry="22" fill="#f7d3e2" stroke="#e5b2c9" stroke-width="2.5" opacity="0"/>
<g id="bears">${bear(0)}${bear(1)}<g id="tummyBackArm" opacity="0" pointer-events="none"><path id="tummyBackArmOutline" fill="none" stroke="#6e4529" stroke-width="27" stroke-linecap="round" stroke-linejoin="round"/><path id="tummyBackArmFill" fill="none" stroke="#9b6a47" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/><g id="tummyBackPaw"><circle r="12.5" fill="#9b6a47" stroke="#6e4529" stroke-width="2.2"/><ellipse cx="-7" cy="-8" rx="4" ry="3.2" fill="#9b6a47" stroke="#6e4529" stroke-width="1.3"/><ellipse cx="0" cy="-10" rx="4" ry="3.2" fill="#9b6a47" stroke="#6e4529" stroke-width="1.3"/><ellipse cx="7" cy="-8" rx="4" ry="3.2" fill="#9b6a47" stroke="#6e4529" stroke-width="1.3"/><path d="M-4 2Q0 5 4 2" fill="none" stroke="#d7a58a" stroke-width="1.4" stroke-linecap="round"/></g></g></g><g font-family="Nunito,Segoe UI,sans-serif" font-size="10" font-weight="800" fill="#8b6a7e" text-anchor="middle"></g>
<rect id="blk" x="0" y="0" width="600" height="400" fill="#5b4a9a" fill-opacity=".24" opacity="0" pointer-events="none"/>
<g id="berry" opacity="0"><path d="M0 -10C-12 -11 -14 3 -8 11 -4 17 4 17 8 11 14 3 12 -11 0 -10Z" fill="#f0455f"/><g fill="#ffe7a8"><circle cx="-4" cy="0" r="1.2"/><circle cx="4" cy="-2" r="1.2"/><circle cx="0" cy="6" r="1.2"/><circle cx="5" cy="7" r="1.2"/><circle cx="-6" cy="8" r="1.2"/></g><path d="M0-10L-7-14 -3-9 0-15 3-9 7-14Z" fill="#6fbf73"/></g>
<g id="fx"></g>`;

  const K=["x","y","rot","hr","hx","hy","eye","eh","mouth","pk","blush","i1","i2","o1","o2","sq","ear"];
  const P=[0,1].map(()=>({x:0,y:0,rot:0,hr:0,hx:0,hy:0,eye:1,eh:1,mouth:0,pk:0,blush:.3,i1:-12,i2:-6,o1:12,o2:6,sq:0,ear:0}));
  const ptL=(b,lx,ly)=>{const p=P[b],r=p.rot*R,vy=ly+50;return[CX[b]+S[b]*(p.x+lx*Math.cos(r)-vy*Math.sin(r)),G+p.y+lx*Math.sin(r)+vy*Math.cos(r)-50]};
  const ptH=(b,hx,hy)=>{const p=P[b],r=p.hr*R;return ptL(b,p.hx+hx*Math.cos(r)-hy*Math.sin(r),-70+p.hy+hx*Math.sin(r)+hy*Math.cos(r))};
  const toL=(b,wx,wy)=>{const p=P[b],r=p.rot*R,x1=S[b]*(wx-CX[b])-p.x,y1=wy-G-p.y+50;return[x1*Math.cos(r)+y1*Math.sin(r),-x1*Math.sin(r)+y1*Math.cos(r)-50]};
  function ik(tx,ty){
    const sx=28,sy=-76;let dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy);const m=L1+L2-.5;
    if(d>m){dx*=m/d;dy*=m/d;d=m}d=Math.max(d,10);
    const tb=Math.atan2(-dx,dy),al=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));let best;
    for(const g of[1,-1]){const a=tb+g*al,ex=sx-L1*Math.sin(a),ey=sy+L1*Math.cos(a);if(!best||ey>best.ey)best={a,ex,ey}}
    const tt=Math.atan2(-(sx+dx-best.ex),sy+dy-best.ey);let a2=(tt-best.a)/R;a2=((a2+540)%360)-180;return[best.a/R,a2]
  }
  const fk=(s,a1,a2)=>{const t1=a1*R,t2=(a1+a2)*R,ex=s-L1*Math.sin(t1),ey=-76+L1*Math.cos(t1);return[[s,-76],[ex,ey],[ex-L2*Math.sin(t2),ey+L2*Math.cos(t2)],t2/R]};

  const V=[{},{}],EXP={eye:1,eh:1,mouth:1,pk:1,blush:1};let tummyLvl=1,tummyAt=0,cur="idle",actor=0,t0=performance.now(),sleepF=0,berryS=1,rate=7;
  const idle=(b,t)=>{const w=Math.sin(t*1.2+b*1.7),curious=Math.max(0,Math.sin(t*.19+b*2.4)),stretch=Math.max(0,Math.sin(t*.075+b*3.1));return{x:Math.sin(t*.32+b*1.8)*1.4,y:-stretch*1.2,rot:w*1.35+curious*(b?-.8:.8),hr:Math.sin(t*.8+b*2.3)*3.2+2+curious*(b?-2.2:2.2),hx:0,hy:0,eye:1,eh:1,mouth:0,pk:0,blush:.3,i1:-12+w*2-stretch*3,i2:-6,o1:12-w*2+stretch*3,o2:6,sq:0,ear:Math.pow(Math.max(0,Math.sin(t*.9+b*2.6)),9)*7}};
  const BITES=[1.4,2.8,4.0];
  const ACT={
    idle:()=>({}),
    flykiss:(t,b)=>{const other=1-actor,phase=t<.72?0:t<1.42?1:2,flutter=Math.sin(t*8);if(b===actor){const mouth=ptH(actor,0,-28),target=ptH(other,0,-34),point=phase===0?mouth:target;return{x:58+Math.sin(t*2)*1.2,rot:2,hr:phase===0?8:phase===1?19:5,hx:phase===1?12:0,eye:1,mouth:.25,blush:.82,ik:phase<2?[point[0],point[1]+(phase===1?flutter*1.6:0)]:null,i1:-28,i2:-12,o1:phase===1?30:18,o2:phase===1?20:10}}return{x:58,y:Math.abs(flutter)*.8,rot:Math.sin(t*5)*.8,hr:t>1.05?-5:0,eye:t>1.05?.12:1,mouth:.48,blush:.98,i1:-24,i2:-10,o1:24,o2:10}},
    slap:(t,b)=>{const other=1-actor,impact=t>.82&&t<1.18,cheek=ptH(other,other===0?-32:32,-34),recoil=t>.86&&t<1.9;if(b===actor){return{x:68,rot:3,hr:t<.55?8:impact?24:8,hx:impact?16:0,eye:1,mouth:.22,blush:.6,ik:t>.32&&t<1.22?[cheek[0],cheek[1]+(impact?Math.sin(t*34)*1.5:0)]:null,i1:-28,i2:-12,o1:impact?34:18,o2:impact?22:10}}const kick=recoil?Math.sin((t-.86)*17):0;return{x:66+kick*5,y:Math.abs(kick)*1.2,rot:recoil?-kick*2.8:0,hr:recoil?-12-kick*3:0,eye:recoil?.12:1,mouth:recoil?.7:.15,blush:recoil?1:.45,i1:-24,i2:-10,o1:24,o2:10}},
    tummy:(t,b)=>{
      /* tummyLvl 1..3 grows each time you keep scratching: faster giggles, bigger wiggles */
      const L=tummyLvl,sw=Math.sin(t*(9+L*3)),rub=t>.45&&t<END.tummy-.45;
      if(b===actor)return{x:75+Math.sin(t*2)*1.2,rot:3,hr:rub?22+sw*2:9,hx:rub?20:6,eye:1,mouth:.45,blush:.75,ear:rub?4:0,i1:-16,i2:-8,o1:18,o2:8};
      const g=rub?Math.min(1,(t-.45)/.5):0,f=11+L*2,flap=Math.abs(Math.sin(t*f));
      return{x:75+g*Math.sin(t*(7+L))*1.5,y:-g*flap*(2+L*1.2),rot:g*Math.sin(t*f)*(2.4+L*1.1),hr:-8+g*Math.sin(t*f+1)*(3+L*1.4),eye:rub?.18:1,eh:1,mouth:rub?.5+.45*Math.abs(Math.sin(t*(13+L*2))):.3,blush:1,
        sq:g*Math.sin(t*(22+L*3))*(.6+.2*L),ear:g*Math.sin(t*(14+L*2))*(6+L*2.5),
        i1:-24-g*flap*(10+L*4),i2:-10-g*flap*6,o1:24+g*flap*(10+L*4),o2:10+g*flap*6}
    },
    hug:(t,b)=>{const o=1-b,sq=t>1.4?Math.sin((t-1.4)*3.2):0,r={x:64+2*sq,y:-2.5*Math.abs(sq),rot:2,hr:12,hx:-18,hy:2*sq,eye:t>.9?.1:1,mouth:.1,blush:.9,o1:30,o2:20};if(t<.6)Object.assign(r,{i1:-82,i2:-8,o1:82,o2:8,hr:3,hx:0,x:36,y:-5*Math.abs(Math.sin(t*5))});else r.ik=ptL(o,-6,-58);return r},
    kiss:(t,b)=>{const a=actor,o=1-a,go=t>.8&&t<2.6;if(b===a)return{x:go?68:50,rot:go?6:0,hr:go?22:5,hx:go?32:0,eye:go?.1:1,mouth:go?.3:.1,pk:go?1:0,blush:.7,ik:t>.4?ptL(o,-14,-66):null,i1:-40,i2:-10};const sh=t>1.2&&t<2.9;return{x:50,hr:sh?-4:6,hy:sh?-3:0,eye:t>1.25&&t<3?.1:1,mouth:.12,blush:t>1.2?1:.5,ik:sh?ptH(b,34,-24):null,i1:-40,i2:-10}},
    hands:t=>({x:38,hr:8,eye:1,mouth:.2,blush:.7,ik:[300,G-52+Math.sin(t*2.2)*3.5],i1:-20,y:-1.5*Math.abs(Math.sin(t*2.2))}),
    sleep:(t,b)=>({x:12,y:12,rot:72,hr:-48,hx:20,hy:2,eye:0,eh:0,mouth:0,blush:.45,i1:-32,i2:-12,o1:30,o2:12}),
    dance:(t,b)=>{const ph=t*1.7*Math.PI,hop=Math.abs(Math.sin(ph)),sw=Math.sin(ph/2),sg=b?-1:1;return{x:38+12*sw*sg,y:-16*hop,rot:sg*sw*7,hr:sg*Math.sin(ph/2+.8)*10,hy:2*hop,eye:.1,mouth:.35+.4*hop,blush:.9,ik:[300+sw*10,G-98+Math.sin(ph*2)*5],o1:105+35*Math.sin(ph*2+b*Math.PI),o2:10}},
    pet:(t,b)=>{const r=1-actor,sw=Math.sin(t*5);return b===actor?{x:64,hr:-5,hx:-8,mouth:.2,blush:.6,ik:(h=>[h[0]+sw*4,h[1]+Math.sin(t*5+1.2)*2.5])(ptH(r,-34,-50))}:{x:64,hr:14+sw*2,hx:16,hy:Math.abs(sw)*1.8,eye:.1,blush:1,mouth:.25}},
    feed:(t,b)=>{const a=actor,r=1-a,open=(t>1.1&&t<1.7)||(t>2.65&&t<3)||(t>3.85&&t<4.2),chew=(t>1.7&&t<2.65)||(t>3&&t<3.85)||(t>4.2&&t<5.2);if(b===a){const k=t<.9?40:open?14:chew?34:t<5.2?34:44,M=ptH(r,0,-22);return{x:64,hr:-6,hx:-16,mouth:.25,blush:.6,ik:[M[0]-S[a]*k,M[1]+2]}}return{x:64,hr:open?12:chew?7:4,hx:open?8:chew?3:0,mouth:open?.9:chew?.2+.2*Math.abs(Math.sin(t*14)):t>5.2?.05:0,eye:chew?.12:1,blush:chew||t>5.2?.9:.5}},
    peekaboo:(t,b)=>{const reveal=t<.8?0:t<1.25?1:Math.max(0,1-(t-1.25)*.45);if(b===actor)return{x:42,y:-2,rot:-2,hr:10+reveal*7,eye:t<1.1?0:1,mouth:.18+reveal*.28,blush:.75,o1:58-reveal*20,o2:20,i1:-34,i2:-12};return{x:38,y:-Math.max(0,Math.sin(t*3))*2,hr:-5,eye:t<.8?.12:1,mouth:.22,blush:.85}},
    bump:(t,b)=>{const hit=t>.72&&t<1.05,pulse=hit?Math.sin((t-.72)*Math.PI/.33):0;return{x:42+(hit?pulse*3:0),y:hit?-Math.abs(pulse)*3:0,rot:b===actor?2+pulse*3:-2-pulse*3,hr:b===actor?8-pulse*5:-8+pulse*5,eye:hit?.2:1,mouth:.22,blush:.8}}
  };
  const END={kiss:3.8,flykiss:3.6,slap:2.8,feed:6.8,tummy:4.6,peekaboo:3.1,bump:2.4};
  /* ---- plush upgrade: squish + ear secondary motion layered over the original poses ---- */
  const add=(k,f)=>{const o=ACT[k];ACT[k]=(t,b)=>Object.assign(o(t,b),f(t,b))};
  const sgn=b=>b?-1:1,pulse=(t,a,w)=>t>a&&t<a+w?Math.sin((t-a)/w*Math.PI):0;
  add("hug",(t,b)=>{const sq=t>1.3?Math.sin((t-1.3)*3.4):0;return{sq:sq*.9+Math.min(1,t/1.2)*.35,ear:t>.9?-3+sq*4:6,blush:.95,rot:2+Math.sin(t*1.6)*sgn(b)}});
  add("kiss",(t,b)=>b===actor?{ear:-3}:{sq:pulse(t,1.25,.7)*1.2,ear:9*pulse(t,1.25,1.4)});
  add("flykiss",(t,b)=>b===actor?{ear:4}:{sq:pulse(t,1.35,.6)*1.1,ear:2+10*pulse(t,1.3,1.2)});
  add("slap",(t,b)=>b===actor?{}:{sq:t>.86&&t<1.9?Math.sin((t-.86)*17)*1.2:0,ear:t>.86&&t<2.4?Math.sin((t-.86)*30)*9*Math.exp(-(t-.86)*1.6):0});
  add("hands",(t,b)=>({rot:sgn(b)*Math.sin(t*1.5)*2,sq:Math.sin(t*2.2)*.3,ear:3+Math.sin(t*2.2+b)*3}));
  add("dance",(t,b)=>{const ph=t*1.7*Math.PI,hop=Math.abs(Math.sin(ph));return{sq:(.5-hop)*1.3,ear:Math.sin(ph*2+b)*9}});
  add("pet",(t,b)=>b===actor?{}:{sq:Math.abs(Math.sin(t*5))*.6,ear:-4+Math.sin(t*5)*5});
  add("feed",(t,b)=>{const chew=(t>1.7&&t<2.65)||(t>3&&t<3.85)||(t>4.2&&t<5.2);return b===actor?{}:{sq:chew?Math.abs(Math.sin(t*14))*.9:0,ear:chew?Math.sin(t*14)*4:0}});
  add("sleep",(t,b)=>({sq:Math.sin(t*1.5)*.35,ear:-7}));

  let ac,master,nbuf;
  function A(){
    if(!ac){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;ac=new C();master=ac.createGain();master.gain.value=(snd ? .9 : 0);master.connect(ac.destination);
      const n=ac.sampleRate*1.8|0,ib=ac.createBuffer(2,n,ac.sampleRate);for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}
      const cv=ac.createConvolver(),wg=ac.createGain();cv.buffer=ib;wg.gain.value=.3;master.connect(wg);wg.connect(cv);cv.connect(ac.destination);
      nbuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
    if(ac.state==="suspended")ac.resume();return ac
  }
  function tone(f,d,v=.05,ty="sine",dl=0,gl=0){if(!snd)return;const c=A();if(!c)return;const t=c.currentTime+dl,o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(gl)o.frequency.exponentialRampToValueAtTime(gl,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+Math.min(.03,d/3));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.05)}
  function nz(d,v,f,ty="bandpass",dl=0,att=.01){if(!snd)return;const c=A();if(!c)return;const t=c.currentTime+dl,s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=nbuf;fl.type=ty;fl.frequency.value=f;fl.Q.value=.9;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(master);s.start(t,Math.random());s.stop(t+d+.05)}
  const kiss=()=>{tone(280,.12,.04,"sine",0,400);nz(.025,.16,3400,"bandpass",.1);tone(1250,.08,.09,"sine",.1,380);nz(.05,.08,1300,"lowpass",.11);tone(1976,.4,.022,"sine",.2);tone(2637,.3,.012,"sine",.26)};
  const crunch=()=>{for(let i=0;i<4;i++)nz(.022,.2-.03*i,2200+Math.random()*2600,"bandpass",i*.04);tone(130,.09,.08,"sine",0,70)};
  const chew=n=>{for(let i=0;i<n;i++){const d=i*.26;nz(.13,.07,520+Math.random()*200,"lowpass",d);tone(230,.1,.03,"sine",d,150)}};
  const yum=()=>{tone(392,.14,.05,"triangle",0,350);tone(523,.22,.045,"triangle",.14,600);tone(659,.4,.035,"sine",.3)};
  const box=(f,d=0,v=.03)=>{tone(f,1.5,v,"sine",d);tone(f*2,.9,v*.3,"sine",d);tone(f*3,.5,v*.12,"sine",d)};
  const breath=()=>{nz(1.6,.05,620,"bandpass",0,1.2);nz(1.7,.04,400,"bandpass",1.7,.3);tone(98,3.2,.014)};
  const LULL=[[784,659,587,659],[784,784,784,0],[659,659,659,0],[784,988,988,0]];
  const SC=[523,587,659,784,880],MEL=[0,2,4,2,3,2,1,-1,0,2,4,3,4,2,1,-1],BASS=[131,196,220,175];
  const pluck=f=>{tone(f,.22,.05,"triangle");tone(f*2,.14,.015,"sine")};
  const beat=n=>{const bt=n>>1;if(n%2===0){tone(125,.2,.14,"sine",0,42);if(bt%2)nz(.1,.09,1900);tone(BASS[(bt>>1)%4],.5,.05,"triangle")}else nz(.04,.03,7500,"highpass");const m=MEL[n%16];if(m>=0)pluck(SC[m])};
  const pat=n=>{tone(230,.16,.06,"sine",0,150);tone(880,.6,.012,"sine",.02);if(n%4===0)tone(330,.7,.03,"triangle",.05,392)};
  let tm=[],lp=[];const later=(f,ms)=>{const id=setTimeout(f,ms);tm.push(id);return id},loop=(f,ms)=>{f(0);let n=0;lp.push(setInterval(()=>f(++n),ms))};
  const mid=()=>[300,G-90];

  function flyFx(sym,x1,y1,x2,y2,col="#f28db5",sz=22){
    const e=document.createElementNS("http://www.w3.org/2000/svg","text");e.textContent=sym;e.setAttribute("x",x1);e.setAttribute("y",y1);e.setAttribute("fill",col);e.setAttribute("font-size",sz);e.setAttribute("text-anchor","middle");e.style.transformBox="fill-box";e.style.transformOrigin="center";$B("fx").appendChild(e);
    if(reduceMotion){e.setAttribute("x",x2);e.setAttribute("y",y2);e.setAttribute("opacity",".8");return}
    const dx=x2-x1,dy=y2-y1;e.animate([{transform:"translate(0,0) scale(.55)",opacity:0},{opacity:1,offset:.18},{transform:`translate(${dx}px,${dy}px) scale(1.25)`,opacity:0}],{duration:1250,easing:"cubic-bezier(.2,.7,.25,1)"}).onfinish=()=>e.remove()
  }
  function fx(sym,x,y,col="#f4789f",sz=22){
    const e=document.createElementNS("http://www.w3.org/2000/svg","text");e.textContent=sym;e.setAttribute("x",x);e.setAttribute("y",y);e.setAttribute("fill",col);e.setAttribute("font-size",sz);e.setAttribute("text-anchor","middle");e.style.transformBox="fill-box";e.style.transformOrigin="center";$B("fx").appendChild(e);
    if(reduceMotion){e.setAttribute("opacity",".75");return}
    const dx=(Math.random()-.5)*50;e.animate([{transform:"translate(0,0) scale(.4)",opacity:0},{opacity:1,offset:.25},{transform:`translate(${dx}px,-70px) scale(1.15)`,opacity:0}],{duration:1900,easing:"ease-out"}).onfinish=()=>e.remove()
  }
  const burst=(x,y,n=5,sym="♥")=>{for(let i=0;i<n;i++)later(()=>fx(sym,x+(Math.random()-.5)*50,y,i%2?"#f4789f":"#d79ae8",16+Math.random()*14),i*130)};

  const TXT=(a,by)=>{const o=1-by,n=NAME[by],m=NAME[o];return{hug:`${n} hugs ${m} 🤗`,kiss:`${n} gives ${m} a sweet kiss 💋`,hands:`${n} and ${m} hold paws 🫶`,feed:`${n} shares a strawberry with ${m} 🍓`,sleep:`${n} and ${m} drift off peacefully 💤`,dance:`${n} and ${m} are dancing together 💃`,pet:`${n} gently pets ${m} 🐾`,tummy:`${n} gives ${m} gentle tummy tickles! 🫳`,flykiss:`${n} blows ${m} a flying kiss! 💋`,slap:`${n} gives ${m} a playful little slap! 🖐️`,idle:`${n} and ${m} are relaxing 🌸`}[a]};
  function start(a,by){
    tm.forEach(clearTimeout);lp.forEach(clearInterval);tm=[];lp=[];$B("fx").innerHTML="";
    cur=a;actor=by;t0=performance.now();
    if(a==="tummy"){const n=performance.now();tummyLvl=n-tummyAt<9000?Math.min(3,tummyLvl+1):1;tummyAt=n;END.tummy=4.2+.5*tummyLvl}rate=a==="dance"?13:a==="sleep"?4.5:7;berryS=1;
    const bears=$B("bears"),backArm=$B("tummyBackArm");
    if(a==="tummy"){bears.appendChild($B("s"+by));bears.appendChild(backArm);bears.appendChild($B("s"+(1-by)));}
    else{backArm.setAttribute("opacity","0");const ord=a==="flykiss"||a==="slap"||a==="feed"||a==="pet"||a==="kiss"?[1-by,by]:[0,1];ord.forEach(i=>bears.appendChild($B("s"+i)));}
    const scene=svg.closest(".couple-bears-scene");if(scene)scene.dataset.action=a;
    if(a==="hug"){tone(262,1.4,.04);tone(330,1.4,.035,"sine",.06);tone(392,1.5,.03,"sine",.12);later(()=>{tone(196,1,.06,"triangle");tone(523,.9,.02,"sine",.1);burst(300,G-170,5)},1250)}
    if(a==="kiss"){later(()=>{kiss();burst(300,G-170,6)},1350);later(()=>{nz(.03,.1,2500);tone(900,.06,.05,"sine",0,500)},2600)}
    if(a==="flykiss"){later(()=>{tone(740,.16,.04,"sine",0,980);tone(988,.22,.035,"sine",.12,1318);const from=ptH(by,0,-28),to=ptH(1-by,0,-34);flyFx("♡",from[0],from[1],to[0],to[1],"#ed79a5",27);later(()=>flyFx("💋",from[0],from[1]-4,to[0],to[1]-12,"#e98bad",20),180)},850)}
    if(a==="slap"){later(()=>{tone(210,.11,.07,"triangle",0,115);nz(.045,.08,1450,"bandpass",.015);const cheek=ptH(1-by,1-by===0?-32:32,-34);burst(cheek[0],cheek[1],5,"✦")},920)}
    if(a==="hands"){later(()=>{[1047,1319,1568,2093,1568].forEach((f,i)=>tone(f,.55,.025,"sine",i*.08));burst(300,G-70,5,"✦")},800)}
    if(a==="feed"){BITES.forEach((b,index)=>later(()=>{crunch();later(()=>chew(3),220);if(index===2)later(yum,500)},b*1000));later(()=>burst(CX[1-by]+S[1-by]*30,G-190,4),5600)}
    if(a==="sleep"){loop(n=>{breath();LULL[n%4].forEach((f,k)=>f&&box(f,k*.8));if(n%2===0)later(()=>fx("z",300+(Math.random()-.5)*60,G-100,"#9b86d6",20+Math.random()*10),500)},3400)}
    if(a==="dance"){loop(n=>{beat(n);if(n%4===0)fx("♪",300+(Math.random()-.5)*120,G-170,"#b08be0",22)},294)}
    if(a==="pet"){tone(300,.5,.03,"triangle");loop(n=>{pat(n);if(n%2==0){const h=ptH(1-by,0,-80);fx("♥",h[0],h[1]-20,"#f4789f",16)}},628)}
    if(a==="tummy"){tone(660,.18,.035,"sine",0,820);tone(784,.2,.03,"sine",.22,988);later(()=>fx("hehe!",CX[1-by],G-165,"#e0669a",15),650);if(tummyLvl>1)later(()=>fx("hihi~",CX[1-by]+(by?30:-30),G-185,"#e0669a",14),1200);if(tummyLvl>2)later(()=>fx("so happy! ♡",CX[1-by],G-200,"#e0669a",14),1900);loop(n=>{pat(n);if(n>1&&n%2)tone(820+Math.random()*420,.09,.03,"sine",0,1250);if(n%2===0){const side=by===0?1:-1,hx=CX[1-by]+side*(63+Math.sin(n*1.8)*2),hy=G-38+Math.sin(n*2.4)*5;fx(n%4===0?"♡":"✦",hx,hy-10,"#f28db5",14+Math.random()*5);if(tummyLvl>1)fx("♥",hx+side*10,hy-26,"#f4789f",12+Math.random()*8)}},420-tummyLvl*50)}
    if(a==="idle"){tone(392,.7,.025,"sine",0,330)}
    if(END[a])later(()=>{if(cur===a)start("idle",by)},END[a]*1000)
  }

  const blink=[{n:1.5,u:0},{n:3,u:0}];let last=performance.now();
  const setT=(id,v)=>$B(id).setAttribute("transform",v);
  function drawArm(b,n,s,a1,a2){
    const f=fk(s,a1,a2),d=`M${f[0][0]} ${f[0][1]}Q${f[1][0]} ${f[1][1]} ${f[2][0]} ${f[2][1]}`,id=n+0+b;
    $B(id+"o").setAttribute("d",d);$B(id+"f").setAttribute("d",d);$B(id+"co").setAttribute("cx",f[2][0]);$B(id+"co").setAttribute("cy",f[2][1]);setT(id+"p",`translate(${f[2][0]} ${f[2][1]}) rotate(${f[3]})`);return f
  }
  function frame(now){
    if(!active||!svg.isConnected)return;
    const dt=Math.min(.05,(now-last)/1e3);last=now;const t=(now-t0)/1e3,ts=now/1e3,k=1-Math.exp(-dt*rate);
    sleepF+=((cur==="sleep"?1:0)-sleepF)*(1-Math.exp(-dt*2.5));
    const tg=[0,1].map(b=>{const o=Object.assign(idle(b,ts),ACT[cur](t,b));if(o.ik){const[a1,a2]=ik(...toL(b,o.ik[0],o.ik[1]));o.i1=a1;o.i2=a2}return o});
    for(let b=0;b<2;b++){
      const p=P[b],g=tg[b];
      for(const key of K){
        if(EXP[key])p[key]+=(g[key]-p[key])*(1-Math.exp(-dt*(key==="eye"?16:9)));
        else{const arm=key[0]==="i"||key[0]==="o",w=(arm?1.25:1)*rate*1.15,z=arm?.72:.78,vv=V[b];vv[key]=(vv[key]||0)+((g[key]-p[key])*w*w-2*z*w*(vv[key]||0))*dt;p[key]+=vv[key]*dt}
      }
      const br=reduceMotion?0:Math.sin(ts*(sleepF>.5?1.5:2.1)+b),bs=1+br*(.012+.02*sleepF),bl=blink[b];
      if(!reduceMotion&&ts>bl.n){bl.u=ts;bl.n=ts+2.5+Math.random()*3}
      const bf=!reduceMotion&&ts-bl.u<.14?.1:1;
      setT("s"+b,`translate(${CX[b]} ${G+p.y}) scale(${S[b]} 1)`);
      setT("p"+b,`translate(${p.x} 0) rotate(${p.rot} 0 -50)`);
      {const kick=cur==="tummy"&&b!==actor&&!reduceMotion?Math.min(1,Math.max(0,t-.45)*2):0,mv=reduceMotion?0:Math.max(kick,cur==="dance"?1:Math.min(1,Math.abs(V[b].x||0)/22)),ph=ts*(cur==="dance"?1.7*Math.PI*2:kick?17+tummyLvl*2:13),ll=Math.max(0,Math.sin(ph))*mv,lr=Math.max(0,-Math.sin(ph))*mv,sp=sleepF*14;
        setT("lg"+b+"l",`translate(0 ${-ll*(7+kick*5)}) rotate(${-ll*(10+kick*14)-sp} -22 -22)`);
        setT("lg"+b+"r",`translate(0 ${-lr*(7+kick*5)}) rotate(${lr*(10+kick*14)+sp} 22 -22)`)
      }
      setT("bd"+b,`translate(0 -10) scale(${1+p.sq*.025} ${bs-p.sq*.03}) translate(0 10)`);
      setT("h"+b,`translate(${p.hx} ${-70+p.hy-br*(.8+sleepF)}) rotate(${p.hr}) scale(${1+p.sq*.035} ${1-p.sq*.045})`);
      {const lag=Math.max(-16,Math.min(16,-(V[b].hr||0)*.07));setT("er"+b+"l",`rotate(${lag-p.ear} -40 -64)`);setT("er"+b+"r",`rotate(${lag+p.ear} 40 -64)`)}
      drawArm(b,"o",-28,p.o1,p.o2);drawArm(b,"i",28,p.i1,p.i2);
      const cl=p.eye<.25,op=Math.max(.06,p.eye*bf);
      for(const e of["l","r"]){
        const x=e==="l"?-26:26;setT("e"+b+e,`translate(${x} -36)`);
        const ee=$B("ee"+b+e);ee.setAttribute("ry",5.4*op);ee.style.opacity=cl?0:1;
        const ea=$B("ea"+b+e);ea.setAttribute("d",`M-5.5 ${p.eh>.5?2:-1}Q0 ${p.eh>.5?-5:6} 5.5 ${p.eh>.5?2:-1}`);ea.style.opacity=cl?1:0;
        $B("bl"+b+e).style.opacity=Math.min(1,p.blush)
      }
      const m=Math.max(0,p.mouth),w=6.5-3.5*p.pk,tp=6*(1-m*.9),bt=6+16*m;
      $B("mo"+b).setAttribute("d",`M${-w} 0Q0 ${tp} ${w} 0Q0 ${bt} ${-w} 0Z`);
      const sh=$B("sh"+b);sh.setAttribute("cx",CX[b]+S[b]*p.x);sh.setAttribute("rx",48-p.y*.7);sh.setAttribute("opacity",.16*(1-sleepF)*(1+p.y/60))
    }
    const backArm=$B("tummyBackArm");
    if(cur==="tummy"){
      const side=actor===0?1:-1,target=1-actor,startX=CX[actor]+S[actor]*(P[actor].x+28),startY=G+P[actor].y-76,endX=startX+side*42,endY=startY+8+Math.sin(t*(9+tummyLvl*3))*(3.2+tummyLvl*.8),controlX=(startX+endX)/2,controlY=startY+5+Math.sin(t*4)*2,path=`M${startX} ${startY} Q${controlX} ${controlY} ${endX} ${endY}`,c=COL[actor];
      $B("tummyBackArmOutline").setAttribute("d",path);$B("tummyBackArmFill").setAttribute("d",path);$B("tummyBackArmOutline").setAttribute("stroke",c.st);$B("tummyBackArmFill").setAttribute("stroke",c.fur);
      $B("tummyBackPaw").setAttribute("transform",`translate(${endX} ${endY}) rotate(${side*8+Math.sin(t*(9+tummyLvl*3))*7})`);
      backArm.setAttribute("opacity",t>.35&&t<END.tummy-.35?"1":"0")
    }else backArm.setAttribute("opacity","0");
    $B("pil").setAttribute("opacity",sleepF);$B("blk").setAttribute("opacity",sleepF);
    const bs=$B("berry");
    if(cur==="feed"&&t<5.3){
      const f=fk(28,P[actor].i1,P[actor].i2),h=f[2],rad=f[3]*R,wp=ptL(actor,h[0]-Math.sin(rad)*8,h[1]+Math.cos(rad)*8),sc=t<1.7?1:t<3?.66:t<4.2?.36:0;
      berryS+=(sc-berryS)*(1-Math.exp(-dt*14));bs.setAttribute("transform",`translate(${wp[0]} ${wp[1]}) scale(${berryS*.9}) rotate(${-S[actor]*20})`);bs.setAttribute("opacity",berryS>.05?1:0)
    }else bs.setAttribute("opacity",0);
    rafId=requestAnimationFrame(frame)
  }
  rafId=requestAnimationFrame(frame);

  function setSound(enabled){
    snd=!!enabled;
    if(master&&ac&&ac.state!=="closed"){
      try{master.gain.setTargetAtTime(snd?.9:0,ac.currentTime,.04)}catch{}
    }
  }
  function destroy(){
    if(!active)return;
    active=false;cancelAnimationFrame(rafId);
    tm.forEach(clearTimeout);lp.forEach(clearInterval);tm=[];lp=[];
    if(ac&&ac.state!=="closed")void ac.close().catch(()=>{});
  }
  return{
    play(action,by){if(active&&ACT[action])start(action,by===1?1:0)},
    setSound,
    destroy
  };
}

const $=s=>root.querySelector(s),$=s=>[...root.querySelectorAll(s)];
const st={room:'living',time:'auto',wx:'clear',snd:false,it:{plant:1,lamp:1,pics:1},plots:[0,0,0,0],rare:[0,0,0,0],petals:0,season:'auto',gift:null,bonus:0,tasks:{water:0,feed:0,hug:0,kiss:0,bunny:0}};
const COLS=['#ff9ec0','#c9a6ff','#ffd36b','#8fd3ff'];
const SEQ=['spring','summer','autumn','winter'],SN={spring:'🌸 Spring',summer:'☀️ Summer',autumn:'🍂 Autumn',winter:'⛄ Winter'};let sOff=0;
const baseSeason=()=>{const m=new Date().getMonth();return m>=2&&m<=4?0:m>=5&&m<=7?1:m>=8&&m<=10?2:3};
const seasonOf=()=>SEQ[(baseSeason()+sOff)%4];
const ST={spring:'rgba(255,170,200,.07)',summer:'rgba(255,225,110,.06)',autumn:'rgba(255,140,60,.09)',winter:'rgba(150,190,255,.10)'};
function sTint(t){const c=ST[seasonOf()];return `linear-gradient(${c},${c}),${t}`}
const SE={spring:['#bfe3b4','#a9d99f','#9fd493'],summer:['#a9dca0','#8fd081','#82c874'],autumn:['#ecd6a4','#e0bc7c','#d6ae6c'],winter:['#f4f8fc','#e3ecf5','#d8e4f0']};
const GC={rose:'#ff7aa2',berries:'#b05fd6',note:'#ffd36b'},GE={rose:'🌹',berries:'🍓',note:'💌'};
const TK=[['water','💧 Water 3 flowers',3],['feed','🍓 Share a strawberry',1],['hug','🤗 Share a hug',1],['kiss','💋 Send a kiss',1],['bunny','🐰 Cuddle the bunny',1]];
const giftSvg=()=>st.gift?`<g id="gift" style="cursor:pointer" transform="translate(300 372)"><rect x="-22" y="-34" width="44" height="40" fill="transparent"/><g class="gbob"><rect x="-15" y="-24" width="30" height="24" rx="4" fill="${GC[st.gift]}" stroke="#fff" stroke-width="2"/><rect x="-3" y="-24" width="6" height="24" fill="#fff" opacity=".8"/><path d="M0-24c-9-10-15-2-8 2zM0-24c9-10 15-2 8 2z" fill="#fff"/><text y="-7" font-size="11" text-anchor="middle">${GE[st.gift]}</text></g></g>`:'';
const TIME_SEQ=['morning','afternoon','evening','night'];const clockPhase=()=>{const h=new Date().getHours();return h>=6&&h<11?'morning':h>=11&&h<17?'afternoon':h>=17&&h<20?'evening':'night'};let timeCycle=clockPhase();const phase=()=>st.time!=='auto'?st.time:timeCycle;
const SKY={morning:['#ffd0b5','#fff0e2'],afternoon:['#8fd0f2','#e4f5ff'],evening:['#f08a73','#fcd2b0'],night:['#171a45','#383d7a']};
const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.substr(i,2),16)*(1-t)+parseInt(b.substr(i,2),16)*t).toString(16).padStart(2,'0')).join('');
const stars=(x,y,w,h,n)=>'<g id="stars" style="opacity:0;transition:opacity 1s" fill="#fff">'+Array.from({length:n},(_,i)=>`<circle cx="${x+(i*47+13)%w}" cy="${y+(i*31+7)%h}" r="${i%3?.9:1.5}"/>`).join('')+'</g>';
const cloud=(x,y,s)=>`<g class="cl" style="opacity:0;transition:opacity 1s" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${26*s}" ry="${9*s}"/><ellipse cx="${x+14*s}" cy="${y-7*s}" rx="${16*s}" ry="${9*s}"/><ellipse cx="${x-12*s}" cy="${y-5*s}" rx="${13*s}" ry="${8*s}"/></g>`;
let ORB;
const win=()=>{ORB={x:258,y:155,w:84,h:80,r:11};return`<clipPath id="wc"><rect x="258" y="155" width="84" height="80" rx="8"/></clipPath><rect x="252" y="149" width="96" height="92" rx="12" fill="#fff" stroke="#e8c6d4" stroke-width="4"/><g clip-path="url(#wc)"><rect x="258" y="155" width="84" height="80" fill="url(#sk)"/>${stars(258,155,84,80,9)}<g id="orb"><circle r="22" opacity=".25"/><circle r="11"/></g>${cloud(285,185,.8)}${cloud(325,205,.7)}</g><path d="M300 155V235M258 195H342" stroke="#fff" stroke-width="3"/><rect x="246" y="240" width="108" height="8" rx="4" fill="#f3d3df"/><path d="M244 140Q262 190 248 245H232V140Z" fill="#f6b8cf"/><path d="M356 140Q338 190 352 245H368V140Z" fill="#f6b8cf"/>`};
const items=()=>(st.it.plant?'<path d="M100 300h24l-3-26h-18z" fill="#e9a58c"/><ellipse cx="104" cy="262" rx="7" ry="15" fill="#6fbf7f" transform="rotate(-25 104 262)"/><ellipse cx="120" cy="258" rx="7" ry="17" fill="#7fcf8f" transform="rotate(22 120 258)"/><ellipse cx="112" cy="252" rx="6" ry="17" fill="#5fb272"/>':'')+(st.it.lamp?'<circle id="glow" cx="488" cy="196" r="72" fill="url(#lg)" style="opacity:0;transition:opacity 1.2s"/><rect x="486" y="208" width="4" height="92" fill="#c9a27a"/><path d="M470 208h36l-8-26h-20z" fill="#fff1c9" stroke="#e8c98a" stroke-width="2"/><ellipse cx="488" cy="301" rx="15" ry="4" fill="#c9a27a"/>':'')+(st.it.pics?'<rect x="150" y="136" width="42" height="34" rx="3" fill="#fff" stroke="#d9b48f" stroke-width="3"/><text x="171" y="160" font-size="16" text-anchor="middle">🐻</text><rect x="408" y="136" width="42" height="34" rx="3" fill="#fff" stroke="#d9b48f" stroke-width="3"/><text x="429" y="160" font-size="16" text-anchor="middle">🌷</text>':'');
const stripes=c=>'<g opacity=".4" stroke="'+c+'" stroke-width="3">'+Array.from({length:22},(_,i)=>`<path d="M${i*28} 120V290"/>`).join('')+'</g>';
const room=r=>{const L=r==='living';return`<rect width="600" height="400" fill="${L?'#fbe4ea':'#ece1f9'}"/>${stripes(L?'#f5c9d8':'#dcc8f0')}${win()}<rect y="292" width="600" height="110" fill="${L?'#f0cfae':'#e6cbbd'}"/><path d="M0 320H600M0 350H600M0 380H600" stroke="${L?'#e2b98f':'#d6b3a3'}" stroke-width="2"/><rect y="286" width="600" height="8" fill="#fff"/>`+(L?'<ellipse cx="300" cy="338" rx="120" ry="24" fill="#f7c1d4" stroke="#fff" stroke-width="4" stroke-dasharray="2 8"/>':'<rect x="150" y="250" width="300" height="52" rx="14" fill="#d8b4e2"/><rect x="142" y="280" width="316" height="42" rx="12" fill="#fff" stroke="#e6cff0" stroke-width="3"/><rect x="142" y="296" width="316" height="26" rx="12" fill="#f6b8cf"/>')+(L?'':'<path d="M440 321q28 24 56 0z" fill="#e0bb94" stroke="#c49a73" stroke-width="2"/>')+items()};
const plant=i=>{const s=st.plots[i],c=st.rare[i]?'#ffcf3d':COLS[i];if(!s)return'';if(s===1)return'<circle cy="-3" r="3.2" fill="#6b4a2f"/>';
const stem=`<path d="M0 0Q-2-14 0-${s===2?20:s===3?30:36}" stroke="#58a56a" stroke-width="3" fill="none" stroke-linecap="round"/>`,lf='<ellipse cx="-8" cy="-10" rx="7" ry="3.5" fill="#6fbf7f" transform="rotate(-25 -8 -10)"/><ellipse cx="8" cy="-14" rx="7" ry="3.5" fill="#6fbf7f" transform="rotate(25 8 -14)"/>';
if(s===2)return stem+lf;if(s===3)return stem+lf+`<ellipse cy="-34" rx="6" ry="8" fill="${c}"/>`;
let p='';for(let k=0;k<6;k++){const a=k*Math.PI/3;p+=`<circle cx="${Math.cos(a)*9}" cy="${-40+Math.sin(a)*9}" r="7" fill="${c}"/>`}
return`<g class="sw">${stem}${lf}${p}<circle cy="-40" r="5" fill="${st.rare[i]?'#fff':'#ffe9a8'}"/></g>`+(st.rare[i]?'<text y="-60" font-size="12" text-anchor="middle">✨</text>':'')};
const garden=()=>{ORB={x:100,y:130,w:400,h:110,r:16};const G=SE[seasonOf()];let f='';for(let x=96;x<510;x+=22)f+=`<rect x="${x}" y="266" width="12" height="36" rx="4" fill="#fff"/>`;
return`<rect width="600" height="400" fill="url(#sk)"/>${stars(100,125,400,110,16)}<g id="orb"><circle r="34" opacity=".25"/><circle r="16"/></g>${cloud(150,170,1.3)}${cloud(330,150,1.1)}${cloud(450,190,1.2)}<path d="M0 270Q110 215 230 262T440 250T600 240V400H0Z" fill="${G[0]}"/><path d="M0 300Q140 255 300 290T600 280V400H0Z" fill="${G[1]}"/>${f}<rect x="80" y="278" width="440" height="5" fill="#fff"/><rect y="300" width="600" height="110" fill="${G[2]}"/>`+[0,1,2,3].map(i=>`<g class="plot" data-i="${i}" transform="translate(${150+i*100} 352)"><ellipse rx="34" ry="11" fill="#a7774f"/><g id="pl${i}">${plant(i)}</g><ellipse rx="40" ry="46" cy="-24" fill="transparent"/></g>`).join('')};
const bunnySvg=()=>'<g id="treats"></g><ellipse id="bsh" rx="17" ry="4.6" fill="#9a6a86" opacity=".2"/><g id="bun"><ellipse cx="0" cy="-26" rx="38" ry="48" fill="transparent"/><g id="bf"><g class="bb"><ellipse cx="-6" cy="-12" rx="17" ry="13" fill="#fff" stroke="#e3cfd6" stroke-width="1.4"/><circle cx="-21" cy="-11" r="5" fill="#fff" stroke="#e3cfd6" stroke-width="1.4"/><g class="ears"><ellipse cx="3" cy="-46" rx="4.5" ry="13" fill="#fff" stroke="#e3cfd6" stroke-width="1.4" transform="rotate(-8 3 -46)"/><ellipse cx="14" cy="-45" rx="4.5" ry="13" fill="#fff" stroke="#e3cfd6" stroke-width="1.4" transform="rotate(10 14 -45)"/><ellipse cx="3" cy="-46" rx="2" ry="9" fill="#f7c3d1" transform="rotate(-8 3 -46)"/></g><circle cx="8" cy="-27" r="11" fill="#fff" stroke="#e3cfd6" stroke-width="1.4"/><ellipse id="be" cx="12" cy="-29" rx="2" ry="2.3" fill="#4a3433"/><ellipse cx="9" cy="-23" rx="3.5" ry="2" fill="#ff9fb8" opacity=".6"/><ellipse cx="17" cy="-26" rx="2" ry="1.4" fill="#e98aa4"/><path d="M19-25l8-2M19-24l8 1" stroke="#c9aab6" stroke-width="1" stroke-linecap="round" fill="none"/><text class="zz" x="14" y="-52" font-size="10" fill="#9b86d6" font-weight="800">z</text><text id="crt" x="18" y="-8" font-size="13" style="display:none">🥕</text></g></g></g>';
let engine,bx=300,by=338,dir=1,asleep=false,wb;
const OUT=r=>r==='garden'||r==='balcony';
const treats=[];let arr=null,roomLock=0,lastAct='idle',rtT=0,lc=0;
const PAL=[['#ffd36b','#ff9ec0','#c9a6ff','#8fd3ff'],['#ff9ec0','#ffd36b','#ff9ec0','#fff'],['#8fd3ff','#c9a6ff','#8fd3ff','#b6f0c8']];
const ob=(o,x,y,inner,w=36,h=40)=>`<g class="obj" data-o="${o}" transform="translate(${x} ${y})" style="cursor:pointer"><rect x="${-w/2}" y="${-h}" width="${w}" height="${h+6}" fill="transparent"/><g class="ig">${inner}</g></g>`;
const edgeHints=()=>'<g style="pointer-events:none" font-size="30" font-weight="800" fill="#fff" opacity=".6" text-anchor="middle"><text x="102" y="350">‹</text><text x="498" y="350">›</text></g>';
const kitchen=()=>{let t='';for(let y=120;y<292;y+=24)t+=`M0 ${y}H600`;for(let r=0;r<8;r++)for(let x=(r%2)*24;x<600;x+=48)t+=`M${x} ${120+r*24}v24`;
let f='';for(let r=0;r<4;r++)for(let c=-1;c<17;c++)if((r+c)%2)f+=`<rect x="${c*36+(r%2?0:0)}" y="${292+r*28}" width="36" height="28" fill="#e8d2bb"/>`;
const cab=x=>`<rect x="${x}" y="244" width="190" height="48" rx="4" fill="#e9b99a"/><rect x="${x-6}" y="234" width="202" height="12" rx="5" fill="#fff" stroke="#efd9cb" stroke-width="2"/><path d="M${x+47} 247v43M${x+95} 247v43M${x+143} 247v43" stroke="#d9a07f" stroke-width="2"/><g fill="#fff"><circle cx="${x+40}" cy="262" r="2.6"/><circle cx="${x+54}" cy="262" r="2.6"/><circle cx="${x+136}" cy="262" r="2.6"/><circle cx="${x+150}" cy="262" r="2.6"/></g>`;
return `<rect width="600" height="400" fill="#fff0e0"/><path d="${t}" stroke="#f0d3b2" stroke-width="2" fill="none" opacity=".85"/>${win()}${cab(60)}${cab(350)}<rect y="292" width="600" height="110" fill="#f6e6d4"/>${f}<rect y="286" width="600" height="8" fill="#fff"/>`};
const balcony=()=>{ORB={x:100,y:130,w:400,h:110,r:16};
const bl=[[96,40,70],[140,34,52],[178,52,88],[234,38,60],[276,46,96],[326,34,50],[362,56,80],[422,40,66],[466,44,90]];
let sk='';bl.forEach(([x,w,h],k)=>{sk+=`<rect x="${x}" y="${292-h}" width="${w}" height="${h}" rx="3" fill="#7d6fa6" opacity=".6"/>`;for(let j=0;j<Math.floor(h/16);j++)for(let i=0;i<Math.floor(w/12);i++)if((i*7+j*3+k*5)%5<2)sk+=`<rect x="${x+5+i*12}" y="${292-h+7+j*16}" width="5" height="7" fill="#ffe9a8" opacity=".8"/>`});
let rl='';for(let x=96;x<510;x+=24)rl+=`<rect x="${x}" y="266" width="8" height="34" rx="3" fill="#fff"/>`;
let bu='';const q=PAL[lc];for(let i=0;i<12;i++){const t=i/11,x=90+t*420,y=142+96*t*(1-t)+3;bu+=`<circle class="bulb twk" style="animation-delay:${(i*.27).toFixed(2)}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${q[i%4]}"/>`}
return `<rect width="600" height="400" fill="url(#sk)"/>${stars(100,125,400,110,16)}<g id="orb"><circle r="34" opacity=".25"/><circle r="16"/></g>${cloud(150,170,1.3)}${cloud(330,150,1.1)}${cloud(450,190,1.2)}<path d="M0 270Q110 235 230 262T440 250T600 244V300H0Z" fill="#b9a6d6" opacity=".55"/>${sk}<rect y="298" width="600" height="110" fill="#d9b48f"/><path d="M0 322H600M0 350H600M0 378H600" stroke="#c49a73" stroke-width="2"/>${rl}<rect x="80" y="276" width="440" height="6" rx="3" fill="#fff"/><g class="obj" data-o="lights" style="cursor:pointer"><path d="M90 142Q300 190 510 142" stroke="transparent" stroke-width="24" fill="none"/><path d="M90 142Q300 190 510 142" stroke="#8a6a5a" fill="none" stroke-width="1.6"/>${bu}</g>`};
const roomSvg=r=>r==='garden'?garden():r==='balcony'?balcony():r==='kitchen'?kitchen():room(r);
const bfly=(x,y,c,d)=>`<g class="obj" data-o="bfly" transform="translate(${x} ${y})" style="cursor:pointer"><g class="fl" style="animation-delay:${d}s"><circle r="20" fill="transparent"/><g class="wg"><ellipse cx="-4.5" cy="-2" rx="5.5" ry="4" fill="${c}"/><ellipse cx="4.5" cy="-2" rx="5.5" ry="4" fill="${c}"/></g><rect x="-.8" y="-5" width="1.6" height="9" rx=".8" fill="#6b4a5a"/></g></g>`;
function props(r){
 if(r==='living')return ob('musicbox',142,366,'<ellipse rx="15" ry="4" fill="#0001"/><rect x="-13" y="-16" width="26" height="16" rx="5" fill="#f6b8cf" stroke="#fff" stroke-width="2"/><ellipse cy="-16" rx="13" ry="4.5" fill="#fbd3e2" stroke="#fff" stroke-width="1.5"/><text y="-5" font-size="11" text-anchor="middle" fill="#fff">♪</text>')
  +ob('ball',455,366,'<ellipse rx="10" ry="2.6" fill="#0001"/><circle cy="-9" r="9" fill="#8fd3ff" stroke="#fff" stroke-width="1.5"/><path d="M-8-9a8 8 0 0116 0" fill="none" stroke="#fff" stroke-width="2"/><circle cy="-9" r="2.5" fill="#fff" opacity=".85"/>');
 if(r==='bedroom')return ob('clock',212,168,'<circle cy="-14" r="14" fill="#fff" stroke="#d9b48f" stroke-width="3"/><line id="ch" x1="0" y1="-14" x2="0" y2="-21" stroke="#76566b" stroke-width="2.4" stroke-linecap="round"/><line id="cm" x1="0" y1="-14" x2="0" y2="-24" stroke="#d9588a" stroke-width="1.6" stroke-linecap="round"/><circle cy="-14" r="1.8" fill="#76566b"/>',34,34)
  +ob('mobile',390,172,'<path d="M0-52V-62M-15-50h30M-12-50v14M0-50v22M12-50v14" stroke="#c9a27a" stroke-width="1.6" fill="none"/><text x="-12" y="-33" font-size="12" text-anchor="middle">⭐</text><text y="-25" font-size="12" text-anchor="middle">🌙</text><text x="12" y="-33" font-size="12" text-anchor="middle">⭐</text>',44,60);
 if(r==='kitchen')return ob('jar',112,236,'<rect x="-10" y="-22" width="20" height="22" rx="6" fill="#f9d0dc" stroke="#fff" stroke-width="2"/><rect x="-8" y="-27" width="16" height="6" rx="3" fill="#e89ab3"/><text y="-7" font-size="11" text-anchor="middle">🍪</text>')
  +ob('kettle',490,236,'<path d="M-12 0v-14q0-9 12-9t12 9v14z" fill="#cfd8e6" stroke="#fff" stroke-width="2"/><path d="M12-14l9-8" stroke="#cfd8e6" stroke-width="4" stroke-linecap="round"/><path d="M-8-23q8-9 16 0" fill="none" stroke="#a9b6c9" stroke-width="3"/><circle cy="-26" r="3" fill="#e89ab3"/><text class="stm" x="20" y="-26" font-size="10">☁</text>')
  +ob('basket',140,366,'<ellipse rx="20" ry="4" fill="#0001"/><text x="-12" y="-14" font-size="15">🥕</text><text x="0" y="-14" font-size="15">🥕</text><path d="M-19-14h38l-4 14h-30z" fill="#d7a36f" stroke="#b98150" stroke-width="2"/>',44,40);
 if(r==='balcony')return ob('scope',128,300,'<path d="M0-18L-13 0M0-18L13 0M0-18V0" stroke="#b9936a" stroke-width="3" stroke-linecap="round" fill="none"/><g transform="rotate(-38 0 -20)"><rect x="-6" y="-46" width="12" height="32" rx="4" fill="#9fb3d9" stroke="#fff" stroke-width="1.5"/><rect x="-7.5" y="-50" width="15" height="6" rx="2" fill="#6f86bd"/></g>',44,58);
 if(r==='garden')return bfly(170,182,'#ffb3cf',0)+bfly(360,206,'#c9a6ff',-4.5)+ob('bird',482,292,'<rect x="-2" y="-34" width="4" height="34" fill="#b98150"/><path d="M-12-52h24v18h-24z" fill="#f6c1a0" stroke="#fff" stroke-width="2"/><path d="M-15-52L0-64l15 12z" fill="#e0847a"/><circle cy="-43" r="4" fill="#6b4a3a"/><ellipse cx="9" cy="-60" rx="6" ry="4.6" fill="#8fd3ff"/><circle cx="14" cy="-64" r="3.4" fill="#8fd3ff"/><path d="M17-64l4 1-4 1z" fill="#ffb84d"/>',40,70);
 return ''}
const OCD={};const pts=(k,v)=>{const n=Date.now();if(!OCD[k]||n-OCD[k]>8000){OCD[k]=n;addP(v)}};
const wob=o=>{const g=root.querySelector('.obj[data-o="'+o+'"] .ig');if(g){g.classList.remove('wob');void g.getBoundingClientRect();g.classList.add('wob')}};
const notes=(fs,step=170,v=.03)=>fs.forEach((f,i)=>setTimeout(()=>tone(f,.4,v),i*step));
function bunnyGo(x,y,fn){if(asleep){pop('shh… bunny sleeps 💤',bx,by-60);return}rd=null;tx=x;ty=y;arr=fn;lastIn=Date.now()}
function updClock(){const h=$('#ch'),m=$('#cm');if(!h)return;const d=new Date();h.setAttribute('transform',`rotate(${(d.getHours()%12+d.getMinutes()/60)*30} 0 -14)`);m.setAttribute('transform',`rotate(${d.getMinutes()*6} 0 -14)`)}
function shoot(){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.innerHTML='<path d="M0 0L48 -12" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/><circle r="3.6" fill="#fff6cf"/>';$('#fg').appendChild(g);g.animate([{transform:'translate(480px,150px)',opacity:0},{opacity:1,offset:.15},{transform:'translate(150px,240px)',opacity:0}],{duration:1300,easing:'ease-in'}).onfinish=()=>g.remove();notes([2093,1568,1175,880],90,.02);pop('✨ make a wish!',300,170)}
function spawnTreat(){if(treats.length>=3){pop('plenty of carrots! 🥕',140,335);return}wake();const x=190+Math.random()*250,y=328+Math.random()*38,id='t'+Date.now()+treats.length;treats.push({x,y,id});$('#treats').insertAdjacentHTML('beforeend',`<text data-id="${id}" x="${x}" y="${y}" font-size="18" text-anchor="middle">🥕</text>`);tone(500,.08,.03,800);goTreat()}
function goTreat(){if(!treats.length||asleep||rd||drag)return;const t=treats[0];tx=t.x;ty=t.y;arr=()=>eatTreat(t)}
function eatTreat(t){const i=treats.indexOf(t);if(i<0)return;treats.splice(i,1);const el=$('#treats [data-id="'+t.id+'"]');if(el)el.remove();const c=$('#crt'),b=$('#bun');c.style.display='';b.classList.add('nib');tone(300,.05,.03,200);setTimeout(()=>tone(260,.05,.03,180),260);setTimeout(()=>{c.style.display='none';b.classList.remove('nib');pop('♥ yum!',bx,by-70);hop();tick('feed');addP(1);if(treats.length)goTreat()},1500)}
function cycleLights(){lc=(lc+1)%PAL.length;$$('.bulb').forEach((e,i)=>e.setAttribute('fill',PAL[lc][i%4]))}
function objTap(o,e){wob(o);wake();
 if(o==='musicbox'){notes([523,659,784,1047,784,659,523]);pop('♪ ♫ ♪',142,330);triggerBearAction('dance',{by:Math.random()<.5?1:0});pts(o,2)}
 else if(o==='ball'){pop('boing!',455,330);tone(300,.2,.05,600);bunnyGo(455,358,()=>{hop();pop('♥',bx,by-60)});pts(o,1)}
 else if(o==='clock'){pop(new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}),212,128);tone(880,.1,.03);setTimeout(()=>tone(660,.2,.03),120)}
 else if(o==='mobile'){notes([784,988,1175,988],140,.025);pop('✨',390,135);pts(o,1)}
 else if(o==='jar'){pop('🍪 yum!',112,208);notes([660,880],110);triggerBearAction('feed',{by:Math.random()<.5?1:0});pts(o,2)}
 else if(o==='kettle'){pop('☁ pssst~',488,208);tone(1500,.6,.03,2100);pts(o,1)}
 else if(o==='basket'){spawnTreat()}
 else if(o==='scope'){shoot();pts(o,3)}
 else if(o==='lights'){cycleLights();notes([1047,1319,1568],90,.02);pts(o,1)}
 else if(o==='bfly'){const[x,y]=vb(e);pop('💗',x,y);tone(1400,.1,.02,1800);pts(o,1)}
 else if(o==='bird'){notes([2093,2637,2093,2349],110,.015);pop('tweet! 🐦',482,222);pts(o,1)}}
function bunnyDoor(d){roomLock=Date.now()+3500;const n=ROOMS.length;goRoom(ROOMS[(ROOMS.indexOf(st.room)+d+n)%n]);startRoomTimer();setTimeout(()=>{bx=d>0?130:470;by=Math.max(by,330);tx=null;dir=d>0?1:-1;drawBunny()},330)}

function build(){const r=st.room;(OUT(r)?$('#fg'):$('#bg')).after($('#wx'));$('#bg').innerHTML='<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop id="s1" offset="0"/><stop id="s2" offset="1"/></linearGradient><radialGradient id="lg"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient></defs>'+roomSvg(r)+props(r)+edgeHints()+giftSvg();
$$('.plot').forEach(g=>g.onclick=()=>tapPlot(+g.dataset.i));$$('.obj').forEach(g=>g.onclick=e=>{e.stopPropagation();objTap(g.dataset.o,e)});treats.length=0;{const tg=$('#treats');if(tg)tg.innerHTML=''}arr=null;updClock();const gf=$('#gift');if(gf)gf.onclick=openGift;
$('#bg').onclick=e=>{if(e.target.closest('.plot,#gift,.obj')||asleep)return;const r=$('#bg').getBoundingClientRect(),vx=90+(e.clientX-r.left)/r.width*420,vy=120+(e.clientY-r.top)/r.height*270;if(vy<296)return;arr=null;tx=Math.max(112,Math.min(488,vx));ty=Math.max(304,Math.min(372,vy));lastIn=Date.now()};
$$('#deco .chip[data-k]').forEach(b=>b.hidden=r==='garden');env()}
const pop=(t,x,y)=>{const e=document.createElement('div');e.className='pop';e.textContent=t;e.style.left=(x-90)/4.2+'%';e.style.top=(y-120)/2.7+'%';$('#fx').appendChild(e);setTimeout(()=>e.remove(),1600)};
let wakeUntil=0,tx=null,ty=null,lastIn=0,drag=null,bl=performance.now(),ck=0;const key={},dp={x:0,y:0};
let rd=null;const HP=[[210,186],[390,186]],PS=.72,FLOOR_S=1+(350-304)/68*.35;
const sc=()=>rd?rd.s:Math.max(1,1+(by-304)/68*.35);
const clampB=()=>{bx=Math.max(112,Math.min(488,bx));if(drag||rd)by=Math.max(140,Math.min(372,by));else{if(by<304)by=Math.min(304,by+7);by=Math.min(372,by)}};
function perchHit(){for(let i=0;i<2;i++)if(Math.abs(bx-HP[i][0])<65&&by>=140&&by<=290)return i;return -1}
function startRide(i){wake();wakeUntil=Date.now()+40000;tx=null;rd={c:i,n:0,ph:'land',t0:performance.now(),fx:bx,fy:by,tx:HP[i][0],ty:HP[i][1],dur:300,arc:20,s0:sc(),s1:PS,s:sc()};pop('🐰 on my head!',HP[i][0],HP[i][1]-50)}
function rideStep(now){const r=rd;const go=(ph,to,dur,arc,s1)=>{r.ph=ph;r.t0=now;r.fx=bx;r.fy=by;r.tx=to[0];r.ty=to[1];r.dur=dur;r.arc=arc;r.s0=r.s;r.s1=s1};
  const u=Math.min(1,(now-r.t0)/r.dur);
  if(r.ph==='sit'){bx=HP[r.c][0];by=HP[r.c][1];r.s=PS;if(u>=1){if(r.n<3){go('jump',HP[1-r.c],760,24,PS);hop();tone(700,.12,.03,1100)}else go('down',[HP[r.c][0]+(r.c?-45:45),350],900,30,FLOOR_S)}return}
  bx=r.fx+(r.tx-r.fx)*u;by=r.fy+(r.ty-r.fy)*u-4*r.arc*u*(1-u);r.s=r.s0+(r.s1-r.s0)*u;if(Math.abs(r.tx-r.fx)>1)dir=r.tx>r.fx?1:-1;
  if(u>=1){if(r.ph==='jump'){r.c=1-r.c;r.n++;r.ph='sit';r.t0=now;r.dur=520;pop(r.n<3?'♥':'♥ ♥ ♥',bx,by-50);tone(900,.07,.03,1400)}
   else if(r.ph==='land'){r.ph='sit';r.t0=now;r.dur=450;tone(900,.07,.03,1400)}
   else{rd=null;tx=null;lastIn=Date.now();pop('wheee! 🐰',bx,by-60);tick('bunny');addP(3)}}}
function setSleep(){const n=phase()==='night'&&Date.now()>wakeUntil&&!drag;asleep=n;const b=$('#bun');if(!b)return;b.classList.toggle('sl',n);$('#be').setAttribute('ry',n?.5:2.3)}
let bmv=false;const drawBunny=()=>{const b=$('#bun');if(!b)return;const s=sc(),lift=bmv&&!rd&&!drag?Math.abs(Math.sin(performance.now()*.011))*9*s:0;b.setAttribute('transform',`translate(${bx} ${by-lift}) scale(${s})`);$('#bf').setAttribute('transform',`scale(${dir} 1)`);const h=$('#bsh');if(h){h.setAttribute('cx',bx);h.setAttribute('cy',by+1);h.setAttribute('rx',Math.max(4,17*s*(1-lift/50)));h.setAttribute('opacity',rd||drag?0:.2)}};
function placeBunny(){setSleep();if(asleep&&st.room==='bedroom'){bx=468;by=322;tx=null}drawBunny()}
const hop=()=>{const b=$('#bun');b.classList.remove('hop');void b.getBoundingClientRect();b.classList.add('hop')};
function wake(){lastIn=Date.now();wakeUntil=Date.now()+30000;if(asleep){setSleep();pop('yawn… 🐰',bx,by-60)}}
let holdT=0,purrI=0,lastTap=0,purrN=0;
function bunnyTap(){if(asleep){wake();return}const n=Date.now(),dbl=n-lastTap<320;lastTap=n;hop();if(dbl){setTimeout(hop,380);pop('wheee! 🐰',bx,by-70)}else pop('♥',bx,by-60);const e=$('#be');e.setAttribute('ry',.6);setTimeout(()=>e.setAttribute('ry',2.3),900);tone(1200,.08,.03,1700)}
function startPurr(){purrN=0;$('#bun').classList.add('purr');$('#be').setAttribute('ry',.6);purrI=setInterval(()=>{pop('♥',bx+(Math.random()-.5)*30,by-70);tone(180,.25,.02,150);if(++purrN===3)tick('bunny')},520)}
function stopPurr(){clearInterval(purrI);const b=$('#bun');if(b)b.classList.remove('purr');const e=$('#be');if(e&&!asleep)e.setAttribute('ry',2.3)}
function bunLoop(now){requestAnimationFrame(bunLoop);const dt=Math.min(.05,(now-bl)/1e3);bl=now;if(!$('#bun'))return;
if(now-ck>500){ck=now;const was=asleep;setSleep();if(asleep&&!was&&st.room==='bedroom'){bx=468;by=322;tx=null}}
const ix=(key.ArrowRight||key.KeyD?1:0)-(key.ArrowLeft||key.KeyA?1:0)+dp.x,iy=(key.ArrowDown||key.KeyS?1:0)-(key.ArrowUp||key.KeyW?1:0)+dp.y;let mv=false;
if(!rd&&(ix||iy)){wake();tx=null;const m=Math.hypot(ix,iy);bx+=ix/m*110*dt;by+=iy/m*62*dt;mv=true;if(ix)dir=ix>0?1:-1}
else if(tx!==null&&!asleep&&!drag&&!rd){const dx=tx-bx,dy=ty-by,d=Math.hypot(dx,dy);if(d<3){tx=null;if(arr){const f=arr;arr=null;f()}}else{const s=Math.min(d,125*dt);bx+=dx/d*s;by+=dy/d*s;dir=dx>0?1:-1;mv=true}}
if(rd)rideStep(now);clampB();bmv=mv;$('#bun').classList.toggle('walk',mv);drawBunny();if(!rd&&!drag&&!asleep&&Date.now()>roomLock&&(bx<=117||bx>=483))bunnyDoor(bx<=117?-1:1);
if(!asleep&&!rd&&!drag&&by>=300){if(st.room==='garden')for(let i=0;i<4;i++)if(st.plots[i]===4&&Math.abs(bx-(150+i*100))<26&&Math.abs(by-352)<20)tapPlot(i);if(st.gift&&Math.abs(bx-300)<24&&Math.abs(by-368)<14)openGift()}}
addEventListener('keydown',e=>{if(e.target.matches&&e.target.matches('input,textarea'))return;key[e.code]=1;if(e.code.startsWith('Arrow')||e.code==='Space')e.preventDefault();if(e.code==='Space'&&!asleep)hop()});
addEventListener('keyup',e=>{delete key[e.code]});
const DIR={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
$$('.dp button').forEach(b=>{const s=e=>{e.preventDefault();[dp.x,dp.y]=DIR[b.dataset.d]},r=()=>{dp.x=0;dp.y=0};b.onpointerdown=s;b.onpointerup=r;b.onpointerleave=r;b.onpointercancel=r});
const vb=e=>{const r=$('#fg').getBoundingClientRect();return[90+(e.clientX-r.left)/r.width*420,120+(e.clientY-r.top)/r.height*270]};
$('#fg').addEventListener('contextmenu',e=>e.preventDefault());
$('#fg').addEventListener('pointerdown',e=>{if(!e.target.closest('#bun'))return;e.preventDefault();const[x,y]=vb(e);drag={ox:bx-x,oy:by-y,sx:e.clientX,sy:e.clientY,m:0,hold:0};rd=null;tx=null;wake();clearTimeout(holdT);holdT=setTimeout(()=>{if(drag&&!drag.m&&!asleep){drag.hold=1;startPurr()}},450)});
addEventListener('pointermove',e=>{if(!drag)return;if(!drag.m&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6){drag.m=1;clearTimeout(holdT);if(drag.hold){drag.hold=0;stopPurr()}}if(drag.m){const[x,y]=vb(e),nx=x+drag.ox;dir=nx>bx?1:-1;bx=nx;by=y+drag.oy;clampB();wake()}});
const endTouch=()=>{clearTimeout(holdT);if(!drag)return;const d=drag;drag=null;if(d.hold){stopPurr();pop('♥',bx,by-60);hop()}else if(d.m){const h=perchHit();if(h>=0)startRide(h);else hop()}else bunnyTap()};
addEventListener('pointerup',endTouch);addEventListener('pointercancel',endTouch);
setInterval(()=>{if(asleep||document.hidden||drag||rd||Date.now()-lastIn<7000||tx!==null)return;if(treats.length){goTreat();return}tx=130+Math.random()*340;ty=310+Math.random()*58;hop()},5200);
requestAnimationFrame(bunLoop);

function updateBearfriendStatus(){
  const roomLabels={living:'Living room',kitchen:'Kitchen',bedroom:'Bedroom',balcony:'Balcony',garden:'Garden'};
  const timeLabels={morning:'Morning',afternoon:'Afternoon',evening:'Evening',night:'Night'};
  const weatherLabels={clear:'Clear skies',rain:'Rainy',snow:'Snowy'};
  const roomNode=$('#bfRoomStatus'),timeNode=$('#bfTimeStatus'),weatherNode=$('#bfWeatherStatus');
  if(roomNode)roomNode.textContent=roomLabels[st.room]||'Little home';
  if(timeNode)timeNode.textContent=timeLabels[phase()]||'A new day';
  if(weatherNode)weatherNode.textContent=weatherLabels[st.wx]||'Changing skies';
  $$('[data-bf-room]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.bfRoom===st.room)));
}
function env(){updateBearfriendStatus();const p=phase(),n=p==='night',base=SKY[p],tg=st.wx==='rain'?'#8d98a8':st.wx==='snow'?'#dfe6f0':null,c=tg?base.map(x=>mix(x,tg,n?.35:.6)):base;
const s1=$('#s1');if(s1){s1.setAttribute('stop-color',c[0]);$('#s2').setAttribute('stop-color',c[1])}
const stt=$('#stars');if(stt)stt.style.opacity=n&&st.wx==='clear'?1:0;
const o=$('#orb');if(o){const f={morning:[.2,.62],afternoon:[.5,.3],evening:[.8,.6],night:[.62,.34]}[p];o.setAttribute('transform',`translate(${ORB.x+ORB.w*f[0]} ${ORB.y+ORB.h*f[1]})`);o.querySelectorAll('circle').forEach(e=>e.setAttribute('fill',n?'#fff6cf':p==='evening'?'#ff9a5c':'#ffd45e'));o.style.opacity=st.wx==='clear'?1:.2}
$$('.cl').forEach(e=>{e.style.opacity=st.wx==='clear'?0:.92;e.setAttribute('fill',st.wx==='rain'?'#aeb7c4':'#fff')});
$('#tint').style.background=sTint({morning:'rgba(255,214,170,.10)',afternoon:'transparent',evening:'rgba(255,128,70,.20)',night:'rgba(24,26,92,.42)'}[p]);
const g=$('#glow');if(g)g.style.opacity=n||p==='evening'?1:0;
placeBunny();amb();updClock()}
let lastBy=1;const cd={};
function bears(a,by=0){runLocalAction(a,by)}
function runLocalAction(action,by=0){
  if(!engine||!ACTION_MAP[action])return false;
  engine.play(action,by===1?1:0);lastAct=action;clearTimeout(rtT);if(['dance','pet','hands'].includes(action))rtT=setTimeout(()=>{if(lastAct===action){engine.play('idle',0);lastAct='idle'}},9000);
  if(action==='hug')tick('hug');
  if(action==='feed')tick('feed');
  if(action==='kiss'||action==='flykiss')tick('kiss');
  if(!asleep&&['hug','kiss','flykiss','feed','hands'].includes(action))setTimeout(()=>{hop();pop('♥',bx,by-60)},900);
  if(!asleep&&action==='dance'){[0,420,840].forEach(d=>setTimeout(hop,d));pop('♪',bx,by-60)}
  return true}
function triggerBearAction(action,options={}){
  if(!ACTION_MAP[action])return false;
  const by=options.by===0||options.by===1?options.by:(lastBy=1-lastBy);
  runLocalAction(action,by);
  if(!options.remote){const n=Date.now();if(!cd[action]||n-cd[action]>4000){cd[action]=n;addP(action==='idle'?1:2)}
    window.dispatchEvent(new CustomEvent('bearfriend:external-action',{detail:{action,by,at:n}}))}
  const bt=$('#acts [data-a="'+action+'"]');if(bt){bt.setAttribute('aria-pressed','true');setTimeout(()=>bt.setAttribute('aria-pressed','false'),1400)}
  return true}
addEventListener('bearfriend:remote',e=>triggerBearAction(e.detail.action,{by:e.detail.by,remote:true}));
addEventListener('bearfriend:iframe-play',e=>{const d=e.detail||{};if(ACTION_MAP[d.action])triggerBearAction(d.action,{by:d.by,remote:true})});
function auto(){const night=['evening','night'].includes(phase());let a='idle';if(st.room==='bedroom'&&night)a='sleep';else if(st.room==='kitchen')a='feed';else if(st.room==='balcony'&&night)a='hands';engine.play(a,0);lastAct=a}
function tapPlot(i){const s=st.plots[i],x=150+i*100;
if(!s){st.plots[i]=1;st.rare[i]=0;pop('🌱 planted',x,318);plot(i)}
else if(s===4){const r=st.rare[i];st.petals+=r?5:1;pop(r?'✨ rare! +5':'+1 🌸',x,296);st.plots[i]=0;st.rare[i]=0;plot(i);carePaint();if(!asleep)hop()}
else{tick('water');pop('💧',x,300);tone(700,.12,.03,500);setTimeout(()=>{st.plots[i]=s+1;if(s+1===4)st.rare[i]=Math.random()<.25?1:0;plot(i)},380)}}
const plot=i=>{const e=$('#pl'+i);if(e)e.innerHTML=plant(i)};
const cv=$('#wx'),cx=cv.getContext('2d');let PT=[];
function loop(){requestAnimationFrame(loop);const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;if(cv.width!==Math.round(r.width*d)){cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d)}
cx.clearRect(0,0,cv.width,cv.height);const sea=seasonOf(),leaf=st.wx==='clear'&&OUT(st.room)&&(sea==='spring'||sea==='autumn');if(st.wx==='clear'&&!leaf)return;const W=cv.width,k=W/420,ind=!OUT(st.room),rg=ind?[(258-90)*k,(155-120)*k,84*k,80*k]:[0,0,W,cv.height],snow=st.wx==='snow'||leaf;
while(PT.length<(ind?36:120))PT.push({x:Math.random(),y:Math.random(),v:.5+Math.random()*.7});
cx.save();cx.beginPath();cx.rect(...rg);cx.clip();cx.strokeStyle='rgba(120,150,200,.7)';cx.fillStyle=leaf?(sea==='spring'?'#ffb3cf':'#e8893a'):'#fff';
for(const q of leaf?PT.slice(0,30):PT){q.y+=q.v*(snow?.004:.02);q.x+=snow?Math.sin(q.y*9+q.v*5)*.0015:-.003;if(q.y>1){q.y=0;q.x=Math.random()}if(q.x<0)q.x=1;const x=rg[0]+q.x*rg[2],y=rg[1]+q.y*rg[3];
if(leaf){cx.beginPath();cx.ellipse(x,y,3.2*k,1.7*k,q.y*9,0,7);cx.fill()}else if(snow){cx.beginPath();cx.arc(x,y,(1+q.v*1.5)*k*.6,0,7);cx.fill()}else{cx.beginPath();cx.moveTo(x,y);cx.lineTo(x-2*k,y+8*k);cx.stroke()}}cx.restore()}
loop();
let ac,nb,amT;const A=()=>{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();nb=ac.createBuffer(1,ac.sampleRate*1.2,ac.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}ac.resume();return ac};
function tone(f,d,v,g){if(!st.snd)return;const c=A(),t=c.currentTime,o=c.createOscillator(),n=c.createGain();o.frequency.setValueAtTime(f,t);if(g)o.frequency.exponentialRampToValueAtTime(g,t+d);n.gain.setValueAtTime(.0001,t);n.gain.exponentialRampToValueAtTime(v,t+.02);n.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(n);n.connect(c.destination);o.start(t);o.stop(t+d+.05)}
function wind(fr,v,d){const c=A(),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=nb;f.type=fr>800?'bandpass':'lowpass';f.frequency.value=fr;g.gain.value=v;s.connect(f);f.connect(g);g.connect(c.destination);s.start();s.stop(c.currentTime+d)}
function amb(){clearInterval(amT);if(!st.snd)return;amT=setInterval(()=>{const p=phase();if(st.wx==='rain')wind(1800,.015,1);else if(st.wx==='snow')wind(260,.009,1.2);else if(p==='night'){tone(4300,.06,.005);setTimeout(()=>tone(4300,.06,.005),130)}else if(Math.random()<.5){const f=2200+Math.random()*900;tone(f,.1,.008,f*1.4);setTimeout(()=>tone(f*1.2,.1,.008,f*.9),140)}},1000)}
function chips(id,list,get,set){const b=$(id);b.innerHTML='';list.forEach(([v,l,k])=>{const e=document.createElement('button');e.type='button';e.className='chip';e.textContent=l;if(k)e.dataset.k=k;e.onclick=()=>set(v,e);b.appendChild(e)});const sync=()=>b.querySelectorAll('.chip').forEach((e,i)=>e.setAttribute('aria-pressed',list[i][0]===get()));b.sync=sync;sync()}
const rs=()=>$$('#rooms,#times,#wxs,#seas').forEach(b=>b.sync());
const ACTION_LIST=[['hug','🫂','Hug'],['kiss','💋','Kiss'],['flykiss','😘','Flying kiss'],['slap','🖐️','Playful slap'],['hands','🤝','Hold hands'],['dance','💃','Dance'],['pet','🐾','Pet'],['tummy','🫳','Scratch tummy'],['feed','🍓','Feed'],['sleep','🌙','Sleep'],['idle','🌸','Relax']];
const ACTION_MAP=Object.fromEntries(ACTION_LIST.map(a=>[a[0],a]));
$('#acts').innerHTML=ACTION_LIST.map(([a,i,l])=>`<button type="button" class="act" data-a="${a}" aria-pressed="false"><span aria-hidden="true">${i}</span>${l}</button>`).join('');
$('#acts').onclick=e=>{const b=e.target.closest('[data-a]');if(b)triggerBearAction(b.dataset.a)};
const addP=n=>{st.petals+=n;carePaint()};
function tasks(){$('#tasks').innerHTML=TK.map(([k,l,n])=>`<div class="tk${st.tasks[k]>=n?' ok':''}"><span>${st.tasks[k]>=n?'✅':'⬜'} ${l}</span><b>${Math.min(st.tasks[k],n)}/${n}</b></div>`).join('');const d=TK.filter(([k,,n])=>st.tasks[k]>=n).length;$('#pg').style.width=d/TK.length*100+'%';$('#pgt').textContent=d+'/'+TK.length;save()}
function tick(k){const n=TK.find(x=>x[0]===k)[2];if(st.tasks[k]>=n)return;st.tasks[k]++;if(st.tasks[k]>=n){addP(3);pop('Task done! +3 🌸',300,175)}if(TK.every(([a,,m])=>st.tasks[a]>=m)&&!st.bonus){st.bonus=1;addP(10);setTimeout(()=>pop('All done today! +10 🌸 ✨',300,140),900)}tasks()}
function goRoom(r){const b=$('#bg');b.style.transition='opacity .25s';b.style.opacity=0;setTimeout(()=>{st.room=r;build();auto();rs();b.style.opacity=1;pop(RN[r],300,150)},260)}
function feedBunny(){if(asleep){pop('shh, bunny is sleeping 💤',bx,by-60);return}const c=$('#crt'),b=$('#bun');if(!c||b.classList.contains('nib'))return;c.style.display='';b.classList.add('nib');tone(300,.05,.03,200);setTimeout(()=>{c.style.display='none';b.classList.remove('nib');pop('♥',bx,by-60);hop();tick('feed')},2800)}
function openGift(){const t=st.gift;if(!t)return;st.gift=null;const g=$('#gift');g&&g.remove();[0,1,2].forEach(i=>setTimeout(()=>pop('💖',270+i*30,330),i*160));pop({rose:'🌹 A rose for you!',berries:'🍓 Fresh berries!',note:'💌 Thinking of you'}[t],300,300);addP(2);tick('open')}
const ROOMS=['living','kitchen','bedroom','balcony','garden'],RN={living:'🛋️ Living room',kitchen:'🍪 Kitchen',bedroom:'🛏️ Bedroom',balcony:'🌙 Balcony',garden:'🌷 Garden'},WN={clear:'☀️ Clear skies',rain:'🌧️ Rain',snow:'❄️ Snow'};let roomT,wxT,timeT;
function startRoomTimer(){clearInterval(roomT);roomT=setInterval(()=>goRoom(ROOMS[(ROOMS.indexOf(st.room)+1)%ROOMS.length]),6*60e3)}
function pickWx(init){const s=seasonOf(),pool=[['clear',5],['rain',s==='winter'?1:3]];if(s==='winter')pool.push(['snow',4]);const p=init?pool:pool.filter(x=>x[0]!==st.wx);let r=Math.random()*p.reduce((a,x)=>a+x[1],0);for(const x of p){if((r-=x[1])<0)return x[0]}return p[0][0]}
function startWxTimer(){clearInterval(wxT);wxT=setInterval(()=>{st.wx=pickWx();env();pop(WN[st.wx],300,150)},3*60e3)}
function startTimeTimer(){clearInterval(timeT);timeT=setInterval(()=>{timeCycle=TIME_SEQ[(TIME_SEQ.indexOf(timeCycle)+1)%TIME_SEQ.length];env();auto();pop(({morning:'🌅 Morning',afternoon:'☀️ Afternoon',evening:'🌇 Evening',night:'🌙 Night'})[timeCycle],300,150)},4*60e3)}
$('#fg').innerHTML=bunnySvg();engine=createBearPoseEngine($('#bsvg'));
$('#bsvg').onclick=e=>{const g=e.target.closest('g[id^="s"]');if(!g||!/^s[01]$/.test(g.id))return;triggerBearAction(['pet','hug','tummy','dance','kiss'][Math.floor(Math.random()*5)],{by:+g.id[1]})};st.snd=localStorage.getItem(bearSoundStorageKey)==='on';engine.setSound(st.snd);
for(const n of[...$('#bsvg').children]){if(n.id==='bears')break;if(n.tagName!=='defs'&&n.id!=='pil')n.remove()}
window.__t=(r,t,w)=>{st.room=r;st.time=t;st.wx=w;build();auto();rs()};window.__e=a=>engine.play(a,0);window.__tap=i=>{tapPlot(i)};
const TREAS=['Cloverlight Meadow','Moonpetal Pond','Starberry Grove','Honeydew Hill','Rainbow Orchard'];
function save(){try{localStorage.setItem('bf-home-v2',JSON.stringify({petals:st.petals,day:new Date().toDateString(),tasks:st.tasks,bonus:st.bonus}))}catch{}}
function loadSave(){try{const sv=JSON.parse(localStorage.getItem('bf-home-v2')||'{}');st.petals=sv.petals||0;if(sv.day===new Date().toDateString()){Object.assign(st.tasks,sv.tasks||{});st.bonus=sv.bonus||0}}catch{}}
function carePaint(){const p=st.petals;const gardenPetals=$('#bfGardenPetals');if(gardenPetals)gardenPetals.textContent=p.toLocaleString();save()}
const seen=[0,1,2,3].map(()=>({s:-1,t:Date.now()}));
setInterval(()=>{const n=Date.now(),f=(st.wx==='rain'?.5:1)*(seasonOf()==='winter'?1.5:1);for(let i=0;i<4;i++){const s=st.plots[i],q=seen[i];if(q.s!==s){q.s=s;q.t=n;continue}if(s===4)continue;if(n-q.t>(s===0?7000:16000)*f){if(s===0){st.plots[i]=1;st.rare[i]=0}else{st.plots[i]=s+1;if(s+1===4)st.rare[i]=Math.random()<.25?1:0}plot(i)}}},1000);
let lastPh=phase();setInterval(()=>{const p=phase();if(p!==lastPh){lastPh=p;auto()}env()},30000);
let swp=null;$('#scene').addEventListener('pointerdown',e=>{if(e.target.closest('#bun'))return;swp={x:e.clientX,y:e.clientY}});
addEventListener('pointerup',e=>{if(!swp)return;const dx=e.clientX-swp.x,dy=e.clientY-swp.y;swp=null;if(Math.abs(dx)>60&&Math.abs(dy)<45){goRoom(ROOMS[(ROOMS.indexOf(st.room)+(dx<0?1:ROOMS.length-1))%ROOMS.length]);startRoomTimer()}});
setInterval(()=>{sOff++;st.wx=pickWx(true);build();auto();pop(SN[seasonOf()],300,150)},6*60e3);

const roomNavHandler=event=>{
  const button=event.target.closest?.('[data-bf-room]');
  if(!button||!ROOMS.includes(button.dataset.bfRoom))return;
  goRoom(button.dataset.bfRoom);
  startRoomTimer();
};
root.addEventListener('click',roomNavHandler);
const soundButton=$('#bfSoundToggle');
const soundHandler=event=>{
  if(!event.target.closest?.('#bfSoundToggle'))return;
  st.snd=!st.snd;
  try{localStorage.setItem(bearSoundStorageKey,st.snd?'on':'off')}catch{}
  engine.setSound(st.snd);
  soundButton.setAttribute('aria-pressed',String(st.snd));
  soundButton.textContent=st.snd?'♫ Sound on':'♫ Sound off';
};
root.addEventListener('click',soundHandler);
const syncSoundButton=()=>{if(soundButton){soundButton.setAttribute('aria-pressed',String(st.snd));soundButton.textContent=st.snd?'♫ Sound on':'♫ Sound off'}};
loadSave();st.wx=pickWx(true);build();auto();startRoomTimer();startWxTimer();startTimeTimer();tasks();carePaint();updateBearfriendStatus();syncSoundButton();

function destroyBearfriendWorld(){
  if(destroyed)return;
  destroyed=true;
  try{engine?.destroy?.()}catch{}
  for(const id of intervals)window.clearInterval(id);
  for(const id of timeouts)window.clearTimeout(id);
  for(const id of rafs)window.cancelAnimationFrame(id);
  for(const [type,handler,options] of listeners)window.removeEventListener(type,handler,options);
  root.removeEventListener('click',roomNavHandler);
  root.removeEventListener('click',soundHandler);
  if(window.BearfriendWorld?.root===root)window.BearfriendWorld=null;
  if(root.__bearfriendDestroy===destroyBearfriendWorld)delete root.__bearfriendDestroy;
}
const api={root,play:triggerBearAction,destroy:destroyBearfriendWorld};
root.__bearfriendDestroy=destroyBearfriendWorld;
window.BearfriendWorld=api;
return api;
}

window.renderBearfriendWorldMarkup=()=>"<section id=\"coupleBearGame\" class=\"couple-bear-game bearfriend-native-host\" aria-label=\"Bearfriend\">\n  <div id=\"bearfriendWorld\" class=\"bearfriend-world\">\n    <main class=\"bearfriend-main\"><div class=\"shell\">\n<div class=\"eyebrow\">A LITTLE PLAYTIME</div><h1 class=\"t\">Bearfriend</h1><p class=\"tag\">Choose how our little bears show their love.</p>\n<div class=\"bearfriend-world-status\" aria-live=\"polite\">\n  <span class=\"bf-status-pill\"><i aria-hidden=\"true\">🏡</i><b id=\"bfRoomStatus\">Living room</b></span>\n  <span class=\"bf-status-pill\"><i aria-hidden=\"true\">🌅</i><b id=\"bfTimeStatus\">Morning</b></span>\n  <span class=\"bf-status-pill\"><i aria-hidden=\"true\">☀️</i><b id=\"bfWeatherStatus\">Clear skies</b></span>\n  <span class=\"bf-status-pill bf-petals-pill\"><i aria-hidden=\"true\">🌸</i><b id=\"bfGardenPetals\">0</b><small>garden petals</small></span>\n  <button type=\"button\" class=\"bf-sound-toggle\" id=\"bfSoundToggle\" aria-pressed=\"false\">♫ Sound off</button>\n</div>\n<nav class=\"bearfriend-room-nav\" id=\"bfRoomNav\" aria-label=\"Choose a room\">\n  <button type=\"button\" data-bf-room=\"living\" aria-pressed=\"true\">🛋️ Living</button>\n  <button type=\"button\" data-bf-room=\"kitchen\" aria-pressed=\"false\">🍪 Kitchen</button>\n  <button type=\"button\" data-bf-room=\"bedroom\" aria-pressed=\"false\">🛏️ Bedroom</button>\n  <button type=\"button\" data-bf-room=\"balcony\" aria-pressed=\"false\">🌙 Balcony</button>\n  <button type=\"button\" data-bf-room=\"garden\" aria-pressed=\"false\">🌷 Garden</button>\n</nav>\n<div class=\"scene couple-bears-scene\" id=\"scene\">\n<svg id=\"bg\" viewBox=\"90 120 420 270\" preserveAspectRatio=\"xMidYMid slice\"></svg>\n<svg id=\"bsvg\" viewBox=\"66.667 98 466.667 300\" preserveAspectRatio=\"xMidYMid slice\"></svg>\n<svg id=\"fg\" viewBox=\"90 120 420 270\" preserveAspectRatio=\"xMidYMid slice\"></svg>\n<canvas id=\"wx\"></canvas><div id=\"tint\"></div><div id=\"fx\"></div>\n</div>\n<p class=\"cap\">Two little bears, one big love.</p>\n<div class=\"acts couple-bear-actions\" id=\"acts\"></div>\n\n<div class=\"lbl\">Today together · <span id=\"pgt\">0/5</span></div><div class=\"bar\"><i id=\"pg\"></i></div><div id=\"tasks\"></div>\n<p class=\"s bearfriend-help\">Tap a bear or room detail to discover little interactions. Guide the bunny with touch or keys, or swipe the scene to visit another room. The rooms, weather and time of day keep changing automatically.</p>\n</div></main>\n  </div>\n  <p class=\"couple-bear-status\" id=\"coupleBearStatus\" hidden aria-live=\"polite\">Two little bears, one big love.</p>\n</section>";
window.mountBearfriendWorld=mountBearfriendWorld;
window.destroyBearfriendWorld=()=>{const root=document.getElementById('bearfriendWorld');root?.__bearfriendDestroy?.()};
