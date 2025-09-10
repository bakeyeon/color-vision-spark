// Korean blue perception categories
export type KoreanBlueCategory = 
  | "blue-cyan" 
  | "blue-violet" 
  | "blue-sky" 
  | "blue-navy" 
  | "blue-white";

// Get a random Korean blue category
export function getRandomKoreanBlueCategory(): KoreanBlueCategory {
  const categories: KoreanBlueCategory[] = [
    "blue-cyan",
    "blue-violet", 
    "blue-sky",
    "blue-navy",
    "blue-white"
  ];
  return categories[Math.floor(Math.random() * categories.length)];
}

// RGB to hex converter
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Interpolate between two RGB colors
function interpolateRGB(
  start: [number, number, number], 
  end: [number, number, number], 
  factor: number
): [number, number, number] {
  return [
    start[0] + (end[0] - start[0]) * factor,
    start[1] + (end[1] - start[1]) * factor,
    start[2] + (end[2] - start[2]) * factor
  ];
}

// Generate colors for the gradient based on category
export function getGradientColors(
  numBlocks: number,
  colorEnd?: [number, number, number],
  category?: KoreanBlueCategory
): string[] {
  // Default base blue
  const BASE_BLUE: [number, number, number] = [0, 56, 168];
  
  let endColor: [number, number, number];

  if (colorEnd) {
    endColor = colorEnd;
  } else {
    // Determine end color based on category
    switch (category) {
      case "blue-cyan":
        endColor = [0, 255, 255]; // Cyan
        break;
      case "blue-violet":
        endColor = [138, 43, 226]; // Blue violet
        break;
      case "blue-sky":
        endColor = [135, 206, 235]; // Sky blue
        break;
      case "blue-navy":
        endColor = [0, 0, 128]; // Navy
        break;
      case "blue-white":
      default:
        endColor = [255, 255, 255]; // White
        break;
    }
  }

  // Generate gradient colors
  const colors: string[] = [];
  for (let i = 0; i < numBlocks; i++) {
    const factor = i / (numBlocks - 1);
    const [r, g, b] = interpolateRGB(BASE_BLUE, endColor, factor);
    colors.push(rgbToHex(r, g, b));
  }

  return colors;
}
