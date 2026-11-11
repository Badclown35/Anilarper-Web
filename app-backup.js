/* Reliable browser backup/export and restore. */
function exportBackup(){
  const data={
    format:'anilarper-web-backup',version:1,library,reading,lists,quests,historyRows,
    profile:JSON.parse(localStorage.getItem('anilarper-profile')||'{}'),
    musicLinks:JSON.parse(localStorage.getItem('anilarper-music-links')||'[]'),
    accent:localStorage.getItem('anilarper-accent')
  };
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;a.download='anilarper-web-backup.json';
  a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  // Give the browser time to begin the download before releasing the object URL.
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function restoreBackup(file){
  const msg=document.querySelector('#backupMsg');
  try{
    if(!file)return;
    const data=JSON.parse(await file.text());
    if(data.format!=='anilarper-web-backup'||data.version!==1)throw Error('This is not a supported Anilarper Web backup.');
    if(!Array.isArray(data.library)||!Array.isArray(data.reading)||!Array.isArray(data.lists)||
       !Array.isArray(data.historyRows)||!data.quests||typeof data.quests!=='object'){
      throw Error('The backup is missing required data or has an invalid format.');
    }
    if(!confirm('Replace the data stored in this browser with this backup?'))return;
    // Validate first, then replace the in-memory and persisted copies together.
    library=data.library;reading=data.reading;lists=data.lists;quests=data.quests;historyRows=data.historyRows;
    save();
    const values=[
      ['anilarper-reading',reading],['anilarper-lists',lists],['anilarper-quests',quests],
      ['anilarper-history',historyRows],['anilarper-profile',data.profile||{}],
      ['anilarper-music-links',Array.isArray(data.musicLinks)?data.musicLinks:[]]
    ];
    for(const [key,value] of values)localStorage.setItem(key,JSON.stringify(value));
    if(data.accent){setAccent(data.accent)}else{localStorage.removeItem('anilarper-accent');document.documentElement.style.removeProperty('--violet')}
    if(msg)msg.textContent='Backup restored successfully. Your library and other sections are updated.';
  }catch(error){
    if(msg)msg.textContent='Restore failed: '+(error?.message||'Unknown error');
  }
}
