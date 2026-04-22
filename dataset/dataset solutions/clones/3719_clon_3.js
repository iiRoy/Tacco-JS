/**
 * This module provides a specialized function to analyze a string
 * representing a sequence of operations and compute a net balance.
 * It primarily focuses on the first line of the input data.
 */

/**
 * Calculates the final balance resulting from a series of symbolic operations.
 * It parses the first line of the provided string data, treating each '+' character
 * as an increment and any other character as a decrement.
 *
 * @param {string} sourceContent - The raw string data, potentially containing multiple lines.
 *                                 Only the first line will be processed.
 * @returns {number} The computed net balance (total increments minus total decrements).
 *                   Returns 0 if the input string is empty or contains no processable symbols.
 */
function evaluateSymbolSequence(sourceContent) {
    // --- Phase 1: Input Normalization and Preliminary Checks ---

    // Ensure the input string is not null, undefined, or merely whitespace.
    // If it is, there are no operations to perform, so the balance is zero.
    if (!sourceContent || sourceContent.trim().length === 0) {
        return 0;
    }

    // Extract the initial line from the complete content.
    // This ensures we only process the relevant part for the balance calculation.
    const firstOperationalLine = sourceContent.split('\n')[0];

    // If the first line itself is empty after trimming, there's nothing to process.
    if (firstOperationalLine.trim().length === 0) {
        return 0;
    }

    // Convert the significant line into a collection of distinct characters.
    // This allows for individual character inspection and counting.
    const characterTokens = Array.from(firstOperationalLine);

    // --- Phase 2: Iterative Counting of Operations ---

    // Utilize the 'reduce' array method to iterate through each character token
    // and aggregate the counts of positive and negative operations.
    const operationCounts = characterTokens.reduce((accumulator, currentToken) => {
        // Check if the current token represents an 'add' operation.
        if (currentToken === '+') {
            // If it's a '+', increment the count for positive contributions.
            accumulator.positiveContributions += 1;
        } else {
            // For any other character, consider it a 'subtract' operation.
            accumulator.negativeContributions += 1;
        }
        // Pass the updated accumulator to the next iteration.
        return accumulator;
    }, { positiveContributions: 0, negativeContributions: 0 }); // Initialize counts to zero.

    // --- Phase 3: Final Balance Computation ---

    // Calculate the ultimate net effect by subtracting the total negative
    // contributions from the total positive contributions.
    const finalCalculatedBalance = operationCounts.positiveContributions - operationCounts.negativeContributions;

    // Deliver the resultant balance.
    return finalCalculatedBalance;
}

// --- Program Execution Entry Point ---

// This block handles the interaction with the environment,
// reading input and displaying the processed output.
try {
    // Attempt to read all data from the standard input stream synchronously.
    // Specifying 'utf8' encoding is crucial for correct text interpretation.
    const systemInputData = require("fs").readFileSync("/dev/stdin", "utf8");

    // Invoke our primary function with the data read from standard input.
    // The result represents the net balance of operations.
    const computedNetResult = evaluateSymbolSequence(systemInputData);

    // Output the final computed balance to the standard output.
    console.log(computedNetResult);

} catch (processingError) {
    // If any exception occurs during file reading or function execution,
    // catch it and provide an informative error message to the user
    // via the standard error stream.
    console.error("An operational error occurred:", processingError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
}