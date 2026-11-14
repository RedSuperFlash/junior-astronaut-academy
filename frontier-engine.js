/* Classroom stocks, costs and event sequences are invented units. One sol is one
   command shift; on the Moon it does not represent a lunar solar day. All
   state transitions are deterministic. No medical dose or flight prediction. */
(function (root) {
  'use strict';
  const buildings = {
    habitat: module('Crew habitat', 7, 'Adds 3 oxygen and water tank spaces per level and steadier cabin conditions.', '3 habitat power for normal crew operations.', 'Extra space does not create oxygen or drinking water.'),
    life: module('Life-support module', 6, 'Converts tank water into breathing oxygen while power is available.', '3 habitat power and 1 water unit per shift.', 'Water and energy must both be available.'),
    solar: module('Solar power station', 7, 'Six fixed generation units plus up to 5 per equipped array before light and wear adjustments.', 'Light reaching the site and maintained surfaces.', 'Output falls during shadow or dust events.'),
    battery: module('Battery storage', 5, 'Adds 7 units of storage for later shifts.', 'Surplus generation to charge.', 'A new battery arrives empty.'),
    greenhouse: module('Greenhouse', 6, 'Each additional growing rack adds 2 food per harvest.', 'Crop-specific light, water and nutrient supplies.', 'Each added rack needs 1 more electricity and 1 more water per growing shift.'),
    recovery: module('Water recovery system', 5, 'Returns up to 4 used water units per shift.', '1 power per recovered unit and functioning filters.', 'Only available wastewater can be recovered.'),
    shelter: module('Radiation shelter', 6, 'Raises shielding. Shelter posture provides extra protection.', 'Construction material and protected crew time. Without a shelter, crew can use the best-shielded corner of the habitat.', 'Sheltering suspends laboratory work and does not remove all radiation risk.'),
    lab: module('Scientific laboratory', 4, 'Collects research observations each powered shift.', 'At least 1 lab power and crew outside shelter posture.', 'Uses energy that could run the greenhouse.'),
    comms: module('Communication station', 4, 'Sends collected research packets home.', '1 communications power, observations and an open link.', 'Cannot transmit more data than the crew has collected.')
  };
  function module(name,cost,benefit,requirements,limitation){return {name,cost,benefit,requirements,limitation,max:3};}
  const crops = {
    lettuce:{name:'Lettuce',days:2,water:1,power:2,nutrients:1,yield:5},
    radish:{name:'Radish',days:3,water:1,power:2,nutrients:1,yield:8},
    potato:{name:'Potato',days:4,water:2,power:3,nutrients:1,yield:13}
  };
  const stages = [
    {title:'First Footprints',objective:'Operate the habitat and finish the stage with a stable cabin (condition 3 or higher).',tutorial:'Choose a response to the arriving crew. Leave at least 3 power for habitat systems.'},
    {title:'Keeping the Crew Alive',objective:'Keep oxygen and water above zero and recycle at least 1 water unit in this shift.',tutorial:'Look at the water budget before you advance. Increasing recovery needs a working filter and power.'},
    {title:'Protecting the Outpost',objective:'Keep the relative radiation-risk index at 4 or below.',tutorial:'Read the particle forecast. Build a shelter or move the crew into protected quarters when activity rises.'},
    {title:'Growing Beyond Earth',objective:'Harvest at least one crop and keep food in the pantry.',tutorial:'Lettuce matures after two successful growing shifts; the others trade a longer wait for a bigger harvest.'},
    {title:'The Extended Expedition',objective:'Finish with oxygen â‰¥3, water â‰¥3, food â‰¥3, battery â‰¥2, condition â‰¥3, risk â‰¤4, and a harvest on record.',tutorial:'Keep reserves while running science and communications. Compare your last shift with the forecast.'}
  ];
  const option=(label,immediate,longTerm,effect)=>({label,immediate,longTerm,effect});
  const event=(title,situation,science,light,particles,options)=>({title,situation,science,light,particles,options});
  const events=[
    event('Touchdown inventory','The lander has room for one last cargo pallet. What should the rover unload?','Cargo space is finite. Carrying extra consumables leaves less room for equipment.',1,1,[
      option('Unload repair stock','Gain 4 materials.','More stock will be available for shielding and replacement components.',{materials:4}),
      option('Unload water tanks','Gain 5 water.','Stored water helps during a recycling fault but cannot repair a worn filter.',{water:5}),
      option('Unload battery packs','Gain 5 battery charge, up to capacity.','Stored electricity buffers the first shadow pass.',{battery:5})]),
    event('Array alignment','A ridge cuts across the morning light. The crew can realign panels or work inside.','Solar generation depends on illumination and panel orientation.',.75,2,[
      option('Realign the panels','Use 1 material; add 4 generation this shift.','The extra generation can refill storage.',{materials:-1,generation:4}),
      option('Inventory the workshop','Gain 2 materials.','Bank the parts for the shelter or filters.',{materials:2})]),
    event('Cabin pressure check','One sensor suggests a small leak at a seal. How should the team investigate?','A sealed pressure vessel and leak monitoring conserve breathing gas.',.9,1,[
      option('Fit a spare seal','Use 1 material and reduce wear by 2.','Less wear protects the next shiftâ€™s power and water output.',{materials:-1,wear:-2}),
      option('Isolate the sample bay','Use 2 oxygen while testing compartments.','Keep the spare parts for later.',{oxygen:-2})]),
    event('Filter flow warning','A return-line filter is collecting residue, forcing a trade between spares and water.','Water recovery equipment needs maintenance. Reuse reduces the need for resupply.',.85,2,[
      option('Clean the return line','Spend 1 material and remove 3 wear.','Higher filter performance helps future shifts.',{materials:-1,wear:-3}),
      option('Bypass the filter today','Recover 2 fewer water units this shift.','Save the part but draw more from storage.',{recovery:-2})]),
    event('Crew exercise block','The crew needs water during exercise. Select the operating schedule.','Crew activity and environmental controls both affect water and energy demand.',.8,2,[
      option('Stagger training sessions','Use 1 extra water and gain 1 research observation.','A time series gives the lab more information.',{water:-1,science:1}),
      option('Run diagnostics instead','Reduce wear by 1.','Protect processing equipment before the next block.',{wear:-1})]),
    event('Water cargo manifest','The surface rover returns carrying ice prospecting instruments and drinking water.','Evidence of lunar ice does not guarantee accessible or drinkable local water.',1,1,[
      option('Receive sealed water','Add 5 verified supply water.','Build a cushion for future growing shifts.',{water:5}),
      option('Inspect the survey instruments','Gain 3 observations and 1 material.','The measurements can be transmitted once a link opens.',{science:3,materials:1})]),
    event('Particle activity alert','Mission Control forecasts an energetic particle event. Choose where the crew works.','The Moon has no thick atmosphere or global magnetic shield like Earth. Shielding can reduce some exposure.',.75,7,[
      option('Use the protected bay','Cut risk by 4; suspend lab work this shift.','Protect the crew while the science queue waits.',{protection:4,labStop:1}),
      option('Install a temporary barrier','Use 2 materials; cut risk by 3.','Keep research running but leave fewer repair materials.',{materials:-2,protection:3}),
      option('Keep the excursion short','Cut risk by 1.','Unprotected work can leave the crew with a warning.',{protection:1})]),
    event('Heavy cargo route','A rover can deliver local cover material or service the array mounts.','Physical shielding trades mass and construction time for protection; geometry and particle energy matter.',.65,5,[
      option('Stock the construction pad','Gain 4 materials.','Use the stock for a permanent shelter upgrade.',{materials:4}),
      option('Service the mounts','Remove 4 wear.','Maintain future electricity and recovery output.',{wear:-4})]),
    event('Shadow crossing','The planned traverse takes the power station into partial shadow.','Energy stored while illuminated can supply equipment when generation falls.',.45,3,[
      option('Connect a spare power pack','Spend 1 material for 4 stored charge.','This adds charge only up to the battery capacity.',{materials:-1,battery:4}),
      option('Suspend the laboratory','Suspend science and add 2 charge from the rover.','A smaller reserve remains after the shift.',{battery:2,labStop:1})]),
    event('Greenhouse delivery','The rover has delivered plant nutrients and a small ration crate. Choose the priority.','Plants need water, light and mineral nutrients. An edible harvest takes time.',.95,1,[
      option('Unload nutrients','Gain 6 nutrient units.','More trays can grow before the next supply allocation.',{nutrients:6}),
      option('Unload emergency rations','Gain 5 food.','Rations cover immediate meals but do not support new plants.',{food:5})]),
    event('Condensation on the leaves','Humidity has risen around the growing racks. Choose a maintenance response.','Managing air movement and water in an enclosed greenhouse supports plant growth.',.9,1,[
      option('Service the air loop','Spend 1 material, reduce wear by 2.','Both the array and recovery systems benefit from maintenance.',{materials:-1,wear:-2}),
      option('Dry the racks manually','Pause growing for one shift.','The existing crop resumes from its current stage afterward.',{cropStop:1})]),
    event('Sample return queue','A short relay window opens while experiments are underway.','Returning science requires a working communications link, power and observations to send.',.75,2,[
      option('Prioritize plant samples','Gain 2 research observations; use 1 water.','Saved observations can be sent through the relay.',{science:2,water:-1}),
      option('Recharge the rover','Gain 2 battery charge.','Carry a little more power toward the extended expedition.',{battery:2})]),
    event('Extended assignment','Mission Control requests another operations block. Reassess the manifest.','A longer mission increases cumulative demands on consumables and hardware.',.9,2,[
      option('Receive service supplies','Gain 3 materials and 3 nutrients.','Prepare for a maintenance stop and another harvest.',{materials:3,nutrients:3}),
      option('Receive crew reserves','Gain 3 food and 3 water.','Improve short-term survival stocks.',{food:3,water:3})]),
    event('Relay interruption','The relay will be unavailable during this shift. Choose local work for the crew.','A communications outage can interrupt a data return without stopping local science.',.55,3,[
      option('Buffer the instruments','Gain 2 observations; the link stays closed.','The data will be available for a later downlink.',{science:2,linkStop:1}),
      option('Inspect the filters','Remove 3 wear; the link stays closed.','Service today supports the final water balance.',{wear:-3,linkStop:1})]),
    event('Final reserve audit','The supply rover makes its last stop before the next rotation. Which reserve needs help?','A reliable outpost retains margins across food, air, water and power at the same time.',.9,2,[
      option('Refill the water tank','Gain 4 water and 2 nutrients.','Maintain reserves and the next planting.',{water:4,nutrients:2}),
      option('Top up emergency power','Gain 5 charge up to capacity.','Protect electrical reserves if production falls.',{battery:5}),
      option('Deliver pantry stores','Gain 5 food.','Stored meals cover the next crew rotation.',{food:5})])
  ];
  const allocations={habitat:3,greenhouse:2,recovery:3,lab:1,comms:1,reserve:2};
  const initialLevels={habitat:1,life:1,solar:1,battery:1,greenhouse:1,recovery:1,shelter:0,lab:0,comms:0};
  const modes=['quick','campaign','free'], worlds=['moon','mars'];
  const quickCards=[0,3,6,9,14];
  const clamp=(x,min,max)=>Math.min(max,Math.max(min,x));
  const ok=message=>({ok:true,message});
  const fail=message=>({ok:false,message});
  const active=s=>s && s.status==='active';
  function create(mode='quick',world='moon'){
    if(!modes.includes(mode)||!worlds.includes(world))throw Error('Unknown mission mode or world.');
    return {version:1,mode,world,sol:0,status:'active',reason:'',resources:{oxygen:11,water:17,food:9,battery:12,materials:16,nutrients:18},
      buildings:{...initialLevels},allocation:{...allocations},crop:{type:'lettuce',progress:0},shield:'standard',wear:0,risk:1,condition:6,stress:0,
      history:[],debriefs:[],wastewater:4,harvested:0,science:0,signals:0,supply:2,stageTurns:0,contingency:0};
  }
  const buildCost=(s,id)=>buildings[id]?buildings[id].cost+2*s.buildings[id]:0;
  const cap=s=>({oxygen:18+3*s.buildings.habitat,water:22+3*s.buildings.habitat,food:30,battery:10+7*s.buildings.battery,materials:60,nutrients:40});
  function store(s,k,v){s.resources[k]=clamp(v,0,cap(s)[k]);}
  function build(s,id){
    if(!active(s)||!Object.hasOwn(buildings,id))return fail('Select an active mission and a structure.');
    const def=buildings[id],level=s.buildings[id],cost=buildCost(s,id);
    if(level>=def.max)return fail('This structure is at its final level.');
    if(s.resources.materials<cost)return fail('You need '+cost+' materials for this construction.');
    s.resources.materials-=cost;s.buildings[id]++;
    return ok(def.name+' commissioned at level '+(level+1)+'. Used '+cost+' materials. '+def.benefit);
  }
  function repair(s){
    if(!active(s)||s.wear===0)return fail('There is no active wear to repair.');
    if(s.resources.materials<2)return fail('Repairs require 2 materials.');
    const repaired=Math.min(5,s.wear);s.resources.materials-=2;s.wear-=repaired;
    return ok('Used 2 materials to remove '+repaired+' wear. Less wear improves system efficiency.');
  }
  function setAllocation(s,id,value){
    if(!active(s)||!Object.hasOwn(allocations,id)||!Number.isInteger(value)||value<0||value>8)return fail('Select a whole power allocation from 0 to 8.');
    s.allocation[id]=value;return ok(id==='reserve'?'Reserve floor set to '+value+' charge.':id+' power request set to '+value+'. Available supply limits actual delivery.');
  }
  function setCrop(s,type){
    if(!active(s)||!Object.hasOwn(crops,type))return fail('Choose an available crop.');
    if(type===s.crop.type)return ok('Current crop retained.');
    s.crop={type,progress:0};return ok(crops[type].name+' planted. A new crop starts at the seed stage.');
  }
  function setShield(s,value){
    if(!active(s)||!['standard','shelter'].includes(value))return fail('Choose an available crew posture.');
    s.shield=value;return ok(value==='shelter'?(s.buildings.shelter?'Crew moved to the radiation shelter.':'Crew moved to the best-shielded corner of the habitat.')+' Laboratory work pauses until they return.':'Crew returned to normal duties.');
  }
  function resupply(s){
    if(!active(s)||s.supply<=0)return fail('No emergency packs remain.');
    s.supply--;for(const [k,n] of Object.entries({oxygen:4,water:5,food:4,battery:4,nutrients:3,materials:2}))store(s,k,s.resources[k]+n);
    return ok('Emergency pack opened: up to +4 oxygen, +5 water, +4 food, +4 charge, +3 nutrients and +2 materials, limited by tank capacity. '+s.supply+' packs remain.');
  }
  function stageIndex(s){return s.mode==='free'?Math.floor(s.sol/3)%5:Math.min(4,s.debriefs.length);}
  function card(s){
    const i=stageIndex(s), index=s.mode==='quick'?quickCards[i]:s.mode==='free'?s.sol%events.length:i*3+Math.min(2,s.stageTurns);
    if(s.contingency>0 && s.mode!=='free'){
      return event('Checkpoint recovery',stages[i].objective+' Select a recovery plan and adjust the systems before advancing.',
        'Independent reserves and fault isolation can interrupt a chain of failures. Both have finite costs.',events[index].light,events[index].particles,[
        option('Protect essential systems','Reduce the risk index by 3 and pause lab work.','The crew gains protected time to restore the missing operating margin.',{protection:3,labStop:1}),
        option('Use workshop reserves','Spend 1 material to release 2 water and 2 charge.','There will be fewer parts available for construction.',{materials:-1,water:2,battery:2})
      ]);
    }
    if(s.world==='mars' && index===8){
      return event('Dust veil','A regional dust veil dims the solar arrays. Select a backup-power response.',
        'Suspended dust reduces the sunlight that reaches the Martian surface. The output factor here is a classroom assumption.',0.45,3,events[index].options);
    }
    if(s.world==='mars' && index===5){
      return {...events[index],science:'Martian ice deposits are targets for exploration. Detecting ice does not deliver purified drinking water.'};
    }
    if(s.world==='mars' && index===6){
      return {...events[index],science:'Mars has a thin atmosphere and lacks a global magnetic field like Earthâ€™s. Sheltering can reduce some exposure.'};
    }
    return events[index];
  }
  // Compute generation and dispatch without changing stored stocks. Reserve sets
  // a floor on battery discharge. Generation can still supply loads at that floor.
  // Dispatch priority is habitat, recovery, plants, link, then optional science.
  function forecast(s,effect={}){
    const ev=card(s), level=s.buildings, a=s.allocation;
    const sun=Math.max(0.1,ev.light*(s.world==='mars'?0.78:1));
    const generation=Math.max(0,Math.round((6+level.solar*5)*sun)-Math.floor(s.wear/5)+(effect.generation||0));
    const available=generation+Math.max(0,s.resources.battery-a.reserve);
    const requests={habitat:a.habitat,recovery:a.recovery,greenhouse:a.greenhouse,comms:level.comms&&!effect.linkStop?a.comms:0,lab:level.lab&&s.shield==='standard'&&!effect.labStop?a.lab:0};
    let left=available;const delivered={};
    for(const [k,request] of Object.entries(requests)){delivered[k]=Math.min(left,request);left-=delivered[k];}
    return {sun,generation,demand:Object.values(requests).reduce((a,b)=>a+b,0),delivered,consumed:available-left,cap:cap(s),batteryCap:cap(s).battery};
  }
  function inspect(s){
    const i=stageIndex(s);
    return {...forecast(s),stage:stages[i],event:card(s),stageIndex:i,turnLimit:s.mode==='quick'?5:s.mode==='campaign'?15:null,
      requiredTurns:s.mode==='quick'?1:3,crew:3};
  }
  function eligible(s,opt){
    return Object.entries(opt.effect).every(([k,v])=>!(Object.hasOwn(s.resources,k)&&v<0&&s.resources[k]<-v));
  }
  // Resolve the selected event first. Then dispatch power, cycle air and water,
  // grow the crop, feed the crew, evaluate exposure, resolve lab/link activity,
  // accumulate wear and evaluate critical conditions and the stage checkpoint.
  function advance(s,index){
    if(!active(s))return fail('This mission has ended.');
    const event=card(s),choice=event.options[index];
    if(!Number.isInteger(index)||!choice)return fail('Choose a briefing response before ending this sol.');
    if(!eligible(s,choice))return fail('This response requires more supplies than are currently stored. Choose another response or open an emergency pack.');
    const stage=stageIndex(s),before={...s.resources},fx=choice.effect,level=s.buildings;
    const log=[];
    for(const [k,v] of Object.entries(fx)){
      if(Object.hasOwn(s.resources,k))store(s,k,s.resources[k]+v);
      else if(k==='wear')s.wear=clamp(s.wear+v,0,12);
      else if(k==='science')s.science+=v;
    }
    const p=forecast(s,fx),d=p.delivered,r=s.resources,c=crops[s.crop.type];
    store(s,'battery',r.battery+p.generation-p.consumed);
    const oxygenUse=3,waterUse=3,foodUse=2;
    const conversion=d.habitat>=3 && r.water>0?Math.min(oxygenUse+1,level.life+2+Math.floor((d.habitat-3)/2)):0;
    // Crew water use feeds a finite greywater tank. A previous shift's crop
    // condensate can also be processed. Electrolysis water is not added back.
    const crewWater=Math.min(waterUse,Math.max(0,r.water-(conversion?1:0)));
    s.wastewater=Math.min(12,s.wastewater+crewWater);
    const recoveryCapacity=clamp(Math.min(4,d.recovery,2+level.recovery-Math.floor(s.wear/6))+(fx.recovery||0),0,4);
    const recovered=Math.min(s.wastewater,recoveryCapacity);
    s.wastewater-=recovered;
    store(s,'oxygen',r.oxygen-oxygenUse+conversion);
    store(s,'water',r.water-crewWater-(conversion?1:0)+recovered);
    let harvest=0;
    const waterCost=c.water+level.greenhouse-1;
    const powerCost=c.power+level.greenhouse-1;
    const growing=!fx.cropStop && d.greenhouse>=powerCost && r.water>=waterCost && r.nutrients>=c.nutrients;
    if(growing){
      store(s,'water',r.water-waterCost);store(s,'nutrients',r.nutrients-c.nutrients);
      s.wastewater=Math.min(12,s.wastewater+1); // One unit of plant moisture captured for a later shift.
      if(++s.crop.progress>=c.days){harvest=c.yield+2*(level.greenhouse-1);s.harvested+=harvest;s.crop.progress=0;}
    }
    store(s,'food',r.food-foodUse+harvest);
    const hazard=event.particles+(s.world==='mars'?-1:0);
    s.risk=clamp(hazard-2*level.shelter-(s.shield==='shelter'?2:0)-(fx.protection||0),0,9);
    const supported=d.habitat>=3&&r.oxygen>0&&r.water>0;
    s.condition=clamp(s.condition+(supported?1:-2)+(supported&&level.habitat>1?1:0)-(s.risk>4?1:0),0,10);
    const gained=Math.min(level.lab,d.lab);s.science+=gained;
    const sent=Math.min(level.comms,d.comms,s.science-s.signals);s.signals+=sent;
    s.wear=clamp(s.wear+1,0,12);s.sol++;s.stageTurns++;
    const critical=[];
    for(const [key,label] of [['oxygen','oxygen depleted'],['water','water depleted'],['food','food depleted']])if(!r[key])critical.push(label);
    if(s.condition<3)critical.push('cabin condition below 3');if(s.risk>4)critical.push('radiation risk above 4');
    if(d.habitat<3)critical.push('habitat power below 3');
    if(crewWater<waterUse)critical.push('crew water demand unmet');
    s.stress=critical.length?s.stress+1:0;
    const stageMet=[s.condition>=3&&d.habitat>=3,r.oxygen>0&&r.water>0&&recovered>=1,s.risk<=4,s.harvested>0&&r.food>0,r.oxygen>=3&&r.water>=3&&r.food>=3&&r.battery>=2&&s.condition>=3&&s.risk<=4&&s.harvested>0][stage]&&!critical.length;
    const turns=s.mode==='quick'?1:3;
    const resourceDelta=Object.fromEntries(Object.keys(r).map(k=>[k,r[k]-before[k]]));
    log.push('Generated '+p.generation+' power; used '+p.consumed+'. Crew needed 3 oxygen, 3 water and 2 food. Crew drew '+crewWater+' water.');
    log.push('Life support returned '+conversion+' oxygen using '+(conversion?1:0)+' water. Recovery returned '+recovered+' water. Greywater awaiting treatment: '+s.wastewater+'/12.');
    log.push(growing?'Plants used '+waterCost+' water and '+c.nutrients+' nutrient. '+(harvest?'Harvested '+harvest+' food.':'The crop grew one step.'):'Crop paused: '+(fx.cropStop?'maintenance':d.greenhouse<powerCost?'insufficient light power':r.water<waterCost?'insufficient water':'insufficient nutrients')+'.');
    log.push('Risk index '+s.risk+'. Crew condition '+s.condition+'/10. '+gained+' lab observations; '+sent+' packets sent.');
    let next=critical.length?'Restore '+critical.join(', ')+'. A second consecutive critical shift ends a scored mission.':'Compare battery and water trends before setting the next shiftâ€™s priorities.';
    if(s.mode!=='free'){
      if(s.stress>=2){s.status='failed';s.reason='Two consecutive critical shifts. Latest problems: '+critical.join(', ')+'.';}
      else if(s.stageTurns>=turns){
        if(stageMet){
          s.debriefs.push({stage:stage+1,title:stages[stage].title,text:'Objective achieved after '+s.stageTurns+' shift'+(s.stageTurns===1?'':'s')+'. '+stages[stage].objective+' End stocks: '+r.oxygen+' oxygen, '+r.water+' water, '+r.food+' food, '+r.battery+' charge. Risk '+s.risk+'.'});
          s.stageTurns=0;s.contingency=0;
          if(stage===4){s.status='won';s.reason='All five checkpoints cleared with all four systems inside their final operating targets.';}
        }else if(++s.contingency>2){s.status='failed';s.reason='The stage target was still unmet after two contingency shifts. '+stages[stage].objective;}
        else next='Checkpoint pending. '+stages[stage].objective+' You have '+(3-s.contingency)+' contingency shift(s) remaining.';
      }
    }else{next='Experiment freely. Try changing one allocation and compare its next result with this shift.';}
    const record={sol:s.sol,event:event.title,choice:choice.label,what:choice.immediate+' '+log.join(' '),why:choice.longTerm,science:event.science,next,
      delta:resourceDelta,resources:{...r},risk:s.risk,condition:s.condition,generated:p.generation,consumed:p.consumed,harvest,recovered,wastewater:s.wastewater,delivered:{...d},
      cropGrowing:growing,critical:[...critical],stage:stage+1};
    s.history.push(record);
    if(s.mode==='free'&&s.history.length>180)s.history.shift();
    return ok(s.status==='active'?next:s.reason);
  }
  const between=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
  function valid(s){
    if(!s||s.version!==1||!modes.includes(s.mode)||!worlds.includes(s.world)||!['active','won','failed'].includes(s.status)||typeof s.reason!=='string')return false;
    if(!s.resources||!s.buildings||!s.allocation||!s.crop||!Object.hasOwn(crops,s.crop.type)||!['standard','shelter'].includes(s.shield))return false;
    if(!Object.keys(buildings).every(k=>between(s.buildings[k],initialLevels[k],3)))return false;
    if(!Object.entries(cap(s)).every(([k,limit])=>between(s.resources[k],0,limit)))return false;
    if(!Object.keys(allocations).every(k=>between(s.allocation[k],0,8)))return false;
    if(!between(s.wastewater,0,12))return false;
    if(!between(s.crop.progress,0,crops[s.crop.type].days-1)||!between(s.wear,0,12)||!between(s.supply,0,2)||!between(s.risk,0,9)||!between(s.condition,0,10))return false;
    if(!['sol','stress','stageTurns','contingency','harvested','science','signals'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0))return false;
    if(!Array.isArray(s.history)||!Array.isArray(s.debriefs)||s.debriefs.length>5)return false;
    if(!s.debriefs.every(d=>d&&between(d.stage,1,5)&&typeof d.title==='string'&&typeof d.text==='string'))return false;
    return s.history.every(h=>h&&Number.isSafeInteger(h.sol)&&['event','choice','what','why','science','next'].every(k=>typeof h[k]==='string')&&h.resources&&h.delta&&Object.keys(s.resources).every(k=>Number.isFinite(h.resources[k])&&Number.isFinite(h.delta[k])));
  }
  root.Frontier={create,inspect,advance,build,buildCost,repair,setAllocation,setCrop,setShield,resupply,valid,buildings,crops,stages,events};
})(typeof window==='undefined'?globalThis:window);
