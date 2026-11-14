# Outpost Intelligence Engine

All arithmetic uses invented classroom units. The engine has no real-time, network or random inputs. A sol is one commander decision shift on either world, with no fixed duration in hours. Real terrain data and sources are documented separately in the science validation.

## Turn resolution

1. Verify that the outpost is active, the option exists and supplies cover its costs. A rejected choice leaves state unchanged.
2. Apply the card's costs, deliveries, wear changes and temporary effects. Tank capacities limit deliveries.
3. Dispatch produced energy and dischargeable battery energy in priority order: habitat, water recovery, greenhouse, communications, laboratory. The adjustable reserve floor limits battery discharge. Paused and unbuilt optional facilities take no power. Surplus charges the battery.
4. Resolve oxygen, crew drinking water, greywater treatment, plants and meals. Compute the relative radiation index and cabin condition, collect observations and transmit eligible packets.
5. Add one wear, record consequences and test the stage objective and crew warning counter.

## Deterministic calculations

- Each shift consumes 3 oxygen and requires 3 drinking water and 2 food for a fictional crew of three. At 3 or more habitat power and with at least 1 water, life support uses 1 water to make min(4, life level + 2 + floor((habitat power - 3)/2)) oxygen. These points carry no chemical mass ratio.
- The greywater tank starts at 4 and holds 12. Actual crew drinking-water use feeds the tank. After treatment, a successful growing shift returns one captured plant-moisture unit for future use. Electrolysis water does not enter the tank. Treatment returns at most the stored greywater and at most min(4, processing power, 2 + recovery level - floor(wear/6)), adjusted by card effects and bounded to 0–4. A shortfall in drinking water before treatment triggers a crew warning.
- Generation is round((6 + 5 × solar level) × scenario illumination) - floor(wear/5) + event contribution, floored at zero. A fixed schedule sets lunar illumination between 0.45 and 1. The Mars classroom scenario applies a further factor of 0.78 and includes a dust veil. None of these values are solar observations. Battery capacity is 10 + 7 × battery level. A new battery arrives empty.
- Lettuce, radish and potato require 2, 3 and 4 successful shifts, respectively. A crop grows only when the greenhouse receives its listed power plus one per extra rack and consumes its listed water plus one per extra rack, and its listed nutrient. Its progress pauses during a shortfall. A harvest adds the listed yield plus two food per extra rack. A crop switch discards partial growth.
- The radiation-risk index is the card's hazard minus two per shelter level, minus two for protected posture, minus temporary event protection. Mars uses a fictional one-point-lower base hazard. The index is bounded from 0 to 9. Protected posture uses the best-shielded habitat corner or the dedicated shelter if built, and stops lab work. The index has no medical units.
- Healthy cabin support adds 1 condition (2 in an expanded habitat). A crew-support deficit subtracts 2; risk above 4 subtracts another 1. Cabin condition stays between 0 and 10. Laboratory gain is the smaller of installed level and delivered power. Transmitted packets are limited by communications level, delivered power, unsent observations and link availability.
- Wear climbs by one per shift to 12. Two materials repair up to five wear. Each of nine structures costs base cost + 2 × current level to construct or upgrade, with level 3 the maximum. Oxygen tank capacity is 18 + 3 × habitat level; water tank capacity is 22 + 3 × habitat level. Food, materials and nutrient stocks cap at 30, 60 and 40. Two emergency packs provide finite recovery supplies.

## Campaign and mission outcomes

Full Campaign has fifteen different briefings and three shifts per stage. Quick Mission samples five briefings, one at each checkpoint. A missed objective grants up to two contingency shifts, with separate recovery options. Any two consecutive critical shifts end the mission. A healthy shift resets the warning counter. Critical conditions are depleted oxygen, drinking water or food, inadequate crew water, cabin condition below 3, risk above 4, or habitat power below 3.

Final victory requires all prior checkpoints plus oxygen, water and food at least 3 each, battery at least 2, condition at least 3, risk at most 4, a harvest on record and no current critical conditions. Free Experiment keeps running after depletion and does not award a competitive result. Its detailed history keeps the latest 180 shifts while lifetime counters continue.

Run `node --test tests/frontier-engine.test.cjs` from the academy source directory to reproduce both planetary campaigns, failure/recovery, construction and deterministic save restoration.
