/* Race flow */
let cdLast=9;function startRace(mp){mp=mp&&mp.players?mp:null;cdLast=9;
 ov(0);loadStage();$('#menu').style.display='none';$('#hud').style.display='block';
 const slots=[0,1,2,3,4,5],ps=3;let ai=0;cars=[];
 if(mp)mp.players.forEach((p,s)=>{if(p.uid==NET.me.uid){P=newCar(0,0x00b4ff,'YOU',false,s);cars.push(P)}else{const c=newCar(0,COLS[s%5],p.name,true,s);c.ai=false;c.remote=true;c.uid=p.uid;cars.push(c)}});else for(const s of slots){if(s==ps){P=newCar(0,0x00b4ff,'YOU',false,s);cars.push(P)}else{cars.push(newCar(0,COLS[ai%5],NAMES[ai%5],true,s));ai++}}
 for(const c of cars)placeCar(c,0);setCam(2);camSnap=true;
 state='count';cdT=mp?(mp.at-(Date.now()+NET.off))/1000+.9:3.9;raceT=0;finishedAt=0;audioInit();if(AC&&AC.state=='suspended')AC.resume();
 if(sel.ctl=='gesture'&&!G.ok)startGesture();else if(sel.ctl!='gesture')stopGesture()}
function placeCar(c,dt){
 const o=samp(c.dist),wx=o.px+o.rx*c.x,wz=o.pz+o.rz*c.x,m=c.m,u=m.userData;
 m.position.set(wx,0,wz);m.rotation.y=Math.atan2(o.tx,o.tz)-c.slip*1.1;time+=0;
 u.b.rotation.z=-c.str*Math.min(c.v,60)*.0014;u.b.rotation.x=-c.acc*.025;u.b.position.y=Math.sin(time*18+c.wob)*Math.min(c.v,70)*.0007+(-Math.abs(c.acc)*.03);
 u.wh.forEach((w,i)=>{w.rotation.x+=c.v*dt/.4;if(i<2)w.rotation.y=-c.str*.35});
 if(c.drift&&smoke&&Math.random()<.7){const s=smoke.userData,k=s.i++%120,a=smoke.geometry.attributes.position;a.setXYZ(k,wx-o.tx*2,.4,wz-o.tz*2);s.life[k]=1;a.needsUpdate=true}}
function ranking(){return cars.slice().sort((a,b)=>b.fin&&a.fin?a.ft-b.ft:b.fin?1:a.fin?-1:b.dist-a.dist)}
function update(dt){
 time+=dt;const inp=input(dt);const D=DIFFS[sel.diff];if(P){P.nitOn=!!(inp.nit&&P.nitro>.02&&state=='race');if(P.nitOn&&!P._n)sfx.nitro();P._n=P.nitOn;if(state=='race')netTick(dt)}
 if(state=='count'){cdT-=dt;const n=Math.ceil(cdT-.9);$('#cd').textContent=cdT>.9?n:'GO!';if(n!=cdLast){cdLast=n;n>0?sfx.tick():sfx.go()}if(cdT<=0){state='race';$('#cd').textContent=''}}
 else if(state=='race'||state=='done'){raceT+=dt;
  cars.forEach((c,i)=>{if(c.remote){netApply(c,dt);return}if(c.fin&&c!==P){step(c,{str:0,thr:0,brk:1,nit:0},dt)}else if(c.ai)step(c,aiInput(c,dt,i),dt);else step(c,state=='done'||c.fin?{str:0,thr:0,brk:.6,nit:0}:inp,dt);
   const lap=Math.floor(c.dist/TR.L);if(lap>c.lastLap&&c.dist>0){if(c===P){c.laps.push(raceT-c.lt);c.lt=raceT;sfx.lap()}}c.lastLap=Math.max(c.lastLap||0,lap);
   if(!c.fin&&c.dist>=D.laps*TR.L){c.fin=true;c.ft=raceT;if(c===P){state='done';finishedAt=raceT;NET.send({t:'fin',time:raceT})}}});
  for(let i=0;i<cars.length;i++)for(let j=i+1;j<cars.length;j++)collide(cars[i],cars[j]);
  if(state=='done'&&(raceT-finishedAt>(NET.room?12:3)||(cars.every(c=>c.fin)&&raceT-finishedAt>1.5))){showResults()}}
 else cars.forEach(c=>{});
 if(state!='menu')cars.forEach(c=>placeCar(c,dt));
 if(smoke){const s=smoke.userData,a=smoke.geometry.attributes.position;for(let k=0;k<120;k++){if(s.life[k]>0){s.life[k]-=dt*1.4;a.setY(k,a.getY(k)+dt*1.5);if(s.life[k]<=0)a.setY(k,-50)}}a.needsUpdate=true}
 if(P){audioUpd(P.rpm,inp.thr,state=='race'||state=='count'||state=='done')}
}
