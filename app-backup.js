/* Browser backup plus Android APK backup compatibility. */
function exportBackup(){
  const data={
    format:'anilarper-web-backup',version:1,library,reading,lists,quests,historyRows,
    profile:JSON.parse(localStorage.getItem('anilarper-profile')||'{}'),
    musicLinks:JSON.parse(localStorage.getItem('anilarper-music-links')||'[]'),
    accent:localStorage.getItem('anilarper-accent')
  };
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download='anilarper-web-backup.json';
  a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
function backupArray(value){
  if(Array.isArray(value))return value;
  if(typeof value==='string'){try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed:[]}catch(_){return []}}
  return [];
}
function androidAnime(row){
  const t=row.title;
  const titleObj=typeof t==='string'?{romaji:t,english:t,native:row.nativeTitle||''}:
    (t&&typeof t==='object'?t:{romaji:'Untitled',english:'',native:row.nativeTitle||''});
  const cover=typeof row.cover==='string'?row.cover:(row.coverImage?.large||row.coverImage?.extraLarge||'');
  return {
    id:Number(row.id)||row.id,title:titleObj,coverImage:{large:cover,extraLarge:cover},
    format:row.format||'',status:row.status||'',episodes:row.episodes??null,
    averageScore:row.averageScore??null,userScore:row.score??null,
    genres:Array.isArray(row.genres)?row.genres:[],studios:Array.isArray(row.studios)?row.studios:[],
    description:row.description||'',watchStatus:String(row.watchStatus||'PLANNING').toUpperCase(),
    progress:Number(row.progress)||0,lastWatchedAt:Number(row.lastWatchedAt)||0,
    season:row.season||'',seasonYear:row.seasonYear??null,isFavorite:!!row.isFavorite
  };
}
function androidReading(row){
  const id=String(row.id??'');
  const provider=String(row.provider||'AniList');
  const key=id.startsWith('kitsu-')||id.startsWith('ani-')?id:
    (provider.toLowerCase()==='kitsu'?'kitsu-'+id:'ani-'+id);
  return {
    id:key,title:String(row.title||'Untitled'),nativeTitle:row.nativeTitle||'',
    cover:row.cover||row.coverImage?.large||'',provider,
    kind:String(row.kind||'MANGA').toUpperCase()==='NOVEL'?'NOVEL':'MANGA',
    format:row.format||'',status:row.status||'',description:row.description||'',
    chapters:row.chapters??null,volumes:row.volumes??null,
    progress:Number(row.progress)||0,volumeProgress:Number(row.volumeProgress)||0,
    readingStatus:String(row.readingStatus||'PLANNING').toUpperCase()
  };
}
function convertAndroidBackup(data){
  if(data?.format!=='anilarper-backup'||Number(data.version)!==1||!data.preferences||typeof data.preferences!=='object'){
    throw Error('This is not a supported Anilarper Android backup.');
  }
  const p=data.preferences;
  const animeRows=backupArray(p.library);
  const readingRows=backupArray(p.readingLibrary);
  if(!animeRows.length&&!readingRows.length&&Object.keys(p).length===0)throw Error('This Android backup contains no collection data.');
  const anime=animeRows.filter(x=>x&&typeof x==='object'&&x.id!=null).map(androidAnime);
  const read=readingRows.filter(x=>x&&typeof x==='object'&&x.id!=null).map(androidReading);
  if((animeRows.length+readingRows.length)>0&&!anime.length&&!read.length)throw Error('The backup collections could not be read. Nothing was changed.');
  const profile={
    name:p.profileName||'ANILARPER MEMBER',bio:p.profileBio||'',
    avatar:p.profileAvatar||'',favorites:p.profileFavorites||''
  };
  const links=backupArray(p.musicLinks||p.musicLinksJson);
  let importedLists=backupArray(p.customLists||p.lists);
  const importedQuests={
    androidXp:Number(p.questXp)||0,
    androidClaimedQuests:backupArray(p.claimedQuests)
  };
  return {library:anime,reading:read,lists:importedLists,quests:importedQuests,
    historyRows:[],profile,musicLinks:links,accent:null,androidPreferences:p};
}
async function restoreBackup(file){
  const msg=document.querySelector('#backupMsg');
  try{
    if(!file)return;
    const data=JSON.parse(await file.text());
    let next;
    if(data?.format==='anilarper-web-backup'&&data.version===1){
      if(!Array.isArray(data.library)||!Array.isArray(data.reading)||!Array.isArray(data.lists)||
         !Array.isArray(data.historyRows)||!data.quests||typeof data.quests!=='object'){
        throw Error('The web backup is missing required data or has an invalid format.');
      }
      next=data;
    }else{
      next=convertAndroidBackup(data);
    }
    const count=next.library.length+next.reading.length;
    const source=next.androidPreferences?'Android APK':'Anilarper Web';
    if(!confirm('Import '+source+' backup with '+next.library.length+' anime and '+next.reading.length+' reading titles? This replaces the data stored in this browser. Your selected backup file will not be changed.'))return;
    library=next.library;reading=next.reading;lists=next.lists||[];quests=next.quests||{};historyRows=next.historyRows||[];
    save();
    const values=[
      ['anilarper-reading',reading],['anilarper-lists',lists],['anilarper-quests',quests],
      ['anilarper-history',historyRows],['anilarper-profile',next.profile||{}],
      ['anilarper-music-links',Array.isArray(next.musicLinks)?next.musicLinks:[]]
    ];
    for(const [key,value] of values)localStorage.setItem(key,JSON.stringify(value));
    if(next.androidPreferences)localStorage.setItem('anilarper-android-backup-original',JSON.stringify(next.androidPreferences));
    if(next.accent){setAccent(next.accent)}else if(next.androidPreferences){
      const palette=['#9b8cff','#55d7e8','#ff8fbf','#ffc36e','#7de3a6'];
      const index=Number(next.androidPreferences.profileAccent);
      if(Number.isInteger(index)&&palette[index])setAccent(palette[index]);
    }
    if(msg)msg.textContent='Backup imported successfully: '+count+' titles restored from '+source+'.';
    if(typeof render==='function')render();
  }catch(error){
    if(msg)msg.textContent='Restore failed: '+(error?.message||'Unknown error')+'. No browser data was replaced.';
  }
}
