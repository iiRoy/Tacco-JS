const fileSystemBridge = require('fs'); // Utilizing the Node.js file system module for I/O operations.

// Read all input from standard input, treating it as UTF-8.
// Split the content into individual lines.
// Filter out any lines that are empty or contain only whitespace, ensuring only meaningful input is processed.
const rawInputLines = fileSystemBridge.readFileSync('/dev/stdin', 'UTF-8')
                                      .split('\n')
                                      .filter(lineContent => lineContent.trim().length > 0);

// An array to accumulate the complete ASCII art blocks for each set of dimensions.
// This is more efficient than repeated string concatenation for large outputs.
const generatedArtBlocks = [];

/**
 * Helper function to parse a string containing two space-separated numbers into an object.
 * It also performs basic validation to ensure the parsed values are valid integers.
 * @param {string} dimensionString - The input string, e.g., "5 8".
 * @returns {{height: number, width: number} | null} - An object with height and width, or null if parsing fails.
 */
const extractDimensions = (dimensionString) => {
    // Split the string by one or more whitespace characters and attempt to convert each part to an integer.
    const numericComponents = dimensionString.split(/\s+/).map(component => parseInt(component.trim(), 10));

    // A guard clause to ensure we have exactly two numeric components and neither is NaN.
    if (numericComponents.length !== 2 || numericComponents.some(isNaN)) {
        console.error(`Error: Malformed dimension input encountered, skipping: "${dimensionString}"`);
        return null; // Indicate a parsing failure.
    }
    return { height: numericComponents[0], width: numericComponents[1] };
};

let currentLinePointer = 0; // Index to keep track of the current line being processed from rawInputLines.
let processedRectangleCount = 0; // A simple counter for how many valid rectangles have been generated.

// Loop through each line of the filtered input data.
// Using a while loop provides more control over iteration compared to a standard for-loop.
while (currentLinePointer < rawInputLines.length) {
    const currentInputLine = rawInputLines[currentLinePointer];
    const rectangleDimensions = extractDimensions(currentInputLine);

    // If the dimension parsing failed, log a warning and advance to the next input line.
    if (rectangleDimensions === null) {
        currentLinePointer++;
        continue;
    }

    const { height: currentHeight, width: currentWidth } = rectangleDimensions;

    // This is the termination condition: if both dimensions are zero, stop processing further input.
    if (currentHeight === 0 && currentWidth === 0) {
        break;
    }

    // Guard clause: Ensure both dimensions are positive for a meaningful rectangle.
    // The original code only checks for 0,0 termination, but doesn't explicitly skip 1,0 or 0,1.
    // We're adding this as a robustness improvement for Type III.
    if (currentHeight < 1 || currentWidth < 1) {
        console.warn(`Warning: Dimensions must be positive (H:${currentHeight}, W:${currentWidth}). Skipping this block.`);
        currentLinePointer++;
        continue;
    }

    // An array to temporarily hold the lines for the current rectangle block.
    const currentRectangleLines = [];

    // Pre-calculate the patterns for solid rows and inner hollow parts.
    // Using String.prototype.repeat() is a concise way to create repeated character strings.
    const fullHashRow = '#'.repeat(currentWidth);
    // The middle pattern should only have dots if the width is sufficient (at least 2 for two hashes and dots in between).
    // If width is 1, the middle pattern is just a hash.
    const innerHollowPattern = (currentWidth >= 2) ? ('#' + '.'.repeat(currentWidth - 2) + '#') : '#';

    // Add the top boundary row to the current block.
    currentRectangleLines.push(fullHashRow);

    // Generate and add the middle, hollow rows.
    // This loop runs (height - 2) times. If height is 1 or 2, this loop won't execute.
    for (let rowIterator = 0; rowIterator < currentHeight - 2; rowIterator++) {
        currentRectangleLines.push(innerHollowPattern);
    }

    // Add the bottom boundary row.
    // The original code always adds a bottom row, even for height=1 (resulting in two identical lines for 1xW).
    // To maintain identical functionality, we also always add it if height >= 1.
    if (currentHeight >= 1) { // This condition will always be true due to earlier guards.
        currentRectangleLines.push(fullHashRow);
    }

    // Join all lines of the current rectangle block with newlines and add to the main output array.
    generatedArtBlocks.push(currentRectangleLines.join('\n'));

    processedRectangleCount++; // Increment the counter for successfully processed blocks.
    currentLinePointer++; // Move to the next line in the input.
}

// Join all accumulated art blocks with a double newline for clear separation between rectangles.
// Finally, print the entire composed output to standard output.
console.log(generatedArtBlocks.join('\n\n'));