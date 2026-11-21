# @chenjilabs/particles

A 2D canvas particle box: the "particle-level view" in the [lab model](../../docs/roadmap.md#the-lab-model). Explorers use it to show what a gas is doing while a science model computes the numbers. **The drawing is illustrative.** Pressure and every other value shown to learners must come from the experiment's science model, never from counting collisions here.

- Particles bounce elastically off the walls. They do not collide with each other.
- Speed scales with √T. Box width scales with V; the space beyond the moving wall is shaded.
- A fixed timestep (1/60 s) makes the motion independent of the frame rate.
- It starts paused if the learner prefers reduced motion, and stops while the tab is hidden, to save battery.
- The canvas gets `role="img"` and an `aria-label` from your `describe` function, updated at most once per second.

## Exports

| Export | What it is |
| --- | --- |
| `createParticleBox(canvas, options)` | Starts the box; returns `{ update({ temperature, volume, count }), pause(), play(), paused, destroy() }` |
| `speedFor`, `widthFor`, `createState`, `step`, `advance`, `setTemperature`, `setWidth`, `setCount`, `rmsSpeed`, `throttle` | The pure simulation (also at `@chenjilabs/particles/sim`), tested in Node |

## Example

```html
<canvas id="box" width="600" height="300"></canvas>
<button type="button" id="pause" aria-pressed="false">Pause</button>
```

```js
import { createParticleBox } from '@chenjilabs/particles';

const box = createParticleBox(document.getElementById('box'), {
  temperature: 300, volume: 25, maxVolume: 50, count: 40,
  describe: ({ temperature, volume }) => `Gas particles at ${temperature} K in ${volume} L`,
  pauseButton: document.getElementById('pause'),
});
box.update({ temperature: 600 }); // speeds rise by √2
```
