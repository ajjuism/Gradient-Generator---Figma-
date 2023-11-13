figma.showUI(__html__, { width: 350, height: 440 });

// Function to calculate the complementary color
function getComplementaryColor(hex: string): string {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = 255 - r;
    g = 255 - g;
    b = 255 - b;

    return "#" + toHexString(r) + toHexString(g) + toHexString(b);
}

// Function to generate a random color
function getRandomColor(): string {
    const random = Math.floor(Math.random() * 16777215);
    return "#" + toHexString(random >> 16) + toHexString((random >> 8) & 255) + toHexString(random & 255);
}

// Convert a number to a two-character hexadecimal string
function toHexString(num: number): string {
    const hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

// Convert hex color to RGBA format for Figma
function hexToRgbA(hex: string): RGBA {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b, a: 1 }; // Include alpha value
}

// Function to lighten a color
function lightenColor(color: RGBA, amount: number): RGBA {
  return {
      r: Math.min(1, color.r + amount),
      g: Math.min(1, color.g + amount),
      b: Math.min(1, color.b + amount),
      a: 1
  };
}

// Function to mix two colors and find a middle color
function mixColors(color1: RGBA, color2: RGBA): RGBA {
  // Adjusting the function to return RGBA instead of RGB
  return {
      r: (color1.r + color2.r) / 2,
      g: (color1.g + color2.g) / 2,
      b: (color1.b + color2.b) / 2,
      a: 1 // Ensure alpha is set to 1
  };
}

// Check if the selected node is a shape or a vector
function isShapeOrVector(node: SceneNode): boolean {
    return ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'FRAME', 'GROUP'].includes(node.type);
}

// Apply gradient to the selected shape
function applyGradientToSelection(primaryColor: string, complementaryColor: string): void {
  const selection = figma.currentPage.selection[0] as GeometryMixin;

  const primaryRgb = hexToRgbA(primaryColor);
  const complementaryRgb = hexToRgbA(complementaryColor);
  
  // Use lightenColor to adjust the primary color for the middle color
  const middleColor = lightenColor(primaryRgb, 0.2); // Adjust the amount to change the lightening effect

  const gradient: Paint = {
      type: 'GRADIENT_LINEAR',
      gradientStops: [
          { color: primaryRgb, position: 0 },
          { color: middleColor, position: 0.5 },  // Updated middle color
          { color: complementaryRgb, position: 1 }
      ],
      gradientTransform: [[0, 1, 0], [-1, 0, 1]]
  };

  selection.fills = [gradient];
}


// Listening for messages from the UI
figma.ui.onmessage = msg => {
    if (msg.type === 'select-color' || msg.type === 'randomise') {
        const primaryColor = msg.type === 'select-color' ? msg.color : getRandomColor();
        const complementaryColor = getComplementaryColor(primaryColor);

        // Send the gradient data back to the UI
        figma.ui.postMessage({
            type: 'update-gradient',
            gradient: `linear-gradient(to right, ${primaryColor}, ${complementaryColor})`
        });

        // Check if there is a selection and if it's a shape or vector
        if (figma.currentPage.selection.length > 0 && isShapeOrVector(figma.currentPage.selection[0])) {
            applyGradientToSelection(primaryColor, complementaryColor);
        } else {
            figma.notify("Please select a shape, vector, frame, or group to apply the gradient");
        }
    }
};
