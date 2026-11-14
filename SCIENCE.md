# Lunar Frontier science validation

Reviewed 14 November 2026. This educational game is intended for ages 10–15. Real astronaut operations require validated hardware, qualified instructors, mission-specific models and procedures.

## Challenge alignment

The 2026 **Build a Junior Astronaut Mission Trainer** challenge asks students to run a lunar or Martian outpost where competing engineering demands can change the outcome. Lunar Frontier makes power, life support, radiation shielding and food share the same budget and decision cycle. [Official Space Apps brief](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)

## Reproducible open-data extract

The Terrain Profile experiment embeds 75 cells from an actual lunar elevation grid. David E. Smith and the NASA Goddard LRO LOLA team produced LDEM_4, product V3.0, from data acquired 13 July 2009 through 29 November 2016. NASA PDS Geosciences Node distributes it under PDS4 identifier **urn:nasa:pds:lro_lola_rdr:data_gridded:ldem_4::1.0**. [Product record](https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_4.xml) · [Encoding and projection](https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_4.lbl) · [Download the binary grid](https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_4.img)

Download the binary and run the following Python code beside it. The SHA-256 is the digest computed from the source file used in the app.

```python
from pathlib import Path
from hashlib import sha256
from struct import unpack_from

image = Path("ldem_4.img").read_bytes()
assert len(image) == 720 * 1440 * 2
assert sha256(image).hexdigest() == "c04632eba6449af49e3108ed7c25b3b1c450600abd3690df4fc815853a1af476"
for row in (360, 700, 19):
    values = unpack_from("<25h", image, row * 1440 * 2)
    for col, value in enumerate(values):
        print(90 - (row + 0.5) / 4, (col + 0.5) / 4, value, value / 2)
```

The output columns are latitude, east longitude, digital number and height in metres. Rows and columns are zero based. Cell centres span 0.125° E to 6.125° E in 0.25° steps at latitudes 0.125° S, 85.125° S and 85.125° N. A negative height lies inside the reference sphere of radius 1,737.4 km. Numerical encoding steps of 0.5 m give no guarantee of 0.5 m accuracy.

Each gridded cell spans roughly 7.58 km north to south. Boulders and dangerous local slopes require finer observations. Grid processing can introduce artefacts. The profiles have a common vertical scale, with relief exaggerated. The illustrative outpost map is independent of these measured transects.

## Science validation matrix

| Topic | Established science | Simplified model and scenario assumptions | Uncertainty and limits |
| --- | --- | --- | --- |
| Lunar gravity | Approximately 1.62 m/s², one sixth of Earth’s. A tool retains its mass when its weight changes. | Surface structures sit on fixed ground. Academy zero-G drills represent orbital free fall. | Local gravity and structural loads vary. |
| Solar energy | The Moon Fact Sheet lists 1,361 W/m² incident solar irradiance at roughly Earth's orbital distance. | Lab energy equals reference flux × 1 m² × cos(incidence angle) × assumed 22% efficiency × lit hours. Game illumination is scripted. | Local shadow, terrain, thermal losses, dust and orientation affect yield. The reference flux is an orbital baseline. Data from Earth’s surface are excluded. |
| Lunar day/night | Sunrise-to-sunrise averages 29.53 Earth days. Equatorial daylight and night each last about two Earth weeks. Polar ridges and floors have different horizons. | The lunar “sol” is one decision turn. The solar bench uses a separate six-hour shift. | Latitude, season and local terrain determine site illumination. |
| Temperature | NASA gives representative extremes around +127 °C in full sunlight and −173 °C in darkness. Diviner measures solar reflection and thermal emission. | Habitat power represents a thermal-control burden. The lab explains representative surface temperatures. | A cabin and its surrounding terrain have different temperatures. Individual locations vary and some polar shadows are colder. |
| Radiation | Earth's atmosphere and magnetic environment offer protection. Beyond Earth, solar energetic particles and galactic cosmic rays differ in penetration. Material, mass and placement matter. | Shelter construction changes a fictional event risk indicator. | Real dose requires particle energy, geometry, materials and time. Secondary particles complicate protection. The score has no medical dose units or safety meaning. |
| Water and ice | Multiple missions found lunar hydration and polar ice. | The game assigns starting water and recovery opportunities to the fictional outpost. | Presence alone cannot establish extractable yield, purity, depth or energy cost. |
| Oxygen and recycling | ISS ECLSS reclaims and purifies wastewater. Electrolysis uses electricity to split water into oxygen and hydrogen. Air revitalization removes carbon dioxide. | In the lab a 12 L shift returns use × collected fraction × recovery fraction. Storage and processor rates in a mission are classroom budgets. | Actual efficiency, air quality and water purity depend on hardware and monitoring. |
| Plants | Light, water, nutrients, gas exchange and suitable temperatures support crops. ISS Veggie provides supplemental produce. | The game compresses growth and assigns fictional crop yields, water use and lighting loads. | Species, disease and environmental conditions affect actual harvest and nutrition. |
| Energy storage | A solar-only base needs stored energy or an alternative source during darkness. | The bench starts with an empty battery, stores 90% of surplus to capacity and discharges ideally. Its constant 100 W load consumes 600 Wh over six hours. Daylight comes first. | Charge-rate limits, ageing and thermal management are omitted. Watts measure power and watt-hours measure energy. |
| Communication | Signals travel at light speed. A mean distance of 384,400 km gives about 1.28 s one way to the Moon. Terrain can block direct links. Mars introduces delays of minutes. | Communications compete for electricity. Players make decisions locally. | Geometry, relays, outages, bitrate and processing introduce additional limits. |
| Mars | A Martian solar day lasts about 24 h 40 min. Mars has a thin atmosphere and dust storms. | The expansion uses fictional environmental modifiers and a turn clock. | Orbital distance, weather, dust and equipment condition affect generation. |

## Source and usage register

“Educational reference” below means an original summary of facts and a direct link. NASA requests credit, reserves its marks and restricts implied endorsement. Third-party content can carry separate rights. Our diagrams are original. [NASA use guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)

| Resource and publisher | What it contributes and how the app uses it | Limitations and usage |
| --- | --- | --- |
| [2026 challenge](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/) · NASA International Space Apps Challenge | Sets the four engineering systems and need for consequential choices. | Educational reference. The game presents a team entry and offers virtual game achievements. |
| [LDEM_4](https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_4.xml) · NASA Goddard LOLA team / NASA PDS | Supplies all 75 real elevation values used by the profile viewer. | Coarse, derived grid. Preserve attribution, product identifier, units and version when reusing the extract. Follow [PDS citation guidance](https://pds.nasa.gov/datastandards/citing/). |
| [Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html) · NASA Goddard | Solar irradiance input, surface gravity and synodic period. | Bulk reference values. Educational reference. |
| [Moon Facts](https://science.nasa.gov/moon/facts/) · NASA Science | Temperature examples and evidence of water support habitat and recycling instruction. | Temperature and water evidence depend on location. Educational reference. |
| [Radioisotope Power Systems to Enable Extended Lunar Science and In-Situ Resource Utilization Missions](https://ntrs.nasa.gov/citations/20180004489) · NASA Technical Reports Server | Polar illumination challenges motivate the solar-storage experiment. | Technology study. Link and original summary only. |
| [Diviner archive](https://pds-geosciences.wustl.edu/missions/lro/diviner.htm) · UCLA Diviner team / NASA PDS Geosciences Node | Identifies measured, derived and modelled lunar thermal products in the field guide. | No Diviner pixels are bundled. Check product quality notes, labels and PDS citation guidance for reuse. |
| [LROC QuickMap](https://quickmap.lroc.asu.edu/) · Lunar Reconnaissance Orbiter Camera team and QuickMap service | Gives learners a route to compare bright rims and dark crater floors. | A single scene cannot establish permanent shadow. Link only. Layers and imagery retain their respective credits. |
| [Moon Trek](https://trek.nasa.gov/moon/) · NASA | Lets learners compare lunar map layers beyond the lab transects. | Resolution varies by layer. Link only. Check each layer’s attribution. |
| [Environmental Control and Life Support Systems](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/) · NASA | Grounds the water-loop experiment and oxygen-generation explanation in ISS engineering. | Hardware-specific operations. Educational reference. |
| [Radiation Analysis and Shielding Design](https://ddtrb.larc.nasa.gov/radiation/) · NASA Langley | Grounds the crew-shelter explanation in particle type and shielding material. | Qualitative use. Educational reference. |
| [Artemis II solar monitoring](https://science.nasa.gov/missions/artemis/artemis-2/to-protect-artemis-ii-astronauts-nasa-experts-keep-eyes-on-sun/) · NASA Science | Provides an example of sheltering during a solar particle event. | Mission-specific procedures. Educational reference. |
| [Growing Plants in Space](https://www.nasa.gov/exploration-research-and-technology/growing-plants-in-space/) · NASA | Supports greenhouse lessons on lighting, medium, water and nutrients. | ISS supplemental crops. Mission yields are fictional. Educational reference. |
| [Compare Earth and the Moon](https://science.nasa.gov/moon/by-the-numbers/) · NASA Science / JPL Solar System Dynamics | Mean distance for the communication light-time calculation. | Actual distance varies. Educational reference. |
| [Space Communications](https://www.nasa.gov/missions/tech-demonstration/space-communications-7-things-you-need-to-know/) · NASA | Explains relays and signal travel time. | Link delay depends on geometry and technology. Educational reference. |
| [Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html) · NASA Goddard | Day length and atmospheric context for the expansion. | Reference values cannot predict a site's weather. Educational reference. |

## Repeatable experiment checks

- Equatorial sample 1 reads −721.5 m. Northern sample 1 reads −1,362.5 m.
- At 0% sunlight the bench shows a 600 Wh shortfall, regardless of capacity. A panel edge-on to the beam at 90° also produces zero.
- At 50% sunlight, 0° incidence and 0 Wh capacity, the night load falls short by 300 Wh. A 400 Wh battery at the same settings covers the full load.
- Collecting 75% and recovering 80% of 12 L returns 7.2 L. The tank needs 4.8 L of replacement. Ideal collection and recovery of 100% each returns all 12 L.

The decorative lunar globe in the interface uses a color-graded rendering of the [NASA Scientific Visualization Studio CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), with the LRO/LROC color map. The lighting, colors and stars are artistic choices.
