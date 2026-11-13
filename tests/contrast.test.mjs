import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const html=readFileSync(new URL('../EventStage.dc.html',import.meta.url),'utf8');
const logic=html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
const Stage=vm.runInNewContext(logic+'\nComponent;', {DCLogic:class{},console});
const lum=rgb=>rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
test('contrast backing preserves normal-text contrast even against the opposite extreme',()=>{
 for(const [ink,surface,alpha] of [[[1,1,1],[0,0,0],.78],[[20/255,22/255,30/255],[1,1,1],.84]]){
  for(const bg of [[0,0,0],[1,1,1],[1,0,0],[0,1,0],[0,0,1]]){
   const backing=surface.map((v,i)=>v*alpha+bg[i]*(1-alpha));
   const fadedInk=ink.map((v,i)=>v*.9+backing[i]*.1);
   assert.ok(contrast(fadedInk,backing)>=4.5);
  }
 }
 assert.match(html,/rgba\(255,255,255,0\.84\)/);assert.match(html,/rgba\(0,0,0,0\.78\)/);
});
test('polarity uses contrast crossover and hysteresis instead of a lightness threshold',()=>{
 const stage=new Stage();
 assert.equal(stage._contrastChoice(.2,null),'dark');
 assert.equal(stage._contrastChoice(.01,null),'light');
 assert.equal(stage._contrastChoice(.19,'light'),'light');
 assert.equal(stage._contrastChoice(.19,'dark'),'dark');
 assert.equal(stage._contrastChoice(-1,'dark'),'dark');
});
test('CSS backgrounds have an explicit estimate and unavailable pixels stay unavailable',()=>{
 const stage=new Stage();stage.props={bg:'#ffffff'};
 assert.equal(stage._sampleLuminanceAt({}),-1);assert.equal(stage._estimateBackgroundLuminance(),1);
 stage.props={bg:'#000000'};assert.equal(stage._estimateBackgroundLuminance(),0);
 stage.props={bg:'not-a-color'};assert.equal(stage._estimateBackgroundLuminance(),-1);
});
test('ambient text and all music styles receive the same contrast backing',()=>{
 assert.ok(html.includes('ref="{{ setAmbientBox }}"'));
 assert.ok(html.includes('[this._cdBox, this._ambientBox, this._npBar]'));
 for (const glassOpacity of [0,.65,1]) for (const npStyle of ['pill','stage','minimal','spectrum']) {
 const stage=new Stage();stage.props={bg:'#fff',ink:'#ffffff',glassOpacity,npStyle};
 const values=stage.renderVals();
 for(const name of ['glassCountdownStyle','glassAmbientStyle','actualNPStyle'])assert.ok(values[name].includes('--st-surface'),name);
 assert.equal(values.ink,'#ffffff');
 }
 assert.equal(/opacity:0\.(42|5|55|65);(?:white-space|padding-left|max-width)/.test(html),false);
});
