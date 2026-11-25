/* Audio */
let AC,o1,o2,og;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();o1=AC.createOscillator();o2=AC.createOscillator();o1.type='sawtooth';o2.type='square';og=AC.createGain();og.gain.value=0;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;o1.connect(f);o2.connect(f);f.connect(og);og.connect(AC.destination);o1.start();o2.start()}catch(e){}}
function audioUpd(rpm,thr,on){if(!AC)return;o1.frequency.value=rpm/60*1.6;o2.frequency.value=rpm/60*.8;og.gain.value=on?.05+.05*thr:0}

function beep(f,d,t,v,f2){if(!AC)return;const n=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=t||'sine';o.frequency.setValueAtTime(f,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(v||.12,n);g.gain.exponentialRampToValueAtTime(.001,n+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+d)}
const sfx={click:()=>beep(660,.08,'triangle',.08),tick:()=>beep(520,.15,'square',.07),go:()=>beep(880,.5,'square',.09),hit:()=>beep(140,.28,'sawtooth',.18,40),nitro:()=>beep(200,.7,'sawtooth',.07,1000),lap:()=>beep(990,.3,'triangle',.1)};
