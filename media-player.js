// Two media elements blend adjacent songs. The clock reads media positions, never load time.
window.StagelightMixer = class StagelightMixer {
  static overlap(a, b) { return Math.max(0, Math.min(3, (a || 0) / 2, (b || 0) / 2)); }
  static length(tracks) {
    return tracks.reduce((sum, t, i) => sum + (t.secs || 0) - (i ? this.overlap(tracks[i - 1].secs, t.secs) : 0), 0);
  }
  constructor({ audio, tracks, volume, onTrack, onClock, onEnded, onError }) {
    Object.assign(this, { audio, tracks, volume, onTrack, onClock, onEnded, onError });
    this.durations = tracks.map(t => t.secs || 0);
    this.run = 0; this.elapsedBase = 0; this.index = 0; this.slot = 0;
    this.paused = false; this.stopped = false; this.ended = false;
    audio.forEach((a, slot) => {
      a.loop = false; a.preload = 'auto';
      a.onloadedmetadata = () => { if (Number.isFinite(a.duration) && a.duration > 0) this.durations[a._mixIndex] = a.duration; };
      a.onended = () => { if (!this.stopped && slot === this.slot) this.next(); };
      a.onerror = () => {
        if (this.stopped) return;
        if (slot === this.slot) this.onError('This song could not play. Retry or choose another song.');
      };
    });
  }
  position() { const a = this.audio[this.slot]; return Number.isFinite(a.currentTime) ? a.currentTime : 0; }
  elapsed() { return this.elapsedBase + this.position(); }
  prepare(slot, index) {
    const a = this.audio[slot];
    a.pause(); a._mixIndex = index;
    if (index >= this.tracks.length) { a.removeAttribute && a.removeAttribute('src'); return; }
    a.src = this.tracks[index].url; a.volume = 0; a.currentTime = 0;
    if (a.load) a.load();
  }
  async start(index = 0, elapsedBase = 0) {
    this.stopped = false; this.paused = false; this.ended = false;
    const run = ++this.run;
    this.slot = 0; this.index = index; this.elapsedBase = elapsedBase; this.fade = null; this.pending = false;
    this.prepare(0, index); this.prepare(1, index + 1);
    // Both play calls originate in the user's click. Unlock the next element silently for Safari.
    if (index + 1 < this.tracks.length) {
      const next = this.audio[1];
      Promise.resolve(next.play()).then(() => {
        if (this.run === run && this.slot !== 1 && !this.pending) { next.pause(); next.currentTime = 0; }
      }).catch(() => {});
    }
    clearInterval(this.timer); this.timer = setInterval(() => this.tick(), 50);
    this.audio[0].volume = this.volume(); this.onTrack(index); this.tick(true);
    try { await this.audio[0].play(); if (this.stopped || run !== this.run) return false; if (this.paused) this.audio[0].pause(); this.tick(); return true; }
    catch (e) { if (!this.stopped && run === this.run) this.onError('Music could not start. Retry playback.'); return false; }
  }
  async next() {
    if (this.stopped || this.ended || this.pending || this.paused) return;
    if (this.index + 1 >= this.tracks.length) {
      this.ended = true; clearInterval(this.timer); this.onClock({ remaining: 0, elapsed: this.elapsed(), playing: false }); this.onEnded(); return;
    }
    const run = this.run, outSlot = this.slot, inSlot = 1 - outSlot;
    const outgoing = this.audio[outSlot], incoming = this.audio[inSlot];
    const nextIndex = this.index + 1;
    const overlap = Math.min(StagelightMixer.overlap(this.durations[this.index], this.durations[nextIndex]), Math.max(0, this.durations[this.index] - this.position()));
    this.pending = true; incoming.currentTime = 0; incoming.volume = 0;
    try {
      await incoming.play();
      if (this.stopped || run !== this.run) return;
      if (this.paused) incoming.pause();
      const base = this.elapsed();
      // Use the overlap that actually remains once the incoming stream can play.
      const seconds = Math.min(overlap, Math.max(0, this.durations[this.index] - this.position()));
      this.elapsedBase = base - incoming.currentTime;
      this.slot = inSlot; this.index = nextIndex;
      this.fade = seconds > 0.05 ? { slot: outSlot, seconds, start: incoming.currentTime } : null;
      if (!this.fade) { outgoing.pause(); this.prepare(outSlot, nextIndex + 1); }
      this.onTrack(nextIndex); this.tick(true);
    } catch (e) {
      if (!this.stopped && run === this.run) { this.transitionFailed = true; this.onError('The next song could not start. Press Next to retry.'); }
    } finally { if (run === this.run) this.pending = false; }
  }
  tick(force = false) {
    if (this.stopped || this.ended) return;
    const a = this.audio[this.slot];
    const duration = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : this.durations[this.index];
    this.durations[this.index] = duration;
    const position = this.position(), vol = this.volume();
    if (this.fade) {
      const amount = Math.max(0, Math.min(1, (position - this.fade.start) / this.fade.seconds));
      a.volume = vol * amount; this.audio[this.fade.slot].volume = vol * (1 - amount);
      if (amount >= 1 || this.audio[this.fade.slot].ended) {
        const slot = this.fade.slot; this.audio[slot].pause(); this.fade = null; a.volume = vol;
        this.prepare(slot, this.index + 1);
      }
    } else a.volume = vol;
    let remaining = Math.max(0, duration - position);
    for (let i = this.index + 1; i < this.tracks.length; i++) remaining += this.durations[i] - StagelightMixer.overlap(this.durations[i - 1], this.durations[i]);
    const now = Date.now();
    if (force || !this.lastClock || now - this.lastClock >= 200) {
      this.lastClock = now; this.onClock({ remaining: Math.max(0, remaining), elapsed: this.elapsed(), playing: !a.paused && a.readyState >= 2 });
    }
    if (!this.fade && !this.pending && !this.paused && !this.transitionFailed && this.index + 1 < this.tracks.length && a.readyState >= 2 && !a.paused && duration - position <= StagelightMixer.overlap(duration, this.durations[this.index + 1])) this.next();
  }
  pause() { this.paused = true; this.audio.forEach(a => a.pause()); this.tick(true); }
  async resume() {
    if (this.stopped || this.ended) return;
    this.paused = false;
    const run = this.run;
    try { await this.audio[this.slot].play(); if (this.stopped || this.paused || run !== this.run) return; if (this.fade && !this.audio[this.fade.slot].ended) await this.audio[this.fade.slot].play(); }
    catch (_) { if (!this.stopped) this.onError('Music could not resume. Retry playback.'); }
    this.tick();
  }
  stop() { clearInterval(this.timer); this.stopped = true; this.run++; this.audio.forEach(a => { a.pause(); a.onended = null; a.onerror = null; a.onloadedmetadata = null; }); }
};
