# @chenjilabs/units

Measurement standards for every experiment: physical constants, unit conversions and number formatting. It is pure, with no page code, and depends on nothing, so it runs unchanged in Node tests.

## Exports

| Export | What it is |
| --- | --- |
| `R` | Molar gas constant, 8.314462618 J/(mol·K) |
| `ZERO_CELSIUS_IN_KELVIN`, `KPA_PER_ATM`, `M3_PER_LITRE` | 273.15 K, 101.325 kPa, 0.001 m³ |
| `celsiusToKelvin`, `kelvinToCelsius` | K = °C + 273.15 |
| `litresToCubicMetres`, `cubicMetresToLitres` | 1 L = 1 dm³ = 0.001 m³ |
| `kPaToAtm`, `atmToKPa` | 1 atm = 101.325 kPa |
| `formatSig(value, n)` | A number to n significant figures: `"101.3"`, `"0.00"`, `"1.23 × 10⁶"` |
| `formatScientific(c)` | Two significant figures, switching to `× 10ⁿ` below 0.001 (concentration labels) |
| `superscript(n)` | `-6` → `"⁻⁶"` |

## Example

```js
import { R, celsiusToKelvin, formatSig } from '@chenjilabs/units';

const T = celsiusToKelvin(25);           // 298.15 K
const P = (1.0 * R * T) / 0.0245;        // Pa, for 1 mol in 24.5 L
formatSig(P / 1000, 3);                  // "101" (kPa)
```
