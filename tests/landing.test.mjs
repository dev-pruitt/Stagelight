import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const landing=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const route=landing.match(/<script id="sl-entry-route">([\s\S]*?)<\/script>/)[1];
function visit(search,name=''){
 const redirects=[];const context=vm.createContext({URLSearchParams,window:{name,opener:null},location:{search,hash:'',replace:url=>redirects.push(url)}});
 vm.runInContext(route,context);return redirects;
}
test('landing keeps normal visitors on the public page and relays Spotify returns',()=>{
 assert.deepEqual(visit(''),[]);assert.deepEqual(visit('?utm_source=shared'),[]);
 assert.deepEqual(visit('?code=one-time-code&state=sl_spotify_popup'),['./app.html?code=one-time-code&state=sl_spotify_popup']);
 assert.deepEqual(visit('?error=access_denied&state=sl_spotify_popup'),['./app.html?error=access_denied&state=sl_spotify_popup']);
 assert.deepEqual(visit('?code=one-time-code','sl_spotify_auth'),['./app.html?code=one-time-code']);
 assert.deepEqual(visit('?code=unrelated'),[]);
});
test('public metadata and sitemap derive from the deployed hostname',()=>{
 const base='https://'+readFileSync(new URL('../CNAME',import.meta.url),'utf8').trim()+'/';
 assert.ok(landing.includes('<link rel="canonical" href="'+base+'">'));
 assert.match(landing,/<meta name="robots" content="index,follow">/);
 assert.equal((landing.match(/<h1\b/g)||[]).length,1);
 const schema=JSON.parse(landing.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
 assert.equal(schema.url,base);assert.equal(schema.offers.price,'0');
 assert.ok(readFileSync(new URL('../sitemap.xml',import.meta.url),'utf8').includes('<loc>'+base+'</loc>'));
 assert.ok(readFileSync(new URL('../robots.txt',import.meta.url),'utf8').includes('Sitemap: '+base+'sitemap.xml'));
 assert.equal(/__SITE_URL__|__STYLE_HASH__|__SCRIPT_HASH__/.test(landing),false);
});
test('landing does not load the app or music players before visitors launch it',()=>{
 assert.equal(landing.includes('data-dc-script'),false);assert.equal(landing.includes('support.js'),false);
 assert.equal(landing.includes('sdk.scdn.co'),false);
 assert.ok(landing.includes('href="./app.html"'));assert.ok(landing.includes('href="./app.html?source=audius"'));
 assert.match(readFileSync(new URL('../app.html',import.meta.url),'utf8'),/<meta name="robots" content="noindex,follow">/);
 new vm.Script(readFileSync(new URL('../landing.js',import.meta.url),'utf8'));
});
