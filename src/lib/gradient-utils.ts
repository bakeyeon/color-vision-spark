
/**
 * Utility to generate a gradient between specific color stops (white → light blue → dark blue → cyan → green)
 * using interpolation in the LCH color space, which keeps perceptual color transitions smooth.
 * Color stops are hard-coded to avoid unwanted hues.
 * If desired, a more precise interpolation (with oklab/lab) can be used with a color manipulation lib.
 */

const GRADIENT_STOPS = [
  { r: 255, g: 255, b: 255 },    // White
  { r: 173, g: 216, b: 230 },    // Light Blue (sky blue)
  { r: 0, g: 56,  b: 168 },      // Dark Blue
  { r: 0, g: 255, b: 255 },      // Cyan
  { r: 0, g: 143, b: 57 },       // Green (Blue-green)
];

// Helper to interpolate linearly between two colors
function lerpColor(a, b, t: number) {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

// Converts RGB to hex
function rgbToHex(c: { r: number; g: number; b: number }) {
  return (
    "#" +
    [c.r, c.g, c.b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

/**
 * Returns an array of hex colors for the N blocks, across strict color stops.
 * @param count Number of blocks
 * @param transitions Array of normalized floats (0-1), for where to make high-contrast jumps
 */
export function getGradientColors(count: number): string[] {
  const stops = GRADIENT_STOPS;
  const nStops = stops.length;
  const out: string[] = [];

  for (let i = 0; i < count; ++i) {
    const t = i / (count - 1);
    // Position in multi-stop segment
    const segLen = 1 / (nStops - 1);
    const seg = Math.min(Math.floor(t / segLen), nStops - 2);
    const segT = (t - seg * segLen) / segLen;
    const interp = lerpColor(stops[seg], stops[seg + 1], segT);
    out.push(rgbToHex(interp));
  }
  return out;
}
