// This module is designed to consume numerical input via standard input (stdin).
// For each valid number provided, it executes a specific iterative calculation,
// accumulating a sum based on products derived from the input number and a sequence of multipliers.

// Define a constant to represent the exclusive upper limit for the intermediate product.
// The original logic included products up to 599 (since 't < 600').
const PRODUCT_EXCLUSIVE_LIMIT = 600;

/**
 * Processes a single line of input, expecting a numerical string,
 * and computes a special sum based on an iterative formula.
 *
 * The calculation involves:
 * 1. Taking an initial numeric value.
 * 2. Iterating with a multiplier starting from 1.
 * 3. In each iteration, calculating an 'intermediate product' (multiplier * initial value).
 * 4. If this 'intermediate product' is less than PRODUCT_EXCLUSIVE_LIMIT,
 *    it calculates a 'term to add' (square of intermediate product * initial value).
 * 5. This 'term to add' is added to a running total.
 * 6. The process continues until the 'intermediate product' reaches or exceeds the limit.
 *
 * @param {string} rawInputContent - The unprocessed string received as a line of input.
 */
function processNumericalSeries(rawInputContent) {
    // First, ensure the input is treated as a string and remove leading/trailing whitespace.
    const cleanedInput = String(rawInputContent || '').trim();

    // Implement a guard clause: if the line is empty after cleaning, skip it.
    if (cleanedInput.length === 0) {
        // console.debug("Skipping an empty or whitespace-only input line."); // Optional debug message
        return;
    }

    // Convert the cleaned string into a floating-point number.
    // This allows for decimal inputs, although the original problem context might imply integers.
    const baseNumericalFactor = parseFloat(cleanedInput);

    // Another guard clause: check if the conversion resulted in an invalid number (NaN)
    // or if the number is zero, which would cause an infinite loop in the calculation.
    if (isNaN(baseNumericalFactor) || baseNumericalFactor === 0) {
        // console.error(`Input "${cleanedInput}" is not a valid non-zero number. Skipping calculation.`); // Optional error logging
        return;
    }

    let finalCumulativeSum = 0; // Initialize the variable that will hold the total sum.
    let currentIterationMultiplier = 1; // Initialize the multiplier, starting from one.

    // Use a 'do-while' loop for a slightly different control flow, ensuring at least one check.
    // The loop's termination condition is checked at the end of each iteration.
    do {
        // Calculate the product for the current iteration.
        const currentIterationProduct = currentIterationMultiplier * baseNumericalFactor;

        // If the current product meets or exceeds the defined limit, terminate the loop.
        if (currentIterationProduct >= PRODUCT_EXCLUSIVE_LIMIT) {
            break; // Exit the loop as the condition for adding terms is no longer met.
        }

        // Calculate the specific term to be added to the sum in this iteration.
        // This is the square of the current product, multiplied by the original base factor.
        const termToInclude = Math.pow(currentIterationProduct, 2) * baseNumericalFactor;

        // Add the calculated term to the running total.
        finalCumulativeSum += termToInclude;

        // Increment the multiplier to prepare for the next iteration.
        currentIterationMultiplier++;

    } while (true); // Loop indefinitely until explicitly broken by the 'if' condition.

    // Output the computed sum to standard output.
    console.log(finalCumulativeSum);
}

// Register an event handler for the 'data' event on the standard input stream.
// This event fires whenever new data is available to be read.
process.stdin.on("data", (incomingDataBuffer) => {
    // Convert the received data buffer into a string.
    // Then, split the string by newline characters to handle multiple input lines in one chunk.
    // Filter out any empty strings that might result from splitting (e.g., a trailing newline).
    const parsedInputLines = String(incomingDataBuffer)
                                .split('\n')
                                .filter(lineItem => lineItem.length > 0);

    // Iterate over each valid line received and process it using the dedicated function.
    // Using forEach is appropriate here as no specific return value from the iteration is needed.
    parsedInputLines.forEach(individualLine => {
        processNumericalSeries(individualLine);
    });
});

// Explicitly resume the standard input stream.
// This is crucial to ensure that the program continues to listen for and receive data
// from stdin, especially in environments where it might otherwise pause or exit.
process.stdin.resume();