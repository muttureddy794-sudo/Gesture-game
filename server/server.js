'use strict';
// Gesture Racer server: static files + auth API + dependency-free WebSocket rooms.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=+process.env.PORT||3000,ROOT=path.join(__dirname,'..'),DIR=process.env.DATA_DIR||path.join(__dirname,'data'),DBF=path.join(DIR,'db.json');
fs.mkdirSync(DIR,{recursive:true});
let db={users:{},secret:crypto.randomBytes(32).toString('hex')};
try{db=Object.assign(db,JSON.parse(fs.readFileSync(DBF,'utf8')))}catch{} // existing data is kept
let tm;const save=()=>{clearTimeout(tm);tm=setTimeout(()=>fs.writeFile(DBF,JSON.stringify(db),()=>{}),200)};save();
const pub=u=>({uid:u.uid,name:u.name,races:u.races,wins:u.wins,best:u.best});
const hash=(pw,salt)=>crypto.scryptSync(pw,salt,32).toString('hex');
const sign=id=>{const p=Buffer.from(JSON.stringify({u:id,e:Date.now()+7*864e5})).toString('base64url');return p+'.'+crypto.createHmac('sha256',db.secret).update(p).digest('base64url')};
const verify=t=>{try{const[p,s]=t.split('.'),h=crypto.createHmac('sha256',db.secret).update(p).digest('base64url');if(s.length!==h.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(h)))return;const d=JSON.parse(Buffer.from(p,'base64url'));return d.e>Date.now()?d.u:null}catch{}};
const newUid=()=>{let s;do{s='RC'+crypto.randomBytes(4).toString('hex').slice(0,5).toUpperCase()}while(db.users[s]);return s};
const hits={};const limited=ip=>{const n=Date.now(),a=hits[ip]=(hits[ip]||[]).filter(t=>n-t<6e4);a.push(n);return a.length>15};
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'};
const json=(res,code,o)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const body=req=>new Promise(r=>{let s='';req.on('data',d=>{s+=d;if(s.length>2048)req.destroy()});req.on('end',()=>{try{r(JSON.parse(s))}catch{r({})}})});
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Permissions-Policy','camera=(self)');
 const url=new URL(req.url,'http://x'),p=url.pathname;
 if(p.startsWith('/api/')){
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method=='OPTIONS'){res.writeHead(204);return res.end()}
  const ip=req.socket.remoteAddress;
  if(req.method=='POST'&&(p=='/api/register'||p=='/api/login')){
   if(limited(ip))return json(res,429,{error:'Too many attempts, wait a minute'});
   const b=await body(req),name=String(b.name||''),pw=String(b.password||'');
   if(!/^[A-Za-z0-9_]{3,16}$/.test(name)||pw.length<6||pw.length>64)return json(res,400,{error:'Name: 3-16 letters/numbers/_ · Password: 6-64 chars'});
   const ex=Object.values(db.users).find(u=>u.name.toLowerCase()==name.toLowerCase());
   if(p=='/api/register'){if(ex)return json(res,409,{error:'Name already taken'});const salt=crypto.randomBytes(16).toString('hex'),u={uid:newUid(),name,salt,hash:hash(pw,salt),races:0,wins:0,best:null,created:Date.now()};db.users[u.uid]=u;save();return json(res,200,{token:sign(u.uid),me:pub(u)})}
   if(!ex||!crypto.timingSafeEqual(Buffer.from(hash(pw,ex.salt)),Buffer.from(ex.hash)))return json(res,401,{error:'Wrong name or password'});
   return json(res,200,{token:sign(ex.uid),me:pub(ex)})}
  if(p=='/api/me'){const id=verify((req.headers.authorization||'').slice(7)),u=id&&db.users[id];return u?json(res,200,{me:pub(u)}):json(res,401,{error:'Not signed in'})}
  if(p=='/api/leaderboard'){const l=Object.values(db.users).sort((a,b)=>b.wins-a.wins||(a.best??1e9)-(b.best??1e9)).slice(0,20).map(pub);return json(res,200,{list:l})}
  return json(res,404,{error:'Not found'})}
 let f=path.normalize(decodeURIComponent(p));if(f=='/'||f=='\\')f='/index.html';
 if(/^[\\/](server|data|node_modules|\.git|\.github)/.test(f)||f.includes('..'))return json(res,404,{error:'Not found'});
 const fp=path.join(ROOT,f);if(!fp.startsWith(ROOT))return json(res,404,{error:'Not found'});
 fs.readFile(fp,(e,d)=>{if(e)return json(res,404,{error:'Not found'});res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream','Cache-Control':f=='/sw.js'?'no-cache':'public,max-age=300'});res.end(d)})});
/* ---- WebSocket (RFC 6455, text frames) ---- */
function frame(d,op=1){const p=Buffer.isBuffer(d)?d:Buffer.from(d),l=p.length;return Buffer.concat([l<126?Buffer.from([128|op,l]):Buffer.from([128|op,126,l>>8,l&255]),p])}
function parse(c){const b=c.buf;if(b.length<2)return;const op=b[0]&15;let len=b[1]&127,o=2;if(len==126){if(b.length<4)return;len=b.readUInt16BE(2);o=4}else if(len==127||!(b[1]&128)){c.sock.destroy();return}
 if(b.length<o+4+len)return;const m=b.slice(o,o+4),d=Buffer.from(b.slice(o+4,o+4+len));for(let i=0;i<len;i++)d[i]^=m[i&3];c.buf=b.slice(o+4+len);return{op,data:d}}
const tx=(c,o)=>{if(c&&!c.sock.destroyed)c.sock.write(frame(JSON.stringify(o)))};
const clients=new Map(),rooms={};
server.on('upgrade',(req,sock)=>{
 if(req.url!='/ws'||!/websocket/i.test(req.headers.upgrade||''))return sock.destroy();
 sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64')+'\r\n\r\n');
 const c={sock,uid:null,buf:Buffer.alloc(0),room:null,n:0,t:Date.now()};
 sock.on('data',d=>{c.buf=Buffer.concat([c.buf,d]);if(c.buf.length>65536)return sock.destroy();let f;while(!sock.destroyed&&(f=parse(c))){if(f.op==8)return sock.end();if(f.op==9)sock.write(frame(f.data,10));else if(f.op==1)onMsg(c,f.data.toString())}});
 sock.on('close',()=>{leave(c);if(clients.get(c.uid)===c)clients.delete(c.uid)});sock.on('error',()=>{})});
const room=r=>({code:r.code,host:r.host,stage:r.stage,diff:r.diff,started:r.started,players:r.members.map(id=>({uid:id,name:db.users[id].name}))});
const bcast=(r,o,except)=>r.members.forEach(id=>id!==except&&tx(clients.get(id),o));
function leave(c){const r=c.room;if(!r)return;r.members=r.members.filter(x=>x!=c.uid);c.room=null;bcast(r,{t:'left',u:c.uid});if(!r.members.length)delete rooms[r.code];else{if(r.host==c.uid)r.host=r.members[0];bcast(r,{t:'room',room:room(r)})}tx(c,{t:'room',room:null})}
function onMsg(c,s){
 if(Date.now()-c.t>1000){c.t=Date.now();c.n=0}if(++c.n>60)return;let m;try{m=JSON.parse(s)}catch{return}
 if(m.t=='auth'){const id=verify(String(m.token)),u=id&&db.users[id];if(!u)return tx(c,{t:'err',e:'Please sign in again',auth:1});const old=clients.get(u.uid);if(old&&old!==c)old.sock.destroy();c.uid=u.uid;clients.set(u.uid,c);return tx(c,{t:'hello',me:pub(u)})}
 if(!c.uid)return;const u=db.users[c.uid],r=c.room,num=v=>Number.isFinite(+v)?+v:0;
 switch(m.t){
 case'ping':tx(c,{t:'pong',now:Date.now(),c:m.c});break;
 case'create':{leave(c);let code;do{code=Array.from(crypto.randomBytes(5),b=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b%31]).join('')}while(rooms[code]);
  const n=rooms[code]={code,host:c.uid,stage:(m.stage|0)&3,diff:Math.min(2,Math.max(0,m.diff|0)),members:[c.uid],started:false,fin:{}};c.room=n;tx(c,{t:'room',room:room(n)});break}
 case'join':{const n=rooms[String(m.code||'').toUpperCase()];if(!n)return tx(c,{t:'err',e:'Room not found'});if(n.started)return tx(c,{t:'err',e:'Race already started'});if(n.members.length>=6&&!n.members.includes(c.uid))return tx(c,{t:'err',e:'Room is full'});
  leave(c);n.members.push(c.uid);c.room=n;bcast(n,{t:'room',room:room(n)});break}
 case'config':if(r&&r.host==c.uid&&!r.started){r.stage=(m.stage|0)&3;r.diff=Math.min(2,Math.max(0,m.diff|0));bcast(r,{t:'room',room:room(r)})}break;
 case'invite':{if(!r)return tx(c,{t:'err',e:'Create a room first'});const to=clients.get(String(m.to||'').toUpperCase());if(!to||to===c)return tx(c,{t:'err',e:'That player is offline or the ID is wrong'});tx(to,{t:'invite',from:pub(u),code:r.code});tx(c,{t:'info',e:'Invite sent'});break}
 case'start':if(r&&r.host==c.uid&&!r.started){if(r.members.length<2)return tx(c,{t:'err',e:'Need at least 2 players'});r.started=true;r.fin={};bcast(r,{t:'start',at:Date.now()+5000,now:Date.now(),stage:r.stage,diff:r.diff,players:room(r).players})}break;
 case's':if(r&&r.started)bcast(r,{t:'s',u:c.uid,d:num(m.d),x:num(m.x),v:num(m.v),sl:num(m.sl)},c.uid);break;
 case'fin':if(r&&r.started&&!r.fin[c.uid]){const t=num(m.time);if(t<5||t>3600)return;r.fin[c.uid]=t;bcast(r,{t:'fin',u:c.uid,time:t});
  u.races++;if(Object.keys(r.fin).length==1){u.wins++;setTimeout(()=>{if(r.started){r.started=false;bcast(r,{t:'room',room:room(r)})}},25000)}
  if(u.best==null||t<u.best)u.best=t;save();if(Object.keys(r.fin).length>=r.members.length){r.started=false;bcast(r,{t:'room',room:room(r)})}}break;
 case'leave':leave(c)}}
if(require.main===module)server.listen(PORT,()=>console.log('Gesture Racer on http://localhost:'+PORT));
module.exports=server;
