/* Track */
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildTrack(){
 const D=DIFFS[sel.diff],r=rng(sel.stage*17+sel.diff*5+3),pts=[];
 for(let i=0;i<D.pts;i++){const a=i/D.pts*Math.PI*2,rr=260*(1+D.amp*(r()*2-1));pts.push(new V(Math.cos(a)*rr,0,Math.sin(a)*rr))}
 const cv=new THREE.CatmullRomCurve3(pts,true,'catmullrom',.5),N=700,L=cv.getLength(),Pp=[],T=[],Rt=[],K=[];
 for(let i=0;i<N;i++){Pp.push(cv.getPointAt(i/N));const t=cv.getTangentAt(i/N);t.y=0;t.normalize();T.push(t);Rt.push(new V(-t.z,0,t.x))}
 for(let i=0;i<N;i++){const n=T[(i+1)%N];K.push(((n.x-T[i].x)*Rt[i].x+(n.z-T[i].z)*Rt[i].z)/(L/N))}
 TR={N,L,P:Pp,T,R:Rt,K,W:18,ds:L/N};
}
const S={};
function samp(s,o){o=o||S;s=((s%TR.L)+TR.L)%TR.L;const f=s/TR.ds,i=Math.floor(f)%TR.N,j=(i+1)%TR.N,a=f-Math.floor(f),p=TR.P[i],q=TR.P[j],t=TR.T[i],u=TR.T[j];
 o.px=p.x+(q.x-p.x)*a;o.pz=p.z+(q.z-p.z)*a;let x=t.x+(u.x-t.x)*a,z=t.z+(u.z-t.z)*a;const m=Math.hypot(x,z);o.tx=x/m;o.tz=z/m;o.rx=-o.tz;o.rz=o.tx;o.k=TR.K[i];return o}
function ribbon(a,b,mat,cf){const pos=[],col=[],idx=[],N=TR.N;
 for(let i=0;i<=N;i++){const k=i%N,p=TR.P[k],r=TR.R[k];pos.push(p.x+r.x*a,.03,p.z+r.z*a,p.x+r.x*b,.03,p.z+r.z*b);if(cf){const c=cf(i);col.push(c.r,c.g,c.b,c.r,c.g,c.b)}if(i<N){const j=i*2;idx.push(j,j+1,j+2,j+1,j+3,j+2)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(cf)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);m.receiveShadow=true;return m}
