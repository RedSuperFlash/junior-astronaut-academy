(() => {
  "use strict";

  // All numerical scenarios are simplified classroom models.
  const button = (key, label, active = false) =>
    '<button type="button" class="lab-choice" data-action="' + key + '" aria-pressed="' + active + '">' + label + '</button>';
  const metric = (label, value) => '<span class="lab-reading"><small>' + label + '</small><b>' + value + '</b></span>';
  const meter = (value, max) => '<meter min="0" max="' + max + '" value="' + value + '" aria-label="Budget used"></meter>';
  const ranges = (fields) => fields.map(([key, label, value, max, unit, min = 0]) =>
    '<label class="lab-range">' + label + '<output>' + value + ' ' + unit + '</output><input type="range" data-slider="' +
    key + '" min="' + min + '" max="' + max + '" value="' + value + '" aria-label="' + label + '"></label>').join('');

  function survey() {
    const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
    const colors = ['#c6bdb0', '#ebb267', '#5bafa9', '#d77153', '#cb9e78', '#d1ba82', '#8acbc5', '#6485c4'];
    const rounds = [
      ['Locate the outermost of the four rocky planets. Use the map, which runs outward from the Sun.', 3, 'Mars is the fourth rocky planet. Jupiter marks the start of the giant planets.'],
      ['Plot the first giant planet past the rocky worlds.', 4, 'Jupiter is the fifth planet and the first gas giant.'],
      ['Plot the farther of the two ice giants, Uranus and Neptune.', 7, 'Neptune follows Uranus and is the farthest planet from the Sun.']
    ];
    let i = 0, target = -1;
    return {
      title: 'Solar survey', intro: 'Build a flight chart by identifying three destinations. Planet sizes and distances are schematic.',
      view: () => '<p><strong>Flight fix ' + (i + 1) + ' / 3</strong> · ' + rounds[i][0] + '</p><div class="lab-orbits">' +
        planets.map((p, n) => '<button type="button" data-action="p' + n + '" aria-pressed="' + (n === target) + '"><i style="--planet:' + colors[n] + '"></i>' + p + '</button>').join('') +
        '</div><a class="lab-source" href="https://science.nasa.gov/solar-system/planets/" target="_blank" rel="noopener">NASA planetary atlas ↗</a>',
      act(key) { target = Number(key.slice(1)); },
      check() {
        if (target !== rounds[i][1]) return {msg: target < 0 ? 'Select a planet on the chart first.' : 'Trace the order from Mercury outward and check the requested group.'};
        const msg = rounds[i][2]; i++; target = -1;
        return {msg, done: i === rounds.length};
      }
    };
  }

  function propulsion() {
    const rounds = [[40, 3], [60, 4], [80, 5]];
    let i = 0, thrust = 20, duration = 1;
    const speed = () => thrust * duration / rounds[i][0];
    return {
      title: 'Thruster test bench', intro: 'Start a test sled at rest in a frictionless chamber. Change its speed by applying a steady force. Speed change = force × burn time ÷ mass.',
      view: () => '<p><strong>Test burn ' + (i + 1) + ' / 3</strong> · Match the target speed exactly.</p><div class="lab-instruments">' +
        metric('Sled mass', rounds[i][0] + ' kg') + metric('Target', rounds[i][1] + ' m/s') + metric('Predicted speed', speed().toFixed(2) + ' m/s') +
        '</div>' + ranges([['thrust', 'Thrust', thrust, 100, 'N', 1], ['time', 'Burn time', duration, 8, 's', 1]]),
      slide(key, value) { if (key === 'thrust') thrust = value; else duration = value; },
      check() {
        const v = speed(), t = rounds[i][1];
        if (Math.abs(v - t) > .001) return {msg: 'Your sled would ' + (v < t ? 'undershoot. Increase' : 'overshoot. Reduce') + ' the force or the burn time.'};
        i++; return {done: i === 3, msg: 'Burn verified. A heavier sled needs more impulse for the same speed change.'};
      }
    };
  }

  function equipment() {
    const items = [['Oxygen supply', 4], ['CO₂ scrubber', 2], ['Cooling loop', 2], ['Radio', 1], ['Tether', 1], ['Sample box', 2], ['Camera', 2]];
    const jobs = [
      ['Bench-test the breathing system. Supply oxygen and capture exhaled carbon dioxide.', 6, [0, 1]],
      ['Configure a warm-environment suit test. Support breathing and remove heat.', 8, [0, 1, 2]],
      ['Prepare the same suit for a tethered communications drill. Add voice contact and a physical connection.', 10, [0, 1, 2, 3, 4]]
    ];
    let i = 0, picked = new Set();
    const mass = () => [...picked].reduce((sum, n) => sum + items[n][1], 0);
    return {
      title: 'Suit systems bay', intro: 'Equip a training rig for three simulated tests. Each module uses part of its mass allowance.',
      view: () => '<p>' + jobs[i][0] + '</p><div class="lab-instruments">' + metric('Test rig', (i + 1) + ' / 3') + metric('Installed mass', mass() + ' / ' + jobs[i][1] + ' kg') + '</div>' +
        '<div class="lab-choices">' + items.map(([name, weight], n) => button('m' + n, name + ' · ' + weight + ' kg', picked.has(n))).join('') + '</div>',
      act(key) { const n = Number(key.slice(1)); if (picked.has(n)) picked.delete(n); else picked.add(n); },
      check() {
        const [, budget, required] = jobs[i];
        if (mass() > budget) return {msg: 'This rig exceeds its mass limit. Remove equipment outside the test objectives.'};
        const missing = required.find(n => !picked.has(n));
        if (missing !== undefined) return {msg: items[missing][0] + ' is missing. Review which function the rig needs.'};
        i++; return {done: i === 3, msg: 'All required systems fit within the mass limit.'};
      }
    };
  }

  function drift() {
    let x = 1, v = 0, impulse = 0, fuel = 6, i = 0;
    const rounds = [[1, 5], [6, 2]];
    function reset() { x = rounds[i][0]; v = 0; impulse = 0; fuel = 6; }
    return {
      title: 'Zero-gravity transfer', intro: 'Move a free-floating cargo pod to the marked bay and stop there. Each turn applies one impulse, then moves the pod by its new velocity. Coasting uses no propellant.',
      submit: 'Advance one turn',
      view: () => '<div class="lab-drift" aria-label="Cargo pod track">' + Array.from({length:8}, (_, n) => '<span class="' +
        (n === rounds[i][1] ? 'lab-target' : '') + '">' + (n === x ? '◆' : '·') + '<small>' + n + '</small></span>').join('') +
        '</div><div class="lab-instruments">' + metric('Destination', 'Bay ' + rounds[i][1]) + metric('Velocity', v + ' bays/turn') + metric('Fuel', fuel + ' units') + '</div><div class="lab-choices">' +
        button('left','← Impulse left', impulse === -1) + button('coast','Coast', !impulse) + button('right','Impulse right →', impulse === 1) + '</div>',
      act(key) { impulse = {left:-1, coast:0, right:1}[key]; },
      check() {
        if (impulse && !fuel) { reset(); return {msg: 'Propellant ran out. The pod is back at its starting bay. Coast between short burns.'}; }
        fuel -= Math.abs(impulse); v += impulse; x += v; impulse = 0;
        if (x < 0 || x > 7) { reset(); return {msg: 'The pod crossed a boundary. Test reset. Apply an opposite impulse to brake before the wall.'}; }
        if (x === rounds[i][1] && !v) {
          i++; if (i < 2) reset();
          return {done: i === 2, msg: i === 2 ? 'Both transfers ended with zero relative velocity.' : 'First pod docked. Bring the second pod back in the opposite direction.'};
        }
        return {msg: 'Pod at bay ' + x + '. ' + (v ? 'It will keep drifting unless you brake.' : 'It is stationary.')};
      }
    };
  }

  function rover() {
    const terrain = ['H','.','.','X','.','X','.','A','.','B','.','.','X','.','X','.'];
    const legend = {H:'Base', '.':'Plain', X:'Rock', A:'Core', B:'Layer'};
    let pos = 0, battery = 12, samples = new Set(), note = '';
    function reset() { pos = 0; battery = 12; samples.clear(); note = 'New traverse started.'; }
    return {
      title: 'Mars sample traverse', intro: 'Collect a rock core and a layer sample, then return to base. Each move to a neighboring square costs one unit of energy. Rocks block the rover.',
      submit: 'Deliver samples',
      view: () => '<div class="lab-map" aria-label="Four by four terrain map">' + terrain.map((t,n) => '<span class="tile-' + t.replace('.','plain') + (n === pos ? ' here' : '') +
        '">' + (n === pos ? '◆ Rover' : (samples.has(t) ? 'Collected' : legend[t])) + '</span>').join('') + '</div><div class="lab-instruments">' +
        metric('Battery', battery + ' units') + metric('Samples', samples.size + ' / 2') + '</div><div class="lab-choices">' + [['north','↑ North'],['west','← West'],['east','East →'],['south','↓ South'],['reset','Restart traverse']].map(([k,l]) => button(k,l)).join('') + '</div>',
      act(key) {
        if (key === 'reset') { reset(); return note; }
        let row = Math.floor(pos / 4), col = pos % 4;
        row += ({north:-1,south:1}[key] || 0); col += ({west:-1,east:1}[key] || 0);
        const next = row * 4 + col;
        if (row < 0 || row > 3 || col < 0 || col > 3 || terrain[next] === 'X') return 'Route blocked. Choose another adjacent square.';
        if (!battery) return 'The battery is empty. Restart and plan a shorter route.';
        battery--; pos = next;
        if ('AB'.includes(terrain[pos]) && !samples.has(terrain[pos])) {
          samples.add(terrain[pos]); return legend[terrain[pos]] + ' sample stored.';
        }
        return 'Moved ' + key + '.';
      },
      check() {
        if (samples.size !== 2) return {msg:'Both geological samples are needed before delivery.'};
        if (pos !== 0) return {msg:'The samples are aboard. Return to the base square.'};
        return {done:true, msg:'Both samples reached the laboratory within the rover’s energy budget.'};
      }
    };
  }

  function comms() {
    const packets = [['Vehicle health',2],['Crew report',3],['Navigation fix',2],['Rock spectra',5],['Panorama',6],['Thumbnail',1]];
    const passes = [
      ['Send vehicle health and a navigation fix before the maneuver.',4,[0,2]],
      ['Send the crew report and rock spectra for the science team.',8,[1,3]],
      ['Return a full panorama with a fresh vehicle health report.',8,[0,4]]
    ];
    let i = 0, selected = new Set();
    const used = () => [...selected].reduce((sum,n) => sum + packets[n][1],0);
    return {
      title:'Ground station downlink', intro:'Plan each contact window. A packet must fit entirely within the available channel capacity. Select packets that satisfy each ground request.',
      submit:'Transmit queue',
      view:() => '<p><strong>Contact ' + (i+1) + ' / 3</strong> · ' + passes[i][0] + '</p>' + meter(used(), passes[i][1]) +
        '<p>Queued data · <b>' + used() + ' / ' + passes[i][1] + ' MB</b></p><div class="lab-choices">' + packets.map(([l,n],j) => button('p'+j,l+' · '+n+' MB',selected.has(j))).join('') + '</div>',
      act(key) { const n = Number(key.slice(1)); if (selected.has(n)) selected.delete(n); else selected.add(n); },
      check() {
        if (used() > passes[i][1]) return {msg:'The transmission would be cut off. Remove lower-priority data.'};
        if (!passes[i][2].every(n => selected.has(n))) return {msg:'The queue leaves part of the ground request unanswered.'};
        i++; selected.clear(); return {done:i === 3, msg:'Complete packet set received on the ground.'};
      }
    };
  }

  function power() {
    const events = [
      ['Sunlit orbit',14, [5,3,4],2,'Charge the battery with 2 units of spare power.'],
      ['Eclipse entry',10,[5,3,0],2,'Pause experiments so the battery reserve stays at 2 units.'],
      ['Cold recovery',13,[5,5,1],2,'Heat demand has increased and one experiment must run.']
    ];
    const names = ['Habitat','Heaters','Science'];
    let i = 0, allocations = [3,2,2];
    const spare = () => events[i][1] - allocations.reduce((a,b) => a+b,0);
    return {
      title:'Station power desk', intro:'Allocate the available supply between three systems while preserving the required reserve. System minima change as the station enters shadow.',
      view:() => '<p><strong>' + events[i][0] + '</strong> · ' + events[i][4] + '</p><div class="lab-instruments">' + metric('Supply',events[i][1]+' units') + metric('Spare power',spare()+' units') + '</div>' +
        ranges(names.map((name,n) => ['s'+n,name+' · minimum '+events[i][2][n],allocations[n],8,'units'])),
      slide(key,v) { allocations[Number(key.slice(1))] = v; },
      check() {
        const low = allocations.findIndex((v,n) => v < events[i][2][n]);
        if (low >= 0) return {msg:names[low]+' is below its operating minimum. Redirect power to it.'};
        if (spare() < events[i][3]) return {msg:'Reserve power is too low. Reduce a load that exceeds its minimum.'};
        i++; return {done:i === 3,msg:'All systems are within their operating limits and reserve is available.'};
      }
    };
  }

  function expedition() {
    const legs = [
      ['Survey a landing site','Two passes give different coverage. Choose a survey that produces at least 3 evidence points.',
        [['Wide stereo survey',3,1,3],['Quick snapshot',1,1,1],['Detailed mapping',4,2,4]],3],
      ['Collect a specimen','Choose a safe investigation that earns at least 2 more evidence points.',
        [['Context photos only',1,1,1],['Logged core sample',2,2,3],['Extended drill',4,3,4]],2],
      ['Return the evidence','A successful return must relay at least 2 evidence points and leave 2 fuel units and 1 power unit in reserve.',
        [['Full archive return',3,3,4],['Essential data return',2,2,2],['Beacon only',1,1,0]],2]
    ];
    let i = 0, fuel = 10, energy = 8, evidence = 0, selected = -1;
    return {
      title:'Expedition command',intro:'Command a three-leg sample expedition. Compare scientific return against fuel and power. The final return needs at least 4 fuel and 3 power at its start, including reserves.',
      submit:'Commit flight plan',
      view:() => '<p><strong>'+legs[i][0]+'</strong> · '+legs[i][1]+'</p><div class="lab-instruments">' + metric('Fuel',fuel) + metric('Power',energy) + metric('Evidence',evidence) +
        '</div><div class="lab-plans">'+legs[i][2].map(([label,f,p,s],n) => button('a'+n,'<strong>'+label+'</strong><small>'+f+' fuel · '+p+' power · '+s+' evidence</small>', n===selected)).join('')+'</div>'+button('reset','Restart expedition'),
      act(key) { if (key === 'reset') { i=0;fuel=10;energy=8;evidence=0;selected=-1;return 'Mission plan reset.'; } selected = Number(key.slice(1)); },
      check() {
        if (selected < 0) return {msg:'Choose a flight plan first.'};
        const [, f, p, s] = legs[i][2][selected];
        if (s < legs[i][3]) return {msg:'The plan falls short of this leg’s evidence objective.'};
        if (fuel-f < 2 || energy-p < 1) return {msg:'This plan would consume the required reserve. Select a lower-cost option or restart the expedition.'};
        if (i === 1 && (fuel-f < 4 || energy-p < 3)) return {msg:'The return leg would be short of resources. Compare the logged core and extended drill costs.'};
        fuel-=f;energy-=p;evidence+=s;i++;selected=-1;
        return {done:i===3,msg:i===3 ? 'Expedition complete with '+evidence+' evidence points, '+fuel+' fuel and '+energy+' power remaining.' : 'Leg complete. Carry the remaining resources into the next decision.'};
      }
    };
  }

  const labs = [survey, propulsion, equipment, drift, rover, comms, power, expedition];
  window.mountLab = function mountLab(container, stageIndex, onSuccess) {
    const factory = labs[stageIndex];
    if (!factory) throw new RangeError('Unknown simulation stage');
    const lab = factory();
    const shell = document.createElement('section');
    shell.className = 'academy-lab';
    shell.innerHTML = '<h3>' + lab.title + '</h3><p>' + lab.intro + '</p><div class="lab-panel"></div><p class="lab-feedback" role="status"></p><button class="lab-submit" type="button">' + (lab.submit || 'Check configuration') + '</button>';
    container.replaceChildren(shell);
    const panel = shell.querySelector('.lab-panel'), feedback = shell.querySelector('.lab-feedback'), submit = shell.querySelector('.lab-submit');
    let done = false;
    const draw = () => { panel.innerHTML = lab.view(); };
    panel.addEventListener('click', e => {
      const item = e.target.closest('[data-action]');
      if (done || !item || !panel.contains(item)) return;
      feedback.textContent = lab.act(item.dataset.action) || '';
      draw();
      panel.querySelector('[data-action="'+item.dataset.action+'"]')?.focus({preventScroll:true});
    });
    // Keep the active range element alive during pointer drags and keyboard repeats.
    panel.addEventListener('input', e => {
      const input = e.target;
      if (done || !input.matches('[data-slider]')) return;
      lab.slide(input.dataset.slider, Number(input.value));
      const template = document.createElement('template');
      template.innerHTML = lab.view();
      const current = panel.querySelectorAll('output, .lab-reading b');
      template.content.querySelectorAll('output, .lab-reading b').forEach((node,i) => { current[i].textContent = node.textContent; });
      feedback.textContent = '';
    });
    submit.addEventListener('click', () => {
      if (done) return;
      const result = lab.check();
      feedback.textContent = result.msg;
      if (result.done) {
        done = true; panel.replaceChildren(); submit.disabled = true; submit.textContent = 'Simulation complete';
        if (typeof onSuccess === 'function') onSuccess();
      } else draw();
    });
    draw();
  };
})();
