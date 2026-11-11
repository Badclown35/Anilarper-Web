/* Anilarper Web shell — browser-native navigation and lifecycle. */
(() => {
  const nav=[...document.querySelectorAll('.tab[data-tab]')], profileButton=document.querySelector('#profile'), page=document.querySelector('#page');
  const allowed=new Set(['Home','Discover','Library','Read','More']);
  let active='Home';
  const renderers={Home:()=>home(),Discover:()=>discover(),Library:()=>libraryPage(),Read:()=>readingPage(),More:()=>morePage()};
  function showError(error,label='This page could not load'){
    console.error('[Anilarper]',error);
    page.innerHTML='<section class="section"><div class="empty"><b>'+esc(label)+'</b><p>'+esc(error?.message||error||'Unknown error')+'</p><button class="btn primary" id="retryPage">Retry</button></div></section>';
    document.querySelector('#retryPage')?.addEventListener('click',render);
  }
  function setTab(next){
    if(!allowed.has(next))return;
    active=next;window.tab=next;
    const brandTitle=document.querySelector('.brand h1');if(brandTitle)brandTitle.textContent=next==='Read'?'Reading Shelf':'Your anime universe.';
    nav.forEach(b=>{const selected=b.dataset.tab===next;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'page':'false');b.setAttribute('aria-pressed',String(selected));});
    if(location.hash!=='#'+next)history.replaceState(null,'','#'+next);
    render();
  }
  function render(){
    const fn=renderers[active];if(typeof fn!=='function')return showError('Missing page module: '+active);
    try{const out=fn();if(out&&typeof out.then==='function')out.catch(showError);}catch(e){showError(e);}
  }
  window.setTab=setTab;window.render=render;
  nav.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
  profileButton?.addEventListener('click',()=>{try{profilePage();}catch(e){showError(e,'Profile could not load');}});
  window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(allowed.has(route)&&route!==active)setTab(route);});
  setTab(allowed.has(location.hash.slice(1))?location.hash.slice(1):'Home');
})();
