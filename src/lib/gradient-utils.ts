
/**
 * Utility to generate gradients reflecting Korean blue perception categories.
 * Korean speakers categorize a broader range as "blue" compared to English speakers,
 * including blue-green and blue-purple boundaries.
 */

// Korean blue perception categories
const KOREAN_BLUE_CATEGORIES = {
  // Core blue
  PURE_BLUE: { r: 0, g: 56, b: 168 },
  
  // Category 1: blue → cyan (blue + green boundary)
  BLUE_TO_CYAN_START: { r: 0, g: 56, b: 168 },
  BLUE_TO_CYAN_END: { r: 0, g: 139, b: 139 }, // teal/cyan
  
  // Category 2: blue → violet (blue + red boundary) 
  BLUE_TO_VIOLET_START: { r: 0, g: 56, b: 168 },
  BLUE_TO_VIOLET_END: { r: 138, g: 43, b: 226 }, // blue-violet
  
  // Category 3: blue → sky/navy (blue + white/black)
  BLUE_TO_SKY_START: { r: 0, g: 56, b: 168 },
  BLUE_TO_SKY_END: { r: 135, g: 206, b: 235 }, // sky blue
  BLUE_TO_NAVY_START: { r: 0, g: 56, b: 168 },
  BLUE_TO_NAVY_END: { r: 25, g: 25, b: 112 }, // navy
  
  // Traditional endpoints
  WHITE: { r: 255, g: 255, b: 255 }
};

// Converts RGB tuple to color object
function tupleToColor(arr: [number, number, number]) {
  return { r: arr[0], g: arr[1], b: arr[2] };
}

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
 * Korean blue perception category types
 */
export type KoreanBlueCategory = 'blue-cyan' | 'blue-violet' | 'blue-sky' | 'blue-navy' | 'traditional';

/**
 * Returns an array of finely-interpolated hex colors for the N blocks,
 * following Korean blue perception categories.
 */
export function getGradientColors(count: number, endpoint?: [number, number, number], category?: KoreanBlueCategory): string[] {
  let startColor, endColor;
  
  if (category) {
    switch (category) {
      case 'blue-cyan':
        startColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_CYAN_START;
        endColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_CYAN_END;
        break;
      case 'blue-violet':
        startColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_VIOLET_START;
        endColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_VIOLET_END;
        break;
      case 'blue-sky':
        startColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_SKY_START;
        endColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_SKY_END;
        break;
      case 'blue-navy':
        startColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_NAVY_START;
        endColor = KOREAN_BLUE_CATEGORIES.BLUE_TO_NAVY_END;
        break;
      default:
        startColor = KOREAN_BLUE_CATEGORIES.PURE_BLUE;
        endColor = endpoint ? tupleToColor(endpoint) : KOREAN_BLUE_CATEGORIES.WHITE;
    }
  } else {
    // Fallback to traditional behavior
    startColor = KOREAN_BLUE_CATEGORIES.PURE_BLUE;
    endColor = endpoint ? tupleToColor(endpoint) : KOREAN_BLUE_CATEGORIES.WHITE;
  }
  
  const out: string[] = [];
  for (let i = 0; i < count; ++i) {
    const t = count === 1 ? 0 : i / (count - 1);
    const interp = lerpColor(startColor, endColor, t);
    out.push(rgbToHex(interp));
  }
  return out;
}

/**
 * Get a random Korean blue category for trial generation
 */
export function getRandomKoreanBlueCategory(): KoreanBlueCategory {
  const categories: KoreanBlueCategory[] = ['blue-cyan', 'blue-violet', 'blue-sky', 'blue-navy'];
  return categories[Math.floor(Math.random() * categories.length)];
}

