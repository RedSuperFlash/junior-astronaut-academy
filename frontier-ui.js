/* Presentation and device-local mission records. All game rules live in Frontier. */
(() => {
'use strict';
const F = window.Frontier;
const $ = selector => document.querySelector(selector);
const dialog = $('#panel');
const modeNames = {quick:'Quick mission',campaign:'Full campaign',free:'Free experiment'};
const planetNames = {moon:'Moon',mars:'Mars'};
const channels = {habitat:'Habitat & life support',greenhouse:'Greenhouse lighting',recovery:'Water processing',lab:'Scientific equipment',comms:'Communications',reserve:'Protected battery reserve'};
const units = {oxygen:'Oxygen',water:'Water',food:'Food',battery:'Battery',materials:'Materials',nutrients:'Nutrients'};
const cacheKey = 'trajectory-frontier-ops-v1';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = n => Number.isFinite(Number(n)) ? String(Math.round(Number(n)*10)/10) : '—';
const clamp = v => Math.max(0,Math.min(100,v));
const signed = v => (v>0?'+':'')+num(v);
const btn = (text,cmd,id='',kind='secondary',disabled=false) => '<button class="'+kind+'" data-do="'+cmd+'" data-id="'+esc(id)+'"'+(disabled?' disabled':'')+'>'+esc(text)+'</button>';
const metric = (label,value) => '<div class="metric"><small>'+esc(label)+'</small><b>'+esc(value)+'</b></div>';
const header = (label,title) => '<div class="kicker">'+esc(label)+'</div><h2>'+esc(title)+'</h2>';
const symbol = k => '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="'+({
life:'M12 20s-9-5.5-9-11A5 5 0 0 1 12 6a5 5 0 0 1 9 3c0 5.5-9 11-9 11z M4 12h4l2-4 3 7 2-4h5',
risk:'m12 2 8 3v6q0 7-8 11-8-4-8-11V5z M12 7v6m0 3v1',
power:'m13 2-9 12h7l-1 8 10-14h-7z',
food:'M4 19C2 9 10 5 21 4q-1 15-14 14m-4 4 12-12'}[k])+'"/></svg>';
function blank(){return {active:'moon:quick',slots:{},medals:{}}}
let saved, storageError='', tab='Briefing', choice=null, selected='habitat', message='', failed=false;
let sheetKind='', modePick='', planetPick='';
try {saved=JSON.parse(localStorage.getItem(cacheKey))} catch {storageError='The previous outpost record could not be read.'}
if(!saved||typeof saved.slots!=='object'||!saved.slots||Array.isArray(saved.slots)||typeof saved.medals!=='object'||!saved.medals||Array.isArray(saved.medals)) saved=blank();
if(!/^(moon|mars):(quick|campaign|free)$/.test(saved.active))saved.active='moon:quick';
if(!F){$('#status').textContent='Mission software could not load. Reload this page to retry.';return}
function startSlot(key){
 const [world,mode]=key.split(':');let run=saved.slots[key];
 if(!F.valid(run)){if(run)storageError='An unreadable mission record was replaced with a fresh run.';run=F.create(mode,world);saved.slots[key]=run}
 saved.active=key;return run;
}
let state=startSlot(saved.active);
function save(){try{localStorage.setItem(cacheKey,JSON.stringify(saved))}catch{storageError='Device storage is unavailable. Keep this tab open to retain this session.'}}
save();
function notify(text,bad=false){message=text;failed=bad;const bar=$('#status');bar.className='notice'+(bad?' error':'');bar.textContent=[message,storageError].filter(Boolean).join(' ')}
function recordRewards(){const prefix=planetNames[state.world];if(state.harvested>0)saved.medals['First harvest']=true;if(state.sol>0&&state.buildings.shelter>0&&state.shield==='shelter')saved.medals['Shelter operations']=true;if(state.science>0&&state.signals>0)saved.medals['Research relay']=true;if(state.status==='won')saved.medals[prefix+' · '+modeNames[state.mode]]=true}
function commit(result){if(result.ok){recordRewards();save()}notify(result.message,!result.ok);return result.ok}
function openSheet(k,title,body){
 sheetKind=k;$('#sheet').innerHTML=btn('×','close','','close')+header('Outpost command',title)+body+'<div class="sheetmsg" role="status"></div>';
 $('#sheet .close').setAttribute('aria-label','Close panel');dialog.setAttribute('aria-label',title);
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
}
function close(){if(dialog.open)dialog.close();sheetKind=''}
function scientificNote(){return '<p class="muted split">Classroom simulation. Stocks, power units and risk scores use simplified assumptions. A lunar “sol” here is a planning turn. <a href="science.html">Explore the science ↗</a></p>'}
function stageName(p){return state.mode==='free'?'Open investigation':p.stage.title}
function instrument(title,value,pct,color,ico){return '<div class="instrument"><span class="sig">'+symbol(ico)+'</span><div><div class="between"><b>'+title+'</b><small>'+esc(value)+'</small></div><div class="meter" aria-hidden="true"><i style="width:'+clamp(pct)+'%;--color:'+color+'"></i></div></div></div>'}
function drawCommand(p){
 $('#world-title').innerHTML=(state.world==='moon'?'LUNAR':'MARS')+' FRONTIER<span>.</span>';
 const R=state.resources;
 $('#command').innerHTML='<div class="command-grid"><section class="window"><div class="windowhead"><span class="kicker">◉ &nbsp; Surface operations</span><span class="mono">'+esc(modeNames[state.mode])+' &nbsp; / &nbsp; SOL '+String(state.sol+(state.status==='active'?1:0)).padStart(2,'0')+'</span></div><div id="surface"></div><div class="windowfoot"><span class="mono">'+planetNames[state.world]+' research outpost</span><button data-do="facilities">Inspect installations ↗</button></div></section><aside class="telemetry"><div class="panelhead"><h2>System status</h2><span class="tag"><i class="dot"></i>'+ (state.status==='active'?'Live':'Final')+'</span></div>'+
 instrument('Life support',num(state.condition)+' / 10',10*state.condition,'#498575','life')+
 instrument('Radiation risk',num(state.risk)+' / 9',100*state.risk/9,'#bd7a48','risk')+
 instrument('Battery',num(R.battery)+' / '+num(p.batteryCap),100*R.battery/p.batteryCap,'#c4933e','power')+
 instrument('Food stores',num(R.food)+' units',100*R.food/(p.cap?.food||Math.max(30,R.food)),'#66894b','food')+
 '<div class="stockpair">'+metric('Oxygen',num(R.oxygen)+' u')+metric('Water',num(R.water)+' u')+'</div>'+btn('View resource ledger →','ledger','','thin')+'</aside></div>';
 drawMap(p);
}
function drawMap(p){const b=state.buildings,c=F.crops[state.crop.type];window.FrontierMap.render($('#surface'),{planet:state.world,buildings:{...b,water:b.recovery},selected:selected==='recovery'?'water':selected,light:p.sun,growth:Math.min(1,state.crop.progress/(c?.days||1)),wear:state.wear/12},id=>{selected=id==='water'?'recovery':id;facility(selected);drawMap(p)})}
const tabs=['Briefing','Construction','Power & crops','Mission log'];
function draw(){const p=F.inspect(state);drawCommand(p);$('#workbench').innerHTML='<div class="tabs" aria-label="Command sections">'+tabs.map(t=>'<button data-do="tab" data-id="'+t+'" '+(t===tab?'aria-current="true"':'')+'>'+t+'</button>').join('')+'</div><div id="workspace"></div>';workspace(p);notify(message,failed)}
function workspace(p){$('#workspace').innerHTML=tab===tabs[0]?briefing(p):tab===tabs[1]?construction():tab===tabs[2]?operations(p):log(p)}
function briefing(p){
 if(state.status!=='active')return '<section class="report">'+header('Expedition debrief',state.status==='won'?'Mission accomplished':'Mission ended')+'<p>'+esc(state.reason)+'</p><div class="actions">'+btn('Open mission report','report','','primary')+btn('Choose a mission','modes')+'</div></section>';
 return '<div class="benchgrid"><section class="event">'+header('Decision checkpoint · Sol '+(state.sol+1),p.event.title)+'<p class="desc">'+esc(p.event.situation)+'</p><div class="options">'+p.event.options.map((o,i)=>'<button class="option" data-do="choose" data-id="'+i+'" aria-pressed="'+(choice===i)+'"><span class="optmark"></span><span><strong>'+esc(o.label)+'</strong><small>'+esc(o.immediate)+'</small>'+(choice===i?'<small><b>Next sols</b> · '+esc(o.longTerm)+'</small>':'')+'</span></button>').join('')+'</div><div class="actions">'+btn('Execute sol '+String(state.sol+1).padStart(2,'0')+' →','advance','','primary',choice===null)+btn('Ask ORBIT','mentor','','thin')+'</div></section><div><section class="control">'+header(modeNames[state.mode],stageName(p))+'<p>'+esc(state.mode==='free'?'Try changing one system at a time and compare your results in the mission log.':p.stage.objective)+'</p><div class="ticks" aria-hidden="true">'+Array.from({length:state.mode==='campaign'?15:5},(_,i)=>'<i class="'+(i<state.sol?'on':'')+'"></i>').join('')+'</div><p class="muted">'+esc(p.stage.tutorial)+'</p>'+btn('Mission objectives','objectives','','thin')+'</section><section class="control">'+header('Outpost Intelligence Engine','Power forecast')+'<div class="metricgrid">'+metric('Generation',num(p.generation))+metric('Demand',num(p.demand))+metric('Battery',num(state.resources.battery))+'</div>'+btn('Allocate power →','operations','','thin')+'</section></div></div>'
}
function construction(){return '<div class="sectionhead"><h2>Construction bay</h2><span class="tag">'+num(state.resources.materials)+' materials</span></div><div class="tilegrid">'+Object.entries(F.buildings).map(([id,b])=>'<button class="tile" data-do="facility" data-id="'+id+'"><span class="kicker">'+(state.buildings[id]?'Installed · Level '+state.buildings[id]:'Available blueprint')+'</span><h3>'+esc(b.name)+'</h3><small>'+esc(b.benefit)+'</small></button>').join('')+'</div>'}
function facility(id){
 const b=F.buildings[id];if(!b)return;selected=id;const lv=state.buildings[id],cost=F.buildCost(state,id);
 openSheet('facility',b.name,'<span class="tag">'+(lv?'Installed · Level '+lv:'Available blueprint')+'</span><p class="split">'+esc(b.benefit)+'</p><div class="reportline"><b>Operating requirements</b>'+esc(b.requirements)+'</div><div class="reportline"><b>Engineering limit</b>'+esc(b.limitation)+'</div><div class="metricgrid">'+metric('Materials available',state.resources.materials)+metric('Next build cost',lv>=b.max?'Max tier':num(cost))+'</div><div class="actions">'+btn(lv>=b.max?'Fully upgraded':lv?'Upgrade to level '+(lv+1):'Construct facility','build',id,'primary',state.status!=='active'||lv>=b.max||cost>state.resources.materials)+btn('Open operations','operations','','thin')+'</div>')
}
function operations(p){
 return '<div class="benchgrid"><section class="editor">'+header('Energy management','Power allocation')+'<p class="desc">Set requests before committing the sol. The forecast shows how much power each system can receive.</p><div class="metricgrid">'+metric('Generation',num(p.generation))+metric('Requested',num(p.demand))+metric('Battery capacity',num(p.batteryCap))+'</div>'+Object.entries(channels).map(([id,name])=>'<label class="alloc"><span>'+name+'</span><input type="range" data-allocation="'+id+'" min="0" max="8" value="'+state.allocation[id]+'" '+(state.status!=='active'?'disabled':'')+'><output>'+state.allocation[id]+' u</output></label>').join('')+'<p class="muted" id="delivery">'+delivery(p)+'</p></section><div><section class="control">'+header('Growing bay','Greenhouse')+'<label class="field">Plant variety<select id="crop" '+(state.status!=='active'?'disabled':'')+'>'+Object.entries(F.crops).map(([id,c])=>'<option value="'+id+'" '+(state.crop.type===id?'selected':'')+'>'+esc(c.name)+'</option>').join('')+'</select></label>'+cropInfo()+'</section><section class="control">'+header('Crew operations','Protection & maintenance')+'<p>Risk index '+num(state.risk)+ ' / 9 · Equipment wear '+num(state.wear)+' / 12 · Emergency packs '+state.supply+'</p><div class="actions">'+btn(state.shield==='standard'?(state.buildings.shelter?'Move crew to shelter':'Use shielded habitat corner'):'Return crew to normal duties','shield','','secondary',state.status!=='active')+btn('Repair equipment','repair','','secondary',state.status!=='active')+btn('Emergency supplies','resupply','','thin',state.status!=='active')+'</div></section></div></div>'
}
function delivery(p){return 'Power dispatch order: habitat, water recovery, greenhouse, communications, lab. Reserve sets a minimum battery charge. Forecast delivery · '+Object.entries(p.delivered||{}).filter(([k])=>channels[k]).map(([k,v])=>channels[k]+' '+num(v)).join(' · ')}
function cropInfo(){const c=F.crops[state.crop.type], racks=state.buildings.greenhouse-1;return '<p class="desc">Each growth step needs '+(c.power+racks)+' power, '+(c.water+racks)+' water and '+c.nutrients+' nutrients. Changing variety starts a new planting.</p><div class="metricgrid">'+metric('Growth steps',num(state.crop.progress)+' / '+c.days)+metric('Food per harvest',num(c.yield+2*racks))+metric('Harvested',num(state.harvested))+'</div>'}
function line(lbl,body){return '<div class="reportline"><b>'+esc(lbl)+'</b>'+esc(body)+'</div>'}
function explanation(h){return line('What happened?',h.what)+line('Why did it happen?',h.why)+line('What science explains it?',h.science)+line('What would you try next?',h.next)}
function trends(){
 const rows=state.history.slice(-15);
 if(rows.length<2)return '<p class="muted">After two completed sols, compare the resource trends here.</p>';
 const colors={oxygen:'#496e88',water:'#27948e',food:'#76913c',battery:'#b7782f'};
 const max=Math.max(1,...rows.flatMap(h=>Object.keys(colors).map(k=>h.resources[k])));
 const plot=Object.entries(colors).map(([k,color])=>'<polyline fill="none" stroke="'+color+'" stroke-width="2.6" points="'+rows.map((h,i)=>[10+380*i/(rows.length-1),95-84*h.resources[k]/max].join(',')).join(' ')+'"/>').join('');
 return '<svg class="trend" role="img" aria-label="Resource history from sol '+rows[0].sol+' to '+rows.at(-1).sol+', shared scale 0 to '+max+' stock units" viewBox="0 0 400 110"><path d="M10 10v85h380 M10 53h380" fill="none" stroke="#c3cfc2"/>'+plot+'</svg><div class="legend">'+Object.entries(colors).map(([k,color])=>'<span><i style="background:'+color+'"></i>'+units[k]+'</span>').join('')+'</div><small>Sol '+rows[0].sol+'–'+rows.at(-1).sol+' · shared scale 0–'+num(max)+' units</small>'
}
function ledger(){
 const last=state.history.at(-1);openSheet('ledger','Resource ledger','<p>Current stocks in classroom resource units. Changes below cover the latest completed sol.</p><div class="metricgrid">'+Object.entries(units).map(([k,v])=>metric(v,num(state.resources[k])+(last?' ('+signed(last.delta[k]||0)+')':''))).join('')+metric('Greywater buffer',num(state.wastewater)+' / 12')+'</div>'+trends()+(last?line('Latest operating conditions',last.why):'')+scientificNote())
}
function log(p){
 return '<div class="benchgrid"><section class="report">'+header('Flight recorder','Mission history')+trends()+(state.history.length?state.history.slice().reverse().map(h=>'<details><summary>Sol '+h.sol+' · '+esc(h.event)+'</summary><p>'+esc(h.choice)+'</p>'+explanation(h)+'</details>').join(''):'<p class="muted">Execute your first sol to record its decisions and results.</p>')+'</section><div><section class="control">'+header('Campaign milestones','Expedition debriefs')+(state.debriefs.length?state.debriefs.map(d=>line(d.title,d.text)).join(''):'<p>Debriefs appear as you complete each mission stage.</p>')+'</section><section class="control">'+header('Cadet record','Command achievements')+(Object.keys(saved.medals).length?Object.keys(saved.medals).map(k=>'<p>✦ '+esc(k)+'</p>').join(''):'<p>Harvest crops, operate a shelter, relay research, or finish an expedition to earn a distinction.</p>')+'<div class="actions"><a href="academy.html">Academy career record ↗</a></div></section></div></div>'
}
function report(){openSheet('report','Mission report',header(planetNames[state.world]+' · '+modeNames[state.mode],state.status==='won'?'Expedition successful':state.status==='failed'?'Mission ended':'Interim report')+'<p>'+esc(state.reason||'Operations are ongoing.')+'</p><div class="metricgrid">'+metric('Sols completed',state.sol)+metric('Crew condition',state.condition)+metric('Risk index',state.risk)+metric('Food harvested',state.harvested)+metric('Science',state.science)+metric('Signals',state.signals)+'</div>'+trends()+state.debriefs.map(d=>line(d.title,d.text)).join('')+state.history.map(h=>line('Sol '+h.sol+' · '+h.event,h.choice+' — '+h.what)).join('')+'<div class="actions">'+btn('Print report','print','','primary')+btn('Mission setup','modes')+'</div>')}
function modeMenu(reset=true){
 if(reset){modePick=state.mode;planetPick=state.world}
 const slot=saved.slots[planetPick+':'+modePick];
 openSheet('modes','Mission setup','<label class="field">Outpost<select id="worldChoice"><option value="moon" '+(planetPick==='moon'?'selected':'')+'>Lunar frontier</option><option value="mars" '+(planetPick==='mars'?'selected':'')+'>Mars expansion</option></select></label><div class="options">'+Object.entries(modeNames).map(([k,v])=>'<button class="option" data-do="pickmode" data-id="'+k+'" aria-pressed="'+(modePick===k)+'"><span class="optmark"></span><span><strong>'+v+'</strong><small>'+({quick:'Five decisions. A compact demonstration of the four systems.',campaign:'Fifteen decision checkpoints across five stages.',free:'Open-ended experiments. Explore system behavior without competitive scoring.'}[k])+'</small></span></button>').join('')+'</div><p class="muted split">'+(slot?'Saved run · '+slot.sol+' sols completed · '+esc(slot.status):'A new outpost is ready to establish.')+'</p><div class="actions">'+btn(slot?'Open saved mission':'Establish outpost','openmode','','primary')+(slot?btn('Restart this mission','restartAsk','','thin'):'')+'</div>')
}
function switchMode(restart=false){
 const id=planetPick+':'+modePick;
 if(restart)saved.slots[id]=F.create(modePick,planetPick);
 state=startSlot(id);choice=null;tab='Briefing';selected='habitat';message='';failed=false;save();close();draw();window.scrollTo(0,0);
}
function mentor(){if(state.status!=='active')return report();let p=F.inspect(state);openSheet('mentor','ORBIT · Flight mentor',line('Current assignment',p.stage.tutorial)+line('Systems forecast','Your arrays can supply '+num(p.generation)+' power units against '+num(p.demand)+' requested. The battery can bridge shortfalls unless you protect its charge as reserve.')+line('Engineering question',p.event.science)+line('Try this','Change one allocation, compare the forecast, then choose a response. Look at the resource ledger after the sol.')+'<div class="actions">'+btn('Inspect allocations','operations','','primary')+'<a href="science.html">Open science lab ↗</a><a href="academy.html?practice=zero-g">Practice zero-G transfers ↗</a></div>')}
function decisionReport(){
 const h=state.history.at(-1),last=state.debriefs.at(-1);
 openSheet('outcome','Sol '+h.sol+' debrief','<h3>'+esc(h.event)+'</h3><p>'+esc(h.choice)+'</p>'+explanation(h)+'<div class="metricgrid">'+Object.entries(units).map(([k,n])=>metric(n,signed(h.delta[k]||0))).join('')+'</div>'+(last&&state.debriefs.length>previousDebriefs?line(last.title,last.text):'')+'<div class="actions">'+btn(state.status==='active'?'Return to command':'Open final report',state.status==='active'?'close':'report','','primary')+'</div>');
}
let previousDebriefs=0;
function act(cmd,id){
 switch(cmd){
 case 'close':close();break;
 case 'modes':modeMenu();break;
 case 'pickmode':modePick=id;modeMenu(false);break;
 case 'openmode':switchMode();break;
 case 'restartAsk':openSheet('confirm','Restart this mission?','<p>This starts a fresh '+modeNames[modePick].toLowerCase()+' on '+planetNames[planetPick]+'. It replaces that slot’s current run. Earned command distinctions stay in your record.</p><div class="actions">'+btn('Restart mission','restart','','primary')+btn('Keep saved run','cancelRestart')+'</div>');break;
 case 'cancelRestart':modeMenu(false);break;
 case 'restart':switchMode(true);break;
 case 'tab':tab=id;draw();document.querySelector('.tabs [aria-current]')?.focus({preventScroll:true});break;
 case 'operations':case 'facilities':close();tab=cmd==='operations'?'Power & crops':'Construction';draw();$('#workbench').scrollIntoView({block:'start'});break;
 case 'choose':choice=Number(id);workspace(F.inspect(state));document.querySelector('.option[aria-pressed=true]')?.focus({preventScroll:true});break;
 case 'advance':if(choice===null||state.status!=='active')break;previousDebriefs=state.debriefs.length;if(commit(F.advance(state,choice))){choice=null;draw();decisionReport()}break;
 case 'facility':facility(id);drawMap(F.inspect(state));break;
 case 'build':{const r=F.build(state,id);commit(r);draw();facility(id);$('#sheet .sheetmsg').textContent=r.message;break}
 case 'shield':case 'repair':case 'resupply':{
 const r=cmd==='shield'?F.setShield(state,state.shield==='standard'?'shelter':'standard'):cmd==='repair'?F.repair(state):F.resupply(state);commit(r);draw();openSheet('feedback','Operations update','<p>'+esc(r.message)+'</p>'+btn('Return to operations','close'));break}
 case 'objectives':{const p=F.inspect(state);openSheet('objectives',stageName(p),line('Stage objective',p.stage.objective)+line('Flight instruction',p.stage.tutorial)+line('Mission rules',p.criteria||'Keep habitat power and cabin condition at 3 or higher, risk at 4 or lower, and food, oxygen and water above zero. Two consecutive critical shifts end a scored mission. Each stage offers up to two extra shifts to meet its objective.')+scientificNote());break}
 case 'ledger':ledger();break;
 case 'mentor':mentor();break;
 case 'report':report();break;
 case 'print':window.print();break;
 }
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-do]');if(b&&!b.disabled)act(b.dataset.do,b.dataset.id)});
document.addEventListener('input',e=>{const k=e.target.dataset.allocation;if(k)e.target.nextElementSibling.value=e.target.value+' u'});
document.addEventListener('change',e=>{
 if(e.target.id==='worldChoice'){planetPick=e.target.value;modeMenu(false);return}
 if(e.target.dataset.allocation){const k=e.target.dataset.allocation;commit(F.setAllocation(state,k,Number(e.target.value)));draw();document.querySelector('[data-allocation="'+k+'"]')?.focus({preventScroll:true})}
 if(e.target.id==='crop'){commit(F.setCrop(state,e.target.value));draw()}
});
dialog.addEventListener('close',()=>{sheetKind=''});draw();
})();
