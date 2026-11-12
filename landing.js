(() => {
  const stage = document.getElementById('demo-stage');
  const timer = document.getElementById('demo-timer');
  const button = document.getElementById('demo-play');
  const label = document.getElementById('demo-play-label');
  const icon = document.getElementById('demo-play-icon');
  const status = document.getElementById('demo-status');
  const heading = document.getElementById('demo-label');
  let running = false, elapsed = 0, anchor = 0, frame;
  function draw() {
    const seconds = Math.max(0, Math.ceil(20 - elapsed - (running ? (performance.now() - anchor) / 1000 : 0)));
    const text = '00:' + String(seconds).padStart(2, '0');
    if (timer.textContent !== text) timer.textContent = text;
    if (!seconds) {
      running = false; elapsed = 20;
      button.setAttribute('aria-pressed', 'false');
      label.textContent = 'Replay preview'; icon.textContent = '↻';
      heading.textContent = 'READY WHEN YOU ARE';
      status.textContent = 'That’s the idea. Open Stagelight to make it yours.';
      stage.classList.remove('is-playing');
    }
    if (running) frame = requestAnimationFrame(draw);
  }
  button.addEventListener('click', () => {
    if (running) {
      elapsed += (performance.now() - anchor) / 1000; running = false;
      cancelAnimationFrame(frame); label.textContent = 'Resume preview'; icon.textContent = '▶';
      status.textContent = 'Preview paused. Sound is off.';
    } else {
      if (elapsed >= 20) elapsed = 0;
      running = true; anchor = performance.now();
      label.textContent = 'Pause preview'; icon.textContent = 'Ⅱ';
      heading.textContent = 'WE BEGIN IN'; status.textContent = 'Preview playing. Sound is off.';
    }
    button.setAttribute('aria-pressed', String(running));
    stage.classList.toggle('is-playing', running);
    draw();
  });
  const looks = { blue: ['#2632bd', '#3670e5', '#842cbd'], violet: ['#652aa0', '#8e5cd8', '#dd67ac'], warm: ['#9d383c', '#cb7650', '#dbab61'] };
  document.querySelectorAll('[data-look]').forEach(swatch => swatch.addEventListener('click', () => {
    const colors = looks[swatch.dataset.look];
    ['a', 'b', 'c'].forEach((key, i) => stage.style.setProperty('--tone-' + key, colors[i]));
    document.querySelectorAll('[data-look]').forEach(item => item.setAttribute('aria-pressed', String(item === swatch)));
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) button.click(); });
})();
