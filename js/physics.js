/* Physics */
function step(c,inp,dt){
 const wet=rainOn?.78:1,nit=inp.nit&&c.nitro>.02,mv=c.max*(nit?1.32:1);
 if(inp.thr>0)c.v+=((mv-c.v)*.55*inp.thr+(nit?10:0))*dt;if(inp.brk)c.v-=48*dt*inp.brk;c.v-=(2.5+c.v*.012)*(inp.thr>0?0:1)*dt;
 if(nit)c.nitro-=.22*dt;else c.nitro=Math.min(1,c.nitro+.035*dt);
 const W2=TR.W/2;if(Math.abs(c.x)>W2+1.4)c.v-=c.v*1.4*dt;c.v=Math.max(0,c.v);
 const o=samp(c.dist),cent=-o.k*c.v*c.v*.25/wet,vc=Math.min(c.v,55),tgt=inp.str*vc*.2;
 c.vx+=(tgt-c.vx)*Math.min(1,5*dt);const xv=c.vx+cent*(1);
 const oldAcc=c.acc;c.acc+=((inp.thr-inp.brk)-c.acc)*Math.min(1,4*dt);c.str=inp.str;
 c.dist+=c.v*dt;c.x+=xv*dt;const lim=W2+7;
 if(Math.abs(c.x)>lim){c.x=Math.sign(c.x)*lim;c.v*=.9;c.vx=0;if(!c.ai&&!c.remote){shake=.5;if(time-(c._h||0)>.6){c._h=time;sfx.hit()}}}
 c.slip=cl(Math.atan2(xv,Math.max(c.v,8)),-.5,.5);c.drift=Math.abs(cent)>5&&c.v>25||Math.abs(inp.str)>.7&&c.v>35;
 const gb=c.max/5.2,g=Math.min(5,Math.floor(c.v/gb)),f=(c.v-g*gb)/gb;c.gear=g+1;c.rpm=1100+cl(f,0,1)*6400+(c.v<1?inp.thr*3000:0)}
function aiInput(c,dt,idx){
 const D=DIFFS[sel.diff];let mk=0;for(let d=10;d<=90;d+=20)mk=Math.max(mk,Math.abs(samp(c.dist+d,{}).k));
 const lim=Math.sqrt(26*D.skill/Math.max(mk,.0005)),tv=Math.min(c.max,lim);
 c.wob+=dt*.4;let tx=Math.sin(c.wob+idx)*(sel.diff==0?4:2.2);
 if(sel.diff>0)for(const o of cars){if(o===c)continue;const d=o.dist-c.dist;if(d>0&&d<22&&Math.abs(o.x-c.x)<3.5)tx=o.x>0?-5:5}
 c.tx=tx;const o=samp(c.dist),cent=-o.k*c.v*c.v*.25,vc=Math.min(c.v,55)*.2||1;
 const str=cl((tx-c.x)*.3-cent/vc,-1,1);
 return{str,thr:c.v<tv?1:0,brk:c.v>tv*1.12?.7:0,nit:Math.random()<D.nit*.004&&mk<.003?1:0}}
function collide(a,b){if(a.remote||b.remote)return;const d=b.dist-a.dist,dx=b.x-a.x;if(Math.abs(d)>4.6||Math.abs(dx)>2.1)return;
 const front=d>=0?b:a,rear=d>=0?a:b,s=dx>=0?1:-1,push=(2.1-Math.abs(dx))*.5;
 a.x-=push*s;b.x+=push*s;a.vx-=3*s;b.vx+=3*s;rear.v*=.985;
 if(Math.abs(dx)<1.4){rear.dist-=.15;front.dist+=.05}
 if(a===P||b===P){shake=Math.max(shake,.5);if(time-(P._h||0)>.6){P._h=time;sfx.hit()}}}
