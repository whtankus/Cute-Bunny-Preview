import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mounted = new WeakSet();
const mat = (color, roughness=.8) => new THREE.MeshStandardMaterial({color,roughness});
function orb(parent, material, pos, scale) {
  const m=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),material);
  m.position.set(...pos); m.scale.set(...scale); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function buildBunny(scene) {
  const fur=mat("#fffafd"), shade=mat("#eee5f2"), pink=mat("#efb9d0"), nose=mat("#d98eae",.4);
  const eyeMat=new THREE.MeshPhysicalMaterial({color:"#292432",roughness:.12,clearcoat:1});
  const white=new THREE.MeshBasicMaterial({color:"#fff"});
  const body=new THREE.Group(); scene.add(body);
  orb(body,shade,[0,-.52,-.04],[.78,.79,.63]); orb(body,fur,[0,-.48,.02],[.76,.77,.64]);
  orb(body,fur,[0,-.55,.57],[.46,.5,.15]); orb(body,fur,[.72,-.42,-.04],[.23,.23,.23]);
  for(const s of [-1,1]) {
    const foot=orb(body,fur,[s*.43,-1.1,.34],[.37,.23,.47]); foot.rotation.x=-.12;
    orb(body,pink,[s*.43,-1.22,.73],[.15,.06,.1]);
    const arm=orb(body,fur,[s*.54,-.43,.48],[.22,.42,.24]); arm.rotation.z=-s*.48;
    orb(body,fur,[s*.49,-.69,.63],[.19,.19,.18]);
  }
  const head=new THREE.Group(); head.position.set(0,.47,.16); body.add(head);
  orb(head,shade,[0,0,-.035],[.82,.76,.69]); orb(head,fur,[0,.025,.015],[.81,.76,.7]);
  const eyes=[];
  for(const s of [-1,1]) {
    orb(head,pink,[s*.48,-.2,.58],[.18,.11,.05]);
    const eye=new THREE.Group(); eye.position.set(s*.29,.13,.65); head.add(eye);
    orb(eye,eyeMat,[0,0,0],[.073,.105,.045]); orb(eye,white,[-.02,.04,.04],[.022,.027,.012]); eyes.push(eye);
  }
  orb(head,nose,[0,-.13,.73],[.08,.06,.05]);
  const mouthMat=mat("#a77a91");
  for(const s of [-1,1]) {
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.18,.755),new THREE.Vector3(s*.035,-.23,.76),new THREE.Vector3(s*.09,-.205,.75)]);
    head.add(new THREE.Mesh(new THREE.TubeGeometry(curve,12,.012,6,false),mouthMat));
  }
  const ears=[];
  for(const s of [-1,1]) {
    const ear=new THREE.Group(); ear.position.set(s*.35,.61,-.05); ear.rotation.z=-s*.16; head.add(ear);
    orb(ear,shade,[0,.55,-.06],[.245,.78,.18]); orb(ear,fur,[0,.57,-.005],[.225,.75,.17]); orb(ear,pink,[0,.58,.145],[.115,.57,.035]); ears.push(ear);
  }
  const carrot=new THREE.Group();
  const carrotBody=new THREE.Mesh(new THREE.ConeGeometry(.13,.62,24),mat("#f39a52",.55));
  carrotBody.rotation.z=-Math.PI/2.8; carrotBody.position.set(.02,-.12,.02); carrot.add(carrotBody);
  for(let i=0;i<3;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.045,.24,8),mat("#91b987"));leaf.position.set(-.18,.12+i*.045,0);leaf.rotation.z=-.8+i*.6;carrot.add(leaf);}
  carrot.position.set(.55,-.62,.9); carrot.visible=false; body.add(carrot);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.2,24,18),mat("#cbb9ed",.35)); ball.position.set(-1.15,-1.04,.4); body.add(ball);
  return {body,head,ears,eyes,carrot,ball};
}
function mount(host) {
  if(mounted.has(host)) return; mounted.add(host);
  const canvas=document.createElement("canvas"); canvas.className="sg-bunny-three-canvas";
  canvas.setAttribute("role","img"); canvas.setAttribute("aria-label","A softly animated three-dimensional white bunny"); host.replaceChildren(canvas);
  let renderer;
  try { renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"}); }
  catch(error){host.dataset.webgl="unavailable";host.innerHTML='<div class="sg-bunny-fallback" role="img" aria-label="Little bunny">🐰</div>';return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7)); renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(34,1,.1,40);
  camera.position.set(0,1.12,5.4); camera.lookAt(0,.08,0);
  scene.add(new THREE.HemisphereLight("#fff8ff","#d8c7e6",2.15));
  const key=new THREE.DirectionalLight("#fff4e9",3.2); key.position.set(-3,5,5); key.castShadow=true; scene.add(key);
  const rim=new THREE.DirectionalLight("#c7c5ff",1.5); rim.position.set(4,2,-3); scene.add(rim);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(2.1,64),new THREE.MeshBasicMaterial({color:"#e9dff5",transparent:true,opacity:.48}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-1.34; scene.add(ground);
  const bunny=buildBunny(scene), clock=new THREE.Clock(), pointer=new THREE.Vector2();
  let action=host.dataset.action||"", actionAt=performance.now();
  const resize=()=>{const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.position.z=r.width<420?6.1:5.4;camera.updateProjectionMatrix();};
  const sizeObserver=new ResizeObserver(resize); sizeObserver.observe(host); resize();
  canvas.addEventListener("pointermove",e=>{const r=canvas.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width-.5)*2;pointer.y=((e.clientY-r.top)/r.height-.5)*2;},{passive:true});
  canvas.addEventListener("pointerdown",()=>{host.dataset.action="cuddle";},{passive:true});
  const tick=()=>{
    if(!host.isConnected){sizeObserver.disconnect();renderer.dispose();return;}
    requestAnimationFrame(tick);
    const t=clock.getElapsedTime(), elapsed=(performance.now()-actionAt)/1000, next=host.dataset.action||"";
    if(next!==action){action=next;actionAt=performance.now();}
    const playful=action==="play"&&elapsed<2.2, cuddly=action==="cuddle"&&elapsed<1.8, feeding=action==="feed"&&elapsed<2.1;
    bunny.body.position.y=(reducedMotion?0:Math.sin(t*1.8)*.045)+(playful?Math.abs(Math.sin(elapsed*7))*.28:0);
    bunny.body.rotation.z=playful?Math.sin(elapsed*8)*.12:Math.sin(t*.8)*.018;
    bunny.head.rotation.y=THREE.MathUtils.lerp(bunny.head.rotation.y,pointer.x*.18,.055);
    bunny.head.rotation.x=THREE.MathUtils.lerp(bunny.head.rotation.x,-pointer.y*.08+(cuddly?-.12:0),.055);
    bunny.ears[0].rotation.z=-.16+Math.sin(t*1.25)*.035+(playful?Math.sin(elapsed*10)*.28:0);
    bunny.ears[1].rotation.z=.16+Math.sin(t*1.4+1)*.04+(playful?-Math.sin(elapsed*10)*.28:0);
    bunny.carrot.visible=feeding;
    if(feeding)bunny.head.rotation.x-=Math.sin(elapsed*18)*.055;
    bunny.ball.position.x=-1.15+(playful?Math.sin(elapsed*5)*.55:0);
    bunny.ball.position.y=-1.04+(playful?Math.abs(Math.sin(elapsed*5))*.28:0);
    const blink=Math.max(0,1-Math.abs(((t+1.7)%4.6)-4.35)/.12);
    for(const eye of bunny.eyes)eye.scale.y=Math.max(.08,1-blink*.92);
    renderer.render(scene,camera);
  }; tick();
}
const scan=()=>document.querySelectorAll("#virtualBuddy3D").forEach(mount);
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true}); scan();
