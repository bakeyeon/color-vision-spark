
/**
 * Utility to generate a gradient between pure blue and white,
 * using finely interpolated steps in RGB space.
 *
 * The gradient is from blue (base) → white, avoiding any green/cyan.
 * All intermediate color stops are calculated between blue and white.
 */

const BLUE = { r: 0, g: 56, b: 168 }; // Deep "royal" blue base, matches earlier code.
const WHITE = { r: 255, g: 255, b: 255 };

// Helper to interpolate linearly between two colors in RGB
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
 * Returns an array of finely-interpolated hex colors for the N blocks,
 * strictly from blue to white.
 */
export function getGradientColors(count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; ++i) {
    const t = count === 1 ? 0 : i / (count - 1); // even steps from 0 to 1
    const interp = lerpColor(BLUE, WHITE, t);
    out.push(rgbToHex(interp));
  }
  return out;
}
