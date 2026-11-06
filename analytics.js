/*
 * Yandex Metrica is deliberately disabled until the client supplies a counter ID.
 * Replace 0 with the numeric ID. The counter loads only after explicit consent.
 */
const YANDEX_METRIKA_ID=0;
const ANALYTICS_CONSENT_KEY='tvoya-spina-analytics-consent-v1';

const cookieBanner=document.querySelector('#cookie-banner');
const cookieSettings=document.querySelector('#cookie-settings');
const analyticsAccept=document.querySelector('#analytics-accept');
const analyticsReject=document.querySelector('#analytics-reject');
const metrikaEnabled=Number.isInteger(YANDEX_METRIKA_ID)&&YANDEX_METRIKA_ID>0;
let metrikaLoaded=false;

function readAnalyticsConsent(){
  try{return localStorage.getItem(ANALYTICS_CONSENT_KEY);}catch{return null;}
}

function writeAnalyticsConsent(value){
  try{localStorage.setItem(ANALYTICS_CONSENT_KEY,value);}catch{}
}

function loadYandexMetrika(){
  if(!metrikaEnabled||metrikaLoaded)return;
  metrikaLoaded=true;
  window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments);};
  window.ym.l=Date.now();
  const script=document.createElement('script');
  script.async=true;
  script.src='https://mc.yandex.ru/metrika/tag.js';
  script.referrerPolicy='no-referrer';
  document.head.append(script);
  window.ym(YANDEX_METRIKA_ID,'init',{
    clickmap:true,
    trackLinks:true,
    accurateTrackBounce:true,
    webvisor:false
  });
}

function setAnalyticsConsent(value){
  writeAnalyticsConsent(value);
  if(cookieBanner)cookieBanner.hidden=true;
  if(value==='granted')loadYandexMetrika();
}

if(!metrikaEnabled){
  cookieBanner?.remove();
  cookieSettings?.remove();
}else{
  cookieSettings.hidden=false;
  const savedConsent=readAnalyticsConsent();
  if(savedConsent==='granted')loadYandexMetrika();
  else if(savedConsent!=='denied')cookieBanner.hidden=false;

  analyticsAccept?.addEventListener('click',()=>setAnalyticsConsent('granted'));
  analyticsReject?.addEventListener('click',()=>setAnalyticsConsent('denied'));
  cookieSettings?.addEventListener('click',()=>{
    cookieBanner.hidden=false;
    analyticsAccept?.focus();
  });

  document.addEventListener('click',event=>{
    if(readAnalyticsConsent()!=='granted'||typeof window.ym!=='function')return;
    const link=event.target.closest('a[href]');
    if(!link)return;
    const href=link.getAttribute('href')||'';
    let goal='';
    if(href.includes('dikidi.net'))goal='booking_click';
    else if(href.startsWith('tel:'))goal='phone_click';
    else if(href.includes('t.me/'))goal='telegram_click';
    else if(href.includes('yandex.ru/maps'))goal='map_click';
    if(goal)window.ym(YANDEX_METRIKA_ID,'reachGoal',goal);
  });
}
