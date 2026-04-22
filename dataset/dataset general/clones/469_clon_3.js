/**
 * @file Color Transformation Module
 * @author CloneBot
 * @description This module provides a set of utilities for handling various color formats,
 *              including conversions and calculations for complementary colors.
 */

// Core Internal Utilities
// These functions are fundamental building blocks for color manipulation within this module.

/**
 * @typedef {object} StructuredColorData
 * @property {number} Red | Hue - The first component of the color.
 * @property {number} Green | Saturation - The second component of the color.
 * @property {number} Blue | Value | Lightness - The third component of the color.
 * @property {string} RGBString | HSVString | HSLString - A space-separated string representation of the components.
 * @property {Array<number>} sourceInput - The original array of numeric values used to create this object.
 */

/**
 * Generates a structured color data object from an array of numeric components
 * based on a specified color model. It handles RGB, HSV, and HSL models,
 * and can delegate to hex conversion for the 'hex' model.
 *
 * @param {Array<number>} componentValues - An array containing at least three numeric color components.
 * @param {string} colorModel - The type of color model ('rgb', 'hsv', 'hsl', 'hex').
 * @returns {StructuredColorData|string|undefined} A structured color object, a hex string if 'hex' model,
 *                                                 or undefined if input is invalid or model unsupported.
 */
function composeColorData(componentValues, colorModel) {
    // Validate the incoming array of component values early.
    if (!Array.isArray(componentValues) || componentValues.length < 3 || componentValues.some(isNaN)) {
        console.warn("composeColorData: Input 'componentValues' must be an array of at least three numbers.");
        return;
    }

    const outputContainer = {}; // Using 'let' for mutation, 'const' for static data structures.
    let componentTextLabels; // Will hold the descriptive names for color components.

    // Map color models to their respective component labels.
    const modelLabelMap = {
        'rgb': ['Red', 'Green', 'Blue', 'RGBString'],
        'hsv': ['Hue', 'Saturation', 'Value', 'HSVString'],
        'hsl': ['Hue', 'Saturation', 'Lightness', 'HSLString']
    };

    // If the requested model is 'hex', we delegate to a specific conversion function.
    if (colorModel === 'hex') {
        // Assume componentValues are R, G, B for hex conversion.
        return convertRgbToHex(componentValues[0], componentValues[1], componentValues[2]);
    }

    // Retrieve labels based on the normalized color model.
    componentTextLabels = modelLabelMap[colorModel.toLowerCase()];

    // If the color model is not recognized, log a warning and exit.
    if (!componentTextLabels) {
        console.warn(`composeColorData: Unsupported color model type "${colorModel}" provided.`);
        return;
    }

    // Populate the output object with individual components and a combined string.
    outputContainer[componentTextLabels[0]] = componentValues[0];
    outputContainer[componentTextLabels[1]] = componentValues[1];
    outputContainer[componentTextLabels[2]] = componentValues[2];
    outputContainer[componentTextLabels[3]] = `${componentValues[0]} ${componentValues[1]} ${componentValues[2]}`;

    // Store the original input for traceability.
    outputContainer.sourceInput = componentValues;

    return outputContainer;
}

/**
 * Formats a given decimal integer (typically 0-255) into a two-character hexadecimal string.
 * It pads single-digit hex values with a leading zero (e.g., 10 -> "0a", 255 -> "ff").
 *
 * @param {number} decimalInput - The integer value to convert.
 * @returns {string} A two-character hexadecimal string.
 */
const formatHexComponent = (decimalInput) => {
    // Clamping the value ensures it stays within a valid 0-255 range,
    // preventing unexpected hex conversions for out-of-bounds numbers.
    const constrainedValue = Math.max(0, Math.min(255, decimalInput));
    return constrainedValue.toString(16).padStart(2, '0');
};


// Color Conversion Functions
// These functions facilitate transformations between different color representations.

/**
 * Converts up to three RGB integer components into a single hexadecimal color string.
 * If only the red component is provided, it's used for all three (R, G, B).
 *
 * @param {number} redChannel - The Red component (0-255).
 * @param {number} [greenChannel] - The Green component (0-255). Defaults to `redChannel`.
 * @param {number} [blueChannel] - The Blue component (0-255). Defaults to `redChannel`.
 * @returns {string} A hexadecimal color string (e.g., "#RRGGBB").
 */
const convertRgbToHex = (redChannel, greenChannel, blueChannel) => {
    const rHex = formatHexComponent(redChannel);
    // Use nullish coalescing or explicit undefined check for default values.
    const gHex = (greenChannel === undefined) ? rHex : formatHexComponent(greenChannel);
    const bHex = (blueChannel === undefined) ? rHex : formatHexComponent(blueChannel);

    return `#${rHex}${gHex}${bHex}`;
};


/**
 * Parses a hexadecimal color string into either a structured RGB object (for 3 or 6 digits)
 * or a single integer (for 1 or 2 digits).
 *
 * @param {string} hexString - The hexadecimal color string (e.g., "#F0F8FF", "FFF", "FF").
 * @returns {StructuredColorData|number|undefined} An object with RGB components, a single numeric value,
 *                                                 or undefined if the input is malformed or unsupported.
 */
function parseHexToRgb(hexString) {
    // Basic validation for string type and content.
    if (typeof hexString !== 'string' || hexString.trim() === '') {
        console.warn("parseHexToRgb: Input must be a non-empty string.");
        return;
    }

    // Remove any leading hash character.
    const cleanHex = hexString.startsWith('#') ? hexString.substring(1) : hexString;

    // Internal helper for parsing hex segments to integers.
    const parseHexSegment = (segment) => parseInt(segment, 16);

    switch (cleanHex.length) {
        case 6: // Full RRGGBB format
            const r6 = parseHexSegment(cleanHex.substring(0, 2));
            const g6 = parseHexSegment(cleanHex.substring(2, 4));
            const b6 = parseHexSegment(cleanHex.substring(4, 6));
            return composeColorData([r6, g6, b6], 'rgb');
        case 3: // Shorthand RGB format (e.g., "F3C" -> "FF33CC")
            const r3 = parseHexSegment(cleanHex[0] + cleanHex[0]);
            const g3 = parseHexSegment(cleanHex[1] + cleanHex[1]);
            const b3 = parseHexSegment(cleanHex[2] + cleanHex[2]);
            return composeColorData([r3, g3, b3], 'rgb');
        case 1:
        case 2: // Single component hex (e.g., "F" or "FF")
            return parseHexSegment(cleanHex);
        default:
            console.warn(`parseHexToRgb: Unsupported hexadecimal string length: ${hexString}.`);
            return;
    }
}

/**
 * Resolves a common HTML color name (case-insensitive) to its corresponding hexadecimal value.
 * Uses a comprehensive internal map of standard HTML color names.
 *
 * @param {string} descriptiveColorName - The name of the HTML color (e.g., "cornflowerblue").
 * @returns {string} The hex color string (e.g., "#6495ED") or "#000000" if the name is not found or invalid.
 */
const resolveNamedColorToHex = (descriptiveColorName) => {
    // Input validation: ensure it's a non-empty string.
    if (typeof descriptiveColorName !== 'string' || descriptiveColorName.trim() === '') {
        console.error('resolveNamedColorToHex: Provided color name must be a non-empty string.');
        return '#000000'; // Default to black for invalid input.
    }

    const normalizedName = descriptiveColorName.toLowerCase().trim();

    // Utilizing a Map for efficient lookup of color names.
    // This provides a slight performance advantage over a plain object for very large dictionaries.
    const standardHtmlColors = new Map([
        ["aliceblue", "#f0f8ff"], ["antiquewhite", "#faebd7"], ["aqua", "#00ffff"], ["aquamarine", "#7fffd4"],
        ["azure", "#f0ffff"], ["beige", "#f5f5dc"], ["bisque", "#ffe4c4"], ["black", "#000000"],
        ["blanchedalmond", "#ffebcd"], ["blue", "#0000ff"], ["blueviolet", "#8a2be2"], ["brown", "#a52a2a"],
        ["burlywood", "#deb887"], ["cadetblue", "#5f9ea0"], ["chartreuse", "#7fff00"], ["chocolate", "#d2691e"],
        ["coral", "#ff7f50"], ["cornflowerblue", "#6495ed"], ["cornsilk", "#fff8dc"], ["crimson", "#dc143c"],
        ["cyan", "#00ffff"], ["darkblue", "#00008b"], ["darkcyan", "#008b8b"], ["darkgoldenrod", "#b8860b"],
        ["darkgray", "#a9a9a9"], ["darkgrey", "#a9a9a9"], ["darkgreen", "#006400"], ["darkkhaki", "#bdb76b"],
        ["darkmagenta", "#8b008b"], ["darkolivegreen", "#556b2f"], ["darkorange", "#ff8c00"], ["darkorchid", "#9932cc"],
        ["darkred", "#8b0000"], ["darksalmon", "#e9967a"], ["darkseagreen", "#8fbc8f"], ["darkslateblue", "#483d8b"],
        ["darkslategray", "#2f4f4f"], ["darkslategrey", "#2f4f4f"], ["darkturquoise", "#00ced1"], ["darkviolet", "#9400d3"],
        ["deeppink", "#ff1493"], ["deepskyblue", "#00bfff"], ["dimgray", "#696969"], ["dimgrey", "#696969"],
        ["dodgerblue", "#1e90ff"], ["firebrick", "#b22222"], ["floralwhite", "#fffaf0"], ["forestgreen", "#228b22"],
        ["fuchsia", "#ff00ff"], ["gainsboro", "#dcdcdc"], ["ghostwhite", "#f8f8ff"], ["gold", "#ffd700"],
        ["goldenrod", "#daa520"], ["gray", "#808080"], ["grey", "#808080"], ["green", "#008000"],
        ["greenyellow", "#adff2f"], ["honeydew", "#f0fff0"], ["hotpink", "#ff69b4"], ["indianred", "#cd5c5c"],
        ["indigo", "#4b0082"], ["ivory", "#fffff0"], ["khaki", "#f0e68c"], ["lavender", "#e6e6fa"],
        ["lavenderblush", "#fff0f5"], ["lawngreen", "#7cfc00"], ["lemonchiffon", "#fffacd"], ["lightblue", "#add8e6"],
        ["lightcoral", "#f08080"], ["lightcyan", "#e0ffff"], ["lightgoldenrodyellow", "#fafad2"], ["lightgray", "#d3d3d3"],
        ["lightgrey", "#d3d3d3"], ["lightgreen", "#90ee90"], ["lightpink", "#ffb6c1"], ["lightsalmon", "#ffa07a"],
        ["lightseagreen", "#20b2aa"], ["lightskyblue", "#87cefa"], ["lightslategray", "#778899"], ["lightslategrey", "#778899"],
        ["lightsteelblue", "#b0c4de"], ["lightyellow", "#ffffe0"], ["lime", "#00ff00"], ["limegreen", "#32cd32"],
        ["linen", "#faf0e6"], ["magenta", "#ff00ff"], ["maroon", "#800000"], ["mediumaquamarine", "#66cdaa"],
        ["mediumblue", "#0000cd"], ["mediumorchid", "#ba55d3"], ["mediumpurple", "#9370d8"], ["mediumseagreen", "#3cb371"],
        ["mediumslateblue", "#7b68ee"], ["mediumspringgreen", "#00fa9a"], ["mediumturquoise", "#48d1cc"], ["mediumvioletred", "#c71585"],
        ["midnightblue", "#191970"], ["mintcream", "#f5fffa"], ["mistyrose", "#ffe4e1"], ["moccasin", "#ffe4b5"],
        ["navajowhite", "#ffdead"], ["navy", "#000080"], ["oldlace", "#fdf5e6"], ["olive", "#808000"],
        ["olivedrab", "#6b8e23"], ["orange", "#ffa500"], ["orangered", "#ff4500"], ["orchid", "#da70d6"],
        ["palegoldenrod", "#eee8aa"], ["palegreen", "#98fb98"], ["paleturquoise", "#afeeee"], ["palevioletred", "#d87093"],
        ["papayawhip", "#ffefd5"], ["peachpuff", "#ffdab9"], ["peru", "#cd853f"], ["pink", "#ffc0cb"],
        ["plum", "#dda0dd"], ["powderblue", "#b0e0e6"], ["purple", "#800080"], ["red", "#ff0000"],
        ["rosybrown", "#bc8f8f"], ["royalblue", "#4169e1"], ["saddlebrown", "#8b4513"], ["salmon", "#fa8072"],
        ["sandybrown", "#f4a460"], ["seagreen", "#2e8b57"], ["seashell", "#fff5ee"], ["sienna", "#a0522d"],
        ["silver", "#c0c0c0"], ["skyblue", "#87ceeb"], ["slateblue", "#6a5acd"], ["slategray", "#708090"],
        ["slategrey", "#708090"], ["snow", "#fffafa"], ["springgreen", "#00ff7f"], ["steelblue", "#4682b4"],
        ["tan", "#d2b48c"], ["teal", "#008080"], ["thistle", "#d8bfd8"], ["tomato", "#ff6347"],
        ["turquoise", "#40e0d0"], ["violet", "#ee82ee"], ["wheat", "#f5deb3"], ["white", "#ffffff"],
        ["whitesmoke", "#f5f5f5"], ["yellow", "#ffff00"], ["yellowgreen", "#9acd32"]
    ]);

    const resolvedHex = standardHtmlColors.get(normalizedName);
    if (resolvedHex === undefined) {
        // Log an error if the color name is not found, providing more detail.
        console.error(`resolveNamedColorToHex: Color name "${descriptiveColorName}" is not a recognized HTML standard color.`);
        return "#000000"; // Return black as a fallback for unknown names.
    }

    return resolvedHex;
};


// Main Exported Function
// This is the primary interface for calculating complementary colors.

/**
 * Computes the complementary color for various input formats:
 * - HTML color names (e.g., "blue")
 * - Hexadecimal color strings (e.g., "#FF0000", "F00", "FF")
 * - RGB color components (as an array [R, G, B] or separate R, G, B arguments)
 *
 * @param {string|Array<number>|number} firstInput - The primary color input.
 * @param {number} [secondInput] - Optional Green component if `firstInput` is Red.
 * @param {number} [thirdInput] - Optional Blue component if `firstInput` is Red.
 * @returns {string|StructuredColorData|undefined} The complementary color, either as a hex string or an RGB object,
 *                                                 or undefined if the input format is invalid or processing fails.
 */
module.exports = function getComplementaryColor(firstInput, secondInput, thirdInput) {
    let identifiedInputType = null; // Stores 'hex' or 'rgb' as determined.
    let currentHexValue = null;
    let currentRgbValues = null;

    // Internal helper to calculate the complement of a single 0-255 color component.
    const getInverseComponent = (value) => 255 - value;

    // --- Input Interpretation and Type Identification ---

    // 1. Attempt to resolve named HTML colors.
    if (typeof firstInput === "string" && secondInput === undefined && thirdInput === undefined && !firstInput.includes('#')) {
        currentHexValue = resolveNamedColorToHex(firstInput);
        // If resolveNamedColorToHex defaults to black for an unrecognized name, warn the user.
        if (currentHexValue === '#000000' && firstInput.toLowerCase() !== 'black') {
            console.warn(`getComplementaryColor: Named color "${firstInput}" was not recognized. Complement will be calculated for black.`);
        }
        identifiedInputType = 'hex';
    }
    // 2. Check for hexadecimal color strings (e.g., "#ABC", "123456").
    else if (typeof firstInput === "string" && /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(firstInput)) {
        currentHexValue = firstInput.startsWith('#') ? firstInput : `#${firstInput}`;
        identifiedInputType = 'hex';
    }
    // 3. Handle RGB components provided as an array.
    else if (Array.isArray(firstInput) && firstInput.length >= 3 && firstInput.every(num => typeof num === 'number' && !isNaN(num))) {
        currentRgbValues = firstInput.slice(0, 3); // Extract only the first three components.
        identifiedInputType = 'rgb';
    }
    // 4. Handle RGB components provided as individual arguments.
    else if (typeof firstInput === "number" && typeof secondInput === "number" && typeof thirdInput === "number" &&
             !isNaN(firstInput) && !isNaN(secondInput) && !isNaN(thirdInput)) {
        currentRgbValues = [firstInput, secondInput, thirdInput];
        identifiedInputType = 'rgb';
    }
    // If no recognized input format, log an error and exit.
    else {
        console.error("getComplementaryColor: Invalid or unsupported color input format provided.");
        return;
    }

    // --- Complementary Color Calculation Logic ---

    if (identifiedInputType === 'hex') {
        let strippedHex = currentHexValue.substring(1); // Remove the '#' prefix.
        let resultHex = '#';

        // Process 6-digit hex codes.
        if (strippedHex.length === 6) {
            const r = parseHexToRgb(strippedHex.substring(0, 2));
            const g = parseHexToRgb(strippedHex.substring(2, 4));
            const b = parseHexToRgb(strippedHex.substring(4, 6));

            // Ensure parsing was successful and components are numbers.
            if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
                console.error("getComplementaryColor: Failed to parse individual hex components for 6-digit code.");
                return;
            }

            resultHex += formatHexComponent(getInverseComponent(r));
            resultHex += formatHexComponent(getInverseComponent(g));
            resultHex += formatHexComponent(getInverseComponent(b));
        }
        // Process 3-digit shorthand hex codes.
        else if (strippedHex.length === 3) {
            // Expand 3-digit to 6-digit for consistent processing (e.g., "F0C" -> "FF00CC").
            const expandedHex = strippedHex.split('').map(char => char + char).join('');
            const r = parseHexToRgb(expandedHex.substring(0, 2));
            const g = parseHexToRgb(expandedHex.substring(2, 4));
            const b = parseHexToRgb(expandedHex.substring(4, 6));

            if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number') {
                console.error("getComplementaryColor: Failed to parse individual hex components for 3-digit code.");
                return;
            }

            resultHex += formatHexComponent(getInverseComponent(r));
            resultHex += formatHexComponent(getInverseComponent(g));
            resultHex += formatHexComponent(getInverseComponent(b));
        }
        else {
            console.error(`getComplementaryColor: Unexpected hex string length encountered: ${currentHexValue}.`);
            return;
        }
        return resultHex;
    }
    else if (identifiedInputType === 'rgb') {
        // Ensure RGB components are valid before processing.
        if (!currentRgbValues || currentRgbValues.length !== 3) {
            console.error("getComplementaryColor: RGB components are invalid or insufficient for complement calculation.");
            return;
        }
        // Apply the inverse component calculation to all RGB values.
        const complementaryRgb = currentRgbValues.map(getInverseComponent);
        // Return a structured RGB object using the internal helper.
        return composeColorData(complementaryRgb, 'rgb');
    }

    // This point should ideally not be reached if all input types are covered.
    console.error("getComplementaryColor: An unhandled condition occurred during color complement calculation.");
    return;
};