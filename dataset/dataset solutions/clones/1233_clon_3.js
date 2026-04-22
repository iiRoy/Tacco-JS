const fileSystemOperations = require('node:fs'); // Importing the file system module using 'node:fs' for modern Node.js environments.

// Define the standard input path as a constant.
const standardInputFilePath = '/dev/stdin';

let entireFileContent; // Variable to hold the entire content read from the file.

try {
    // Attempt to read the file synchronously.
    // 'utf8' encoding ensures the content is treated as text.
    entireFileContent = fileSystemOperations.readFileSync(standardInputFilePath, 'utf8');
} catch (readingError) {
    // If an error occurs during file reading, log it and terminate the process.
    console.error("An error occurred while attempting to read the standard input:", readingError.message);
    process.exit(1); // Exit with a non-zero code to indicate an error.
}

// --- Data Preparation and Initial Validation ---

// Check if the file content is empty or contains only whitespace after reading.
if (!entireFileContent || entireFileContent.trim().length === 0) {
    console.log("No meaningful input data was provided. Terminating execution.");
    process.exit(0); // Exit gracefully if no data.
}

// Split the raw content into individual lines.
// Using a regex to handle both Unix-style (\n) and Windows-style (\r\n) line endings.
// Then, filter out any lines that are empty or consist only of whitespace.
const validDataLines = entireFileContent
    .split(/\r?\n/)
    .filter(lineText => lineText.trim() !== '');

// If, after filtering, no valid lines remain, exit.
if (validDataLines.length === 0) {
    console.log("The input file contained only empty or whitespace-only lines. No processing needed.");
    process.exit(0);
}

// --- Core Processing Logic ---

// A boolean flag to control the main processing loop's continuation.
let keepProcessingInput = true;

// An array to buffer the results before printing them all at once.
// This is a Type III modification for batch output instead of immediate `console.log`.
const finalOutputBuffer = [];

// Iterate through each validated line of input data.
// The loop continues as long as there are lines to process and the termination flag is true.
for (let currentLineIndex = 0; currentLineIndex < validDataLines.length && keepProcessingInput; currentLineIndex++) {
    const activeLineString = validDataLines[currentLineIndex];

    // Split the current line by spaces.
    // Filter out any empty strings that might result from multiple spaces.
    // Then, map the remaining strings to integers using `parseInt` with base 10.
    // Finally, filter out any results that are not valid numbers (NaN).
    const parsedNumericTokens = activeLineString
        .split(' ')
        .filter(token => token.trim() !== '')
        .map(strValue => parseInt(strValue.trim(), 10))
        .filter(numValue => !isNaN(numValue));

    // Guard clause: Ensure there are at least two numbers on the line as expected.
    if (parsedNumericTokens.length < 2) {
        // console.warn(`Warning: Line ${currentLineIndex + 1} ("${activeLineString}") did not contain enough valid numbers. Skipping.`);
        continue; // Skip to the next line if the format is invalid.
    }

    // Extract the first and second values for clear variable naming.
    const primaryOperand = parsedNumericTokens[0];
    const secondaryOperand = parsedNumericTokens[1];

    // Check for the specific termination condition: both values are zero.
    if (primaryOperand === 0 && secondaryOperand === 0) {
        // Set the flag to false to signal the loop to stop after this iteration.
        keepProcessingInput = false;
        // console.log("Termination sequence (0 0) detected. Halting further input processing.");
        break; // Immediately exit the loop.
    }

    // Create a new array containing just the two operands for sorting.
    // This makes the sorting operation explicit on just the pair.
    const twoValuesToOrder = [primaryOperand, secondaryOperand];

    // Sort the array numerically in ascending order using an arrow function.
    const numericallyOrderedPair = twoValuesToOrder.sort((valA, valB) => valA - valB);

    // Format the sorted numbers into a space-separated string.
    const formattedResultString = numericallyOrderedPair.join(' ');

    // Add the formatted string to our output buffer.
    finalOutputBuffer.push(formattedResultString);
}

// --- Final Output ---

// Check if any results were collected during processing.
if (finalOutputBuffer.length > 0) {
    // Join all buffered results with a newline character and print them to the console.
    // This ensures each sorted pair appears on its own line.
    console.log(finalOutputBuffer.join('\n'));
} else {
    // If the buffer is empty, it means either no valid pairs were found,
    // or the termination condition was met immediately.
    // console.log("No output generated from valid input pairs.");
}