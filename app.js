const botanicalIntro=document.querySelector('.botanical-intro');
const introMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(botanicalIntro){
  let introSeen=false;
  try{introSeen=sessionStorage.getItem('tvoya-spina-intro-v2')==='seen';}catch{}
  if(introSeen||introMotion.matches){botanicalIntro.remove();}
  else{
    botanicalIntro.hidden=false;
    const finishIntro=()=>{
      try{sessionStorage.setItem('tvoya-spina-intro-v2','seen');}catch{}
      botanicalIntro.remove();
    };
    window.requestAnimationFrame(()=>botanicalIntro.classList.add('is-opening'));
    botanicalIntro.querySelector('.botanical-panel-right')?.addEventListener('animationend',finishIntro,{once:true});
    window.setTimeout(finishIntro,1600);
  }
}

const menuButton=document.querySelector('.menu-button');
const nav=document.querySelector('.header nav');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню');menuButton.focus();}});
const load=document.querySelector('#load-reviews'),close=document.querySelector('#close-reviews'),widget=document.querySelector('#review-widget'),placeholder=document.querySelector('#review-placeholder'),yandexConsent=document.querySelector('#yandex-consent');
if(load&&close&&widget&&placeholder&&yandexConsent){
  const syncYandexConsent=()=>{load.disabled=!yandexConsent.checked;};
  syncYandexConsent();
  yandexConsent.addEventListener('change',syncYandexConsent);
  load.addEventListener('click',()=>{
    if(!yandexConsent.checked)return;
    const frame=document.createElement('iframe');
    frame.title='Отзывы о студии «Твоя спина» на Яндекс Картах';
    frame.referrerPolicy='no-referrer';
    frame.loading='lazy';
    frame.src='https://yandex.ru/maps-reviews-widget/68532083989?comments';
    widget.replaceChildren(frame);widget.hidden=false;placeholder.hidden=true;close.hidden=false;close.focus();
  });
  close.addEventListener('click',()=>{
    widget.replaceChildren();widget.hidden=true;placeholder.hidden=false;close.hidden=true;
    yandexConsent.checked=false;syncYandexConsent();load.focus();
  });
}

// Service cards stay compact on phones and tablets; one tap reveals the local photo and description.
document.documentElement.classList.add('service-accordion');
const compactServices=window.matchMedia('(max-width: 1050px), (hover: none)');
const serviceCards=[...document.querySelectorAll('.service')];
function setServiceOpen(card,open){
  card.classList.toggle('is-open',open);
  const toggle=card.querySelector('.service-toggle');
  if(toggle){toggle.setAttribute('aria-expanded',String(open));toggle.firstChild.textContent=open?'Скрыть подробности':'Показать подробнее';}
}
function toggleService(card){
  const shouldOpen=!card.classList.contains('is-open');
  if(shouldOpen)serviceCards.forEach(other=>{if(other!==card)setServiceOpen(other,false);});
  setServiceOpen(card,shouldOpen);
}
serviceCards.forEach(card=>{
  const detail=card.querySelector('.service-detail');
  if(!detail)return;
  const toggle=document.createElement('button');
  toggle.type='button';toggle.className='service-toggle';toggle.setAttribute('aria-controls',detail.id);toggle.setAttribute('aria-expanded','false');
  const icon=document.createElement('span');icon.textContent='+';icon.setAttribute('aria-hidden','true');
  toggle.append(document.createTextNode('Показать подробнее'),icon);
  card.append(toggle);setServiceOpen(card,false);
  toggle.addEventListener('click',event=>{event.stopPropagation();if(compactServices.matches)toggleService(card);});
  card.addEventListener('click',event=>{if(!compactServices.matches||event.target.closest('a,button'))return;toggleService(card);});
  card.addEventListener('keydown',event=>{
    if(!compactServices.matches||event.target!==card)return;
    if(event.key==='Escape'&&card.classList.contains('is-open')){event.preventDefault();setServiceOpen(card,false);return;}
    if(!['Enter',' '].includes(event.key))return;
    event.preventDefault();toggleService(card);
  });
});
compactServices.addEventListener('change',()=>serviceCards.forEach(card=>setServiceOpen(card,false)));

// One entrance per element; content remains visible if JS or motion is disabled.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let revealObserver;
function observeReveals(){
  revealObserver?.disconnect();
  if(reducedMotion.matches||!('IntersectionObserver' in window))return;
  revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal-enter');revealObserver.unobserve(entry.target);}});
  },{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  document.querySelectorAll('.section-top,.master-photo,.master-copy,.intro-film,.approach-shell,.studio-gallery,.steps article,.review-copy,.review-panel,.faq>div,.contact-main,.address-card').forEach(el=>{if(!el.classList.contains('reveal-enter'))revealObserver.observe(el);});
}
observeReveals();
reducedMotion.addEventListener('change',observeReveals);

// Continuous animation runs only while visible. No frame or scroll loops.
document.documentElement.classList.add('motion-ready');
const motionSections=document.querySelectorAll('[data-motion]');
if('IntersectionObserver' in window){
  const motionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('motion-visible',entry.isIntersecting)));
  motionSections.forEach(section=>motionObserver.observe(section));
}else{motionSections.forEach(section=>section.classList.add('motion-visible'));}
function suspendMotion(){document.documentElement.classList.toggle('motion-suspended',document.hidden);}
document.addEventListener('visibilitychange',suspendMotion);
suspendMotion();
const ticker=document.querySelector('.brand-ticker');
document.querySelector('.motion-toggle').addEventListener('click',event=>{
  const paused=ticker.classList.toggle('is-paused');
  event.currentTarget.setAttribute('aria-pressed',String(paused));
  event.currentTarget.setAttribute('aria-label',paused?'Продолжить бегущую строку':'Приостановить бегущую строку');
});

// Incoming client media uses local files and loads full images only on request.
const media=window.studioMedia||{};
function localAsset(path){
  if(typeof path!=='string'||!path.startsWith('assets/'))return '';
  const url=new URL(path,document.baseURI);
  return url.origin===location.origin?url.href:'';
}
const mediaDialog=document.querySelector('#media-dialog');
const fullImage=document.querySelector('#media-full-image');
const mediaCaption=document.querySelector('#media-caption');
let mediaOpener;
document.querySelector('.media-dialog-close').addEventListener('click',()=>mediaDialog.close());
mediaDialog.addEventListener('click',event=>{if(event.target===mediaDialog){const r=mediaDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)mediaDialog.close();}});
mediaDialog.addEventListener('close',()=>{fullImage.hidden=true;fullImage.removeAttribute('src');document.body.classList.remove('dialog-open');mediaOpener?.focus();});
function installGallery(selector,items){
  document.querySelectorAll(selector).forEach(slot=>{
    const key=slot.dataset.certificate||slot.dataset.direction;
    const item=items?.[key];
    const thumbnail=localAsset(item?.thumbnail),full=localAsset(item?.full||item?.thumbnail);
    if(!thumbnail||!full||!item.alt)return;
    const link=document.createElement('a');link.className='media-enlarge';link.href=full;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Увеличить: '+item.alt);
    const img=document.createElement('img');img.src=thumbnail;img.alt=item.alt;img.loading='lazy';img.decoding='async';img.width=900;img.height=1200;
    const label=document.createElement('span');label.className='media-enlarge-label';label.textContent='Увеличить';label.setAttribute('aria-hidden','true');
    link.append(img,label);slot.replaceChildren(link);
    link.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||typeof mediaDialog.showModal!=='function')return;
      event.preventDefault();mediaOpener=link;mediaCaption.textContent=item.alt;fullImage.alt=item.alt;fullImage.src=full;fullImage.hidden=false;mediaDialog.showModal();document.body.classList.add('dialog-open');
    });
  });
}
installGallery('[data-certificate]',media.certificates);
installGallery('[data-direction]',media.directions);
document.querySelectorAll('[data-lightbox]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||typeof mediaDialog.showModal!=='function')return;
  const full=localAsset(link.getAttribute('href'));
  if(!full)return;
  event.preventDefault();mediaOpener=link;
  const caption=link.dataset.lightbox||link.querySelector('img')?.alt||'Фотография студии';
  mediaCaption.textContent=caption;fullImage.alt=caption;fullImage.src=full;fullImage.hidden=false;mediaDialog.showModal();document.body.classList.add('dialog-open');
}));
