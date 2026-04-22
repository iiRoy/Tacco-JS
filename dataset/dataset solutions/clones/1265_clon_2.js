let finishedProcessing = false; // This flag indicates whether the processing loop should terminate.

const basePatternBuffer = Buffer.from("#.#.#.#.#."); // A small buffer holding the fundamental repeating pattern.
let expandedPatternBuffer = Buffer.alloc(300); // A larger buffer to construct the full pattern line.

// Populate the expanded pattern buffer by repeatedly copying the smaller base pattern.
for (let currentBufferIndex = 0; currentBufferIndex < 300; currentBufferIndex = currentBufferIndex + 10) {
    basePatternBuffer.copy(expandedPatternBuffer, currentBufferIndex, 0);
}

expandedPatternBuffer = expandedPatternBuffer.toString(); // Convert the filled buffer into a string for easier manipulation.

// Read input from standard input, splitting by newlines, and process each line with the designated function.
require('node:fs').readFileSync('/dev/stdin', 'utf8')
    .split('\n')
    .forEach(processInputLine);

// Debugging placeholder: ["2 2", "3 3", "0 0"].forEach(processInputLine);

/**
 * Handles a single line of input, determining if a grid needs to be rendered or if processing should stop.
 * @param {string} inputString The current line read from standard input.
 */
function processInputLine(inputString) {
    // Check if the current line signals termination.
    if (inputString === '0 0') {
        finishedProcessing = true;
        return; // Exit the function, as processing should stop.
    }

    // If the termination flag is already set, skip further operations for this line.
    if (finishedProcessing) return;

    // Parse the height and width from the input string.
    const dimensionsArray = inputString.split(' ').map(Number);
    const gridWidth = dimensionsArray[1];

    // Extract the specific row patterns needed for the current grid dimensions.
    const evenRowSegment = expandedPatternBuffer.slice(0, gridWidth);
    const oddRowSegment = expandedPatternBuffer.slice(1, gridWidth + 1);

    // Call the dedicated rendering function to display the grid.
    renderGrid(dimensionsArray[0], evenRowSegment, oddRowSegment);

    // Output an empty line to separate consecutive grids.
    console.log("");
}

/**
 * Renders a grid of specified height using two alternating row patterns.
 * @param {number} gridHeight The number of rows in the grid.
 * @param {string} evenPatternString The pattern for even-indexed rows.
 * @param {string} oddPatternString The pattern for odd-indexed rows.
 */
function renderGrid(gridHeight, evenPatternString, oddPatternString) {
    let rowIterator; // Loop counter for iterating through rows.

    // Loop through each row from top to bottom.
    for (rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
        // Print the appropriate pattern based on whether the current row index is even or odd.
        if (rowIterator % 2 === 0) {
            console.log(evenPatternString);
        } else {
            console.log(oddPatternString);
        }
    }
}