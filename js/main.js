/* Loop */
let last=performance.now();loadStage();
(function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000||.016);last=now;
 if(state=='pause'){R.render(scene,cam);return}
 if(state=='menu')time+=dt;else update(dt);
 updCam(dt);if(P&&state!='menu'&&state!='results')hud(dt);R.render(scene,cam)})(last);
