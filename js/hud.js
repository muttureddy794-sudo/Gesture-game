/* HUD */
let lbT=0;const mc=$('#mini').getContext('2d'),gc=$('#gauge').getContext('2d');
function fmt(t){const m=Math.floor(t/60);return m+':'+(t%60).toFixed(2).padStart(5,'0')}
function hud(dt){
 const D=DIFFS[sel.diff],rk=ranking(),pos=rk.indexOf(P)+1,lap=cl(Math.floor(P.dist/TR.L)+1,1,D.laps);
 $('#lap').innerHTML='<b>LAP '+lap+'/'+D.laps+'</b> · P'+pos+'/'+cars.length+'<br>'+fmt(Math.max(0,raceT))+'<br><small>Best '+(P.laps.length?fmt(Math.min(...P.laps)):'--')+' · '+STAGES[sel.stage].n+' · '+D.n+(rainOn?' · Rain':'')+'</small>';
 if((lbT-=dt)<=0){lbT=.25;$('#lb').innerHTML=rk.map((c,i)=>{const gap=i==0?'':(c.fin?'FIN':'+'+Math.max(0,(rk[0].dist-c.dist)/Math.max(c.v,20)).toFixed(1)+'s');const s=(i+1)+'. '+c.name+' <small>'+gap+'</small>';return c===P?'<b>'+s+'</b>':s}).join('<br>')}
 $('#nit i').style.width=P.nitro*100+'%';$('#fx').style.opacity=P.nitOn?.9:cl((P.v-50)/60,0,.3);
 gc.clearRect(0,0,240,170);const cx=120,cy=105;gc.lineWidth=12;gc.lineCap='round';gc.strokeStyle='#ffffff22';gc.beginPath();gc.arc(cx,cy,80,Math.PI*.8,Math.PI*2.2);gc.stroke();
 const f=cl((P.rpm-1000)/7000,0,1);gc.strokeStyle=f>.85?'#ff2d75':'#00e5ff';gc.beginPath();gc.arc(cx,cy,80,Math.PI*.8,Math.PI*(.8+1.4*f));gc.stroke();
 gc.fillStyle='#e8f0ff';gc.textAlign='center';gc.font='italic 800 46px sans-serif';gc.fillText(Math.round(P.v*3.6),cx,cy+10);gc.font='12px sans-serif';gc.fillText('KM/H',cx,cy+28);gc.fillText('RPM '+Math.round(P.rpm/100)*100,cx,cy+48);gc.font='700 20px sans-serif';gc.fillStyle='#ffb300';gc.fillText('G'+(P.gear||1),cx,cy-40);
 mc.clearRect(0,0,160,160);mc.strokeStyle='#ffffff66';mc.lineWidth=3;mc.beginPath();const sc=70/330;
 TR.P.forEach((p,i)=>{const x=80+p.x*sc,y=80+p.z*sc;i?mc.lineTo(x,y):mc.moveTo(x,y)});mc.closePath();mc.stroke();
 cars.forEach(c=>{const p=c.m.position;mc.fillStyle=c===P?'#00e5ff':'#ff2d75';mc.beginPath();mc.arc(80+p.x*sc,80+p.z*sc,c===P?4.5:3,0,7);mc.fill()})}
