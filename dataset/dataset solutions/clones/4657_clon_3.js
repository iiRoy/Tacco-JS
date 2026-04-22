const STDIN_SOURCE_PATH = '/dev/stdin';

const fileSystemHandler = require('fs');

/**
 * Reads the raw input string from the specified standard input path,
 * processes it, and extracts two numeric values. This function
 * includes robust error handling and validation for input.
 *
 * @returns {Array<number>} An array containing two parsed numeric values.
 * @throws {Error} If the input file cannot be read or if critical parsing fails.
 */
function obtainNumericInputs() {
    let rawContentOfFile;
    try {
        // Attempt to synchronously read the content of the standard input file
        rawContentOfFile = fileSystemHandler.readFileSync(STDIN_SOURCE_PATH, 'utf8');
    } catch (readOperationError) {
        // Log the specific error and then throw a more general one for upstream handling
        console.error("Input Acquisition Error: Failed to read from standard input path.", readOperationError.message);
        throw new Error("Critical error: Cannot acquire initial input data.");
    }

    // Extract the very first line from the raw content, as per typical competitive programming format
    const firstInputLine = rawContentOfFile.split('\n')[0];

    // Implement a guard clause for empty or purely whitespace input lines
    if (!firstInputLine || firstInputLine.trim() === '') {
        console.warn("Warning: The primary input line was empty or contained only whitespace. Defaulting to '0 0'.");
        return [0, 0]; // Return default values to prevent further errors
    }

    // Split the relevant line by spaces to separate potential numeric strings
    const stringParts = firstInputLine.split(' ');

    // Validate that we have sufficient parts to extract two numbers
    if (stringParts.length < 2) {
        console.error(`Input Parsing Error: Expected at least two numeric components, but found ${stringParts.length}.`);
        // Attempt to parse what's available, defaulting to zero for missing parts
        const parsedFirst = Number(stringParts[0]) || 0;
        return [parsedFirst, 0];
    }

    // Convert the first two string components into actual numbers
    // Using `shift()` modifies the array, which is acceptable here as we only need the first two.
    const firstExtractedNumber = Number(stringParts.shift());
    const secondExtractedNumber = Number(stringParts.shift());

    // Perform validation to ensure the conversions resulted in valid numbers
    let validatedFirstValue = isNaN(firstExtractedNumber) ? 0 : firstExtractedNumber;
    let validatedSecondValue = isNaN(secondExtractedNumber) ? 0 : secondExtractedNumber;

    if (isNaN(firstExtractedNumber) || isNaN(secondExtractedNumber)) {
        console.warn(`Input Validation Warning: One or both input values were not valid numbers. Defaulting to zero for invalid entries. (Received: ${firstExtractedNumber}, ${secondExtractedNumber})`);
    }

    // Return the validated numeric values
    return [validatedFirstValue, validatedSecondValue];
}

/**
 * Performs a specific arithmetic calculation on two numeric operands.
 * This calculation mimics a 24-hour cycle where a sum of 24 results in 24,
 * and sums greater than 24 wrap around (e.g., 25 becomes 1).
 *
 * @param {number} inputValA The first numeric operand for the sum.
 * @param {number} inputValB The second numeric operand for the sum.
 * @returns {number} The final calculated result after applying the conditional logic.
 */
function calculateAdjustedTimeSum(inputValA, inputValB) {
    // Define a constant for the cycle threshold, improving readability
    const CYCLE_BOUNDARY = 24;

    // Compute the initial, unadjusted sum of the two input values
    const rawTotalSum = inputValA + inputValB;

    let finalComputedValue;

    // Apply the conditional logic based on the raw total sum
    if (rawTotalSum > CYCLE_BOUNDARY) {
        // If the sum exceeds the boundary, subtract the boundary to "wrap around"
        finalComputedValue = rawTotalSum - CYCLE_BOUNDARY;
    } else {
        // Otherwise, the sum itself is the final value
        finalComputedValue = rawTotalSum;
    }

    // Return the result of the time-like calculation
    return finalComputedValue;
}

// --- Primary Execution Block ---
(function executeProgram() {
    try {
        // Step 1: Safely retrieve the two numeric inputs using our dedicated function
        const [numOperand1, numOperand2] = obtainNumericInputs();

        // Step 2: Perform the core calculation with the obtained operands
        const finalOutputValue = calculateAdjustedTimeSum(numOperand1, numOperand2);

        // Step 3: Output the final result to the standard output stream
        // Using process.stdout.write for direct output, ensuring a newline character.
        process.stdout.write(`${finalOutputValue}\n`);

    } catch (programExecutionError) {
        // Centralized error handling for any unmanaged exceptions during execution
        console.error("Program Termination Error: An unexpected issue occurred.", programExecutionError.message);
        // Exit the process with a non-zero code to indicate an error state
        process.exit(1);
    }
})(); // Immediately Invoked Function Expression (IIFE) to encapsulate execution