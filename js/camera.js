/* Camera */
const CAMS=['Cockpit','Hood','Chase','High chase','Front','Cinematic','Helicopter'];
let camMode=2,camSnap=false,fovT=62;const tp=new V(),tl=new V(),cl2=new V();
function setCam(m){camMode=m;if(P)P.m.visible=true;const t=$('#cam');t.textContent=CAMS[m]+' camera';t.style.opacity=1;clearTimeout(setCam.t);setCam.t=setTimeout(()=>t.style.opacity=0,1600);[...$('#camb').children].forEach((b,i)=>b.classList.toggle('sel',i==m))}
function updCam(dt){
 if(state=='menu'){const a=time*.12;tp.set(Math.cos(a)*460,150,Math.sin(a)*460);cam.position.lerp(tp,.05);cam.lookAt(0,0,0);return}
 const c=P,o=samp(c.dist),y=c.m.rotation.y,fx=Math.sin(y),fz=Math.cos(y),p=c.m.position;let k=5,fv=58;
 c.m.visible=camMode!=0;
 switch(camMode){
  case 0:tp.set(p.x+fx*.2,1.3,p.z+fz*.2);tl.set(p.x+fx*30,1.1,p.z+fz*30);k=40;fv=72;break;
  case 1:tp.set(p.x+fx*1.8,1.25,p.z+fz*1.8);tl.set(p.x+fx*30,.9,p.z+fz*30);k=25;fv=68;break;
  case 2:tp.set(p.x-fx*9,3.8,p.z-fz*9);tl.set(p.x+fx*8,1.2,p.z+fz*8);k=6;break;
  case 3:tp.set(p.x-fx*16,9,p.z-fz*16);tl.set(p.x+fx*12,0,p.z+fz*12);k=4;fv=55;break;
  case 4:tp.set(p.x+fx*8,2.2,p.z+fz*8);tl.set(p.x,1,p.z);k=7;break;
  case 5:{const ph=Math.floor(time/5)%4;k=2.5;tl.set(p.x+fx*5,1,p.z+fz*5);
   if(ph==0)tp.set(p.x+o.rx*9-fx*4,1.5,p.z+o.rz*9-fz*4);
   else if(ph==1)tp.set(p.x-o.rx*12+fx*14,5,p.z-o.rz*12+fz*14);
   else if(ph==2){const q=samp(Math.floor(c.dist/90)*90+90,{});tp.set(q.px+q.rx*16,3,q.pz+q.rz*16);k=20}
   else tp.set(p.x-fx*6+o.rx*1.5,.7,p.z-fz*6+o.rz*1.5);break}
  case 6:{const a=time*.15;tp.set(p.x+Math.cos(a)*22,45,p.z+Math.sin(a)*22);tl.set(p.x+fx*10,0,p.z+fz*10);k=3;fv=60;break}
 }
 const a1=camSnap?1:1-Math.exp(-dt*k),a2=camSnap?1:1-Math.exp(-dt*(k+4));camSnap=false;
 cam.position.lerp(tp,a1);cl2.lerp(tl,a2);cam.lookAt(cl2);
 if(shake>0){cam.position.x+=(Math.random()-.5)*shake;cam.position.y+=(Math.random()-.5)*shake*.6;shake=Math.max(0,shake-dt*2)}
 fovT=fv+P.v*.2+(P.nitOn?14:0);cam.fov+=(fovT-cam.fov)*Math.min(1,5*dt);cam.updateProjectionMatrix();
 sun.position.set(p.x+60,90,p.z+40);sun.target.position.copy(p);sky.position.copy(cam.position);
 if(rain.visible){const a=rain.geometry.attributes.position;for(let i=0;i<a.count;i+=2){let y2=a.getY(i)-dt*55;if(y2<0)y2+=50;a.setY(i,y2);a.setY(i+1,y2-1.2)}a.needsUpdate=true;rain.position.set(p.x,0,p.z)}}
