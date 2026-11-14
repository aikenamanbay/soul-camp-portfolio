'use strict';
const paths={scale:'M12 3v17M6 21h12M3 7h18M6 7l-4 8h8L6 7zm12 0-4 8h8l-4-8z',home:'m3 10 9-7 9 7v10H3z M9 20v-7h6v7',book:'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1zm0 0v14',cards:'M3 8h15v12H3z M6 5h15v12 M9 2h12',test:'M6 4h12v17H6z M9 9h6m-6 4h6m-6 4h4',calendar:'M3 5h18v16H3z M7 3v4m10-4v4M3 10h18',landmark:'m3 8 9-5 9 5H3zm2 3v6m5-6v6m4-6v6m5-6v6M3 21h18',case:'M3 7h18v13H3z M8 7V4h8v3M3 12c6 3 12 3 18 0',shield:'m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6z m-3 9 2 2 4-5',hand:'m3 13 4-4 4 1 3-2 7 5-4 5-3 1-6-2-3 1z M3 10l3-2m12 1 3 2',people:'M15 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0z M5 20v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M3 13c2-1 3-3 2-5m16 5c-2-1-3-3-2-5',arrow:'M4 12h15m-6-6 6 6-6 6',back:'M20 12H5m6-6-6 6 6 6',check:'m5 12 4 4L19 6',clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z M12 6v6l4 2',target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',spark:'M12 2v20M2 12h20M5 5l14 14M19 5 5 19'};
const ic=(n)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+paths[n]+'"/></svg>';
const el=(s)=>document.querySelector(s), main=el('#main');
document.querySelectorAll('[data-icon]').forEach(x=>x.innerHTML=ic(x.dataset.icon));
const queryLanguage = new URL(location.href).searchParams.get('lang');
let savedLanguage;
try { savedLanguage = localStorage.getItem('pravo-language'); } catch {}
let language = (queryLanguage || savedLanguage) === 'kk' ? 'kk' : 'ru';
let ts, cases, examGroups, questions;
function setContentLanguage() {
 ts = language === 'kk' ? kazakhTopics : russianTopics;
 cases = language === 'kk' ? kazakhCases : russianCases;
 examGroups = makeExamGroups(ts, language);
 questions = examGroups.flatMap(group => group.questions);
}
setContentLanguage();
const by=id=>ts.find(t=>t.id===id);
const nCards=ts.reduce((a,t)=>a+t.cards.length,0);
const dates=[{day:13, name:'Государство и Конституция', ids:['theory','constitution','state']},{day:14,name:'Гражданское право и практика',ids:['civil','duties']},{day:15,name:'Труд и семья',ids:['labor','safety','family']},{day:16,name:'Правонарушения и ответственность',ids:['admin','criminal']},{day:17,name:'Пробный зачёт и разбор ошибок',ids:[]}];
const now=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Atyrau',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
const dateKey=now.year+'-'+now.month+'-'+now.day;
const remain=Math.round((Date.parse('2026-11-18')-Date.parse(dateKey))/86400000);
const today=dates.find(d=>'2026-11-'+d.day===dateKey);
let st={done:{},known:{},miss:{},best:0,last:null};
try{st={...st,...JSON.parse(localStorage.getItem('pravo-course-v1')||'{}')}}catch{}
function save(){try{localStorage.setItem('pravo-course-v1',JSON.stringify(st))}catch{toast('Браузер не сохранил прогресс.')}}
let timer;
function toast(s){const o=el('#toast');o.textContent=language==='kk'?translateUi(s):s;o.hidden=false;clearTimeout(timer);timer=setTimeout(()=>o.hidden=true,2300)}
const mockQuestionsPerLecture=5;
const mockQuestionCount=()=>examGroups.length*mockQuestionsPerLecture;
const mistakeCount=()=>questions.filter(question=>st.miss[question.id]).length;
const done=()=>ts.filter(t=>st.done[t.id]).length;
const learnt=()=>ts.reduce((a,t)=>a+t.cards.filter((_,i)=>st.known[t.id+':'+i]).length,0);
const bar=(v,max)=>'<div class="meter" role="progressbar" aria-valuenow="'+v+'" aria-valuemin="0" aria-valuemax="'+max+'" aria-label="Прогресс"><span style="width:'+Math.round(v/max*100)+'%"></span></div>';
const link=(href,label,style='primary',icon='arrow')=>'<a class="btn '+style+'" href="#'+href+'">'+label+(icon?ic(icon):'')+'</a>';
const button=(action,label,style='secondary',val='')=>'<button type="button" class="btn '+style+'" data-act="'+action+'" data-val="'+val+'">'+label+'</button>';
const pill=(icon,s)=>'<span class="pill">'+ic(icon)+s+'</span>';
const head=(tag,title,sub='')=>'<header class="pagehead"><div class="eyebrow">'+tag+'</div><h1>'+title+'</h1>'+(sub?'<p>'+sub+'</p>':'')+'</header>';
const navItems=[['home','home','Обзор'],['plan','calendar','План подготовки'],['topics','book','Лекции'],['cards','cards','Флэш-карты'],['practice','case','Практика'],['quiz','test','Тесты']];
function nav(page){let base={lesson:'topics',study:'cards',run:'quiz'}[page]||page;el('#nav').innerHTML=navItems.map(([id,i,s])=>'<a href="#'+id+'" '+(base===id?'aria-current="page"':'')+'>'+ic(i)+'<span>'+s+'</span></a>').join('')}
const tones=['mint','lilac','rose','butter','sky','peach','rose','sky','butter','lilac'];
const numeral=i=>String(i).padStart(2,'0');
function topicCard(t){
 const i=ts.indexOf(t), complete=st.done[t.id];
 return '<a class="topic panel tone-'+tones[i]+'" href="#lesson/'+t.id+'"><div class="topic-top"><span class="tile">'+ic(t.icon)+'</span><span class="topic-index">ЛЕКЦИЯ '+numeral(i+1)+'</span></div><div class="topic-art" aria-hidden="true">'+ic(t.icon)+'</div><div class="topic-copy"><h3>'+t.title+'</h3><p>'+t.desc+'</p></div><div class="topic-bottom">'+(complete?pill('check','Изучено'):pill('clock',t.minutes+' мин'))+'<span class="round-arrow">'+ic('arrow')+'</span></div></a>'
}
function dayRow(d){let finished=d.ids.length?d.ids.every(id=>st.done[id]):st.last!==null;return '<div class="dayrow" id="plan-day-'+d.day+'"><span class="daynum">'+d.day+'<small>НОЯ</small></span><div><strong>'+d.name+'</strong><div class="daylinks">'+(d.ids.length?d.ids.map(id=>'<a href="#lesson/'+id+'">'+by(id).title+(st.done[id]?' ✓':'')+'</a>').join(''):'<a href="#run/mock">Пройти пробный тест</a><a href="#quiz">Разобрать ошибки</a>')+'</div></div>'+(finished?'<span class="state">Готово</span>':d===today?'<span class="state">Сегодня</span>':'')+'</div>'}
const art='<svg class="hero-art" viewBox="0 0 250 210" aria-hidden="true"><defs><pattern id="law-dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#4b3660" opacity=".27"/></pattern></defs><circle cx="128" cy="104" r="85" fill="url(#law-dots)"/><g stroke="#211829" stroke-width="1.6" stroke-linejoin="round"><rect x="81" y="43" width="112" height="132" rx="14" transform="rotate(15 137 109)" fill="#a9cfbe"/><rect x="67" y="38" width="112" height="132" rx="14" transform="rotate(-11 123 104)" fill="#e6d1f7"/><g transform="rotate(-11 123 104)" fill="none" stroke-width="2.2" stroke-linecap="round"><path d="M123 62v58m-16 0h32m-48-39h64M99 81l-11 22h22L99 81Zm48 0-11 22h22l-11-22Z"/><path d="M97 139h52m-38 9h24" stroke="#66547a"/></g><circle cx="187" cy="141" r="22" fill="#f5d982"/><path d="m178 141 6 6 11-12" fill="none" stroke-width="2.3" stroke-linecap="round"/><path d="M46 43v18m-9-9h18m153 2v20m-10-10h20M58 147v14m-7-7h14" fill="none" stroke-linecap="round"/></g></svg>';
function studyRail(){
 const agenda=today||dates.find(d=>d.ids.some(id=>!st.done[id]))||dates[4];
 const dateLabel=today?'Сегодня, '+today.day+' ноября':agenda.day+' ноября';
 const agendaLinks=agenda.ids.length?agenda.ids.map((id,i)=>{const t=by(id);return '<a class="agenda-item tone-'+tones[ts.indexOf(t)]+'" href="#lesson/'+id+'"><span class="agenda-icon">'+ic(st.done[id]?'check':t.icon)+'</span><span><strong>'+t.title+'</strong><small>'+(st.done[id]?'Изучено':t.minutes+' мин')+'</small></span>'+ic('arrow')+'</a>'}).join(''):'<a class="agenda-item tone-lilac" href="#run/mock"><span class="agenda-icon">'+ic('test')+'</span><span><strong>Пробный зачёт</strong><small>'+mockQuestionCount()+' вопросов</small></span>'+ic('arrow')+'</a>';
 const marks=dates.map(d=>{const checked=d.ids.length?d.ids.every(id=>st.done[id]):st.last!==null;return '<a href="#plan/'+d.day+'" class="'+(d===today?'current ':'')+(checked?'finished':'')+'" aria-label="'+d.day+' ноября'+(checked?', готово':'')+'"><small>'+['ПТ','СБ','ВС','ПН','ВТ'][d.day-13]+'</small><strong>'+d.day+'</strong></a>'}).join('');
 const metrics=[['book','Лекции',done(),ts.length],['cards','Флэш-карты',learnt(),nCards],['target','Лучший тест',st.last===null?'—':st.best+'%',null]];
 return '<aside class="study-rail" aria-label="План и прогресс"><div class="rail-head"><div><div class="eyebrow">13–17 НОЯБРЯ</div><h2>Мой план</h2></div><span class="rail-icon">'+ic('calendar')+'</span></div><div class="week-strip">'+marks+'</div><div class="agenda"><h3>'+dateLabel+'</h3>'+agendaLinks+'</div>'+link('plan','Весь план','secondary')+'<section class="rail-progress"><div class="eyebrow">ПОДГОТОВКА</div><h3>Мой прогресс</h3>'+metrics.map(([icon,label,val,max])=>'<div class="rail-metric">'+ic(icon)+'<span>'+label+'</span><strong>'+val+(max?'<small> / '+max+'</small>':'')+'</strong></div>').join('')+'</section></aside>'
}
function home(){
 const next=(today?.ids||[]).map(by).find(t=>!st.done[t.id])||ts.find(t=>!st.done[t.id]);
 const pick=remain===1?'run/mock':next?'lesson/'+next.id:'run/mock';
 const prep=remain>0?'До зачёта · '+remain+' '+(remain===1?'день':remain<5?'дня':'дней'):remain===0?'Зачёт сегодня':'Зачёт · 18 ноября';
 return '<div class="dashboard"><div class="dashboard-intro"><div class="topline"><span class="eyebrow">ЛИЧНЫЙ КАБИНЕТ / ОБЗОР</span>'+pill('calendar','18 ноября 2026')+'</div><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="dot"></span> '+prep+'</div><h1>'+(language==='kk'?'Сынаққа дайындық':'Право к зачёту')+'<span>.</span></h1><p>Десять лекций по праву Казахстана, флэш-карты и задачи с занятий.</p>'+link(pick,remain===1||!next?'Пройти пробный зачёт':done()?'Продолжить подготовку':'Начать подготовку')+'</div>'+art+'</section></div>'+studyRail()+'<div class="dashboard-courses"><div class="sectionhead"><div><div class="eyebrow">ПО МАТЕРИАЛАМ ЗАНЯТИЙ</div><h2>Лекции</h2></div>'+link('topics','Все лекции','plain')+'</div><div class="grid course-grid">'+ts.slice(0,4).map(topicCard).join('')+'</div></div></div>'
}
function plan(){return head('13–17 НОЯБРЯ','План подготовки','Распределение уроков до зачёта 18 ноября. На 17 ноября оставь пробный тест и повторение ошибок.')+'<div class="panel progress"><strong>'+done()+' из '+ts.length+' уроков изучено</strong>'+bar(done(),ts.length)+'</div><section class="panel daylist">'+dates.map(dayRow).join('')+'</section>'}
function lectureList(){
 return '<div class="dashboard"><div class="dashboard-intro"><header class="catalog-head"><div class="eyebrow">МАТЕРИАЛЫ КУРСА</div><h1>Лекции<span>.</span></h1><p>Десять лекций по твоим занятиям. В каждой — схема, ключевые понятия и 15 вопросов трёх уровней.</p></header></div>'+studyRail()+'<div class="dashboard-courses"><div class="catalog-caption"><span>Все лекции</span><span>'+done()+' из '+ts.length+' изучено</span></div><div class="grid course-grid">'+ts.map(topicCard).join('')+'</div></div></div>'
}
const levels=['Лёгкий','Средний','Сложный'];
let levelBy={};
function review(t){
 const level=levelBy[t.id]||0;
 return '<section class="panel reading review" id="review"><div class="eyebrow">ПРОВЕРЬ СЕБЯ</div><h2>Вопросы по лекции</h2><p>Ответь своими словами, затем открой пример ответа.</p><div class="levels" aria-label="Уровень сложности">'+levels.map((s,i)=>'<button type="button" class="btn '+(i===level?'primary':'secondary')+'" aria-pressed="'+(i===level)+'" data-act="level" data-val="'+i+'">'+s+' · 5</button>').join('')+'</div><ol>'+t.levels[level].map(([q,a])=>'<li><details><summary>'+q+'</summary><p>'+a+'</p></details></li>').join('')+'</ol></section>';
}
function lesson(t){const i=ts.indexOf(t)+1;const sources=[t.source,...(t.extra||[])].filter(Boolean);const related=cases.map((c,j)=>[c,j]).filter(([c])=>c[0]===t.id);return '<a class="back" href="#topics">'+ic('back')+'Все лекции</a>'+head('УРОК '+i+' ИЗ '+ts.length,t.title,t.desc)+memoryVisual(t.id, language)+'<div class="lesson-layout"><section class="panel reading"><h2>Главное из лекции</h2>'+t.cards.map(([k,v],j)=>'<div class="point"><span>'+String(j+1).padStart(2,'0')+'</span><div><h3>'+k+'</h3><p>'+v+'</p></div></div>').join('')+(sources.length?'<div class="sources">Официальные источники: '+sources.map(([s,u])=>'<a href="'+u+'" target="_blank" rel="noopener">'+s+' ↗</a>').join(' · ')+'</div>':'')+'</section><aside class="panel tools"><h3>Закрепить урок</h3>'+link('study/'+t.id,'Флэш-карты','secondary')+link('run/'+t.id,'Тест по уроку','secondary')+related.map(([c,j])=>link('practice/'+j,c[1],'secondary')).join('')+button('done',st.done[t.id]?ic('check')+' Изучено':'Отметить изученным',st.done[t.id]?'secondary':'primary',t.id)+'</aside></div>'+review(t)}
let cardKey='', cardIndex=0, flipped=false;
function study(id){const t=by(id), all=(t?[t]:ts).flatMap(o=>o.cards.map(([k,v],i)=>({k,v,key:o.id+':'+i,topic:o.title})));if(cardKey!==id){cardKey=id;cardIndex=0;flipped=false} const item=all[cardIndex];return '<a class="back" href="#cards">'+ic('back')+'К наборам</a>'+head('КАРТОЧКИ',t?t.title:'Все лекции','Сначала вспомни определение, дату или ключевую идею, затем открой ответ.')+'<div class="panel drill"><div class="drill-meta"><span>'+item.topic+'</span><span>'+ (cardIndex+1)+' / '+all.length+'</span></div>'+bar(cardIndex+1,all.length)+'<button type="button" class="flash '+(flipped?'flipped':'')+'" data-act="flip" aria-pressed="'+flipped+'"><small>'+(flipped?'ОТВЕТ':'ВСПОМНИ ОТВЕТ')+'</small><strong>'+item.k+'</strong><span>'+(flipped?item.v:'Нажми, чтобы открыть ответ')+'</span></button><div class="actions">'+button('card-prev',ic('back')+' Назад')+(flipped?button('know',st.known[item.key]?'✓ Запомнено':'Запомнила','primary',item.key):'')+button('card-next','Далее '+ic('arrow'))+'</div></div>'}
function cardList(){return head('АКТИВНОЕ ПОВТОРЕНИЕ','Флэш-карты','Открой набор и проверь, какие определения можешь вспомнить без подсказки.')+'<div class="panel progress"><div><strong>'+learnt()+' из '+nCards+' карточек запомнено</strong>'+bar(learnt(),nCards)+'</div>'+link('study/all','Все карточки')+'</div><div class="grid">'+ts.map(t=>'<a class="panel listtile" href="#study/'+t.id+'"><span class="tile '+t.color+'">'+ic(t.icon)+'</span><div><strong>'+t.title+'</strong><small>'+t.cards.filter((_,i)=>st.known[t.id+':'+i]).length+' / '+t.cards.length+' запомнено</small></div>'+ic('arrow')+'</a>').join('')+'</div>'}
function practice(id){return head('ЗАДАЧИ ИЗ КУРСА','Практика','Сформулируй решение вслух или запиши его. Затем сравни с разбором.')+'<div class="practice-list">'+cases.map(([key,title,q,a,src],i)=>'<article class="panel practice"><div class="eyebrow">'+src+'</div><h3>'+title+'</h3><p>'+q+'</p><details '+(id!==undefined&&Number(id)===i?'open':'')+'><summary>Показать разбор</summary><p>'+a+'</p><a href="#lesson/'+key+'">К конспекту урока →</a></details></article>').join('')+'</div>'}
let run=null;
const shuffled=a=>{const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
function quiz(){return head('САМОПРОВЕРКА','Тесты','После каждого ответа будет пояснение. Ошибки сохраняются для повторения.')+'<div class="panel progress mock"><div><h2>Пробный зачёт</h2><p>'+mockQuestionCount()+' вопросов: по 5 из каждого из '+examGroups.length+' разделов.'+(st.last===null?'':' Последний результат: '+st.last+'%.')+'</p></div>'+link('run/mock','Начать тест')+'</div><div class="panel progress"><div><strong>Работа над ошибками</strong><p>'+mistakeCount()+' вопросов для повторения</p></div>'+(mistakeCount()?link('run/miss','Повторить','secondary'):'<span class="muted">Пока нет ошибок</span>')+'</div><div class="grid">'+examGroups.map(t=>'<a class="panel listtile" href="#run/'+t.id+'"><span class="tile '+t.color+'">'+ic(t.icon)+'</span><div><strong>'+t.title+'</strong><small>Вопросов: '+t.questions.length+'</small></div>'+ic('arrow')+'</a>').join('')+'</div>'}
function runView(id){
 const group=examGroups.find(item=>item.id===id);
 if(!run||run.id!==id){
  let selection;
  if(id==='mock') selection=shuffled(examGroups.flatMap(group=>shuffled(group.questions).slice(0,mockQuestionsPerLecture)));
  else if(id==='miss') selection=questions.filter(question=>st.miss[question.id]);
  else if(id==='civil'||id==='family') selection=group.questions;
  else selection=shuffled(group?.questions||[]);
  run={id,q:selection,i:0,sel:null,score:0,wrong:[],end:false};
 }
 const title=id==='mock'?'Пробный зачёт':id==='miss'?'Работа над ошибками':group?.title;
if(!run.q.length)return quiz();
const back='<a class="back" href="#quiz">'+ic('back')+'К тестам</a>';
if(run.end){return back+head('РЕЗУЛЬТАТ',title)+'<div class="panel drill"><h2>'+run.score+' из '+run.q.length+' верно</h2>'+bar(run.score,run.q.length)+'<p>'+(run.wrong.length?'Посмотри пояснения к ошибкам и вернись к нужным урокам.':'Все ответы верные.')+'</p>'+run.wrong.map(({q,topic})=>'<div class="wrong"><strong>'+q[0]+'</strong><p>'+q[3]+'</p><a href="#lesson/'+topic+'">Повторить урок →</a></div>').join('')+'<div class="actions">'+button('restart','Пройти ещё раз','primary')+link('quiz','К тестам','secondary')+'</div></div>'}
const {q}=run.q[run.i], answered=run.sel!==null;return back+head('САМОПРОВЕРКА',title)+'<section class="panel drill"><div class="drill-meta"><span>ВОПРОС '+(run.i+1)+' ИЗ '+run.q.length+'</span><span>Верно: '+run.score+'</span></div>'+bar(run.i+(answered?1:0),run.q.length)+'<h2>'+q[0]+'</h2><div class="answers">'+q[1].map((s,i)=>'<button type="button" class="answer '+(answered?(i===q[2]?'right':i===run.sel?'incorrect':''):'')+'" data-act="answer" data-val="'+i+'" '+(answered?'disabled':'')+'><span>'+['А','Б','В'][i]+'</span>'+s+'</button>').join('')+'</div>'+(answered?'<div class="feedback" tabindex="-1"><strong>'+(run.sel===q[2]?'Верно':'Правильный ответ: '+q[1][q[2]])+'</strong><p>'+q[3]+'</p></div><div class="actions">'+button('quiz-next',run.i+1===run.q.length?'Результат':'Дальше '+ic('arrow'),'primary')+'</div>':'')+'</section>'}
function route(){const [page='home',id]=location.hash.slice(1).split('/');return [page||'home',id]}
function render(enteringRoute = false){
 const [page,id]=route();
 nav(page);
 main.innerHTML=page==='plan'?plan():page==='topics'?lectureList():page==='lesson'&&by(id)?lesson(by(id)):page==='cards'?cardList():page==='study'?study(id):page==='practice'?practice(id):page==='quiz'?quiz():page==='run'?runView(id):home();
 if (language === 'kk') { translateView(main); translateView(el('#nav')); }
 main.classList.toggle('route-enter', enteringRoute);
 if (enteringRoute) {
  main.querySelectorAll('.course-grid > .topic').forEach((card, index) => {
   card.style.setProperty('--entrance-delay', Math.min(index, 6) * 35 + 'ms');
  });
 }

}
function positionRoute(){
 const [page,id]=route();
 const row=page==='plan'&&dates.some(d=>String(d.day)===id)?document.getElementById('plan-day-'+id):null;
 if(row)row.scrollIntoView({block:'start'});else window.scrollTo(0,0);
}
const menuToggle=el('.menu-toggle'), sidebar=el('.sidebar');
const mobileMenu=window.matchMedia('(max-width:690px)');
function menuIsOpen(){return menuToggle.getAttribute('aria-expanded')==='true'}
function setMenu(open,returnFocus=false){
 sidebar.classList.toggle('menu-open',open);
 menuToggle.setAttribute('aria-expanded',String(open));
 if(returnFocus)menuToggle.focus();
}
menuToggle.addEventListener('click',()=>setMenu(!menuIsOpen()));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&menuIsOpen()){e.preventDefault();setMenu(false,true)}
});
document.addEventListener('click',e=>{
 if(!menuIsOpen())return;
 const chosen=e.target.closest('#nav a,.brand');
 if(chosen)setMenu(false,chosen.hash===location.hash);
 else if(!sidebar.contains(e.target)){
  setMenu(false,sidebar.contains(document.activeElement));
 }
});
mobileMenu.addEventListener('change',()=>setMenu(false));
const shellNodes = [];
const shellWalker = document.createTreeWalker(sidebar, NodeFilter.SHOW_TEXT);
while (shellWalker.nextNode()) shellNodes.push([shellWalker.currentNode, shellWalker.currentNode.data]);
function updateLanguageShell() {
 document.documentElement.lang = language;
 applyTheme();
 document.title = language === 'kk' ? 'Құқық негіздерінен сынаққа дайындық' : 'Право к зачёту';
 for (const [node, value] of shellNodes) node.data = language === 'kk' ? translateUi(value) : value;
 el('#nav').setAttribute('aria-label', language === 'kk' ? 'Дайындық бөлімдері' : 'Разделы подготовки');
 el('.skip').textContent = language === 'kk' ? 'Мазмұнға өту' : 'К содержанию';
 for (const control of document.querySelectorAll('[data-language]')) {
  control.setAttribute('aria-pressed', String(control.dataset.language === language));
 }
}
for (const control of document.querySelectorAll('[data-language]')) {
 control.addEventListener('click', () => {
  if (language === control.dataset.language) return;
  language = control.dataset.language;
  try { localStorage.setItem('pravo-language', language); } catch {}
  const url = new URL(location.href);
  url.searchParams.set('lang', language);
  history.replaceState(history.state, '', url);
  setContentLanguage();
  if (run) {
   const translated = new Map(questions.map(question => [question.id, question]));
   run.q = run.q.map(question => translated.get(question.id));
   run.wrong = run.wrong.map(question => translated.get(question.id));
  }
  updateLanguageShell();
  render();
 });
}
updateLanguageShell();
window.addEventListener('hashchange',()=>{setMenu(false);if(route()[0]!=='run')run=null;if(route()[0]!=='study')cardKey='';render(true);positionRoute();main.focus({preventScroll:true})});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const {act,val}=b.dataset;
const previousProgress=act==='answer' ? run.i : null;
switch(act){
case 'level':levelBy[route()[1]]=Number(val);break;
case 'done':st.done[val]=!st.done[val];save();toast(st.done[val]?'Урок отмечен как изученный':'Отметка снята');break;
case 'flip':flipped=!flipped;break;
case 'know':st.known[val]=!st.known[val];save();toast(st.known[val]?'Карточка отмечена как запомненная':'Отметка снята');break;
case 'card-next':case 'card-prev':{const t=by(route()[1]),n=t?t.cards.length:nCards;cardIndex=(cardIndex+(act==='card-next'?1:-1)+n)%n;flipped=false;break;}
case 'answer':{if(run.sel!==null)return;run.sel=Number(val);const x=run.q[run.i];if(run.sel===x.q[2]){run.score++;delete st.miss[x.id]}else{st.miss[x.id]=true;run.wrong.push(x)}save();break;}
case 'quiz-next':if(run.i+1===run.q.length){run.end=true;if(run.id==='mock'){st.last=Math.round(run.score/run.q.length*100);st.best=Math.max(st.best,st.last);save()}}else{run.i++;run.sel=null}break;
case 'restart':run=null;break;
default:return}
render();
animateStudyAction(act, previousProgress);
if(act==='level')el('[data-act="level"][data-val="'+val+'"]')?.focus({preventScroll:true});
else if(act==='answer')el('.feedback')?.focus();
else if(act==='quiz-next'||act==='restart')main.focus({preventScroll:true});
else el('[data-act="'+act+'"]')?.focus({preventScroll:true});
});

function animateStudyAction(action, previousProgress) {
 const cardMotion = {
  flip: 'card-turn',
  'card-next': 'card-forward',
  'card-prev': 'card-back'
 };
 if (Object.hasOwn(cardMotion, action)) {
  el('.flash')?.classList.add(cardMotion[action]);
 }
 if (action === 'answer') {
  const correct = run.sel === run.q[run.i].q[2];
  const selected = el('.answer[data-val="'+run.sel+'"]');
  selected?.classList.add(correct ? 'answer-confirmed' : 'answer-retry');
  el('.feedback')?.classList.add('feedback-enter');
  const fill = el('.drill .meter span');
  if (fill) {
   fill.style.setProperty('--previous-progress', String(previousProgress / (run.i + 1)));
   fill.classList.add('meter-fill-enter');
  }
 }
 if (action === 'quiz-next' || action === 'restart') {
  el('.drill')?.classList.add(run?.end ? 'result-enter' : 'question-enter');
 }
}

render(true);
if(route()[0]==='plan'&&route()[1])positionRoute();
