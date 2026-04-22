const RESULT_MODULO_VALUE = 100000; // Define a constant for the modulo operation.

/**
 * Reads all input data from standard input, trims it, and splits it into an array of lines.
 * Filters out any empty lines to ensure clean processing.
 * @returns {string[]} An array where each element is a non-empty line from the input.
 */
function retrieveRawInputLines() {
    // Utilize Node.js 'fs' module to synchronously read from '/dev/stdin'.
    // Ensure encoding is 'utf8' for proper character handling.
    const fullInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim leading/trailing whitespace from the entire input block,
    // then split by newline characters. Filter out any resulting empty strings.
    return fullInputString.trim().split("\n").filter(line => line.length > 0);
}

// Obtain all processed input lines.
let processedInputLines = retrieveRawInputLines();

// Initialize a cursor to keep track of the current line being processed.
// This allows sequential consumption of input without modifying the array.
let currentInputLineCursor = 0;

/**
 * Parses the next line from the input array as an integer and advances the cursor.
 * Includes basic validation to prevent reading beyond available lines.
 * @param {string[]} linesArray - The array of input lines.
 * @returns {number} The parsed integer value of the current line.
 * @throws {Error} If an attempt is made to read beyond the end of the input lines.
 */
function extractNextIntegerLine(linesArray) {
    if (currentInputLineCursor >= linesArray.length) {
        // Implement a guard clause for robust input handling.
        throw new Error("Input line cursor out of bounds: No more lines to read.");
    }
    // Explicitly convert the string line to a number using the Number constructor.
    const integerValue = Number(linesArray[currentInputLineCursor]);
    currentInputLineCursor++; // Advance the cursor for the next read operation.
    return integerValue;
}

// The very first line contains two space-separated integers: N_SEGMENTS and N_INSTRUCTIONS.
// Parse this line, convert parts to numbers, and store them.
const initialConfigValues = processedInputLines[currentInputLineCursor].split(" ").map(Number);
currentInputLineCursor++; // Move the cursor past the configuration line.

// Destructure the configuration values for better readability.
const totalSegmentCount = initialConfigValues[0]; // Represents 'm' from original code.
const totalInstructionCount = initialConfigValues[1]; // Represents 'n' from original code.

// Allocate an array to hold the numeric values of the segments.
// These are the values that will be accumulated during movement.
const segmentNumericValues = [];

// Populate the segment values array. There are (totalSegmentCount - 1) such values.
// Using a standard 'for' loop for clear iteration over indices.
for (let segmentIdx = 0; segmentIdx < totalSegmentCount - 1; segmentIdx++) {
    segmentNumericValues.push(extractNextIntegerLine(processedInputLines));
}

// Allocate an array to hold the movement instruction values.
// These dictate how many steps to take and in which direction.
const movementInstructionValues = [];

// Populate the movement instructions array. There are 'totalInstructionCount' instructions.
for (let instructionIdx = 0; instructionIdx < totalInstructionCount; instructionIdx++) {
    movementInstructionValues.push(extractNextIntegerLine(processedInputLines));
}

// Initialize the primary accumulator for the total sum and the current position index.
// The 'currentTraversalIndex' tracks our position within the 'segmentNumericValues' array.
let overallAccumulatedSum = 0;
let currentTraversalIndex = 0; // Starts at index 0.

// Iterate through each movement instruction provided.
// Using a 'for...of' loop for elegant iteration over array elements.
for (const individualInstructionStep of movementInstructionValues) {
    // Determine the direction multiplier based on the sign of the instruction.
    // +1 for forward movement, -1 for backward movement.
    const traversalDirection = individualInstructionStep > 0 ? 1 : -1;

    // Calculate the absolute number of steps to perform for this instruction.
    const absoluteStepsToTake = Math.abs(individualInstructionStep);

    // Execute the required number of steps as indicated by the current instruction.
    // This loop replaces the more cryptic 'while(v--)' pattern.
    for (let stepCounter = 0; stepCounter < absoluteStepsToTake; stepCounter++) {
        // Apply the core logic for accumulating values based on traversal direction.
        if (traversalDirection === 1) { // Moving forward
            // Add the value of the segment at the *current* position before moving.
            overallAccumulatedSum += segmentNumericValues[currentTraversalIndex];
            currentTraversalIndex++; // Advance one step forward.
        } else { // TraversalDirection === -1, moving backward
            currentTraversalIndex--; // Move one step backward *first*.
            // Then, add the value of the segment at the *newly moved* position.
            overallAccumulatedSum += segmentNumericValues[currentTraversalIndex];
        }

        // Optional Type III addition: Boundary check for currentTraversalIndex.
        // While problem constraints often guarantee valid indices, adding a check
        // enhances robustness for potentially malformed inputs.
        /*
        if (currentTraversalIndex < 0 || currentTraversalIndex >= segmentNumericValues.length) {
            console.error(`Error: Traversal index ${currentTraversalIndex} out of bounds for segments array of length ${segmentNumericValues.length}.`);
            // Depending on desired error handling, one might break, throw, or adjust index.
            // For this clone, we assume valid operations as per original problem.
        }
        */
    }

    // After processing all steps for the current instruction, apply the modulo operation.
    overallAccumulatedSum %= RESULT_MODULO_VALUE;

    // JavaScript's '%' operator can return a negative result if the dividend is negative.
    // To ensure the result is always non-negative (common for modulo in competitive programming),
    // adjust if necessary. This is a Type III update for correctness.
    if (overallAccumulatedSum < 0) {
        overallAccumulatedSum += RESULT_MODULO_VALUE;
    }
}

// Output the final calculated accumulated sum.
console.log(overallAccumulatedSum);