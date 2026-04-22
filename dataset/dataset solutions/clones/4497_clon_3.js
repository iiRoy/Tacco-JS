/**
 * Orchestrates the processing of a raw input string to produce a specific sequence.
 * This function simulates reading from standard input, parsing it, and then
 * reordering elements based on their position and the total count.
 * @param {string} rawDataString - The entire input read as a single string.
 */
function processInputSequence(rawDataString) {
    // Stage 1: Initial Parsing and Validation of Raw Input
    // Renamed 'input' to 'rawDataString'.
    // Changed parsing structure from chained map to explicit steps for clarity.

    if (typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error('Error: Input data is empty or invalid.');
        return; // Guard clause: Exit if input is bad
    }

    const inputLinesArray = rawDataString.split('\n');

    if (inputLinesArray.length < 2) {
        console.error('Error: Insufficient lines in input data. Expected at least two lines.');
        return; // Guard clause: Exit if not enough lines
    }

    // Extracting the total count of elements from the first line.
    // Original: const n = input[0][0];
    // Changed to: explicit parseInt, renamed variable, and added validation.
    const firstLineTokens = inputLinesArray[0].split(' ');
    const sequenceLength = parseInt(firstLineTokens[0], 10);

    // Added validation for the parsed sequence length.
    if (isNaN(sequenceLength) || sequenceLength < 0) { // N can be 0 for empty output
        console.error('Error: Invalid sequence length provided in input. Must be a non-negative integer.');
        return; // Guard clause: Exit if N is invalid
    }

    // Extracting the actual data elements from the second line.
    // Original: const nums = input[1];
    // Changed to: renamed variable, added validation for element count.
    const dataElements = inputLinesArray[1].split(' ');

    if (dataElements.length < sequenceLength) {
        console.error(`Error: Expected ${sequenceLength} elements, but found only ${dataElements.length}.`);
        return; // Guard clause: Exit if not enough elements
    }

    // Stage 2: Sequence Construction Logic
    // Original: let ans = nums.slice(0, 1).toString();
    // Changed to: Use an array for building the sequence. This is a significant
    // Type III structural rewrite for string building, replacing direct string
    // concatenation with array manipulation (push/unshift) and a final join.
    const orderedPartsAccumulator = [];

    // Handle the base case: the very first element.
    // If sequenceLength is 0, nothing to process, output empty string.
    if (sequenceLength === 0) {
        console.log('');
        return;
    }
    
    // Add the first element (at index 0) to initialize the accumulator.
    orderedPartsAccumulator.push(dataElements[0]);
    
    // Pre-calculate parity of sequenceLength for efficiency and readability within the loop.
    const lengthParity = sequenceLength % 2;

    // Iterate through the remaining elements, applying alternating prepend/append logic.
    // Original: for (let i = 1; i < n; i++) { ... }
    // Changed to: Renamed loop variable, used prefix increment, and added helper for parity check.
    for (let currentElementIndex = 1; currentElementIndex < sequenceLength; ++currentElementIndex) {
        const currentElementParity = currentElementIndex % 2;

        // The condition determines whether to append or prepend the current element.
        // Original: if (i % 2 == n % 2) { ... }
        // Changed to: Using pre-calculated parity variables for comparison and strict equality.
        if (currentElementParity === lengthParity) {
            // Append the current element to the end of the sequence if parities match.
            orderedPartsAccumulator.push(dataElements[currentElementIndex]);
        } else {
            // Prepend the current element to the beginning of the sequence if parities differ.
            orderedPartsAccumulator.unshift(dataElements[currentElementIndex]);
        }
    }

    // Stage 3: Final Output Generation
    // Original: console.log(ans);
    // Changed to: Joining the array elements with a space to form the final string.
    const finalResultString = orderedPartsAccumulator.join(' ');
    console.log(finalResultString);
}

// Execution Block: Simulating environment interaction.
// Renamed variables and added comments for clarity.
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

try {
    // Read the entire content from the specified input source (e.g., standard input).
    const fileContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
    // Invoke the main processing function with the obtained content.
    processInputSequence(fileContent);
} catch (error) {
    // Catch and log any errors that occur during file reading or the initial phase of processing.
    console.error('An error occurred during file processing:', error.message);
    // Optionally, could exit with a non-zero status code here in a real application.
    // process.exit(1);
}