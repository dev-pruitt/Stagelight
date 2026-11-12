import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const code=readFileSync(new URL('../media-player.js',import.meta.url),'utf8');
function setup() {
  const context=vm.createContext({window:{},setInterval:()=>1,clearInterval(){},console});
  vm.runInContext(code,context);
  class Audio {
    currentTime=0; paused=true; readyState=0; ended=false; volume=0;
    set src(v){this._src=v;this.currentTime=0;this.duration=10;this.ended=false;this.readyState=0;}
    get src(){return this._src;}
    play(){this.paused=false;this.readyState=4;return Promise.resolve();}
    pause(){this.paused=true;}
    load(){}
  }
  const audio=[new Audio(),new Audio()], clocks=[],changes=[],errors=[];
  let ends=0;
  const mixer=new context.window.StagelightMixer({audio,tracks:[{url:'a',secs:10},{url:'b',secs:10}],volume:()=>1,onClock:v=>clocks.push(v),onTrack:i=>changes.push(i),onError:e=>errors.push(e),onEnded:()=>ends++});
  return {mixer,audio,clocks,changes,errors,ends:()=>ends,Mixer:context.window.StagelightMixer};
}
test('loading time never advances the timer; duration includes real overlap',async()=>{
  const {mixer,audio,clocks,Mixer}=setup();
  await mixer.start();
  assert.equal(Mixer.length([{secs:10},{secs:10}]),17);
  mixer.tick(true); assert.equal(clocks.at(-1).remaining,17); assert.equal(clocks.at(-1).elapsed,0);
  audio[0].currentTime=2;mixer.tick(true);assert.equal(clocks.at(-1).remaining,15);assert.equal(clocks.at(-1).elapsed,2);
  // A buffering stall keeps its media position, regardless of wall-clock time.
  audio[0].readyState=1;mixer.tick(true);assert.equal(clocks.at(-1).remaining,15);
});
test('both songs overlap, volumes blend, and the clock follows the incoming track',async()=>{
  const {mixer,audio,clocks,changes}=setup();await mixer.start();
  assert.equal(audio[1].paused,true,'Safari priming must remain silent and stop');
  audio[0].currentTime=7;mixer.tick(true);await new Promise(setImmediate);
  assert.deepEqual(changes,[0,1]);assert.equal(audio[0].paused,false);assert.equal(audio[1].paused,false);
  audio[0].currentTime=8.5;audio[1].currentTime=1.5;mixer.tick(true);
  assert.equal(audio[0].volume,0.5);assert.equal(audio[1].volume,0.5);
  assert.equal(clocks.at(-1).remaining,8.5);assert.equal(clocks.at(-1).elapsed,8.5);
  mixer.pause();assert.equal(audio[0].paused,true);assert.equal(audio[1].paused,true);
  await mixer.resume();assert.equal(audio[0].paused,false);assert.equal(audio[1].paused,false);
  audio[1].currentTime=3;mixer.tick(true);assert.equal(audio[0].paused,true);assert.equal(audio[1].volume,1);
});
test('late incoming audio uses actual overlap rather than a guessed deadline',async()=>{
  const {mixer,audio,clocks}=setup();await mixer.start();
  let ready;audio[1].play=()=>new Promise(resolve=>{ready=()=>{audio[1].paused=false;resolve();};});
  audio[0].currentTime=7;mixer.tick(true);audio[0].currentTime=9;ready();await new Promise(setImmediate);
  assert.equal(mixer.fade.seconds,1);
  audio[1].currentTime=0.5;mixer.tick(true);
  assert.equal(clocks.at(-1).remaining,9.5);assert.equal(audio[0].volume,0.5);
});
test('failed next song does not fade out the playing song or claim a transition',async()=>{
  const {mixer,audio,changes,errors}=setup();await mixer.start();
  audio[1].play=()=>Promise.reject(new Error('network failure'));
  audio[0].currentTime=7;mixer.tick(true);await new Promise(setImmediate);
  assert.deepEqual(changes,[0]);assert.equal(audio[0].volume,1);assert.equal(errors.length,1);
});
test('stop cancels pending transitions; final end reports zero exactly once',async()=>{
  const {mixer,audio,changes,clocks,ends}=setup();await mixer.start(1);
  audio[0].currentTime=10;audio[0].ended=true;audio[0].onended();
  assert.equal(clocks.at(-1).remaining,0);assert.equal(ends(),1);await mixer.next();assert.equal(ends(),1);
  await mixer.start();let ready;audio[1].play=()=>new Promise(resolve=>{ready=resolve;});
  audio[0].currentTime=7;mixer.tick(true);mixer.stop();ready();await new Promise(setImmediate);
  assert.equal(changes.at(-1),0);assert.equal(audio[0].paused,true);
});
test('skipping preserves elapsed music time for a manually set countdown',async()=>{
  const {mixer,audio,clocks}=setup();await mixer.start(1,12.5);audio[0].currentTime=2;mixer.tick(true);assert.equal(clocks.at(-1).elapsed,14.5);
});

test('late Safari priming cannot pause an incoming crossfade',async()=>{
  const {mixer,audio}=setup();const ready=[];
  audio[1].play=()=>{audio[1].paused=false;audio[1].readyState=4;return new Promise(resolve=>ready.push(resolve));};
  await mixer.start();audio[0].currentTime=7;mixer.tick(true);
  assert.equal(ready.length,2);
  ready[0]();ready[1]();await new Promise(setImmediate);
  assert.equal(mixer.index,1);assert.equal(audio[1].paused,false);
});
