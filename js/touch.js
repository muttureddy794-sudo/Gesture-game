/* Touch controls + PWA install button */
const IS_TOUCH_UI=matchMedia('(pointer:coarse)').matches||navigator.maxTouchPoints>0;
if(IS_TOUCH_UI){document.body.classList.add('touch');const tc=$('#tc');
 [['◀','ArrowLeft','l'],['▶','ArrowRight','r'],['GAS','ArrowUp','g'],['BRK','ArrowDown','b'],['N₂O','Space','n']].forEach(([t,k,c])=>{const b=document.createElement('button');b.className='tb '+c;b.textContent=t;
  const on=e=>{e.preventDefault();keys[k]=1;b.classList.add('on')},off=e=>{e.preventDefault();keys[k]=0;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(x=>b.addEventListener(x,off));b.addEventListener('contextmenu',e=>e.preventDefault());tc.appendChild(b)});
 $('.help').innerHTML='<b>Touch:</b> ◀ ▶ steer, GAS / BRK / N₂O buttons. Hand gestures use the front camera.'}
let deferredInstall;addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#inst').style.display='inline-block'});
$('#inst').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();deferredInstall=null;$('#inst').style.display='none'}};
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
document.addEventListener('contextmenu',e=>{if(IS_TOUCH_UI)e.preventDefault()});

$('#mpb').onclick=openMP;
