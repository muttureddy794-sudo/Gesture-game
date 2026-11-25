// End-to-end multiplayer test: node server/test.js
const server=require('./server.js');const assert=require('assert');
const log=(...a)=>console.log(...a),wait=ms=>new Promise(r=>setTimeout(r,ms));
server.listen(0,async()=>{
 const B='http://localhost:'+server.address().port,tag=Math.random().toString(36).slice(2,6);
 const api=async(p,o)=>{const r=await fetch(B+p,o);return{s:r.status,j:await r.json()}};
 const post=(p,b)=>api(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
 const mk=async n=>{const r=await post('/api/register',{name:n,password:'secret12'});assert(r.s==200,'register '+n);const ws=new WebSocket(B.replace('http','ws')+'/ws'),inbox=[];ws.onmessage=e=>inbox.push(JSON.parse(e.data));await new Promise(r=>ws.onopen=r);ws.send(JSON.stringify({t:'auth',token:r.j.token}));await wait(100);return{ws,inbox,me:r.j.me,tok:r.j.token,send:o=>ws.send(JSON.stringify(o)),got:t=>inbox.filter(m=>m.t==t).pop()}};
 const A=await mk('Ann'+tag),Bo=await mk('Bob'+tag);log('1. Registered:',A.me.name,A.me.uid,'| ',Bo.me.name,Bo.me.uid);
 assert((await post('/api/login',{name:A.me.name,password:'wrong!!'})).s==401);log('2. Wrong password rejected (401)');
 assert((await post('/api/register',{name:'x',password:'1'})).s==400);log('3. Invalid sign-up rejected (400)');
 A.send({t:'create',stage:3,diff:2});await wait(100);const code=A.got('room').room.code;log('4. Ann created room',code,'(Neon Circuit, Hard)');
 A.send({t:'invite',to:Bo.me.uid});await wait(100);const inv=Bo.got('invite');assert(inv&&inv.code==code);log('5. Bob received invite from',inv.from.name,'-> code',inv.code);
 Bo.send({t:'join',code:inv.code});await wait(100);log('6. Room now has',A.got('room').room.players.map(p=>p.name).join(', '));
 Bo.send({t:'start'});await wait(80);assert(!A.got('start'));log('7. Non-host start ignored');
 A.send({t:'start'});await wait(100);const st=A.got('start'),st2=Bo.got('start');assert(st&&st2&&st.at==st2.at);log('8. Synchronised start: both got at=',st.at,'(',st.at-st.now,'ms from now), stage',st.stage,'diff',st.diff);
 A.send({t:'s',d:120,x:2,v:60,sl:.1});await wait(80);const rs=Bo.got('s');assert(rs&&rs.u==A.me.uid&&rs.d==120);log('9. Live position relay: Bob sees Ann at',rs.d,'m, speed',rs.v);
 A.send({t:'fin',time:95.2});Bo.send({t:'fin',time:101.7});await wait(150);
 const me=(await api('/api/me',{headers:{Authorization:'Bearer '+A.tok}})).j.me;assert(me.wins==1&&me.races==1&&me.best==95.2);log('10. Ann profile:',JSON.stringify(me));
 const lb=(await api('/api/leaderboard')).j.list;log('11. Leaderboard top:',lb.slice(0,2).map(p=>p.name+' wins='+p.wins+' best='+p.best).join(' | '));
 assert((await api('/api/me',{headers:{Authorization:'Bearer bad.token'}})).s==401);log('12. Forged token rejected (401)');
 assert((await api('/server/server.js')).s==404);log('13. Server source not exposed (404)');
 log('\nALL TESTS PASSED');process.exit(0)});
