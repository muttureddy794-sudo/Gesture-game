/* Input */
addEventListener('keydown',e=>{keys[e.code]=1;if(e.code=='Space')e.preventDefault();if(state=='race'||state=='count'){if(e.code=='KeyC')setCam((camMode+1)%CAMS.length);if(/^Digit[1-7]$/.test(e.code))setCam(+e.code.slice(5)-1);if(e.code=='KeyR'){rainOn=!rainOn;rain.visible=rainOn}}if((e.code=='KeyP'||e.code=='Escape'))togglePause()});
addEventListener('keyup',e=>keys[e.code]=0);
let ks=0;const G={ok:false,t:0,str:0,thr:0,brk:0,nit:0};
function input(dt){
 if(G.ok&&performance.now()-G.t<500)return{str:G.str,thr:G.thr,brk:G.brk,nit:G.nit};
 const t=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);ks+=(t-ks)*Math.min(1,7*dt);
 return{str:ks,thr:keys.ArrowUp||keys.KeyW?1:0,brk:keys.ArrowDown||keys.KeyS?1:0,nit:keys.Space?1:0}}
let hands,busy=false,gStream;
const loadScript=u=>new Promise((a,b)=>{const s=document.createElement('script');s.src=u;s.onload=a;s.onerror=()=>b(new Error('script blocked'));document.head.appendChild(s)});
async function startGesture(){
 const gs=$('#gs');$('#gest').style.display='block';$('#retry').style.display='none';G.ok=false;
 try{
  if(!navigator.mediaDevices)throw new Error('no camera API');
  if(!gStream){gStream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480}})}
  const v=$('#vid');v.srcObject=gStream;await v.play();gs.textContent='Loading hand tracker…';
  if(!window.Hands)await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js');
  hands=new Hands({locateFile:f=>'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/'+f});
  hands.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.6,minTrackingConfidence:.5});hands.onResults(onHand);
  await Promise.race([hands.initialize(),new Promise((_,r)=>setTimeout(()=>r(new Error('tracker timeout')),20000))]);
  G.ok=true;gs.textContent='Show your hand';(async function lp(){if(!hands)return;if(!busy&&v.readyState>1){busy=true;try{await hands.send({image:v})}catch(e){}busy=false}requestAnimationFrame(lp)})();
 }catch(e){gs.textContent=(e&&e.name=='NotAllowedError'?'Camera permission denied':'Hand tracking unavailable')+' — using keyboard';hands=null;$('#retry').style.display='inline-block'}}
function stopGesture(){hands=null;G.ok=false;$('#gest').style.display='none'}
const dist2=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function onHand(r){const c=$('#hc').getContext('2d');c.clearRect(0,0,164,123);const l=r.multiHandLandmarks&&r.multiHandLandmarks[0];if(!l){$('#gs').textContent='No hand detected';return}
 c.fillStyle='#00e5ff';l.forEach(p=>{c.beginPath();c.arc(p.x*164,p.y*123,2.5,0,7);c.fill()});
 const w=l[0],m=l[9],ps=dist2(w,m)||.1,ang=Math.atan2(m.x-w.x,w.y-m.y);
 const raw=cl(-ang/.55,-1,1),dz=Math.abs(raw)<.08?0:raw;G.str+=(dz-G.str)*.5;
 const tips=[8,12,16,20].reduce((s,i)=>s+dist2(l[i],w),0)/4/ps,fist=tips<1.2,pinch=dist2(l[4],l[8])/ps<.35&&!fist;
 const size=dist2(w,l[9]);G.thr=fist?0:cl((size-.1)/.07,.45,1);G.brk=fist?1:0;G.nit=pinch?1:0;G.t=performance.now();
 $('#gs').textContent=fist?'✊ BRAKE':pinch?'🤏 NITRO':'🖐 Drive · steer '+G.str.toFixed(2)}
