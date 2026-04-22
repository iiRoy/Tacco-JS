/*
 * This JavaScript module is designed to consume a single numerical input
 * from standard input, process it through a specific arithmetic algorithm,
 * and then output the computed result to standard output.
 *
 * The core functionality involves iterating through potential divisors of the
 * input number and accumulating a sum based on a derived value,
 * applying a unique exclusion condition.
 */

// A dynamic array to store each line read from the input stream.
const dataLines = [];

// Import the 'readline' core Node.js utility for handling streamed input.
const inputUtility = require('readline');

/**
 * Establishes an interactive interface to facilitate reading input
 * line by line from the standard input (stdin) and directing output
 * to the standard output (stdout). This configuration is standard
 * for console-based applications.
 */
const lineInterface = inputUtility.createInterface({
    input: process.stdin,  // Configures the input source.
    output: process.stdout // Configures the output destination.
});

/**
 * Event handler triggered whenever a new line of text is received
 * from the input stream. Each line is sanitized and appended to
 * our internal data buffer.
 * @param {string} inputString - The raw line of text read from stdin.
 */
lineInterface.on('line', (inputString) => {
    // Clean up leading/trailing whitespace and store the processed line.
    dataLines.push(inputString.trim());
});

/**
 * Event handler invoked when the input stream signals its closure.
 * This is where the primary computational logic is executed, using
 * the collected input data.
 */
lineInterface.on('close', () => {
    // --- Start of Core Application Logic ---

    // Preliminary check: Ensure that at least one line of input was provided.
    if (dataLines.length === 0) {
        console.error("Error: No input data detected. Program requires a single numerical input.");
        process.exit(1); // Terminate with an error status.
    }

    // Extract the first line of input, which is expected to contain the primary number.
    const rawNumericalInput = dataLines[0];
    let mainValue = Number(rawNumericalInput); // Convert the string input to a numerical type.

    // Input Validation: Verify that 'mainValue' is a positive integer.
    if (isNaN(mainValue) || !Number.isInteger(mainValue) || mainValue <= 0) {
        console.error(`Error: Provided input '${rawNumericalInput}' is invalid. Please supply a positive integer.`);
        process.exit(1); // Exit due to malformed input.
    }

    // Initialize an accumulator for the final computed sum.
    let finalTally = 0;

    /*
     * The algorithm calculates a sum based on factors of 'mainValue'.
     * It iterates through potential divisors 'currentDivisor' up to the
     * square root of 'mainValue'. For each 'currentDivisor' that divides
     * 'mainValue' evenly, it determines a 'complementaryDivisor' (mainValue / currentDivisor).
     *
     * A term (complementaryDivisor - 1) is added to 'finalTally',
     * but only if 'currentDivisor' is not equal to this 'calculatedTerm'.
     * This exclusion condition is equivalent to: currentDivisor + 1 !== complementaryDivisor.
     * The loop condition 'currentDivisor * currentDivisor < mainValue' is
     * an optimized way to check 'currentDivisor < Math.sqrt(mainValue)'.
     */

    // Loop through integers starting from 1.
    // The loop continues as long as 'currentDivisor' is less than the square root of 'mainValue'.
    for (let currentDivisor = 1; currentDivisor * currentDivisor < mainValue; currentDivisor++) {
        // Check if 'currentDivisor' is an exact divisor of 'mainValue'.
        if (mainValue % currentDivisor === 0) {
            // If it is a divisor, compute its corresponding paired divisor.
            const complementaryDivisor = mainValue / currentDivisor;

            // Calculate the value that potentially contributes to the sum.
            const calculatedTerm = complementaryDivisor - 1;

            // Apply the specific conditional rule for inclusion in the sum.
            // This prevents adding the term if the smaller divisor 'currentDivisor'
            // is equal to (complementaryDivisor - 1).
            if (currentDivisor !== calculatedTerm) {
                finalTally += calculatedTerm;
            }
        }
    }

    // Present the final accumulated sum to the user via standard output.
    process.stdout.write(`Result for input value ${mainValue}: ${finalTally}\n`);

    // --- End of Core Application Logic ---
});