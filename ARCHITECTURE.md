# TRAJECTORY.EXE · Architecture and challenge alignment

The existing browser application has no backend or build dependency. Its curriculum, practical labs, career progression and local cadet record remain available at academy.html. GitHub Pages serves relative assets and links from the project subdirectory.

| Requirement | Implementation boundary | Acceptance check |
| --- | --- | --- |
| Direct judge entry | index.html opens Lunar Frontier in Quick Mission | A fresh browser can issue a command without registration |
| Interdependent systems | frontier-engine.js owns the deterministic sol transition, costs, wear, crop growth, crew limits, events and outcomes | Compare depleted, repaired and successful runs |
| Playable surface | frontier-map.js renders selectable installations from the engine state | Selection opens the associated construction and operations panel |
| Mission control | frontier-ui.js owns modes, resource allocation, previews, the notebook, ORBIT guidance and reports | All displayed balances originate in a saved run or a labeled forecast |
| Five-stage expedition | Campaign milestones, fifteen choices and individual stage debriefs | Test each milestone and final readiness checks |
| Exploration | Moon and Mars configurations, sandbox, science laboratory, academy and zero-G practice | Each is reachable without finishing the career tree |
| Scientific basis | Science lab, linked NASA source register and validation notes | Distinguish established facts, scenario inputs, models and uncertainties |
| Reliability | Versioned independent outpost saves and existing academy storage; local fonts, art and scripts | Reload after construction and mid-mission; preserve the original profile |
| Publication | Existing free GitHub Pages URL | Anonymous browser loads the deployed app and advances a sol |

Official brief: https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/
