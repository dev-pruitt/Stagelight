import { meetingGuides, renderMeetingGuide } from './meeting-guides.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sourcePath = new URL('../Event Waiting Screen.dc.html', import.meta.url);
const original = readFileSync(sourcePath, 'utf8');
const domain = readFileSync(new URL('../CNAME', import.meta.url), 'utf8').trim();
let updated = original.replace(/var CANON = '[^']+'/, "var CANON = '" + domain + "'");
for (const [name, dependencies] of Object.entries({ 'media-player.js': ['media-player.js'], 'support.js': ['support.js', 'EventStage.dc.html'] })) {
  const hash = createHash('sha256');
  for (const file of dependencies) hash.update(readFileSync(new URL('../' + file, import.meta.url)));
  const pattern = name.replaceAll('.', '\\.') + '(?:\\?v=[a-f0-9]+)?';
  updated = updated.replace(new RegExp(pattern), name + '?v=' + hash.digest('hex').slice(0, 12));
}
if (process.argv.includes('--check') && original !== updated) throw new Error('Display assets changed. Run node scripts/build.mjs.');
if (!process.argv.includes('--check') && original !== updated) writeFileSync(sourcePath, updated);
const source = Buffer.from(updated);
const target = new URL('../app.html', import.meta.url);
if (process.argv.includes('--check')) {
  if (!source.equals(readFileSync(target))) throw new Error('Source and app differ. Run node scripts/build.mjs.');
  console.log('Source and generated app match.');
} else {
  writeFileSync(target, source);
  console.log('Built app.html from source.');
}

const base = 'https://' + domain + '/';
const digest = file => createHash('sha256').update(readFileSync(new URL('../' + file, import.meta.url))).digest('hex').slice(0, 12);
const landing = readFileSync(new URL('../landing.html', import.meta.url), 'utf8')
  .replaceAll('__SITE_URL__', base).replaceAll('__STYLE_HASH__', digest('landing.css')).replaceAll('__SCRIPT_HASH__', digest('landing.js'))
  .replace('content="noindex,follow"', 'content="index,follow"');
const help = readFileSync(new URL('../help-template.html', import.meta.url), 'utf8')
  .replaceAll('__SITE_URL__', base).replaceAll('__STYLE_HASH__', digest('landing.css')).replaceAll('__HELP_HASH__', digest('help.css'))
  .replace('content="noindex,follow"', 'content="index,follow"');
const streamers = readFileSync(new URL('../streamers-template.html', import.meta.url), 'utf8')
  .replaceAll('__SITE_URL__', base).replaceAll('__STREAM_STYLE_HASH__', digest('streamers.css')).replaceAll('__STREAM_SCRIPT_HASH__', digest('streamers.js'))
  .replace('content="noindex,follow"', 'content="index,follow"');
const outputs = {
  'streamers.html': streamers,
  'help.html': help,
  'index.html': landing,
  'robots.txt': 'User-agent: *\nAllow: /\nSitemap: ' + base + 'sitemap.xml\n',
  'sitemap.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' + base + '</loc></url><url><loc>' + base + 'help.html</loc></url></urlset>\n'
};
for (const guide of meetingGuides) outputs['help-' + guide.slug + '.html'] = renderMeetingGuide(guide, base, digest('landing.css'), digest('help.css'));
outputs['sitemap.xml'] = outputs['sitemap.xml'].replace('</urlset>', '<url><loc>' + base + 'streamers.html</loc></url>' + meetingGuides.map(g => '<url><loc>' + base + 'help-' + g.slug + '.html</loc></url>').join('') + '</urlset>');
for (const [file, content] of Object.entries(outputs)) {
  const url = new URL('../' + file, import.meta.url);
  if (process.argv.includes('--check')) { if (readFileSync(url, 'utf8') !== content) throw new Error(file + ' needs rebuilding.'); }
  else writeFileSync(url, content);
}
console.log(process.argv.includes('--check') ? 'Landing page and sitemap match.' : 'Built landing page and sitemap.');
