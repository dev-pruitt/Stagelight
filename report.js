(() => {
 const draft=document.getElementById('report-draft'),platform=document.getElementById('report-platform'),email=document.getElementById('open-email'),status=document.getElementById('report-status');
 const names={obs:'OBS',twitch:'Twitch',youtube:'YouTube',kick:'Kick',zoom:'Zoom',teams:'Teams',meet:'Meet'};
 const selected=names[new URLSearchParams(location.search).get('platform')];if(selected)platform.value=selected;
 function update(){email.href='mailto:support@t64.org?subject='+encodeURIComponent('Stagelight support — '+platform.value)+'&body='+encodeURIComponent('Using Stagelight with: '+platform.options[platform.selectedIndex].text+'\n\n'+draft.value);}
 platform.addEventListener('change',update);draft.addEventListener('input',update);update();
 document.getElementById('copy-report').addEventListener('click',async()=>{const text='To: support@t64.org\nSubject: Stagelight support — '+platform.value+'\n\nUsing Stagelight with: '+platform.options[platform.selectedIndex].text+'\n\n'+draft.value;try{await navigator.clipboard.writeText(text);status.textContent='Copied. Paste into your email app and send when ready.';}catch{draft.focus();draft.select();status.textContent='Select and copy the draft, then email support@t64.org.';}});
})();
