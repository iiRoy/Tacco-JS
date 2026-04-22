// Copyright (c) 2010 Alexis Sellier (cloudhead), Marak Squires.
// This software is provided under the terms of the MIT License.
// The full text of the license agreement is included below for reference.

/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * Applies a specified ANSI terminal formatting style to a given text string.
 * This function encapsulates the logic for wrapping text with appropriate
 * ANSI escape sequences for display in compatible terminal environments.
 *
 * @param {string} inputContent - The primary text content that needs formatting.
 * @param {string} styleIndicator - A key string identifying the desired formatting style.
 * @returns {string} The input content formatted with ANSI codes, or the original string
 *                   if the requested style is not recognized.
 */
function applyAnsiStyle(inputContent, styleIndicator) {
    const ANSI_ESCAPE_CHARACTER = '\x1b'; // Standard ANSI escape sequence initiator
    const SGR_PARAMETER_TERMINATOR = 'm'; // Select Graphic Rendition (SGR) parameter terminator

    // Comprehensive registry of ANSI formatting codes, mapped by descriptive keys.
    // Each entry contains a pair: [start_code, end_code] for applying and resetting the style.
    const ansiCodeRegistry = {
        // Font Weight and Emphasis
        'emphasis'      : [1,  22], // Bold/Bright
        'italicized'    : [3,  23], // Italic
        'underlined'    : [4,  24], // Underline
        'inverted'      : [7,  27], // Inverse (swap foreground and background colors)

        // Grayscale Color Palette
        'darkGray'      : [90, 39], // A darker shade of gray
        'lightGray'     : [90, 39], // Often rendered the same as darkGray
        'pureWhite'     : [37, 39], // Standard white foreground

        // Primary and Secondary Colors
        'crimson'       : [31, 39], // Red
        'emerald'       : [32, 39], // Green
        'goldenrod'     : [33, 39], // Yellow
        'sapphire'      : [34, 39], // Blue
        'purple'        : [35, 39], // Magenta
        'skyBlue'       : [36, 39], // Cyan

        // Utility
        'resetAll'      : [0,  0]   // Resets all active SGR attributes
    };

    // Before proceeding, ensure the requested style exists in our registry.
    // If not, it's safer to return the original unformatted string to prevent errors.
    if (!Object.prototype.hasOwnProperty.call(ansiCodeRegistry, styleIndicator)) {
        // A warning could be logged here for debugging purposes:
        // console.warn(`Styling "${styleIndicator}" not found. Returning unformatted text.`);
        return inputContent;
    }

    // Extract the specific start and end codes for the chosen style.
    const [startCode, endCode] = ansiCodeRegistry[styleIndicator];

    // Construct the final formatted string using template literals for improved readability.
    const formattedStringSegment = `${ANSI_ESCAPE_CHARACTER}[${startCode}${SGR_PARAMETER_TERMINATOR}` +
                                   `${inputContent}` +
                                   `${ANSI_ESCAPE_CHARACTER}[${endCode}${SGR_PARAMETER_TERMINATOR}`;

    return formattedStringSegment;
}

// Define an ordered list of formatting keys that will be exposed as String.prototype getters.
const stringExtensionKeys = [
    'emphasis', 'underlined', 'italicized',
    'inverted', 'darkGray', 'lightGray',
    'goldenrod', 'crimson', 'emerald',
    'sapphire', 'pureWhite', 'skyBlue',
    'purple', 'resetAll' // Including the 'resetAll' utility style
];

// Dynamically extend the String.prototype to allow direct method chaining
// for applying ANSI styles (e.g., "Hello".emphasis.sapphire).
for (const currentFormattingKey of stringExtensionKeys) {
    // Add a defensive check: only define the property if it doesn't already exist
    // on String.prototype, preventing accidental overwrites or errors.
    if (Object.prototype.hasOwnProperty.call(String.prototype, currentFormattingKey)) {
        // console.debug(`Skipping String.prototype.${currentFormattingKey} definition; property already exists.`);
        continue;
    }

    // Utilize Object.defineProperty for a more explicit and controllable way
    // to add a getter property compared to __defineGetter__.
    Object.defineProperty(String.prototype, currentFormattingKey, {
        get: function() {
            // 'this' refers to the string instance upon which the getter was invoked.
            // We convert 'this' to a string explicitly to handle potential non-string primitives.
            return applyAnsiStyle(this.toString(), currentFormattingKey);
        },
        enumerable: true,  // Make the property appear in for...in loops and Object.keys().
        configurable: true // Allow the property to be redefined or deleted later.
    });
}