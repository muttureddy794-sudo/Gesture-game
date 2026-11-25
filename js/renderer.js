/* Renderer */
const R=new THREE.WebGLRenderer({canvas:$('#c'),antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,IS_TOUCH?1.5:1.75));R.shadowMap.enabled=true;R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.1;
const cam=new THREE.PerspectiveCamera(62,1,.5,3000);
function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
