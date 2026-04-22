/*
 * Core internal utilities for color manipulation.
 *
 * This module provides fundamental functions to process color values.
 */

// Helper: Converts a collection of color components into a formatted output.
// The `colorComponents` argument is an array of numerical values.
// The `outputFormat` argument specifies the desired output structure (e.g., 'rgb', 'hsv', 'hsl').
function formatColorValue(colorComponents, outputFormat) {
 var resultValue;
 // Determine the action based on the requested output format.
  switch (outputFormat) {
    case 'hex':
      // If hexadecimal output is requested, convert RGB components.
      var colorRgb = formatColorValue(colorComponents, 'rgb');
      resultValue = convertRgbToHex.apply(this, colorRgb);
      break;
    default:
      // For other formats (RGB, HSV, HSL), construct an object.
      resultValue = {};
      var componentLabels;
      // Ensure the input is a valid object or array.
      if (typeof colorComponents !== "object") {
        return;
      }
      // Assign appropriate labels based on the color model.
      if (outputFormat === "rgb") {
        componentLabels = ["Red", "Green", "Blue", "RgbString"];
      }
      if (outputFormat === "hsv") {
        componentLabels = ["Hue", "Saturation", "Value", "HsvString"];
      }
      if (outputFormat === "hsl") {
        componentLabels = ["Hue", "Saturation", "Lightness", "HslString"];
      }
      // Populate the result object with individual components and a combined string.
      resultValue[componentLabels[0]] = colorComponents[0];
      resultValue[componentLabels[1]] = colorComponents[1];
      resultValue[componentLabels[2]] = colorComponents[2];
      resultValue[componentLabels[3]] = colorComponents[0] + " " + colorComponents[1] + " " + colorComponents[2];
      // Store all components under a generic key.
      resultValue.allComponents = colorComponents;
      break;
  }

  return resultValue;
};


// Helper: Ensures a number is represented as a two-digit hexadecimal string.
// `decimalInput` is the integer value to convert.
function ensureTwoDigitHex(decimalInput) {
  // Convert to hex, padding with a leading '0' if less than 10 (decimal).
  var hexString = ((decimalInput < 0xA) ? "0" : "") + decimalInput.toString(0x10);
  // If the resulting hex string is still only one digit, prepend another '0'.
  return (hexString.length === 1) ? "0" + hexString : hexString;
};


/*
 * Color conversion functions.
 * These methods handle transformations between different color representations.
 */

// Converts individual RGB integer values into a hexadecimal color string.
// Can accept three separate integers (red, green, blue) or a single integer if all are the same.
function convertRgbToHex(redVal, greenVal, blueVal) {
  // Ensure each component is a two-digit hex string.
  redVal = ensureTwoDigitHex(redVal);
  greenVal = (greenVal !== void 0) ? ensureTwoDigitHex(greenVal) : redVal;
  blueVal = (blueVal !== void 0) ? ensureTwoDigitHex(blueVal) : redVal;
  // Concatenate with a '#' prefix to form the final hex code.
  return "#" + redVal + greenVal + blueVal;
};


// Transforms a hexadecimal color string into an RGB color object.
// `hexColorCode` is the hexadecimal string (e.g., "#FF0000" or "FF0000").
function convertHexToRgb(hexColorCode) {
  // Remove any leading hash symbol.
  hexColorCode = hexColorCode.replace("#", "");
  // If it's a full 6-digit hex code, parse into R, G, B components.
  if (hexColorCode.length === 6) {
    return formatColorValue([Number.parseInt(hexColorCode.substring(0, 2), 0x10), Number.parseInt(hexColorCode.substring(2, 4), 0x10), Number.parseInt(hexColorCode.substring(4, 6), 0x10)], "rgb");
  } else {
    // Otherwise, assume it's a single component or a short hex and parse it directly.
    return Number.parseInt(hexColorCode, 0x10);
  }
};

// Retrieves the hexadecimal representation of a standard HTML color name.
// `colorNameInput` is a string containing the name of the color.
function resolveNamedColor(colorNameInput) {
  // Convert input name to lowercase for case-insensitive matching.
  colorNameInput = colorNameInput.toLowerCase();
  // A mapping of HTML color names to their corresponding hex values.
  var namedColorMap = {
      "aliceblue": "#f0f8ff",
      "antiquewhite": "#faebd7",
      "aqua": "#00ffff",
      "aquamarine": "#7fffd4",
      "azure": "#f0ffff",
      "beige": "#f5f5dc",
      "bisque": "#ffe4c4",
      "black": "#000000",
      "blanchedalmond": "#ffebcd",
      "blue": "#0000ff",
      "blueviolet": "#8a2be2",
      "brown": "#a52a2a",
      "burlywood": "#deb887",
      "cadetblue": "#5f9ea0",
      "chartreuse": "#7fff00",
      "chocolate": "#d2691e",
      "coral": "#ff7f50",
      "cornflowerblue": "#6495ed",
      "cornsilk": "#fff8dc",
      "crimson": "#dc143c",
      "cyan": "#00ffff",
      "darkblue": "#00008b",
      "darkcyan": "#008b8b",
      "darkgoldenrod": "#b8860b",
      "darkgray": "#a9a9a9",
      "darkgrey": "#a9a9a9",
      "darkgreen": "#006400",
      "darkkhaki": "#bdb76b",
      "darkmagenta": "#8b008b",
      "darkolivegreen": "#556b2f",
      "darkorange": "#ff8c00",
      "darkorchid": "#9932cc",
      "darkred": "#8b0000",
      "darksalmon": "#e9967a",
      "darkseagreen": "#8fbc8f",
      "darkslateblue": "#483d8b",
      "darkslategray": "#2f4f4f",
      "darkslategrey": "#2f4f4f",
      "darkturquoise": "#00ced1",
      "darkviolet": "#9400d3",
      "deeppink": "#ff1493",
      "deepskyblue": "#00bfff",
      "dimgray": "#696969",
      "dimgrey": "#696969",
      "dodgerblue": "#1e90ff",
      "firebrick": "#b22222",
      "floralwhite": "#fffaf0",
      "forestgreen": "#228b22",
      "fuchsia": "#ff00ff",
      "gainsboro": "#dcdcdc",
      "ghostwhite": "#f8f8ff",
      "gold": "#ffd700",
      "goldenrod": "#daa520",
      "gray": "#808080",
      "grey": "#808080",
      "green": "#008000",
      "greenyellow": "#adff2f",
      "honeydew": "#f0fff0",
      "hotpink": "#ff69b4",
      "indianred": "#cd5c5c",
      "indigo": "#4b0082",
      "ivory": "#fffff0",
      "khaki": "#f0e68c",
      "lavender": "#e6e6fa",
      "lavenderblush": "#fff0f5",
      "lawngreen": "#7cfc00",
      "lemonchiffon": "#fffacd",
      "lightblue": "#add8e6",
      "lightcoral": "#f08080",
      "lightcyan": "#e0ffff",
      "lightgoldenrodyellow": "#fafad2",
      "lightgray": "#d3d3d3",
      "lightgrey": "#d3d3d3",
      "lightgreen": "#90ee90",
      "lightpink": "#ffb6c1",
      "lightsalmon": "#ffa07a",
      "lightseagreen": "#20b2aa",
      "lightskyblue": "#87cefa",
      "lightslategray": "#778899",
      "lightslategrey": "#778899",
      "lightsteelblue": "#b0c4de",
      "lightyellow": "#ffffe0",
      "lime": "#00ff00",
      "limegreen": "#32cd32",
      "linen": "#faf0e6",
      "magenta": "#ff00ff",
      "maroon": "#800000",
      "mediumaquamarine": "#66cdaa",
      "mediumblue": "#0000cd",
      "mediumorchid": "#ba55d3",
      "mediumpurple": "#9370d8",
      "mediumseagreen": "#3cb371",
      "mediumslateblue": "#7b68ee",
      "mediumspringgreen": "#00fa9a",
      "mediumturquoise": "#48d1cc",
      "mediumvioletred": "#c71585",
      "midnightblue": "#191970",
      "mintcream": "#f5fffa",
      "mistyrose": "#ffe4e1",
      "moccasin": "#ffe4b5",
      "navajowhite": "#ffdead",
      "navy": "#000080",
      "oldlace": "#fdf5e6",
      "olive": "#808000",
      "olivedrab": "#6b8e23",
      "orange": "#ffa500",
      "orangered": "#ff4500",
      "orchid": "#da70d6",
      "palegoldenrod": "#eee8aa",
      "palegreen": "#98fb98",
      "paleturquoise": "#afeeee",
      "palevioletred": "#d87093",
      "papayawhip": "#ffefd5",
      "peachpuff": "#ffdab9",
      "peru": "#cd853f",
      "pink": "#ffc0cb",
      "plum": "#dda0dd",
      "powderblue": "#b0e0e6",
      "purple": "#800080",
      "red": "#ff0000",
      "rosybrown": "#bc8f8f",
      "royalblue": "#4169e1",
      "saddlebrown": "#8b4513",
      "salmon": "#fa8072",
      "sandybrown": "#f4a460",
      "seagreen": "#2e8b57",
      "seashell": "#fff5ee",
      "sienna": "#a0522d",
      "silver": "#c0c0c0",
      "skyblue": "#87ceeb",
      "slateblue": "#6a5acd",
      "slategray": "#708090",
      "slategrey": "#708090",
      "snow": "#fffafa",
      "springgreen": "#00ff7f",
      "steelblue": "#4682b4",
      "tan": "#d2b48c",
      "teal": "#008080",
      "thistle": "#d8bfd8",
      "tomato": "#ff6347",
      "turquoise": "#40e0d0",
      "violet": "#ee82ee",
      "wheat": "#f5deb3",
      "white": "#ffffff",
      "whitesmoke": "#f5f5f5",
      "yellow": "#ffff00",
      "yellowgreen": "#9acd32"
    },
    hexRepresentation = namedColorMap[colorNameInput];
  // If the color name is not found, log an error and return black.
  if (hexRepresentation === void 0) {
    console.log('Unknown color identifier encountered: ' + colorNameInput);
    return "#000000";
  }

  return hexRepresentation;
};

// Main export: A function to compute the complementary color.
// It can accept a hex string, an HTML color name, or individual RGB components/array.
module.exports = function (firstComponent, secondComponent, thirdComponent) {
  var complementaryValues, finalOutput, detectedInputType;

  // Handle named colors if only a string is provided without a hash.
  if (typeof firstComponent === "string" && secondComponent === void 0 && thirdComponent === void 0 && firstComponent.indexOf('#') === -1) {
    firstComponent = resolveNamedColor(firstComponent);
  }

  // Process hexadecimal input.
  if (typeof firstComponent === "string" && (/#?([A-Fa-f0-9]{3}){1,2}/i).test(firstComponent)) {
    detectedInputType = 'hexadecimal';

    firstComponent = firstComponent.replace("#", "");
    finalOutput = "#";
    // For 6-digit hex codes.
    if (firstComponent.length === 6) {
      finalOutput += ensureTwoDigitHex(0xFF - convertHexToRgb(firstComponent.substring(0, 2)));
      finalOutput += ensureTwoDigitHex(0xFF - convertHexToRgb(firstComponent.substring(2, 4)));
      finalOutput += ensureTwoDigitHex(0xFF - convertHexToRgb(firstComponent.substring(4, 6)));
    }
    // For 3-digit shorthand hex codes.
    if (firstComponent.length === 3) {
      finalOutput += ensureTwoDigitHex(0xFF - convertHexToRgb(firstComponent.substring(0, 1) + firstComponent.substring(0, 1)));
      finalOutput += ensureTwoDigitHex(0xFF - convertHexToRgb(firstComponent.substring(1, 2) + firstComponent.substring(1, 2)));
      finalOutput += ensureTwoDigitHex(0xFF - convertHexToRgb(firstComponent.substring(2, 3) + firstComponent.substring(2, 3)));
    }
    return finalOutput;
  }
  // Process RGB input (individual components or an array).
  else {
    detectedInputType = 'redGreenBlue';

    // If separate R, G, B values are provided.
    if (firstComponent !== void 0 && secondComponent !== void 0 && thirdComponent !== void 0) {
      complementaryValues = [(0xFF - firstComponent), (0xFF - secondComponent), (0xFF - thirdComponent)];
    }
    // If an object (array) containing RGB values is provided.
    if (typeof firstComponent === "object") {
      complementaryValues = [(0xFF - firstComponent[0]), (0xFF - firstComponent[1]), (0xFF - firstComponent[2])];
    }
    // Format the complementary RGB values.
    return formatColorValue(complementaryValues, detectedInputType);
  }
};