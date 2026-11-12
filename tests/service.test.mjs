import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const logic = html.match(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
function setup() {
  const storage = new Map();
  const timers = new Map();
  let timerId = 0;
  const context = vm.createContext({
    DCLogic: class {
      setState(patch, cb) { Object.assign(this.state, typeof patch === 'function' ? patch(this.state) : patch); cb?.(); }
    },
    console, URL, URLSearchParams, AbortSignal, TextEncoder,
    localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,String(v)), removeItem: k => storage.delete(k) },
    setInterval: fn => { timers.set(++timerId, fn); return timerId; }, clearInterval: id => timers.delete(id),
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id),
    location: { origin: 'https://www.stagelight.t64.org', pathname: '/', search: '' },
    window: { addEventListener() {}, removeEventListener() {} },
    document: { getElementById: () => null, fullscreenElement: null },
    fetch: async () => { throw new Error('Unexpected network call'); }
  });
  const C = vm.runInContext(logic + '\nComponent;', context);
  return { app: new C(), context, storage, timers };
}

test('all shipped component scripts parse', () => {
  for (const name of ['index.html', 'Event Waiting Screen.dc.html', 'EventStage.dc.html']) {
    const text = readFileSync(new URL('../' + name, import.meta.url), 'utf8');
    for (const match of text.matchAll(/<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
  }
  new vm.Script(readFileSync(new URL('../support.js', import.meta.url), 'utf8'));
});

test('saved uploads expire; corrupt runtime state cannot restore authentication', () => {
  const {app} = setup();
  app.restorePrefs({ queue: [{service:'local',url:'blob:dead'}, {service:'spotify',uri:'spotify:track:one'}], currentIdx: 99, variantIdx: 999, selectedVariants: [0,999,0], minutes: -20, phase:'presenting', spToken:'fake', connected:{spotify:true} });
  assert.equal(app.state.queue.length, 1);
  assert.equal(app.state.track.uri, 'spotify:track:one');
  assert.equal(app.state.currentIdx, 0);
  assert.ok(app.VARIANTS[app.state.variantIdx]);
  assert.equal(app.state.selectedVariants.join(','), '0');
  assert.equal(app.state.minutes, 1);
  assert.equal(app.state.phase, 'setup');
  assert.equal(app.state.spToken, null);
  assert.equal(app.state.connected.spotify, false);
  assert.match(app.state.authError, /selected again/);
  app.renderVals();
});

test('saved setup never persists dead blob audio', () => {
  const {app,storage} = setup();
  app.state.queue = [{service:'local',url:'blob:old'}, {service:'spotify',uri:'spotify:track:one'}];
  app.savePrefs();
  assert.equal(JSON.parse(storage.get('sl_setup')).queue.length, 1);
});

test('single uploaded track ends, never loops; failed audio reports a fault', async () => {
  const {app,timers} = setup();
  app.state.queue = [{service:'local',url:'blob:one'}];
  app.audio = { play: () => Promise.resolve() };
  app.playLocalAt(0);
  assert.equal(app.audio.loop, false);
  app.audio.onended();
  assert.equal(app.state.musicEnded, true);
  assert.equal(timers.size, 0);
  app.audio.play = () => Promise.reject(new Error('blocked'));
  app.playLocalAt(0);
  await Promise.resolve();
  assert.match(app.state.authError, /blocked/);
  assert.equal(timers.size, 0);
});

test('paused song change compensates countdown and resets ended state', () => {
  const {app} = setup();
  app.state.queue = [{service:'mock'}, {service:'mock'}];
  app.state.phase = 'presenting'; app.state.paused = true; app.state.musicEnded = true;
  app.state.target = Date.now() + 10000; app._pauseAt = Date.now() - 5000;
  const target = app.state.target;
  app.changeSong(1);
  assert.ok(app.state.target >= target + 4990);
  assert.equal(app.state.paused, false);
  assert.equal(app.state.musicEnded, false);
  assert.equal(app.state.currentIdx, 1);
});

test('unready Spotify never falls back to synthetic audio', () => {
  const {app} = setup();
  app.state.queue = [{service:'spotify',uri:'spotify:track:one'}];
  app.state.currentIdx = 0;
  app.startAudio();
  assert.match(app.state.authError, /not ready/);
  assert.equal(app.actx, undefined);
});

test('token refresh shares one request; expired tokens never masquerade as usable', async () => {
  const {app,context,storage} = setup();
  app.state.spToken = 'expired'; app.state.spExpires = 0;
  await assert.rejects(app.ensureSpToken(), /expired/);
  storage.set('sl_sp_refresh','refresh'); storage.set('sl_sp_clientid','client');
  let calls = 0;
  context.fetch = async () => { calls++; return {ok:true,json:async()=>({access_token:'new',expires_in:3600})}; };
  const tokens = await Promise.all([app.ensureSpToken(),app.ensureSpToken()]);
  assert.deepEqual(tokens,['new','new']); assert.equal(calls,1);
});

test('playback failure stays visible and preview never claims success', async () => {
  const {app,context} = setup();
  app.state.spToken = 'token'; app.state.spExpires = Date.now()+60000; app.state.spDeviceId = 'device'; app.state.spReady=true;
  app.state.track = {service:'spotify',uri:'spotify:track:one'};
  context.fetch = async () => ({ok:false,status:403});
  await app.togglePreview();
  assert.equal(app.state.previewPlaying,false);
  assert.match(app.state.authError,/denied access/);
  await assert.rejects(app.spotifyRequest('https://example.com/steal'), /Invalid Spotify/);
});

test('inactive Spotify device starts its explicit queue before repeat/shuffle controls', async () => {
  const {app,context} = setup();
  app.state.spToken='token'; app.state.spExpires=Date.now()+60000; app.state.spDeviceId='device'; app.state.spReady=true;
  const requests=[];
  let active=false;
  app.spPlayer={activateElement:()=>{requests.push({url:'unlock'});}};
  context.fetch=async (url,options)=>{
    requests.push({url,options});
    const path=new URL(url).pathname;
    if(path==='/v1/me/player/play') active=true;
    else assert.equal(active,true,'settings cannot activate the device');
    assert.notEqual(path,'/v1/me/player','transfer endpoint fails for this account');
    return {ok:true};
  };
  await app.playSpotifyQueue(['spotify:track:one','spotify:track:two']);
  assert.equal(requests[0].url,'unlock');
  assert.match(requests[1].url,/play\?device_id=device/);
  assert.deepEqual(JSON.parse(requests[1].options.body),{uris:['spotify:track:one','spotify:track:two'],offset:{position:0},position_ms:0});
  assert.match(requests[2].url,/repeat.*state=off/);
  assert.match(requests[3].url,/shuffle.*state=false/);
  assert.equal(app.state.authError,'');
});

test('preview unlocks browser audio and targets its own Spotify device', async () => {
  const {app}=setup();
  app.state.spDeviceId='preview-device'; app.state.spReady=true;
  const calls=[];
  app.spPlayer={activateElement:()=>{calls.push('unlock');}};
  app.spotifyRequest=async url=>{calls.push(url);return {ok:true};};
  assert.equal(await app.playSpotify('spotify:track:one'),true);
  assert.deepEqual(calls,['unlock','https://api.spotify.com/v1/me/player/play?device_id=preview-device']);
});

test('offline device or failed playback sends no subsequent setlist commands', async () => {
  const {app}=setup();
  app.state.spDeviceId='stale';
  let calls=0;
  app.spotifyRequest=async()=>{calls++;throw new Error('Spotify player is unavailable.');};
  await app.playSpotifyQueue(['spotify:track:one']);
  assert.equal(calls,0);
  assert.match(app.state.authError,/not ready/);
  app.state.spReady=true;
  await app.playSpotifyQueue(['spotify:track:one']);
  assert.equal(calls,1);
  assert.match(app.state.authError,/unavailable/);
});

test('player 404 identifies unavailable device without disguising catalog 404', async () => {
  const {app,context}=setup();
  app.state.spToken='token'; app.state.spExpires=Date.now()+60000;
  context.fetch=async()=>({ok:false,status:404});
  await assert.rejects(app.spotifyRequest('https://api.spotify.com/v1/me/player/play'),/player is unavailable/);
  await assert.rejects(app.spotifyRequest('https://api.spotify.com/v1/tracks/missing'),/request failed \(404\)/);
});

test('playlist import handles new item field, pagination, and duplicate tracks', async () => {
  const {app,context} = setup();
  app.state.spToken='token'; app.state.spExpires=Date.now()+60000;
  const urls=[];
  const track = {uri:'spotify:track:one',name:'One',duration_ms:120000};
  context.fetch = async url => {
    urls.push(url);
    return {ok:true,json:async()=> urls.length === 1 ? {items:[{item:track}],next:'https://api.spotify.com/v1/playlists/id/items?offset=1'} : {items:[{track}],next:null}};
  };
  await app.addSpotifyPlaylist('id');
  assert.match(urls[0],/\/items\?limit=50/);
  assert.equal(app.state.queue.length,1);
  assert.equal(app.state.queue[0].secs,120);
  assert.equal(app.state.searching,false);
});

test('foreign OAuth messages are ignored', () => {
  const {app} = setup();
  let exchanges=0; app.exchangeSpotifyCode=()=>exchanges++; app._popup={};
  app.onAuthMessage({origin:'https://evil.example',source:app._popup,data:{__sl_auth:'spotify',code:'bad'}});
  assert.equal(exchanges,0);
  app.onAuthMessage({origin:'https://www.stagelight.t64.org',source:app._popup,data:{__sl_auth:'spotify',code:'good'}});
  assert.equal(exchanges,1);
});

test('SDK startup, intentional pause, manual back, and real setlist end stay distinct', async () => {
  const {app,context} = setup();
  const listeners = {};
  context.window.Spotify = { Player: class {
    addListener(name, fn) { listeners[name] = fn; }
    async connect() { return true; }
    pause() {}
    disconnect() {}
  }};
  app.loadScript = async () => {};
  app.spotifyRequest = async () => ({ok:true});
  app.state.queue = [{service:'spotify',uri:'spotify:track:one'}, {service:'spotify',uri:'spotify:track:two'}];
  app.state.phase = 'presenting';
  await app.initSpotifyPlayer();
  const frame = (uri, paused, position) => ({paused,position,track_window:{current_track:{uri,name:uri,duration_ms:2000,artists:[]}}});
  const emit = listeners.player_state_changed;
  emit(frame('spotify:track:two',true,0));
  assert.equal(app.state.musicEnded,false);
  emit(frame('spotify:track:two',false,500));
  app.state.paused = true;
  emit(frame('spotify:track:two',true,0));
  assert.equal(app.state.musicEnded,false);
  app.changeSong(-1);
  assert.equal(app.state.musicEnded,false);
  emit(frame('spotify:track:one',false,100));
  assert.equal(app.state.musicEnded,false);
  emit(frame('spotify:track:two',false,1800));
  emit(frame('spotify:track:two',true,0));
  assert.equal(app.state.musicEnded,true);
  app.state.phase='setup';
  emit(frame('spotify:track:two',true,0));
  assert.equal(app.state.musicEnded,false);
});

test('Spotify popup opens before asynchronous PKCE so Safari keeps the click gesture', async () => {
  const {app,context,storage} = setup();
  context.screen={width:1440,height:900};
  const calls=[];
  context.window.open=(url)=>{calls.push(url);return {location:{replace:url=>calls.push(url)}};};
  let release;
  app.pkce=()=>new Promise(resolve=>{release=resolve;});
  app._startAuthPoll=()=>{};
  const connecting=app.connectSpotify();
  assert.equal(calls[0],'about:blank');
  release({verifier:'test-verifier',challenge:'test-challenge'});
  await connecting;
  const auth=new URL(calls[1]);
  assert.equal(auth.origin,'https://accounts.spotify.com');
  assert.equal(auth.searchParams.get('redirect_uri'),'https://www.stagelight.t64.org/');
  assert.equal(storage.get('sl_sp_verifier'),'test-verifier');
});

test('blocked popup exits before PKCE and leaves a useful error', async () => {
  const {app,context}=setup();
  context.screen={width:1440,height:900};
  context.window.open=()=>null;
  app.pkce=()=>assert.fail('PKCE should not run after a blocked popup');
  await app.connectSpotify();
  assert.match(app.state.authError,/blocked/);
});

test('OAuth return uses first-party capture when Safari hides query access from React', () => {
  const {app,context,storage}=setup();
  const capture=html.match(/<script id="sl-auth-capture">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(capture);
  context.location.search='?code=returned-code&state=sl_spotify_popup';
  vm.runInContext(capture,context);
  Object.defineProperty(context.location,'search',{get(){throw new Error('Query access blocked');}});
  let cleaned=false,closed=false;
  context.history={replaceState(){cleaned=true;}};
  context.window.close=()=>{closed=true;};
  app.renderAuthPopupClosed=()=>{};
  assert.equal(app.handleAuthRedirect(),true);
  assert.equal(JSON.parse(storage.get('sl_sp_auth_msg')).code,'returned-code');
  assert.equal(cleaned,true); assert.equal(closed,true);
  assert.equal(context.window.__slAuthCallback,undefined);
});

test('owner Premium rejection is explicit and never reports a ready connection', async () => {
  const {app,context}=setup();
  app.state.spToken='token'; app.state.spExpires=Date.now()+60000;
  app.state.connected.spotify=true;
  context.fetch=async()=>({ok:false,status:403,text:async()=> 'Active premium subscription required for the owner of the app. When the subscription status changes, it can take a few hours before requests are allowed again.'});
  app.loadScript=()=>assert.fail('Do not start SDK for an account Spotify rejects');
  await app.initSpotifyPlayer();
  assert.equal(app.state.spReady,false);
  assert.equal(app.state.connected.spotify,false);
  assert.match(app.state.authError,/owns this developer app/);
  assert.match(app.state.authError,/few hours/);
});

test('Audius search keeps free playable tracks and stable IDs, never gated content', async () => {
  const {app,context}=setup(); app.state.source='audius';
  const base={id:'one',title:'Same title',user:{name:'Artist'},duration:123,is_streamable:true,artwork:{'150x150':'https://art.example/cover.jpg'}};
  let requested;
  context.fetch=async url=>{requested=new URL(url);return {ok:true,json:async()=>({data:[base,{...base,id:'two'},{...base,id:'paid',is_stream_gated:true},{...base,id:'blocked',is_streamable:false},{...base,id:'condition',stream_conditions:{}},{...base,id:'missing',is_available:false}]})};};
  await app.searchAudius('lofi & chill');
  assert.equal(requested.searchParams.get('query'),'lofi & chill');
  assert.equal(requested.origin,'https://api.audius.co');
  assert.equal(app.state.results.length,2);
  assert.equal(app.state.results[0].secs,123);
  assert.notEqual(app.selKey(app.state.results[0]),app.selKey(app.state.results[1]));
  assert.equal(app.state.results[0].url,undefined,'stream URL must be derived at playback');
});

test('late Audius search cannot overwrite a different source or newer results', async () => {
  const {app,context}=setup(); app.state.source='audius';
  let finish;
  context.fetch=()=>new Promise(resolve=>{finish=resolve;});
  const search=app.searchAudius('old');
  app.setSource('upload');
  finish({ok:true,json:async()=>({data:[]})});
  await search;
  assert.equal(app.state.source,'upload'); assert.equal(app.state.authError,''); assert.equal(app.state.searching,false);
});

test('Audius queue advances in order, finishes once, and restores from IDs', async () => {
  const {app}=setup();
  app.state.queue=[{service:'audius',id:'first',title:'One',secs:2},{service:'audius',id:'second',title:'Two',secs:3}];
  app.state.source='audius'; app.state.phase='presenting';
  app.audio={play:async()=>{},pause(){}};
  assert.equal(await app.playAudiusAt(0),true);
  assert.match(app.audio.src,/tracks\/first\/stream\?app_name=Stagelight$/);
  assert.equal(app.audio.loop,false);
  app.audio.onended(); await Promise.resolve();
  assert.equal(app.state.currentIdx,1); assert.match(app.audio.src,/tracks\/second\/stream/);
  app.audio.onended(); assert.equal(app.state.musicEnded,true);
  app.restorePrefs({source:'audius',queue:app.state.queue});
  assert.equal(app.state.source,'audius'); assert.equal(app.state.queue[0].id,'first');
});

test('Audius preview ends without advancing; failures never claim playback', async () => {
  const {app}=setup();
  app.state.queue=[{service:'audius',id:'first'},{service:'audius',id:'second'}];
  app.state.track=app.state.queue[0]; app.audio={play:async()=>{},pause(){}};
  await app.togglePreview(); assert.equal(app.state.previewPlaying,true);
  app.audio.onended(); assert.equal(app.state.currentIdx,0); assert.equal(app.state.previewPlaying,false); assert.equal(app.state.musicEnded,false);
  app.audio.play=async()=>{throw new Error('media unavailable');};
  await app.togglePreview(); assert.equal(app.state.previewPlaying,false); assert.match(app.state.authError,/Audius could not play/);
});

test('stopped Audius startup cannot report a late success or fault', async () => {
  const {app}=setup();
  app.state.queue=[{service:'audius',id:'first'}]; app.state.track=app.state.queue[0];
  let reject;
  app.audio={play:()=>new Promise((_,fail)=>{reject=fail;}),pause(){}};
  const pending=app.togglePreview(); app.stopAudio(); reject(new Error('cancelled'));
  await pending; assert.equal(app.state.previewPlaying,false); assert.equal(app.state.authError,'');
});

test('Audius pause/resume leaves Spotify stopped and mixed queues cannot start', () => {
  const {app}=setup(); let spotifyResumes=0,plays=0;
  app.spPlayer={pause(){},resume(){spotifyResumes++;}};
  app.audio={pause(){},src:'audius',play(){plays++;return Promise.resolve();}};
  app.state.track={service:'audius',id:'first'}; app.state.phase='presenting';
  app.togglePause(); app.togglePause(); assert.equal(plays,1); assert.equal(spotifyResumes,0);
  app.state.phase='setup'; app.state.queue=[app.state.track,{service:'spotify',uri:'spotify:track:two'}];
  app.beginEvent(); assert.equal(app.state.phase,'setup'); assert.match(app.state.authError,/Audius-only/);
});

test('inactive Spotify state cannot overwrite Audius playback or completion', async () => {
  const {app,context}=setup(); const listeners={};
  context.window.Spotify={Player:class{addListener(n,f){listeners[n]=f;} async connect(){return true;}}};
  app.loadScript=async()=>{}; app.spotifyRequest=async()=>({ok:true});
  await app.initSpotifyPlayer();
  app.state.track={service:'audius',id:'one',title:'Audius song'}; app.state.musicEnded=true;
  listeners.player_state_changed({paused:true,position:0,track_window:{current_track:{uri:'spotify:track:old',name:'Old Spotify song'}}});
  assert.equal(app.state.track.title,'Audius song'); assert.equal(app.state.musicEnded,true);
});

test('presentation clock follows observed music, including buffering and manual timers',()=>{
  const {app}=setup();app.state.phase='presenting';app.state.autoMatch=true;app._clockSeconds=120;
  app.updateMusicClock({remaining:117,elapsed:3,playing:true});assert.equal(app.state.target-app.state.now,117000);
  app.updateMusicClock({remaining:117,elapsed:3,playing:false});assert.equal(app.state.target-app.state.now,117000);assert.equal(app.state.playing,false);
  app.state.autoMatch=false;app.updateMusicClock({remaining:40,elapsed:3,playing:true});assert.equal(app.state.target-app.state.now,117000);
  app.updateMusicClock({remaining:0,elapsed:120,playing:false});assert.equal(app.state.target,app.state.now);
});
test('Spotify clock holds until playback is observed and reads actual track progress',()=>{
  const {app}=setup();app.state.phase='presenting';app.state.autoMatch=true;
  app.state.queue=[{service:'spotify',uri:'spotify:track:one',secs:10},{service:'spotify',uri:'spotify:track:two',secs:20}];
  app.state.track=app.state.queue[0];app.state.target=50000;app.state.now=20000;
  app.tickPresentationClock();assert.equal(app.state.target-app.state.now,30000);
  const frame={paused:false,position:2500,track_window:{current_track:{uri:'spotify:track:one',duration_ms:10500}}};
  app.updateSpotifyClock(frame);assert.equal(app.state.target-app.state.now,30000);
  app._spotifyClockReady=true;app.updateSpotifyClock(frame);assert.equal(app.state.target-app.state.now,28000);
});
