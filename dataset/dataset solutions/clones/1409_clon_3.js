/*
 * This program processes input to generate
 * a series of patterned grids.
 * Each grid is defined by its height and width.
 * The pattern alternates between two characters.
 */

// Import the 'filesystem' module to handle file operations.
const fileSystem = require('fs');

// Define the standard input file path.
const standardInputPath = '/dev/stdin';

// Read the raw input data from the specified file, decoding it as UTF-8.
const rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');

// Split the entire content into individual lines based on the newline character.
const contentLines = rawInputContent.split('\n');

/**
 * Helper function to output a single character to the console without a newline.
 * @param {string} charToPrint - The character to be displayed.
 */
function emitCharacter(charToPrint) {
    process.stdout.write(charToPrint);
}

// Main processing loop: continues until an explicit break condition is met.
while (true) {
    // Retrieve and process the current line from the input array.
    const currentLineData = contentLines.shift();

    // If there's no more data, or the line is empty/undefined, break.
    if (!currentLineData) {
        break;
    }

    // Split the current line by spaces to get individual dimension tokens.
    const dimensionTokens = currentLineData.split(' ');

    // Parse the first token as the grid's vertical dimension (height).
    const gridHeight = parseInt(dimensionTokens[0], 10);
    // Parse the second token as the grid's horizontal dimension (width).
    const gridWidth = parseInt(dimensionTokens[1], 10);

    // Validate if both dimensions are valid numbers.
    if (isNaN(gridHeight) || isNaN(gridWidth)) {
        // Optionally log an error or skip, for now, we'll just skip this line.
        console.error("Warning: Invalid dimensions encountered. Skipping line.");
        continue;
    }

    // Termination condition: if both dimensions are zero, exit the loop.
    if (gridHeight === 0 && gridWidth === 0) {
        break;
    }

    // Construct the grid row by row.
    for (let rowIdx = 0; rowIdx < gridHeight; ++rowIdx) {
        let currentRowBuffer = ''; // Buffer to build the current row.

        // Populate the current row with alternating characters.
        for (let colIdx = 0; colIdx < gridWidth; ++colIdx) {
            // Determine the character based on the parity of the sum of indices.
            const sumOfIndices = rowIdx + colIdx;
            const characterToUse = (sumOfIndices % 2 === 0) ? '#' : '.';
            currentRowBuffer += characterToUse;
        }
        // Output the completed row followed by a newline.
        console.log(currentRowBuffer);
    }
    // Add an extra blank line after each completed grid for separation.
    console.log('');
}

// End of program execution.
// A final message could be added here if desired, e.g., console.log("Processing complete.");