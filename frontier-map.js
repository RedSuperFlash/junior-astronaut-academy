/* Original isometric facility drawings. The map uses normalized scenario state. */
(() => {
  "use strict";
  const width = 1000, height = 432;
  const sites = {
    solar:      [166, 230, "Solar power station"],
    shelter:    [367, 211, "Radiation shelter"],
    lab:        [582, 207, "Scientific laboratory"],
    comms:      [784, 210, "Communications station"],
    battery:    [255, 294, "Battery storage"],
    habitat:    [487, 285, "Crew habitat"],
    greenhouse: [708, 311, "Greenhouse"],
    life:       [365, 367, "Life-support module"],
    water:      [567, 377, "Water recovery system"]
  };
  const labels = {solar:"Solar array",shelter:"Shelter",lab:"Laboratory",comms:"Antenna",battery:"Battery",habitat:"Habitat",greenhouse:"Greenhouse",life:"Life support",water:"Recovery"};
  const svgNS = "http://www.w3.org/2000/svg";
  const fix = n => Number(n.toFixed(2));
  const clamp = n => Math.max(0, Math.min(1, Number(n) || 0));
  function iso(x,y,z=0) { return [fix(x-y),fix((x+y)*.37-z)]; }
  function polygon(vertices,fill,stroke="#283733") {
    return '<polygon points="'+vertices.map(p=>iso(...p).join(',')).join(' ')+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.2" stroke-linejoin="round"/>';
  }
  function box(x,y,z,w,d,h, palette=["#ece8cf","#b1b3a0","#788e88"]) {
    const a=x+w,b=y+d,c=z+h;
    return polygon([[x,y,c],[a,y,c],[a,b,c],[x,b,c]],palette[0])
      +polygon([[x,b,z],[x,b,c],[a,b,c],[a,b,z]],palette[1])
      +polygon([[a,b,z],[a,b,c],[a,y,c],[a,y,z]],palette[2]);
  }
  function pipe(x,y,z,r,h, color="#b5c5b4", top="#e3e9d4", dark="#56746b") {
    const [cx,cy]=iso(x,y,z),ry=r*.38;
    return '<g stroke="#384945" stroke-width="1"><path d="M'+(cx-r)+' '+cy+'v-'+h+'h'+(r*2)+'v'+h+'a'+r+' '+ry+' 0 0 1 -'+(2*r)+' 0" fill="'+color+'"/><path d="M'+(cx+r*.62)+' '+(cy-h)+'v'+h+'" stroke="'+dark+'" stroke-width="'+(r*.53)+'"/><ellipse cx="'+cx+'" cy="'+(cy-h)+'" rx="'+r+'" ry="'+ry+'" fill="'+top+'"/></g>';
  }
  function rail(a,b,color,w=1.5,details="") {
    const [x,y]=iso(...a),[u,v]=iso(...b);
    return '<path d="M'+x+' '+y+'L'+u+' '+v+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" '+details+'/>';
  }
  function module(x,y,w,d,h,stripe="#d29550"){
    let art=box(x,y,2,w,d,h);
    // Insulation seams, wraparound mission band and inset portholes.
    art+=box(x-.2,y-.2,h*.31,w+.4,d+.4,3,[stripe,stripe,"#8e6a45"]);
    for(let n=4;n<w-3;n+=10){
      art+=rail([x+n,y+d+.3,4],[x+n,y+d+.3,h+2],"#727e72",1.2);
      art+=polygon([[x+n+1,y+d+.5,h-3],[x+n+6,y+d+.5,h-3],[x+n+6,y+d+.5,h-8],[x+n+1,y+d+.5,h-8]],"#254c52");
      art+=rail([x+n+1,y+d+.6,h-4],[x+n+5,y+d+.6,h-4],"#b8dcce",1.2);
    }
    for(let n=4;n<d-2;n+=8)art+=rail([x+w+.2,y+n,3],[x+w+.2,y+n,h+1],"#566f67",1);
    return art;
  }
  function array(x,y,z,w,d){
    let art=pipe(x+w*.5,y+d*.5,0,3,15,"#aaa38b");
    const corner=(a,b)=>[x+a,y+b,z+11*(1-b/d)];
    art+=polygon([corner(0,0),corner(w,0),corner(w,d),corner(0,d)],"#305064","#dccca1");
    for(let n=1;n<8;n++)art+=rail(corner(n*w/8,0),corner(n*w/8,d),"#b7c2b5",.9);
    for(let n=1;n<4;n++)art+=rail(corner(0,n*d/4),corner(w,n*d/4),"#9bb9ba",.75);
    return art;
  }
  const slab=(w,d)=>box(-w/2,-d/2,0,w,d,3,["#a9ae9b","#757b6d","#686f64"]);
  function structure(id,tier,growth,light){
    let a="";
    switch(id){
      case "habitat":
        a=slab(82,43)+module(-37,-18,63,32,21)+module(18,-12,19,21,15,"#ce754a");
        a+=box(-23,-13,24,35,19,4,["#d7dbc8","#a7afa2","#889b90"]);
        a+=pipe(-14,-3,28,6,3)+pipe(4,-3,28,4,6);
        a+=box(26,-1,4,11,9,10,["#dbccb1","#cad0b7","#6e8075"]);
        break;
      case "life":
        a=slab(48,28)+module(-21,-11,30,20,16,"#5a9188");
        a+=pipe(16,-6,3,7,22)+pipe(16,8,3,7,18);
        a+=rail([12,-7,24],[12,7,20],"#bcaa75",3);
        break;
      case "water":
        a=slab(46,32)+module(-19,-10,19,21,13,"#60afa9");
        a+=pipe(7,-7,3,9,21,"#8daaa0")+pipe(10,9,3,8,18,"#759e98");
        a+=rail([5,-7,25],[8,9,22],"#d0c39a",3);break;
      case "solar":
        a=slab(15,14)+array(-42,-8,14,29,22)+array(-7,-8,14,29,22)+array(27,-8,14,29,22);break;
      case "battery":
        a=slab(36,26);
        for(let n=0;n<3;n++){
          let x=-16+n*11;
          a+=box(x,-10,3,9,21,14,["#c9cbc1","#849794","#617873"]);
          a+=box(x+1,-8,17,7,17,1.8,["#d8bc72","#ad945a","#96834f"]);
          a+=rail([x+2,11.2,13],[x+7,11.2,13],light>.2?"#b4edc8":"#d69c5f",2);
        }break;
      case "shelter":
        a='<path d="m-51 8 10-13 22-10 27-7 30 10 10 13 7 10-29 12-29-2z" fill="#98988b" stroke="#4a554f"/><path d="m-51 8 33-19 27-11-18 24-13 11z" fill="#c8c4a8"/><path d="m9-22 29 10 10 13-32-8-18 9z" fill="#a9a994"/><path d="m-9 2 25-9 32 8 7 10-29 12-29-2-19-8z" fill="#777f74"/>';
        a+=module(5,-5,22,19,11,"#ba874e");break;
      case "lab":
        a=slab(46,30)+module(-21,-13,39,24,14,"#aa785a");
        a+=pipe(-7,-4,16,8,5)+pipe(7,0,16,4,8);
        a+=rail([2,-6,17],[2,-6,39],"#573f3a",1.8)+rail([2,-9,35],[2,-3,35],"#cec7b2",1.4);break;
      case "comms":
        a=slab(36,24)+module(-14,-10,25,18,11,"#c68c4b");
        a+='<g transform="translate(0,-14)"><path d="m-9 2 10-24L12 4Z" fill="#b7b9a3" stroke="#445953"/><path d="m1-24 6-2" stroke="#364943" stroke-width="4"/><g transform="translate(3 -29) rotate(-28)"><path d="M-23-4Q0 25 23-4Q0 4-23-4Z" fill="#a6b1a5" stroke="#465952"/><ellipse cy="-4" rx="23" ry="6" fill="#e5dfc0" stroke="#4b615b"/><path d="m-20-3 20-14 20 14m-20-14v18" fill="none" stroke="#78887e" stroke-width="1.3"/><circle cy="-17" r="2" fill="#e8b97f"/></g></g>';break;
      case "greenhouse": {
        a=slab(65,28)+box(-31,-12,3,61,24,4,["#d0c8a7","#aeb595","#758a78"]);
        a+='<g class="frontier-map-crop">';
        for(let n=0;n<4;n++)a+=box(-26+n*14,-8,7,9,15,2+growth*8,["#87bf85","#557d59","#385c48"]);
        a+="</g>";
        const corner=(x,y,z)=>[x,y,z+7];
        const struts=[[-12,0],[-11,8],[-7,15],[0,18],[7,15],[11,8],[12,0]];
        for(let j=0;j<struts.length-1;j++){let [y,z]=struts[j],[yy,zz]=struts[j+1];a+='<g opacity=".43">'+polygon([corner(-30,y,z),corner(30,y,z),corner(30,yy,zz),corner(-30,yy,zz)],["#83bbad","#b8e4cc","#99cbb6","#89bdaf","#7aa69c","#4d8c84"][j],"#bed5b9")+'</g>'}
        for(let x=-30;x<=30;x+=12){
          for(let j=0;j<struts.length-1;j++)a+=rail(corner(x,...struts[j]),corner(x,...struts[j+1]),"#d6d5af",1.8);
        }
        a+=module(24,-6,10,12,8,"#7d9865");break;
      }
    }
    if(tier>1) a+=pipe(24,-14,3,5,8)+box(16,-18,10,14,8,3,["#dab868","#a38d59","#766949"]);
    if(tier>2) a+=array(25,-28,10,20,12);
    return a;
  }
  function rover(){
    return '<g transform="translate(829 349) scale(.76)"><ellipse cx="4" cy="3" rx="27" ry="6" fill="#394547" opacity=".34"/>'+box(-13,-6,5,23,12,8,["#ddc38b","#c49a60","#8e7352"])+box(-1,-5,13,9,9,8,["#ede0b7","#587b78","#496562"])+rail([-8,1,13],[-8,1,25],"#586560",2)+[[-13,5],[0,9],[12,9],[18,3]].map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="4.3" ry="5" fill="#384641" stroke="#738075"/><circle cx="'+x+'" cy="'+y+'" r="1.6" fill="#c6c3a6"/>').join('')+'</g>';
  }
  const cssurl = new URL("frontier-map.css",document.currentScript.src).href;
  if(!Array.from(document.styleSheets).some(sheet=>sheet.href===cssurl)){
    const link=document.createElement("link");link.rel="stylesheet";link.href=cssurl;document.head.append(link);
  }
  function render(container,state={},onSelect=()=>{}){
    if(!container) return;
    const mars=state.planet==="mars", levels=state.buildings||{}, light=clamp(state.light??1), growth=clamp(state.growth), wear=clamp(state.wear);
    const focused = container.contains(document.activeElement) ? document.activeElement?.dataset.facility : null;
    const priorScroll=container.querySelector(".frontier-map-screen")?.scrollLeft||0;
    const options=Object.entries(sites).map(([id,p])=>'<option value="'+id+'" '+(state.selected===id?'selected':'')+'>'+p[2]+' · '+(levels[id]?'Level '+Number(levels[id]):'Build site')+'</option>').join('');
    container.innerHTML='<section class="frontier-map" aria-label="'+(mars?'Martian':'Lunar')+' outpost map"><div class="frontier-map-screen"><div class="frontier-map-world '+(mars?'frontier-mars':'frontier-moon')+'"><div class="frontier-map-shadow"></div><div class="frontier-map-compass" aria-hidden="true">N<span>⌖</span></div></div></div><label class="frontier-map-picker">Inspect facility<select>'+options+'</select></label></section>';
    const world=container.querySelector(".frontier-map-world");
    world.style.setProperty("--surface-shadow",fix((1-light)*.36));
    const scene=document.createElementNS(svgNS,"svg");scene.setAttribute("viewBox",'0 0 '+width+' '+height);scene.classList.add("frontier-map-drawing");scene.setAttribute("aria-hidden","true");
    // Fixed utility conduits: visible only when both endpoint buildings have been constructed.
    const routes=[["solar","battery"],["battery","habitat"],["life","habitat"],["water","life"],["water","greenhouse"],["habitat","greenhouse"],["shelter","habitat"],["lab","habitat"],["comms","lab"]];
    let markup='<g fill="none" stroke-linecap="round">'+routes.filter(([a,b])=>levels[a]>0&&levels[b]>0).map(([a,b])=>{
      const [x,y]=sites[a],[u,v]=sites[b], d='M'+x+' '+y+' Q'+Math.round((x+u)/2)+' '+Math.max(y,v)+' '+u+' '+v;
      return '<path d="'+d+'" stroke="#384943" opacity=".48" stroke-width="4"/><path d="'+d+'" stroke="#d7caa2" opacity=".74" stroke-width="1.1" stroke-dasharray="7 3"/>';
    }).join('')+'</g>'+rover();
    Object.entries(sites).sort((a,b)=>a[1][1]-b[1][1]).forEach(([id,[x,y]])=>{
      const tier=Math.max(0,Number(levels[id])||0), scale=.85+y/1600;
      markup+='<g transform="translate('+x+' '+y+') scale('+fix(scale)+')">';
      if(tier){
        markup+='<path d="m-36 5 24-6 46 1 36 13-24 8-54-9z" fill="#283c40" opacity=".38"/>'+structure(id,tier,growth,light);
        if(id==="habitat"&&light>.25)markup+='<circle class="frontier-map-beacon" cx="3" cy="-25" r="1.5" fill="#ffdb8b"/>';
        if(wear>.74)markup+='<circle cx="17" cy="-6" r="2.6" fill="#ffb45d" stroke="#744830"/>';
      } else{
        markup+='<path d="m-32 0 33-13 30 12-32 14z" fill="#444e453b" stroke="#ece8cd" stroke-dasharray="5 3" stroke-width="1.5"/><path d="M-5 0H5M0-5V5" stroke="#f3eacf" stroke-width="2"/>';
      }
      markup+='</g>';
    });
    scene.innerHTML=markup;world.append(scene);
    Object.entries(sites).forEach(([id,[x,y,name]])=>{
      const built=Number(levels[id])>0;
      const marker=document.createElement("button");marker.type="button";marker.className="frontier-map-pin"+(built?"":" is-unbuilt");marker.dataset.facility=id;
      marker.style.left=(x/width*100)+"%";marker.style.top=((y+20)/height*100)+"%";
      marker.setAttribute("aria-label",name+" · "+(built?"Level "+Number(levels[id]):"Construction site"));
      marker.setAttribute("aria-pressed",String(state.selected===id));
      const label=document.createElement("span");label.textContent=labels[id];marker.append(label);world.append(marker);
      marker.onclick=()=>onSelect(id);
    });
    container.querySelector("select").onchange=e=>onSelect(e.target.value);
    container.querySelector(".frontier-map-screen").scrollLeft=priorScroll;
    if(focused&&sites[focused])world.querySelector('[data-facility="'+focused+'"]')?.focus({preventScroll:true});
  }
  window.FrontierMap=Object.freeze({render});
})();
