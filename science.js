'use strict';
(() => {
  const archive = 'https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_4.xml';
  const facts = 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html';
  const life = 'https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/';
  const sources = [
    ['Orbital terrain measurements','NASA Goddard · LOLA science team / NASA PDS','Our profiles use 75 cells from LDEM_4, a grid built from laser ranging. The instrument measures distance to the ground. Orbit information helps researchers turn ranges into surface heights. Each cell covers too much ground to certify a landing pad.',archive],
    ['Sunlight, gravity and the lunar day','NASA Goddard · Moon Fact Sheet','The solar bench uses 1,361 watts per square metre as a reference for incoming sunlight. Local hills can block the Sun. One sunrise to the next averages 29.53 Earth days on the Moon. A mission sol in this game is one decision turn.',facts],
    ['Lunar surface conditions and water','NASA Science · Moon Facts','The surface can reach about 127 °C in sunlight and about −173 °C in darkness. Ice occurs in some polar shadows. A crew still needs to find it, collect it and purify it. The game gives the crew a fictional starting supply.','https://science.nasa.gov/moon/facts/'],
    ['Polar illumination and power storage','NASA Technical Reports Server · Extended lunar science missions','Ridges and crater floors can see very different amounts of sunlight. The bench lets you change the lit fraction of a shift. Its battery starts empty, stores surplus electricity and has a fixed capacity.','https://ntrs.nasa.gov/citations/20180004489'],
    ['Heat from orbit','NASA PDS Geosciences Node / UCLA Diviner team','Diviner uses infrared radiation to investigate surface temperature. Its archive includes calibrated observations and derived or modelled products. Temperatures mentioned here describe the lunar environment. Our game has no live thermal feed.','https://pds-geosciences.wustl.edu/missions/lro/diviner.htm'],
    ['Orbital maps and images','Lunar Reconnaissance Orbiter Camera team · QuickMap','Use the camera mosaics to compare a bright crater rim with a shadowed floor. A dark pixel in one photo tells you about that observation. Additional observations are needed to establish persistent shadow.','https://quickmap.lroc.asu.edu/'],
    ['Explore lunar map layers','NASA · Moon Trek','Turn layers on and off to compare different views of the same terrain. Check each layer’s instrument, resolution and observation conditions. The outpost map is original game artwork.','https://trek.nasa.gov/moon/'],
    ['Water recovery and oxygen generation','NASA · Environmental Control and Life Support Systems','Station equipment collects and cleans water. An electrolyzer uses electricity to split water into oxygen and hydrogen. Filters, pumps and tests help make the treated water safe. Our water loop uses an adjustable classroom recovery rate.',life],
    ['Shielding and particle events','NASA Langley Research Center · Radiation Analysis and Shielding Design','Particles from the Sun and high-energy particles arriving from beyond our solar system behave differently. Shelter mass and material matter. The mission indicator ranks fictional hazards and has no medical dose units.','https://ddtrb.larc.nasa.gov/radiation/'],
    ['Light, water and plant nutrients','NASA · Growing Plants in Space','ISS crews grow supplemental food using systems that provide lighting, water, air and nutrients. The outpost compresses growth into turns. A harvest in the game cannot predict a real crop yield.','https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/'],
    ['Signal delays and relays','NASA · Space Communications','Radio signals travel at light speed. Distance sets a minimum delay and terrain can block the link. On Mars a reply from Earth can take many minutes. In the game, communications draw from the same electricity supply as the habitat.','https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/'],
    ['Mars as a second environment','NASA Goddard · Mars Fact Sheet','A Martian solar day is about 24 hours and 40 minutes. Mars has a thin atmosphere, and airborne dust can reduce sunlight reaching an array. Both worlds use a classroom turn clock here.','https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html']
  ];
  const tracks = [
    {name:'Equatorial · 0.125° S', values:[-1443,-1385,-1334,-1354,-1454,-1351,-1284,-1142,-1184,-1258,-1231,-857,-897,243,-187,-446,356,710,287,346,296,2169,2748,2146,1086]},
    {name:'Southern · 85.125° S', values:[-1537,-1764,-1983,-2223,-2471,-2640,-2863,-2978,-3096,-3154,-3254,-3353,-3438,-3542,-3566,-3627,-3640,-3579,-3486,-3579,-3570,-3561,-3671,-4181,-4179]},
    {name:'Northern · 85.125° N', values:[-2725,-2808,-2829,-2837,-2810,-2804,-2822,-2780,-2705,-2767,-2805,-2777,-2778,-2819,-2867,-2898,-2886,-2866,-2785,-2826,-2809,-2810,-2792,-2789,-2791]}
  ];
  const referenceFlux = 1361;
  const templates = {
    terrain:{tag:'LRO / LOLA elevation grid',name:'Read a lunar transect',tip:'Move the marker along one line of the Moon’s surface. Which part of the line is higher?',source:archive,srcLabel:'LOLA data product',controls:'<label for="track">Latitude band</label><select id="track">'+tracks.map((t,i)=>'<option value="'+i+'">'+t.name+'</option>').join('')+'</select>'+range('sample','Sample',1,25,12)},
    power:{tag:'Energy bench / Classroom model',name:'Charge through shadow',tip:'Give a 1 m² solar panel part of a six-hour shift in sunlight. Can the battery carry a 100 W habitat load through the remaining darkness?',source:facts,srcLabel:'NASA solar reference',controls:range('sun','Sunlit fraction',0,100,60,'%')+range('angle','Angle from face-on',0,90,20,'°')+range('battery','Storage capacity',0,800,400,' Wh')},
    water:{tag:'Water bench / Classroom model',name:'Close the water loop',tip:'Your fictional habitat uses 12 litres in a shift. Choose how much wastewater reaches the processor and how much clean water it can recover.',source:life,srcLabel:'NASA life support systems',controls:range('capture','Wastewater collected',0,100,80,'%')+range('recover','Processor recovery',0,100,90,'%')}
  };
  function range(id,label,min,max,value,unit=''){
    return '<label for="'+id+'">'+label+'<output for="'+id+'" data-unit="'+unit+'">'+value+unit+'</output></label><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" value="'+value+'">';
  }
  const panel = document.querySelector('#experiment');
  const value = id=>Number(document.getElementById(id).value);
  const svgShell = content=>'<svg viewBox="0 0 480 190" aria-hidden="true" focusable="false">'+content+'</svg>';
  const svgText = (x,y,text)=>'<text x="'+x+'" y="'+y+'" fill="#e4ead6" font-family="monospace" font-size="13">'+text+'</text>';
  function terrain(){
    const track=tracks[value('track')], index=value('sample')-1;
    const points=track.values.map((v,i)=>[20+i*440/24, 165-(v+4300)/7200*144]);
    const path='M'+points.map(p=>p.join(' ')).join(' L'), [x,y]=points[index];
    return {
      plot:svgShell('<path d="'+path+' L460 172 L20 172Z" fill="#51867d"/><path d="'+path+'" stroke="#d2e0ac" stroke-width="2.5" fill="none"/><line x1="'+x+'" x2="'+x+'" y1="10" y2="172" stroke="#ebb65d" stroke-dasharray="3 4"/><circle cx="'+x+'" cy="'+y+'" r="5" fill="#f5bd67"/>'+svgText(20,16,'+1.5 km')+svgText(20,187,'0.125° E')+svgText(385,187,'6.125° E')),
      caption:'Common vertical scale · Height above a 1,737.4 km reference sphere. Vertical relief is exaggerated.',
      result:(track.values[index]/2).toLocaleString('en-US')+' m',
      why:'Cell centre at '+(0.125+0.25*index).toFixed(3)+'° E. Heights below zero lie inside the reference sphere. A local slope or a safe landing site requires finer data.'
    };
  }
  function bars(rows){
    return svgShell(rows.map(([label,fraction,readout],i)=>{
      const y=15+55*i;
      return svgText(18,y+5,label)+svgText(365,y+5,readout)+'<rect x="18" y="'+(y+15)+'" width="442" height="12" rx="3" fill="#31504e"/><rect x="18" y="'+(y+15)+'" width="'+Math.min(1,Math.max(0,fraction))*442+'" height="12" rx="3" fill="'+['#f5bd67','#91b89e','#68aaa7'][i]+'"/>';
    }).join(''));
  }
  function power(){
    const hours=6*value('sun')/100, angle=value('angle'), capacity=value('battery');
    const watts=referenceFlux*0.22*(angle===90?0:Math.cos(angle*Math.PI/180));
    const generation=watts*hours, dayNeed=100*hours, shadowNeed=100*(6-hours);
    const stored=Math.min(capacity,Math.max(0,generation-dayNeed)*.9);
    const missing=Math.max(0,dayNeed-generation)+Math.max(0,shadowNeed-stored);
    return {plot:bars([['Solar energy',generation/1800,Math.round(generation)+' Wh'],['Stored at dusk',stored/1800,Math.round(stored)+' Wh'],['Shadow demand',shadowNeed/1800,Math.round(shadowNeed)+' Wh']]),caption:'Common scale · 0–1,800 Wh. The panel is lit first and then enters shadow.',
      result:missing>.01?Math.ceil(missing)+' Wh short':'Load supplied',why:'The lit interval supplies the habitat first. The empty battery stores 90% of the surplus until full. At dusk it holds '+Math.round(stored)+' Wh for '+Math.round(shadowNeed)+' Wh of shadow demand. The classroom panel converts 22% of incident light.'};
  }
  function water(){
    const collected=12*value('capture')/100, clean=collected*value('recover')/100, makeup=12-clean;
    return {plot:bars([['Crew use',1,'12.0 L'],['Collected',collected/12,collected.toFixed(1)+' L'],['Recovered',clean/12,clean.toFixed(1)+' L']]),caption:'Common scale · 0–12 L per shift. The processor only treats the water it receives.',result:makeup.toFixed(1)+' L to replace',why:'The tank gets '+clean.toFixed(1)+' L back. Another '+(12-collected).toFixed(1)+' L escaped collection and '+(collected-clean).toFixed(1)+' L stayed in the waste stream. The crew needs fresh supplies to make up both losses.'};
  }
  const compute={terrain,power,water};
  let active='terrain';
  function update(){
    panel.querySelectorAll('output').forEach(o=>o.value=value(o.htmlFor.value)+o.dataset.unit);
    const result=compute[active]();
    panel.querySelector('.diagram').innerHTML=result.plot;
    panel.querySelector('.caption').textContent=result.caption;
    panel.querySelector('.result strong').textContent=result.result;
    panel.querySelector('.result p').textContent=result.why;
  }
  function mount(id){
    active=id;
    document.querySelectorAll('[data-exp]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.exp===id)));
    const model=templates[id];
    panel.innerHTML='<div class="bench"><div class="plot"><div><p class="eyebrow">'+model.tag+'</p><h2>'+model.name+'</h2></div><div class="diagram"></div><small class="caption"></small></div><div class="controls"><h3>Test the system</h3><p>'+model.tip+'</p>'+model.controls+'<div class="result" aria-live="polite" aria-atomic="true"><strong></strong><p></p></div><a class="source" href="'+model.source+'">'+model.srcLabel+' ↗</a></div></div>';
    update();
  }
  panel.addEventListener('input',update);
  document.querySelector('.selector').addEventListener('click',e=>{if(e.target.dataset.exp)mount(e.target.dataset.exp)});
  document.getElementById('records').innerHTML=sources.map(([title,owner,info,url])=>'<details><summary>'+title+'</summary><p>'+info+'</p><a href="'+url+'">'+owner+' ↗</a></details>').join('');
  mount('terrain');
})();
