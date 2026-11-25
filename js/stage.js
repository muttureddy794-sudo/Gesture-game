/* Stage */
let stageG,sky,sun,rain,smoke;
function loadStage(){
 if(scene)scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})});
 const st=STAGES[sel.stage];buildTrack();
 scene=new THREE.Scene();scene.fog=new THREE.FogExp2(st.sky[1],st.fog);
 const hl=new THREE.HemisphereLight(st.sky[0],st.grd,sel.stage==3?.35:.8);scene.add(hl);
 sun=new THREE.DirectionalLight(sel.stage==3?0x8866ff:0xfff2dd,sel.stage==3?.6:1.1);sun.castShadow=true;sun.shadow.mapSize.set(IS_TOUCH?1024:2048,IS_TOUCH?1024:2048);const sc=sun.shadow.camera;sc.left=sc.bottom=-45;sc.right=sc.top=45;sc.near=1;sc.far=250;scene.add(sun,sun.target);
 const sg=new THREE.SphereGeometry(1600,16,12),cols=[],ps=sg.attributes.position,t0=new THREE.Color(st.sky[0]),t1=new THREE.Color(st.sky[1]);
 for(let i=0;i<ps.count;i++){const c=t1.clone().lerp(t0,cl(ps.getY(i)/900,0,1));cols.push(c.r,c.g,c.b)}
 sg.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));sky=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false}));scene.add(sky);
 const gr=new THREE.Mesh(new THREE.PlaneGeometry(5000,5000),new THREE.MeshStandardMaterial({color:st.grd,roughness:1}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;scene.add(gr);
 scene.add(ribbon(-TR.W/2,TR.W/2,new THREE.MeshStandardMaterial({color:st.road,roughness:.55,metalness:.1,side:THREE.DoubleSide})));
 const white=new THREE.Color(sel.stage==3?0x00e5ff:0xffffff),cA=new THREE.Color(sel.stage==3?0xff2d75:0xd01818);
 const bm=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
 scene.add(ribbon(TR.W/2,TR.W/2+1.4,bm,i=>i%4<2?cA:white),ribbon(-TR.W/2-1.4,-TR.W/2,bm,i=>i%4<2?cA:white));
 const dk=new THREE.Color(st.road);const lm=ribbon(-.15,.15,bm,i=>i%8<4?white:dk);lm.position.y=.01;scene.add(lm);
 const cv=document.createElement('canvas');cv.width=64;cv.height=16;const x=cv.getContext('2d');for(let i=0;i<16;i++)for(let j=0;j<4;j++){x.fillStyle=(i+j)%2?'#fff':'#111';x.fillRect(i*4,j*4,4,4)}
 const tx=new THREE.CanvasTexture(cv);tx.magFilter=THREE.NearestFilter;const sl=new THREE.Mesh(new THREE.PlaneGeometry(TR.W,3),new THREE.MeshBasicMaterial({map:tx}));const o=samp(0);sl.rotation.order='YXZ';sl.rotation.set(-Math.PI/2,Math.atan2(o.tx,o.tz),0);sl.position.set(o.px,.06,o.pz);scene.add(sl);
 /* scenery */
 const r=rng(99+sel.stage),mk=(g,c,e)=>new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:c,roughness:.8,emissive:e||0,emissiveIntensity:e?1:0})),dec=new THREE.Group();
 const bx=new THREE.BoxGeometry(1,1,1),cn=new THREE.ConeGeometry(1,1,7),cy=new THREE.CylinderGeometry(1,1,1,8),dd=new THREE.DodecahedronGeometry(1);
 for(let i=0;i<260;i++){const j=Math.floor(r()*TR.N),sd=r()<.5?-1:1,off=TR.W/2+9+r()*(st.deco=='city'?25:55),p=TR.P[j],q=TR.R[j],px=p.x+q.x*sd*off,pz=p.z+q.z*sd*off;let m;
  if(st.deco=='city'){const h=12+r()*60,w=8+r()*10;m=mk(bx,new THREE.Color().setHSL(.6,.12,.25+r()*.35),0);m.scale.set(w,h,w);m.position.set(px,h/2,pz);m.material.emissive=new THREE.Color(0xffd070);m.material.emissiveIntensity=.08}
  else if(st.deco=='mtn'){const h=6+r()*10;m=new THREE.Group();const a=mk(cy,0x5a3a20);a.scale.set(.5,3,.5);a.position.y=1.5;const b=mk(cn,0x1e5a2a);b.scale.set(3,h,3);b.position.y=h/2+2;m.add(a,b);m.position.set(px,0,pz)}
  else if(st.deco=='desert'){if(r()<.5){m=new THREE.Group();const a=mk(cy,0x3b7a3a);a.scale.set(.7,6,.7);a.position.y=3;const b=mk(cy,0x3b7a3a);b.scale.set(.45,2.5,.45);b.position.set(1.3,4,0);m.add(a,b)}else{m=mk(dd,0x8a5a3a);const s=1+r()*4;m.scale.set(s,s*.7,s);m.position.y=s*.4}m.position.x=px;m.position.z=pz}
  else{const c=r()<.5?0x00e5ff:0xff2d75,h=10+r()*40;m=mk(bx,0x0a0a14,c);m.scale.set(1.2,h,1.2);m.position.set(px,h/2,pz)}
  m.rotation.y=r()*6;dec.add(m);}
 if(st.deco=='mtn')for(let i=0;i<16;i++){const a=i/16*6.283,rr=700+r()*300,h=150+r()*200,m=mk(cn,0x6b7280);m.scale.set(140,h,140);m.position.set(Math.cos(a)*rr,h/2,Math.sin(a)*rr);dec.add(m)}
 if(st.deco=='neon'){const gh=new THREE.GridHelper(4000,200,0xff2d75,0x3a1060);gh.position.y=.01;dec.add(gh)}
 scene.add(dec);
 /* rain */
 const rp=[];for(let i=0;i<1800;i++){const x=(Math.random()-.5)*90,y=Math.random()*50,z=(Math.random()-.5)*90;rp.push(x,y,z,x,y-1.2,z)}
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));rain=new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xaaccee,transparent:true,opacity:.45}));rain.visible=rainOn;rain.frustumCulled=false;scene.add(rain);
 /* smoke */
 const sp=new Float32Array(120*3).map((_,i)=>i%3==1?-50:0),sgm=new THREE.BufferGeometry();sgm.setAttribute('position',new THREE.BufferAttribute(sp,3));smoke=new THREE.Points(sgm,new THREE.PointsMaterial({color:0xdddddd,size:2.2,transparent:true,opacity:.35,depthWrite:false}));smoke.frustumCulled=false;smoke.userData={i:0,life:new Float32Array(120)};scene.add(smoke);
 cars=[];
}
