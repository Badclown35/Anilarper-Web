/* AniList discovery: responsive filters, safe query construction, pagination and title details. */
let discoverPage=1,discoverHasNext=false,lastDiscoverQuery='';
const GENRES=['Action','Adventure','Comedy','Drama','Fantasy','Horror','Mystery','Psychological','Romance','Sci-Fi','Slice of Life','Sports','Supernatural','Thriller'];
function discover(q=''){
  lastDiscoverQuery=q;discoverPage=1;
  page.innerHTML=heading('Discover anime','Explore the AniList catalog')+
    '<div class="discover-tools"><input class="searchbar" id="q" placeholder="Search anime titles…" value="'+esc(q)+'">'+
    '<div class="filters discover-filters"><select id="dgenre"><option value="">All genres</option>'+GENRES.map(x=>'<option>'+x+'</option>').join('')+'</select>'+
    '<select id="dformat"><option value="">All formats</option>'+['TV','TV_SHORT','MOVIE','OVA','ONA','SPECIAL'].map(x=>'<option>'+x+'</option>').join('')+'</select>'+
    '<select id="dstatus"><option value="">Any status</option>'+['RELEASING','FINISHED','NOT_YET_RELEASED','CANCELLED'].map(x=>'<option>'+x+'</option>').join('')+'</select>'+
    '<select id="dseason"><option value="">Any season</option>'+['WINTER','SPRING','SUMMER','FALL'].map(x=>'<option>'+x+'</option>').join('')+'</select>'+
    '<input class="field year-filter" id="dyear" type="number" min="1940" max="2100" placeholder="Year">'+
    '<select id="dsort"><option value="TRENDING_DESC">Trending</option><option value="POPULARITY_DESC">Most popular</option><option value="SCORE_DESC">Top rated</option><option value="START_DATE_DESC">Newest</option></select>'+
    '<button class="btn primary" id="dgo">Apply filters</button></div></div>'+
    '<div class="discover-meta"><span class="sub" id="dmeta">Loading anime…</span><span class="sub" id="dpage">Page 1</span></div>'+
    '<div class="grid discover-grid" id="results"><div class="empty">Loading anime…</div></div>'+
    '<div class="row section discover-pagination"><button class="btn" id="prev" disabled>← Previous</button><button class="btn" id="next" disabled>Next →</button></div>';
  const run=async(reset=true)=>{
    if(reset)discoverPage=1;
    const get=id=>document.querySelector('#'+id);
    const vars={page:discoverPage,sort:get('dsort').value};
    const defs=['$page:Int','$sort:[MediaSort]'];
    const args=['type:ANIME','isAdult:false','sort:$sort'];
    const search=get('q').value.trim(),genre=get('dgenre').value,format=get('dformat').value,status=get('dstatus').value,season=get('dseason').value,year=Number(get('dyear').value)||null;
    if(search){defs.push('$search:String');vars.search=search;args.push('search:$search')}
    if(genre){defs.push('$genre:[String]');vars.genre=[genre];args.push('genre_in:$genre')}
    if(format){defs.push('$format:MediaFormat');vars.format=format;args.push('format:$format')}
    if(status){defs.push('$status:MediaStatus');vars.status=status;args.push('status:$status')}
    if(season){defs.push('$season:MediaSeason');vars.season=season;args.push('season:$season')}
    if(year){defs.push('$year:Int');vars.year=year;args.push('seasonYear:$year')}
    const box=get('results'),meta=get('dmeta');box.innerHTML='<div class="empty">Finding anime…</div>';meta.textContent='Searching AniList…';
    get('prev').disabled=true;get('next').disabled=true;
    try{
      const query='query('+defs.join(',')+'){Page(page:$page,perPage:24){pageInfo{hasNextPage total} media('+args.join(',')+'){id title{romaji english native} coverImage{large extraLarge} format averageScore episodes genres description(asHtml:false)}}}';
      const d=await gql(query,vars);
      if(d.errors?.length)throw Error(d.errors.map(x=>x.message).join(' · '));
      const data=d.data?.Page;if(!data)throw Error('AniList returned an unexpected response.');
      results=data.media||[];discoverHasNext=!!data.pageInfo?.hasNextPage;
      box.innerHTML=results.map(card).join('')||'<div class="empty">No anime matched those filters. Try clearing one or more filters.</div>';
      meta.textContent=(data.pageInfo?.total??results.length).toLocaleString()+' matching titles';
      get('dpage').textContent='Page '+discoverPage;
      get('prev').disabled=discoverPage===1;get('next').disabled=!discoverHasNext;
    }catch(e){meta.textContent='Could not load results';box.innerHTML='<div class="empty"><b>Anime search is temporarily unavailable.</b><p>'+esc(e.message)+'</p><button class="btn primary" onclick="discover(\''+esc(search).replace(/'/g,"\\'")+'\')">Try again</button></div>'}
  };
  document.querySelector('#dgo').onclick=()=>run(true);
  document.querySelector('#q').onkeydown=e=>{if(e.key==='Enter')run(true)};
  ['dgenre','dformat','dstatus','dseason','dyear','dsort'].forEach(id=>document.querySelector('#'+id).addEventListener('change',()=>run(true)));
  document.querySelector('#prev').onclick=()=>{if(discoverPage>1){discoverPage--;run(false)}};
  document.querySelector('#next').onclick=()=>{if(discoverHasNext){discoverPage++;run(false)}};
  run();
}
async function animeDetails(id){
  page.innerHTML=heading('Anime details','Loading title information…')+'<div class="empty">Loading details…</div>';
  try{
    const d=await gql('query($id:Int){Media(id:$id,type:ANIME){id idMal title{romaji english native} coverImage{large extraLarge} format status episodes averageScore season seasonYear genres studios(isMain:true){nodes{name}} description(asHtml:false) startDate{year month day} endDate{year month day} relations{edges{relationType node{id title{romaji english native}coverImage{large}format}}} recommendations(page:1,perPage:8){nodes{mediaRecommendation{id title{romaji english native}coverImage{large extraLarge}format averageScore}}}}}',{id});
    if(d.errors?.length)throw Error(d.errors.map(x=>x.message).join(' · '));
    const a=d.data?.Media;if(!a)throw Error('Title details were not returned.');
    results=[a,...(a.recommendations?.nodes||[]).map(x=>x.mediaRecommendation).filter(Boolean)];
    page.innerHTML='<button class="btn" onclick="setTab(\'Discover\')">← Back to discover</button><div class="row section details-hero" style="align-items:flex-start"><img src="'+esc(a.coverImage?.large||'')+'" style="width:130px;border-radius:14px"><div style="flex:1"><h2>'+esc(title(a))+'</h2><span class="pill">'+esc(a.format||'ANIME')+'</span><p class="sub">'+esc(a.status||'')+' · '+(a.episodes||'?')+' episodes · '+(a.averageScore||'—')+'%</p><button class="btn primary" onclick="toggle('+a.id+')">'+(library.some(x=>x.id===a.id)?'In your library':'Add to library')+'</button></div></div><section class="section">'+heading('Synopsis')+'<p class="sub synopsis">'+esc((a.description||'No synopsis available.').replace(/<[^>]*>/g,' '))+'</p></section><section class="section">'+heading('Genres')+a.genres.map(x=>'<span class="chip">'+esc(x)+'</span>').join('')+'</section><section class="section">'+heading('Production')+'<p class="sub">'+(a.studios?.nodes||[]).map(x=>esc(x.name)).join(' · ')+'</p></section><section class="section">'+heading('Related anime')+(a.relations?.edges||[]).map(x=>'<div class="coverrow" onclick="animeDetails('+x.node.id+')"><img src="'+esc(x.node.coverImage?.large||'')+'"><div><b>'+esc(title(x.node))+'</b><p class="sub">'+esc(x.relationType.replaceAll('_',' '))+' · '+esc(x.node.format||'')+'</p></div></div>').join('')+'</section><section class="section">'+heading('You might also like')+'<div class="grid">'+(a.recommendations?.nodes||[]).map(x=>x.mediaRecommendation).filter(Boolean).map(card).join('')+'</div></section>';
  }catch(e){page.innerHTML=heading('Anime details','Could not load title')+'<div class="empty">'+esc(e.message)+'</div>'}
}
page.addEventListener('click',e=>{if(e.target.closest('button')||e.target.closest('select')||e.target.closest('input'))return;let c=e.target.closest('.card');if(!c)return;let id=Number(c.dataset.animeId);if(Number.isInteger(id)&&id>0){animeDetails(id);return}let h=c.querySelector('h3');if(!h)return;let a=results.find(x=>title(x)===h.textContent);if(a)animeDetails(a.id)});
