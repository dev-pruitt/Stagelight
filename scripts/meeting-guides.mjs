export const meetingGuides = [
  { slug: 'zoom', name: 'Zoom', intro: 'Share your countdown and computer sound in a Zoom meeting.', steps: [
    ['Prepare Stagelight', 'Open the app in its own browser window. Add music and choose your countdown. Turn off Full screen if you want the Zoom controls nearby.'],
    ['Open screen sharing', 'Join your Zoom meeting in the desktop app. Click Share Screen (or Share), then select the Stagelight window.'],
    ['Include the music', 'Enable Share sound in the sharing options, then start sharing. A window picture alone does not send its sound.'],
    ['Begin and check', 'Return to Stagelight and click Begin presentation. Ask an attendee to confirm the countdown is visible and music is audible.'],
    ['Start your meeting', 'Stop Stagelight playback before you begin speaking. Stop sharing in Zoom before returning to your setup.']
  ], fix: 'If attendees hear nothing, check Share sound in the sharing toolbar. Confirm Stagelight is audible on your computer, then try sharing again with sound enabled.', note: 'These steps use the Zoom desktop app. The web app may offer tab audio instead. On a Mac, Zoom may need screen and system audio recording permission.' },
  { slug: 'teams', name: 'Microsoft Teams', intro: 'Give your Teams meeting a countdown with music.', steps: [
    ['Prepare Stagelight', 'Open Stagelight in a separate browser window. Choose your songs, title, and countdown. Turn off Full screen if you want the Teams controls nearby.'],
    ['Choose what to share', 'Join your Teams meeting and select Share. Choose the Stagelight window, or the screen containing it.'],
    ['Include the sound', 'Turn on Include sound in the sharing controls. If sharing already started, look for Share audio in the sharing toolbar.'],
    ['Begin and check', 'In Stagelight, click Begin presentation. Ask another attendee to confirm both the screen and music.'],
    ['Hand over to the meeting', 'Stop Stagelight playback, then stop sharing in Teams before returning to your setup.']
  ], fix: 'If sound is missing, check Include sound or Share audio. Confirm the music plays locally. Your Teams app, device, or organization may limit audio sharing.', note: 'Use the Teams desktop app for this walkthrough. On a Mac, Teams may prompt for an audio component or recording permission; finish its setup before your event.' },
  { slug: 'meet', name: 'Google Meet', intro: 'Share just the Stagelight tab and its music in Google Meet.', steps: [
    ['Use two tabs in Chrome', 'Open your meeting in one tab and Stagelight in another. Add songs and choose your countdown in Stagelight.'],
    ['Present the Stagelight tab', 'Join the meeting, then select Present now → A tab. Choose Stagelight, rather than the Meet tab.'],
    ['Enable tab audio', 'Keep Also share tab audio enabled in the share dialog, then click Share. If your browser has no tab audio option, try Chrome.'],
    ['Begin and check', 'Switch to Stagelight and click Begin presentation. Ask an attendee to confirm they see the countdown and hear the music.'],
    ['Return to the meeting', 'Stop Stagelight playback, then use Stop presenting in Meet before returning to your setup.']
  ], fix: 'If the picture works but sound does not, stop presenting and share the Stagelight tab again with tab audio enabled. Check that this tab is not muted.', note: 'This walkthrough uses Chrome tab sharing. Window and whole-screen audio options vary by device. Your meeting host or organization may restrict presenting.' }
];
export function renderMeetingGuide(guide, base, styleHash, helpHash) {
  const steps = guide.steps.map(([title, text]) => `<li><h3>${title}</h3><p>${text}</p></li>`).join('\n');
  const others = meetingGuides.filter(g => g.slug !== guide.slug).map(g => `<a href="./help-${g.slug}.html">${g.name} guide →</a>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>How to use Stagelight with ${guide.name}</title><meta name="description" content="${guide.intro}"><link rel="canonical" href="${base}help-${guide.slug}.html"><link rel="icon" href="./assets/favicon-32.png"><link rel="stylesheet" href="./landing.css?v=${styleHash}"><link rel="stylesheet" href="./help.css?v=${helpHash}"></head><body>
<a class="skip" href="#main">Skip to content</a><header class="site-header"><a class="brand" href="./"><img src="./assets/icon-64.png" width="34" height="34" alt=""><span>Stagelight</span></a><nav aria-label="Main navigation"><a href="./help.html#meetings">All help</a><a class="nav-launch" href="./app.html" target="_blank" rel="noopener">Open app ↗</a></nav></header>
<main id="main" class="help-main"><div class="help-intro"><p class="eyebrow">MEETING SETUP</p><h1>Stagelight<br>with ${guide.name}.</h1><p>${guide.intro}</p></div><section class="help-card"><h2>Before you share</h2><p>Use headphones. Close other noisy tabs. Try a music preview first. Share only the window or tab you want attendees to see.</p></section><section aria-label="Setup steps"><ol class="guide-steps">${steps}</ol></section><section class="help-card"><h2>No sound in the meeting?</h2><p>${guide.fix}</p><p>${guide.note}</p><p>Hearing music locally does not prove the meeting hears it. Ask an attendee before people arrive.</p></section><section class="help-card report-card"><h2>Need another hand?</h2><p>Find audio fixes or tell us what went wrong.</p><div class="actions"><a class="button primary" href="./help.html#fixes">Quick fixes</a><a class="text-link" href="./help.html#report">Report an issue →</a></div></section><nav class="help-topics" aria-label="Other meeting guides">${others}<a href="./help.html#meetings">All meeting help</a></nav></main><footer class="site-footer"><a class="brand" href="./">Stagelight</a><p>Ready when you are.</p><a href="./help.html">Help</a></footer></body></html>\n`;
}
