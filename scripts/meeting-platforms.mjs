export const platforms = {
  zoom: {
    image: 'zoom-sharing-controls.png', alt: 'Zoom screen-sharing toolbar with New Share and Stop Share controls.', caption: 'Example Zoom sharing toolbar. Stop Share ends the broadcast. Controls vary by version.', credit: 'Zoom Support', imageSource: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060596',
    desktop: 'The downloaded Zoom Workplace app runs on Windows or Mac. Stagelight stays open in your browser. Use the numbered steps below.',
    browser: 'Joining Zoom without its download? In the web meeting, choose Share Screen, select the Stagelight browser tab, and enable Share tab audio if offered. If that option is missing, use the desktop app. Mobile browser audio sharing is not supported.',
    android: 'In the Zoom mobile app, tap Share → Screen and accept the screen-capture prompt. Enable Share Audio. Switch to Stagelight in your browser, then begin. Return to Zoom and tap Stop Share when finished.',
    ios: 'In the Zoom mobile app, tap Share → Screen → Start Broadcast. Turn on Share Device Audio in Zoom’s sharing controls. Open Stagelight in Safari and begin. Return to Zoom to stop sharing.',
    source: 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0057913'
  },
  teams: {
    image: 'teams-include-sound.png', alt: 'Teams sharing panel with the Include sound switch enabled and outlined in red.', caption: 'Turn on Include sound before presenting from the desktop app.', credit: 'Microsoft Support', imageSource: 'https://support.microsoft.com/en-us/teams/meetings/manage-audio-settings-in-microsoft-teams-meetings',
    desktop: 'The downloaded Teams app runs on Windows or Mac. Stagelight runs separately in your browser. Follow the numbered steps below.',
    browser: 'In Teams for web, choose Share → Screen, window, or tab. Select the Stagelight tab and enable Also share tab audio. Window or screen sharing may offer system audio instead.',
    android: 'In the Teams mobile meeting, tap Share → Share screen → Share screen with audio. Accept the device prompt, then switch to Stagelight in your browser. Return to Teams to stop presenting.',
    ios: 'In the Teams mobile meeting, choose Share → Share screen → Share screen with audio → Start Broadcast. Switch to Stagelight in Safari. Return to Teams to stop the broadcast.',
    source: 'https://support.microsoft.com/en-gb/teams/meetings/share-sound-from-your-computer-in-microsoft-teams-meetings-or-live-events'
  },
  meet: {
    image: 'meet-tab-audio.png', alt: 'Chrome sharing dialog for Google Meet with Chrome Tab selected and Also share tab audio enabled.', caption: 'Choose the Stagelight tab and keep tab audio on. This example shows other tabs; yours will list Stagelight.', credit: 'Tactiq tutorial screenshot', imageSource: 'https://tactiq.io/learn/unmute-google-meet-presentation',
    desktop: 'On a computer, Meet runs in the browser. An installed Meet web app uses the browser too; it is not a separate desktop audio engine. The steps below use Chrome.',
    browser: 'Keep Meet and Stagelight in separate Chrome tabs. Present the Stagelight tab with audio enabled. Supported devices also offer system audio for a window or whole screen; tab sharing keeps the sound limited to Stagelight.',
    android: 'Join in the Meet app. Tap More → Share screen → Start sharing. Enable the audio checkbox on Present to everyone if available. Switch to Stagelight in your browser. Use Stop sharing in Meet to finish.',
    ios: 'Join in the Meet app, then tap More → Share screen and follow the Start sharing or broadcast prompt. Enable audio if offered. Open Stagelight in Safari, then return to Meet to stop sharing.',
    source: 'https://support.google.com/meet/answer/9308856?hl=en',
    extra: 'Mobile audio may be unavailable on your device. Google says muting your microphone also stops shared audio. Joining only to present does not share audio.'
  }
};
export function platformSections(guide) {
  const p = platforms[guide.slug];
  return `<nav class="help-topics" aria-label="Choose your device"><a href="#desktop">Computer app</a><a href="#browser">Web browser</a><a href="#mobile">Phone or tablet</a></nav>
<section class="help-card"><h2>Which app do I need?</h2><p>Stagelight is a website. There is no Stagelight download to install. “Downloaded app” below means your meeting app.</p><p>${p.desktop}</p></section>
<figure class="guide-image"><img src="./assets/help/${p.image}" alt="${p.alt}" loading="lazy"><figcaption>${p.caption} <span>Image: <a href="${p.imageSource}" target="_blank" rel="noopener">${p.credit}</a>.</span></figcaption></figure>`;
}
export function mobileSections(guide) {
  const p = platforms[guide.slug];
  return `<section id="browser" class="help-card"><p class="eyebrow">NO MEETING APP DOWNLOAD</p><h2>Computer browser</h2><p>${p.browser}</p></section>
<section id="mobile"><p class="eyebrow">DOWNLOADED MEETING APP + STAGELIGHT IN YOUR BROWSER</p><h2>Phone or tablet</h2><div class="help-card"><h3>Android</h3><p>${p.android}</p><h3 class="guide-subhead">iPhone &amp; iPad</h3><p>${p.ios}</p>${p.extra ? `<p>${p.extra}</p>` : ''}</div><div class="help-card mobile-note"><h3>Test on your device first</h3><p>These are the meeting provider’s sharing steps. Stagelight playback while switching between mobile apps is not verified. Your phone may pause music or limit screen audio. If that happens, present from a computer.</p><p>Mobile sharing can expose your whole screen and notifications. Enable Do Not Disturb and stop sharing before opening anything private.</p></div></section>
<p class="help-note">Based on <a href="${p.source}" target="_blank" rel="noopener">${guide.name} sharing documentation ↗</a>. Button names can vary by version and device.</p>`;
}
