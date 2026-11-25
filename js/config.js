/* Config */
const V=THREE.Vector3,$=s=>document.querySelector(s),cl=(x,a,b)=>Math.min(b,Math.max(a,x));
const STAGES=[
{n:'City Streets',sky:[0x3d6fb0,0xcfe0f2],grd:0x3a3d42,road:0x2b2d31,deco:'city',rain:0,fog:.0013},
{n:'Mountain Pass',sky:[0x3f78c4,0xd5e6f5],grd:0x3d6b36,road:0x35373b,deco:'mtn',rain:0,fog:.001},
{n:'Desert Run',sky:[0x3b97dd,0xf6d9a0],grd:0xc9a063,road:0x45423e,deco:'desert',rain:0,fog:.0009},
{n:'Neon Circuit',sky:[0x04010f,0x2a0a4a],grd:0x070510,road:0x14121f,deco:'neon',rain:0,fog:.0016}];
const DIFFS=[{n:'Easy',skill:.76,pts:10,amp:.2,laps:2,nit:0},{n:'Medium',skill:.88,pts:13,amp:.32,laps:3,nit:.3},{n:'Hard',skill:.99,pts:16,amp:.45,laps:3,nit:.8}];
const NAMES=['Vega','Nova','Kuro','Rex','Zed'],COLS=[0xff7a00,0x22cc66,0xffd400,0xaa44ff,0xffffff];
const sel={stage:0,diff:0,ctl:'gesture'};
let TR,scene,state='menu',rainOn=false,cars=[],P,time=0,cdT=0,raceT=0,camMode=1,shake=0,finishedAt=0;
const keys={};

const IS_TOUCH=matchMedia('(pointer:coarse)').matches;
