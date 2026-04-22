// This JavaScript module is designed to perform a unique bitwise transformation
// on a sequence of integer values provided via standard input.
// It first determines an overall XOR sum of the input numbers,
// then applies this sum as a mask to each individual number.

// Define a constant for the default input stream path.
const INPUT_SOURCE_PATH = '/dev/stdin';

/**
 * Processes a multi-line string input to perform a specific XOR-based calculation.
 * The input is expected to contain a count of numbers on the first line,
 * followed by the numbers themselves (space-separated) on the second line.
 *
 * @param {string} incomingDataPayload - The raw string content received from the input source.
 *                                     Expected format:
 *                                     Line 1: An integer, `K`, indicating the number of elements.
 *                                     Line 2: `K` space-separated integers.
 * @returns {string} A string where each original number is XORed with the total XOR sum,
 *                   with results separated by spaces. Returns an empty string on invalid input.
 */
function computeXorTransformation(incomingDataPayload) {
    // Sanitize the input by removing any leading or trailing whitespace.
    const cleanedPayload = incomingDataPayload.trim();

    // Implement a guard clause for scenarios where the input is entirely empty.
    if (!cleanedPayload) {
        // If no data, there's nothing to process. Return an empty string.
        return '';
    }

    // Divide the cleaned input into individual lines for structured parsing.
    const dataLines = cleanedPayload.split('\n');

    // Validate the number of lines received. We require at least two lines.
    if (dataLines.length < 2) {
        console.error("Error: The input data is malformed. Expected at least two lines.");
        return ''; // Or consider throwing a specific error.
    }

    // Extract and parse the expected count of numbers from the initial line.
    // Using radix 10 for explicit base conversion.
    const expectedElementCount = parseInt(dataLines[0].trim(), 10);

    // Perform validation on the parsed count to ensure it's a valid non-negative integer.
    if (isNaN(expectedElementCount) || expectedElementCount < 0) {
        console.error("Error: Invalid numerical count specified in the first line of input.");
        return '';
    }

    // Parse the actual sequence of numbers from the second line.
    // Each string element is converted to an integer.
    const rawNumberSequence = dataLines[1].trim().split(' ').map(item => parseInt(item, 10));

    // Filter out any non-numeric results from the parsing process (e.g., empty strings becoming NaN).
    const validatedNumberSequence = rawNumberSequence.filter(num => !isNaN(num));

    // Introduce a warning if the actual number of elements doesn't match the expected count.
    if (validatedNumberSequence.length !== expectedElementCount) {
        console.warn(`Warning: The declared count (${expectedElementCount}) does not match ` +
                     `the actual number of parsed elements (${validatedNumberSequence.length}). ` +
                     `Proceeding with the actual number of elements found.`);
    }

    // If, after validation, there are no numbers to process, return an empty string.
    if (validatedNumberSequence.length === 0) {
        return '';
    }

    // Calculate the cumulative XOR sum of all valid numbers in the sequence.
    // Initialize the accumulator to zero to ensure correct behavior, especially for edge cases.
    let cumulativeXorSum = 0;
    // Iterate through the sequence, updating the sum with each element.
    for (let currentElementIndex = 0; currentElementIndex < validatedNumberSequence.length; currentElementIndex++) {
        cumulativeXorSum ^= validatedNumberSequence[currentElementIndex];
    }

    // Prepare a new array to store the results of the transformation.
    const resultantValues = [];
    let processingCursor = 0; // Use a cursor for iterative processing.

    // Apply the transformation: XOR each original number with the cumulative XOR sum.
    while (processingCursor < validatedNumberSequence.length) {
        const originalNumericValue = validatedNumberSequence[processingCursor];
        const transformedNumericValue = originalNumericValue ^ cumulativeXorSum;
        resultantValues.push(transformedNumericValue);
        processingCursor++;
    }

    // Concatenate the transformed numbers into a single string, using a space as a separator.
    return resultantValues.join(' ');
}

// Access the Node.js 'fs' (file system) module to read input.
const fileSystemUtility = require('fs');

// Read the entire content of the standard input file synchronously.
// The 'utf8' encoding ensures the input is treated as a string.
const rawInputContent = fileSystemUtility.readFileSync(INPUT_SOURCE_PATH, 'utf8');

// Execute the primary transformation function with the acquired input and
// output the final result directly to the console.
console.log(computeXorTransformation(rawInputContent));