/* Cars */
function makeCar(color,isP){
 const g=new THREE.Group(),b=new THREE.Group();g.add(b);
 const bm=new THREE.MeshPhysicalMaterial({color,metalness:.7,roughness:.25,clearcoat:1,clearcoatRoughness:.05}),gl=new THREE.MeshStandardMaterial({color:0x10151c,metalness:.9,roughness:.1}),bl=new THREE.MeshStandardMaterial({color:0x111111});
 const add=(geo,m,x,y,z,p)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;(p||b).add(o);return o};
 add(new THREE.BoxGeometry(2,.55,4.4),bm,0,.7,0);add(new THREE.BoxGeometry(1.7,.5,2.1),gl,0,1.2,-.3);add(new THREE.BoxGeometry(1.9,.12,.6),bl,0,1.25,-2.0);
 add(new THREE.BoxGeometry(.12,.35,.3),bl,-.7,1.05,-2).visible=true;add(new THREE.BoxGeometry(.12,.35,.3),bl,.7,1.05,-2);
 for(const x of[-.7,.7]){add(new THREE.BoxGeometry(.4,.14,.1),new THREE.MeshBasicMaterial({color:0xffffee}),x,.8,2.22);add(new THREE.BoxGeometry(.4,.12,.1),new THREE.MeshBasicMaterial({color:0xff1111}),x,.85,-2.22)}
 const wh=[],wg=new THREE.CylinderGeometry(.4,.4,.32,16);wg.rotateZ(Math.PI/2);
 for(const[x,z]of[[-1,1.4],[1,1.4],[-1,-1.4],[1,-1.4]]){const w=add(wg,bl,x,.4,z,g);wh.push(w)}
 g.userData={b,wh};if(isP){const pl=new THREE.PointLight(0xffffff,.6,30);pl.position.set(0,3,0);g.add(pl)}
 scene.add(g);return g}
function newCar(i,color,name,ai,slot){return{m:makeCar(color,!ai),name,ai,dist:-8-slot*9,x:(slot%2?3.8:-3.8),vx:0,v:0,max:ai?74*DIFFS[sel.diff].skill*(.96+Math.random()*.08):78,nitro:1,rpm:1000,slip:0,fin:false,ft:0,laps:[],lt:0,lastLap:0,tx:0,acc:0,str:0,wob:Math.random()*9}}
