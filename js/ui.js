/* Overlay / menus */
function ov(show,t,b,btns){const e=$('#ov');e.style.display=show?'flex':'none';if(!show)return;$('#ovT').textContent=t;$('#ovB').innerHTML=b;const r=$('#ovR');r.innerHTML='';btns.forEach(([l,f])=>{const x=document.createElement('button');x.className='btn';x.textContent=l;x.onclick=f;r.appendChild(x)})}
function togglePause(){audioUpd(0,0,false);if(state=='pause'){state=pausedFrom;ov(0)}else if(state=='race'||state=='count'){pausedFrom=state;state='pause';ov(1,'PAUSED','Rain: '+(rainOn?'on':'off')+' · camera: C',[['Resume',togglePause],['Toggle Rain',()=>{rainOn=!rainOn;rain.visible=rainOn}],['Main Menu',toMenu]])}}
let pausedFrom='race';
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state=='race'||state=='count'))togglePause()});
function showResults(){if(state=='results')return;state='results';const rk=ranking(),D=DIFFS[sel.diff];
 const rows=rk.map((c,i)=>'<tr'+(c===P?' style="color:var(--ac)"':'')+'><td>'+(i+1)+'</td><td>'+c.name+'</td><td>'+(c.fin?fmt(c.ft):'DNF')+'</td></tr>').join('');
 const pl=rk.indexOf(P)+1;ov(1,pl==1?'VICTORY!':'P'+pl+' FINISH','<table>'+rows+'</table>Best lap '+(P.laps.length?fmt(Math.min(...P.laps)):'--'),NET.room?[['Back to Lobby',()=>{toMenu();openMP()}],['Main Menu',toMenu]]:[['Race Again',startRace],['Main Menu',toMenu]])}
function toMenu(){ov(0);state='menu';$('#hud').style.display='none';$('#menu').style.display='flex';$('#cd').textContent='';if(P)P.m.visible=true;audioUpd(1000,0,false);stopGesture();loadStage()}
function opts(id,list,key,cb){const e=$(id);list.forEach((n,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=n;b.onclick=()=>{sel[key]=key=='ctl'?['gesture','keys'][i]:i;[...e.children].forEach(x=>x.classList.remove('sel'));b.classList.add('sel');if(cb)cb()};e.appendChild(b);if((key=='ctl'?['gesture','keys'][i]:i)===sel[key])b.classList.add('sel')})}
opts('#stg',STAGES.map(s=>s.n),'stage',()=>loadStage());opts('#dif',DIFFS.map(d=>d.n),'diff',()=>loadStage());opts('#ctl',['✋ Hand Gestures (webcam)','⌨ Keyboard'],'ctl');
$('#go').onclick=()=>{audioInit();startRace()};

$('#retry').onclick=startGesture;
CAMS.forEach((n,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=(i+1)+' '+n;b.tabIndex=-1;b.onmousedown=e=>e.preventDefault();b.onclick=()=>setCam(i);$('#camb').appendChild(b)});

document.addEventListener('click',e=>{if(e.target.closest('.btn'))sfx.click()});
addEventListener('pointerdown',()=>{audioInit();if(AC&&AC.state=='suspended')AC.resume()});
