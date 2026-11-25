/* Multiplayer client: auth, rooms, invites, live sync */
const API=(window.GR_SERVER||'').replace(/\/$/,''),h=(t,p,...c)=>{const e=document.createElement(t);Object.assign(e,p||{});c.flat().forEach(x=>x!=null&&e.append(x));return e};
const NET={tok:localStorage.getItem('gr_tok'),me:null,room:null,off:0,remotes:{},ws:null,invites:[],msg:'',lb:[],acc:0,
 async api(p,o={}){let r;try{r=await fetch(API+p,{...o,headers:{'Content-Type':'application/json',...(NET.tok?{Authorization:'Bearer '+NET.tok}:{})}})}catch{throw new Error('Multiplayer server not reachable')}
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Multiplayer server not reachable');return j},
 send(o){if(NET.ws&&NET.ws.readyState==1)NET.ws.send(JSON.stringify(o))},
 connect(){if(NET.ws||!NET.tok)return;const ws=NET.ws=new WebSocket((API||location.origin).replace(/^http/,'ws')+'/ws');
  ws.onopen=()=>{NET.send({t:'auth',token:NET.tok});NET.ping()};ws.onclose=()=>{NET.ws=null;NET.room=null;if(NET.tok)setTimeout(NET.connect,3000);drawMP()};
  ws.onmessage=e=>{const m=JSON.parse(e.data);NET.on(m);drawMP()}},
 ping(){NET.send({t:'ping',c:performance.now()});clearTimeout(NET.pt);NET.pt=setTimeout(NET.ping,8000)},
 on(m){switch(m.t){
  case'hello':NET.me=m.me;break;
  case'pong':{const rtt=performance.now()-m.c;NET.off=m.now+rtt/2-Date.now();break}
  case'room':NET.room=m.room;if(m.room&&state=='menu'&&!m.room.started){sel.stage=m.room.stage;sel.diff=m.room.diff}break;
  case'invite':NET.invites.push(m);sfx.lap();break;
  case'err':NET.msg=m.e;if(m.auth)NET.logout();break;case'info':NET.msg=m.e;break;
  case'start':NET.room.started=true;NET.remotes={};sel.stage=m.stage;sel.diff=m.diff;$('#mp').style.display='none';startRace(m);break;
  case's':NET.remotes[m.u]={d:m.d,x:m.x,v:m.v,sl:m.sl,t:performance.now()};break;
  case'fin':{const c=cars.find(c=>c.uid==m.u);if(c){c.fin=true;c.ft=m.time}break}
  case'left':{const c=cars.find(c=>c.uid==m.u);if(c){c.fin=true;c.ft=1e6;c.gone=true;c.m.visible=false}break}}},
 logout(){localStorage.removeItem('gr_tok');NET.tok=null;NET.me=null;NET.room=null;if(NET.ws)NET.ws.close()},
 async auth(kind,name,password){try{const r=await NET.api('/api/'+kind,{method:'POST',body:JSON.stringify({name,password})});NET.tok=r.token;localStorage.setItem('gr_tok',r.token);NET.me=r.me;NET.msg='';NET.connect()}catch(e){NET.msg=e.message}drawMP()}};
function netApply(c,dt){const t=NET.remotes[c.uid];if(!t||c.gone)return;const age=Math.min(.3,(performance.now()-t.t)/1000),k=Math.min(1,10*dt);c.dist+=(t.d+t.v*age-c.dist)*k;c.x+=(t.x-c.x)*k;c.v=t.v;c.slip=t.sl;c.rpm=1000+t.v*70;c.str=0}
function netTick(dt){if(!NET.room||!P)return;NET.acc+=dt;if(NET.acc>.066){NET.acc=0;NET.send({t:'s',d:P.dist,x:P.x,v:P.v,sl:P.slip})}}
function openMP(){$('#mp').style.display='flex';NET.api('/api/leaderboard').then(r=>{NET.lb=r.list;drawMP()}).catch(()=>{});if(NET.tok&&!NET.me)NET.api('/api/me').then(r=>{NET.me=r.me;NET.connect();drawMP()}).catch(()=>NET.logout());NET.connect();drawMP()}
function drawMP(){const e=$('#mp');if(e.style.display!='flex')return;e.innerHTML='';const box=h('div',{className:'p mpbox'});e.append(box);
 const btn=(t,f,c)=>h('button',{className:'btn'+(c?' sel':''),textContent:t,onclick:f}),inp=(ph,type,id)=>h('input',{placeholder:ph,type:type||'text',id,className:'inp',autocomplete:'off',maxLength:type=='password'?64:16});
 box.append(h('h2',{textContent:'🌐 MULTIPLAYER'}));if(NET.msg)box.append(h('div',{className:'warn',textContent:NET.msg}));
 if(!NET.me){box.append(h('div',{textContent:'Sign in to race friends. Passwords are hashed on the server.'}),inp('Username','text','mpn'),inp('Password (6+)','password','mpp'),
  h('div',{className:'row'},btn('Sign in',()=>NET.auth('login',$('#mpn').value,$('#mpp').value),1),btn('Create account',()=>NET.auth('register',$('#mpn').value,$('#mpp').value))))}
 else{const m=NET.me,r=NET.room;box.append(h('div',{className:'prof'},h('b',{textContent:m.name}),' · ID ',h('b',{textContent:m.uid,className:'uid'}),h('br'),h('small',{textContent:`Races ${m.races} · Wins ${m.wins} · Best ${m.best?fmt(m.best):'--'}`})));
  NET.invites.forEach((iv,i)=>box.append(h('div',{className:'row'},h('span',{textContent:iv.from.name+' invited you'}),btn('Join',()=>{NET.send({t:'join',code:iv.code});NET.invites.splice(i,1);drawMP()},1),btn('✕',()=>{NET.invites.splice(i,1);drawMP()}))));
  if(!r){box.append(h('div',{className:'row'},btn('Create room ('+STAGES[sel.stage].n+' · '+DIFFS[sel.diff].n+')',()=>NET.send({t:'create',stage:sel.stage,diff:sel.diff}),1)),h('div',{className:'row'},inp('Room code','text','mpc'),btn('Join',()=>NET.send({t:'join',code:$('#mpc').value}))))}
  else{const host=r.host==m.uid;box.append(h('div',{className:'prof'},'Room ',h('b',{textContent:r.code,className:'uid'}),' · '+STAGES[r.stage].n+' · '+DIFFS[r.diff].n),h('div',{innerHTML:''},r.players.map(p=>h('div',{textContent:(p.uid==r.host?'👑 ':'🏎 ')+p.name+' ('+p.uid+')'}))),
   h('div',{className:'row'},inp('Friend ID e.g. RC12AB3','text','mpi'),btn('Invite',()=>NET.send({t:'invite',to:$('#mpi').value}))),
   h('div',{className:'row'},host?btn('▶ START RACE',()=>NET.send({t:'start'}),1):h('span',{textContent:'Waiting for host…'}),btn('Leave',()=>NET.send({t:'leave'}))));
   if(host)box.append(h('small',{textContent:'Host: change stage/difficulty in the main menu, then press Update.'}),btn('Update room settings',()=>NET.send({t:'config',stage:sel.stage,diff:sel.diff})))}}
 if(NET.lb.length)box.append(h('h3',{textContent:'🏆 LEADERBOARD'}),h('table',{},NET.lb.slice(0,8).map((p,i)=>h('tr',{},h('td',{textContent:i+1}),h('td',{textContent:p.name}),h('td',{textContent:p.wins+' wins'}),h('td',{textContent:p.best?fmt(p.best):'--'})))));
 box.append(h('div',{className:'row'},NET.me?btn('Sign out',()=>{NET.logout();drawMP()}):null,btn('Close',()=>{e.style.display='none'})))}
