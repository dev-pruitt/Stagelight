const notta = 'https://www.notta.ai/en/blog/share-screen-on-google-meet/';
export const shots = {
  setup: ['stagelight-setup.png', 'Stagelight setup with music selected and Begin presentation at the top right.', 'Your setup stays in Stagelight. This example has one Audius song selected.', '', 'Stagelight'],
  zoomButton: ['zoom-share-button.jpg', 'Zoom meeting toolbar with Share Screen highlighted.', 'Find Share Screen in the meeting controls. Newer versions may say Share.', 'https://www.apeaksoft.com/mirror-screen/zoom-share-screen-not-working/', 'Apeaksoft'],
  zoomDialog: ['zoom-share-dialog.jpg', 'Zoom sharing picker with window tiles, Share sound and a blue Share button.', 'Select your Stagelight window. This example lists other windows.', 'https://www.airdroid.com/screen-mirror/how-to-fix-zoom-screen-share-not-working/', 'AirDroid'],
  zoomStop: ['zoom-sharing-controls.png', 'Zoom sharing toolbar with the red Stop Share button.', 'Use Stop Share to end the broadcast, without ending the meeting.', 'https://support.zoom.com/hc/en/article?id=zm_kb&sysparm_article=KB0060596', 'Zoom Support'],
  teamsPanel: ['teams-share-panel.jpg', 'Teams meeting Share button and sharing panel with sound and window choices.', 'Share opens this panel. Choose your Stagelight window, not the Teams meeting window.', 'https://www.avica.com/blog/sharing-audio-on-teams/', 'Avica'],
  teamsSound: ['teams-include-sound.png', 'Teams Include sound switch turned on.', 'The Include sound switch must be on for attendees to hear your music.', 'https://support.microsoft.com/en-us/teams/meetings/manage-audio-settings-in-microsoft-teams-meetings', 'Microsoft Support'],
  teamsStop: ['teams-stop.png', 'Teams sharing toolbar with Stop presenting highlighted.', 'Stop presenting ends the screen share. It does not leave the call.', 'https://allthings.how/how-to-share-screen-on-microsoft-teams/', 'All Things How'],
  meetPresent: ['meet-present.jpeg', 'Google Meet Present now button and A tab option highlighted.', 'Choose A tab for the Stagelight browser tab.', notta, 'Notta'],
  meetAudio: ['meet-tab-audio.png', 'Chrome tab picker with Also share tab audio enabled.', 'Select Stagelight from your own tab list. Turn on Also share tab audio, then Share.', 'https://tactiq.io/learn/unmute-google-meet-presentation', 'Tactiq'],
  meetStop: ['meet-stop.jpeg', 'Google Meet Stop presenting button highlighted in the presenting banner.', 'Return to Meet and select Stop presenting.', notta, 'Notta'],
  zoomMobile: ['zoom-mobile.png', 'Zoom mobile screen-sharing status with device audio on and Stop share.', 'After starting screen sharing, check that Share device audio is on.', 'https://participant-support.usertesting.com/hc/es/articles/50652957272723', 'UserTesting participant support'],
  teamsMobile: ['teams-mobile.jpg', 'Three Teams mobile screens showing More, Share and Share screen with audio enabled.', 'Follow the marked controls from left to right. Labels vary by app version.', 'https://www.apeaksoft.com/mirror-screen/share-screen-on-teams/', 'Apeaksoft'],
  meetAndroid: ['meet-android-share.jpeg', 'Meet mobile More menu with Share screen highlighted.', 'In the Meet app, open More and choose Share screen.', notta, 'Notta'],
  meetIOS: ['meet-ios-broadcast.jpeg', 'iPhone Screen Broadcast dialog with Meet selected and Start Broadcast highlighted.', 'Check that Meet is selected before starting the broadcast.', notta, 'Notta']
};
export function screenshot(key) {
  const [file,alt,caption,url,credit]=shots[key];
  return `<figure class="step-shot"><a href="./assets/help/${file}" target="_blank" rel="noopener" aria-label="Enlarge screenshot: ${alt}"><img src="./assets/help/${file}" alt="${alt}" loading="lazy"></a><figcaption>${caption}<span>Screenshot: ${url ? `<a href="${url}" target="_blank" rel="noopener">${credit}</a>` : credit}. Click image to enlarge.</span></figcaption></figure>`;
}
export const screenshotSteps = {
 zoom: [
 ['Prepare your screen', 'In Stagelight, add your title and music. Keep the app in its own browser window.', 'setup'],
 ['Open the sharing picker', 'In your Zoom meeting, click Share Screen or Share.', 'zoomButton'],
 ['Choose the Stagelight window', 'Click the window tile containing Stagelight. The example below has different window names.', 'zoomDialog'],
 ['Turn on sound and share', 'Check Share sound, then click the blue Share button. Attendees now receive the selected screen and computer audio.', 'zoomDialog'],
 ['Start your countdown', 'Switch to Stagelight and click Begin presentation at the top right. Ask an attendee to confirm the picture and sound.', 'setup'],
 ['Stop sharing when ready', 'Use Esc in Stagelight to stop the presentation. Then return to Zoom and click Stop Share.', 'zoomStop']
 ],
 teams: [
 ['Prepare Stagelight', 'Add your title and music in a separate browser window.', 'setup'],
 ['Open Share in Teams', 'Join the meeting, then click Share in the meeting toolbar.', 'teamsPanel'],
 ['Include the music', 'Turn on Include sound before selecting what to share.', 'teamsSound'],
 ['Select the Stagelight window', 'Under Window, choose the browser window containing Stagelight. Screen shares your entire desktop instead.', 'teamsPanel'],
 ['Begin and confirm', 'Return to Stagelight. Click Begin presentation at the top right. Ask an attendee to confirm both screen and audio.', 'setup'],
 ['End the screen share', 'Press Esc in Stagelight to stop its presentation, then choose Stop presenting in Teams.', 'teamsStop']
 ],
 meet: [
 ['Open Stagelight in another tab', 'Keep Meet in one Chrome tab and Stagelight in another. Add your title and music.', 'setup'],
 ['Open Present now', 'Join the meeting. Click the screen-with-arrow button, then choose A tab.', 'meetPresent'],
 ['Choose your Stagelight tab', 'Select Stagelight from the browser’s tab list. The screenshot uses example tabs; your list will differ.', 'meetAudio'],
 ['Enable audio and share', 'Turn on Also share tab audio, then click Share. The button becomes available after you select a tab.', 'meetAudio'],
 ['Begin your countdown', 'Switch to Stagelight. Click Begin presentation. Ask an attendee to confirm they see and hear it.', 'setup'],
 ['Stop presenting', 'Press Esc in Stagelight to stop its presentation. Return to Meet and click Stop presenting.', 'meetStop']
 ]
};
