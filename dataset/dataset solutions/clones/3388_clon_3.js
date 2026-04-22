const ODD_PARITY_MESSAGE = "first";
const EVEN_PARITY_MESSAGE = "second";
const PARITY_CALCULATION_MODULO = 2;

/**
 * Handles the primary processing of incoming data from a source.
 * This function orchestrates parsing, calculation, and output.
 * @param {string} rawInputString - The raw string data received, typically from standard input.
 */
function ProcessInputDataset(rawInputString) {
    // Ensure the input is a valid string and not empty after trimming.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        // In a competitive programming context, empty input might lead to default behavior
        // or an error. For this clone, we'll output the even parity message.
        console.log(EVEN_PARITY_MESSAGE);
        return;
    }

    // Inner helper function to safely parse the raw string into an array of numbers.
    const extractNumericalSequence = (textFragment) => {
        // Split the string by newline characters to get individual lines.
        const lineSegments = textFragment.split('\n');
        // Map each segment to a number, trimming whitespace, and filter out any non-numeric results.
        const parsedNumbers = lineSegments
            .map(segment => Number(segment.trim()))
            .filter(value => !isNaN(value)); // Keep only valid numbers.
        return parsedNumbers;
    };

    let numericDataPoints = extractNumericalSequence(rawInputString);

    // If no valid numbers were extracted, default to even parity output.
    if (numericDataPoints.length === 0) {
        console.log(EVEN_PARITY_MESSAGE);
        return;
    }

    // The problem statement often includes an initial count 'N' which is not part of the sum.
    // We mimic the original behavior of discarding the very first element from the sequence.
    const initialDiscardedElement = numericDataPoints.shift();

    // Calculate the overall parity (sum modulo 2) of the remaining numbers.
    const finalComputedParity = determineAggregateParity(numericDataPoints);

    // Based on the calculated parity, print the appropriate message.
    if (finalComputedParity === 1) { // If the sum is odd
        console.log(ODD_PARITY_MESSAGE);
    } else { // If the sum is even (or 0)
        console.log(EVEN_PARITY_MESSAGE);
    }
}

/**
 * Calculates the parity (0 for even, 1 for odd) of the sum of numbers in a given list.
 * This is equivalent to (element1 + element2 + ... + elementN) % 2.
 * @param {number[]} numberSequence - An array of numerical values for which to calculate the sum's parity.
 * @returns {number} - Returns 0 if the sum is even, or 1 if the sum is odd. Defaults to 0 for invalid input.
 */
function determineAggregateParity(numberSequence) {
    let runningParityState = 0; // Initialize parity tracker to 0 (even).

    // Perform a quick validation to ensure the input is an array.
    if (!Array.isArray(numberSequence)) {
        console.error("Error: Input for parity determination must be an array of numbers.");
        return 0; // Return default even parity on invalid input.
    }

    // Iterate through each numeric value in the provided sequence.
    for (const individualValue of numberSequence) {
        // Only process valid numbers. Skip anything that's not a number or is NaN.
        if (typeof individualValue === 'number' && !isNaN(individualValue)) {
            // Update the running parity state.
            // XORing with the modulo 2 of the current value is an efficient way to track parity.
            // Math.abs is used to handle potential negative numbers gracefully, as parity is usually
            // concerned with the absolute value's odd/even property in this context.
            runningParityState ^= (Math.abs(individualValue) % PARITY_CALCULATION_MODULO);
        }
    }

    return runningParityState; // The final 0 or 1 representing the sum's parity.
}

// The standard entry point for execution in a typical competitive programming setup.
// Reads the entire content of standard input, trims it, and passes it to the main processing function.
ProcessInputDataset(require("fs").readFileSync("/dev/stdin", "utf8").trim());