const {test} = require('node:test');
const assert = require('node:assert/strict');
require('../frontier-engine.js');
const F = globalThis.Frontier;
const step = (s,index=0) => {assert.equal(F.advance(s,index).ok,true);assert.equal(F.valid(s),true);};
const clone = x => JSON.parse(JSON.stringify(x));

test('five quick checkpoints, successful harvest, terminal guards, deterministic replay and save restoration',()=>{
  const s=F.create();
  step(s);step(s);
  assert.equal(s.harvested,5);
  const restored=clone(s);
  assert(F.valid(restored));
  for(let t=0;t<3;t++){step(s);step(restored);}
  assert.deepEqual(s,restored);
  assert.equal(s.status,'won');
  assert.equal(s.debriefs.length,5);
  for(const k of ['advance','repair','resupply'])assert.equal(F[k](s,0).ok,false);
  assert.equal(F.build(s,'solar').ok,false);
});
test('power cut gives a warning, then failure; restoring power recovers in a contingency shift',()=>{
  const s=F.create();F.setAllocation(s,'habitat',0);step(s);
  assert.equal(s.stress,1);assert.equal(s.status,'active');assert.equal(s.contingency,1);
  const rescued=clone(s);F.setAllocation(rescued,'habitat',3);step(rescued);assert.equal(rescued.stress,0);
  assert.equal(rescued.debriefs.length,1);
  step(s);assert.equal(s.status,'failed');assert.match(s.reason,/habitat power/);
});
test('failures from resource depletion, meaningful construction, food and finite packs',()=>{
  const s=F.create('campaign');F.setAllocation(s,'recovery',0);
  while(s.status==='active' && s.sol<10)step(s,s.sol===4?1:0);
  assert.equal(s.resources.water,0);assert.equal(s.status,'failed');
  const a=F.create(), initial=F.inspect(a), cost=F.buildCost(a,'solar');
  assert.equal(F.build(a,'solar').ok,true);assert.equal(a.resources.materials,16-cost);
  assert(F.inspect(a).generation>initial.generation);
  assert.equal(F.build(a,'solar').ok,false);
  F.setCrop(a,'potato');step(a);assert.equal(a.crop.progress,0);
  F.setAllocation(a,'greenhouse',3);step(a);assert.equal(a.crop.progress,1);
  F.resupply(a);F.resupply(a);assert.equal(F.resupply(a).ok,false);
});
test('shelter and crew posture lower risk; radiation warning can be rescued',()=>{
  const base=F.create();step(base);step(base);
  const good=clone(base),bad=clone(base);
  F.build(good,'shelter');F.setShield(good,'shelter');step(good,2);step(bad,2);
  assert(good.risk<bad.risk);assert.equal(bad.stress,1);step(bad,0);
  assert.equal(bad.stress,0);assert.equal(bad.debriefs.length,3);
});
test('all construction levels enforce maximum, cost and storage; lab and link deliver science',()=>{
  for(const key of Object.keys(F.buildings)){
    const s=F.create('free');
    while(s.buildings[key]<3){const b=s.buildings[key],cost=F.buildCost(s,key);s.resources.materials=60;assert(F.build(s,key).ok);assert.equal(s.buildings[key],b+1);assert.equal(s.resources.materials,60-cost);}
    assert.equal(F.build(s,key).ok,false);
  }
  const s=F.create();F.build(s,'lab');F.build(s,'comms');step(s);
  assert.equal(s.science,1);assert.equal(s.signals,1);
  F.setShield(s,'shelter');step(s);assert.equal(s.science,1);assert.equal(s.signals,1);
});
for(const world of ['moon','mars'])test('15-sol full campaign passes all checkpoints on '+world,()=>{
  const s=F.create('campaign',world);F.build(s,'solar');F.build(s,'shelter');F.setAllocation(s,'recovery',4);
  const seen=new Set();
  for(let n=0;n<15;n++){
    seen.add(F.inspect(s).event.title);
    if(s.wear>=5 && s.resources.materials>=2)F.repair(s);
    if((s.resources.water<=5||s.resources.nutrients<=1)&&s.supply)F.resupply(s);
    step(s,n===11?1:0);
  }
  assert.equal(seen.size,15);assert.equal(s.status,'won');assert.equal(s.debriefs.length,5);
  if(world==='mars')assert(seen.has('Dust veil'));
});
test('finite response costs, future free experiment shifts, malformed saves',()=>{
  const s=F.create('free');step(s);s.resources.materials=0;const before=clone(s);assert.equal(F.advance(s,0).ok,false);assert.deepEqual(before,s);
  for(let n=0;n<250;n++){
    const i=F.inspect(s).event.options.findIndex(o=>Object.entries(o.effect).every(([key,v])=>!(key in s.resources)||s.resources[key]+v>=0));
    assert(i>=0);step(s,i);
  }
  assert.equal(s.status,'active');assert.equal(s.history.length,180);
  for(const bad of [null,{}, {...s,buildings:null},{...s,crop:{type:'fiction'}},{...s,resources:{...s.resources,water:-8}},{...s,history:[{}]}])assert.equal(F.valid(bad),false);
});

test('greywater availability, rack power and water overhead, habitat shelter corner',()=>{
  const dry=F.create('free');dry.resources.water=0;dry.wastewater=0;step(dry);
  assert.equal(dry.history[0].recovered,0);assert.equal(dry.resources.water,0);assert(dry.stress>0);
  const rack=F.create();assert(F.build(rack,'greenhouse').ok);step(rack);assert.equal(rack.crop.progress,0);
  F.setAllocation(rack,'greenhouse',3);step(rack);assert.equal(rack.crop.progress,1);
  assert.match(F.setShield(rack,'shelter').message,/corner/);
});
