import { readFileSync } from 'fs';

// Define the standard input file path for competitive programming environments.
const standardInputPath = '/dev/stdin';

// Read the entire content of the standard input file.
// Ensure UTF-8 encoding for proper character interpretation.
const sourceContentBuffer = readFileSync(standardInputPath, 'utf8');

// Process the raw input content:
// 1. Remove any leading or trailing whitespace from the entire block.
// 2. Split the content into an array of individual lines.
const processedInputLines = sourceContentBuffer.trim().split('\n');

// A helper function to generate a rectangular pattern of characters.
// This encapsulates the logic for creating the grid string.
function generateCharacterGrid(gridWidth, gridHeight) {
    // Basic validation for positive dimensions.
    // In competitive programming, input is usually guaranteed valid,
    // but Type III allows for adding such robustness.
    if (gridWidth <= 0 || gridHeight <= 0) {
        return ''; // Return an empty string for invalid dimensions.
    }

    // Define the character to be used for the grid.
    const fillCharacter = '#';

    // Create a single row string by repeating the fill character.
    const horizontalLineSegment = fillCharacter.repeat(gridWidth);

    // Use an array to accumulate all generated rows.
    const gridRowsCollection = [];

    // Populate the array with the required number of rows.
    for (let currentLineNum = 0; currentLineNum < gridHeight; currentLineNum++) {
        gridRowsCollection.push(horizontalLineSegment);
    }

    // Join all rows with a newline character, and then append one final newline.
    // This matches the original's specific output format where each block
    // ends with a newline, and the `console.log` then adds another.
    const finalGridRepresentation = gridRowsCollection.join('\n') + '\n';

    return finalGridRepresentation;
}

// Initialize a pointer to iterate through the processed input lines.
let currentLinePointer = 0;

// Loop through the input lines until a termination condition is met.
while (currentLinePointer < processedInputLines.length) {
    // Fetch the current line being processed.
    const activeInputSegment = processedInputLines[currentLinePointer];
    currentLinePointer++; // Advance the pointer for the next iteration.

    // Skip any potentially empty lines that might result from aggressive trimming or malformed input.
    if (!activeInputSegment || activeInputSegment.trim() === '') {
        continue;
    }

    // Define the specific string that signals the end of input.
    const processingTerminationToken = "0 0";
    if (activeInputSegment === processingTerminationToken) {
        break; // Exit the loop if the termination token is found.
    }

    // Split the line into its component parts (expecting two numbers).
    // Filter out any empty strings that might arise from multiple spaces.
    const dimensionStringParts = activeInputSegment.split(' ').filter(part => part !== '');

    // Validate that exactly two dimension values were found.
    if (dimensionStringParts.length !== 2) {
        // console.warn(`Skipping malformed input entry: "${activeInputSegment}"`);
        continue; // Move to the next line if the format is incorrect.
    }

    // Parse the height and width values from the string parts.
    // Original code uses ary[0] for height and ary[1] for width.
    const gridHeightValue = parseInt(dimensionStringParts[0], 10);
    const gridWidthValue = parseInt(dimensionStringParts[1], 10);

    // Validate that the parsed values are indeed positive integers.
    if (isNaN(gridWidthValue) || isNaN(gridHeightValue) || gridWidthValue < 1 || gridHeightValue < 1) {
        // console.warn(`Skipping invalid dimension values in line: "${activeInputSegment}"`);
        continue; // Skip this entry if dimensions are not valid.
    }

    // Generate the grid pattern using the helper function.
    const renderedOutputBlock = generateCharacterGrid(gridWidthValue, gridHeightValue);

    // Write the generated grid block to standard output.
    // An additional newline is appended to precisely match the original's output formatting,
    // where each block is followed by two newlines (one from the block itself, one from console.log's explicit addition).
    process.stdout.write(renderedOutputBlock + '\n');
}