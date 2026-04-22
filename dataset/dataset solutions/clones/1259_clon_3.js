// Import the Node.js file system module for input operations.
const sysFileModule = require('fs');
// Define the standard input file path, which is typically /dev/stdin on Unix-like systems.
const standardInputPath = '/dev/stdin';
// Specify the character encoding for reading the file content.
const fileEncoding = 'utf8';

let rawInputLines;
try {
    // Synchronously read the entire content of the standard input file.
    const fileContentBuffer = sysFileModule.readFileSync(standardInputPath, fileEncoding);
    // Split the buffered content into an array of strings, where each string represents a line.
    rawInputLines = fileContentBuffer.split('\n');
} catch (readError) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error message to standard error and initialize rawInputLines as an empty array
    // to prevent subsequent processing from failing.
    console.error("Error encountered while attempting to read input file:", readError.message);
    rawInputLines = [];
}

/**
 * Generates a rectangular grid pattern composed of a specific fill character.
 * This function handles the core logic of constructing the visual block.
 * @param {number} rowCount - The desired number of rows for the grid. Must be a positive integer.
 * @param {number} colCount - The desired number of columns for each row in the grid. Must be a positive integer.
 * @returns {string} A string representing the generated grid, with rows separated by newlines,
 *                   or an empty string if the dimensions are invalid or non-positive.
 */
const generatePatternGrid = (rowCount, colCount) => {
    // Define the character that will be used to fill the grid cells.
    const fillCharacter = '#';
    // Define the newline character, essential for separating grid rows.
    const lineBreak = '\n';

    // Perform basic validation to ensure dimensions are positive integers.
    // A grid cannot have zero or negative dimensions, nor non-integer dimensions.
    if (rowCount <= 0 || colCount <= 0 || !Number.isInteger(rowCount) || !Number.isInteger(colCount)) {
        // If dimensions are invalid, return an empty string as no grid can be formed.
        return '';
    }

    // Construct a single row string by repeating the fill character 'colCount' times.
    // Example: if colCount is 3, this creates "###".
    const singleRowString = fillCharacter.repeat(colCount);

    // Append a newline character to the single row string to create a complete, terminated line.
    // Example: "###\n".
    const completeLineWithNewline = singleRowString + lineBreak;

    // Repeat the complete line string 'rowCount' times to form the entire grid.
    // Example: if rowCount is 2, this results in "###\n###\n".
    const fullGridOutput = completeLineWithNewline.repeat(rowCount);

    return fullGridOutput;
};

// Process each line from the raw input to generate corresponding output blocks.
// The map function transforms each input line into a processed string block.
const processedOutputBlocks = rawInputLines.map((currentLineText, lineIndex) => {
    // Trim whitespace from the current line and check if it's empty.
    // Empty lines are often artifacts of file processing (e.g., trailing newlines) and should be skipped.
    if (currentLineText.trim() === '') {
        return '';
    }

    // Split the current line by spaces to get individual string parts.
    // These parts are expected to represent height and width.
    const stringParts = currentLineText.split(' ');

    // Attempt to parse each string part into an integer using parseInt with radix 10.
    // This creates an array of numerical dimensions.
    const parsedDimensions = stringParts.map(val => parseInt(val, 10));

    // Extract height and width values for better readability.
    const currentHeight = parsedDimensions[0];
    const currentWidth = parsedDimensions[1];

    // Implement robust input validation for the dimensions.
    // 1. Ensure exactly two numerical values were provided.
    // 2. Check if any parsed value is NaN (Not a Number), indicating failed parsing.
    // 3. Verify that both height and width are indeed integers.
    if (stringParts.length !== 2 || parsedDimensions.some(isNaN) || !Number.isInteger(currentHeight) || !Number.isInteger(currentWidth)) {
        // Log a warning for malformed input lines, including the line number and original text.
        // This helps in debugging input issues without crashing the entire process.
        console.warn(`Warning: Input line ${lineIndex + 1} ("${currentLineText}") contains invalid or malformed dimensions. Skipping this block.`);
        return ''; // Return an empty string for invalid lines.
    }

    // Handle the termination condition or no-operation cases.
    // If both dimensions are 0, it typically signals the end of input or no grid output.
    if (currentHeight === 0 && currentWidth === 0) {
        return '';
    }
    // If only one dimension is 0 (e.g., 5 0 or 0 3), it also implies no visible grid.
    else if (currentHeight === 0 || currentWidth === 0) {
        return '';
    }

    // If dimensions are valid and non-zero, call the helper function to generate the grid.
    const generatedBlock = generatePatternGrid(currentHeight, currentWidth);
    return generatedBlock;
});

// Filter out any empty strings from the processed blocks array.
// Empty strings result from skipped invalid lines or termination conditions.
// Then, join the remaining valid blocks with a single newline character to separate them in the final output.
const finalOutputString = processedOutputBlocks.filter(block => block !== '').join('\n');

// Print the aggregated final output string to the standard output.
console.log(finalOutputString);