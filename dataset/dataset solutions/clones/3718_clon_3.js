// This JavaScript module is designed to compute a numeric balance based on a sequence of characters.
// It assigns a specific value for a designated character and another for all others,
// then sums these values to produce a final tally.

/**
 * Calculates the net value of a given character sequence.
 * The function treats occurrences of a specific character as decrements
 * and all other characters as increments.
 *
 * @param {string} inputSequence - The string of characters to process.
 * @returns {number} The final calculated balance. Returns 0 for invalid input.
 */
function calculateNetValue(inputSequence) {
    // Initialize an accumulator for the total balance.
    let finalBalance = 0;

    // Define the character that will cause a decrement in the balance.
    const DECREMENT_INDICATOR_CHAR = '-';

    // Perform an initial validation on the input to ensure it's a usable string.
    // If the input is not a string or is null, a warning is logged, and a default balance is returned.
    if (typeof inputSequence !== 'string' || inputSequence === null) {
        // A simple error log for robustness, though the problem context might not require it.
        console.error("Processing Warning: Received invalid input type. Expected a string.");
        return 0; // Return zero balance for non-string or null inputs.
    }

    // Convert the input string into an array of individual characters.
    // This allows for easier iteration over each character.
    const characterArray = Array.from(inputSequence);

    // Iterate through each character in the prepared array.
    characterArray.forEach((currentSymbol) => {
        let impactValue = 0; // A temporary variable to hold the impact of the current symbol.

        // Determine if the current symbol matches the decrement indicator.
        // If it does, the impact is negative; otherwise, it's positive.
        if (currentSymbol === DECREMENT_INDICATOR_CHAR) {
            impactValue = -1; // Decrement the balance.
        } else {
            impactValue = 1;  // Increment the balance for any other character.
        }
        
        // Add the calculated impact value to the running total.
        finalBalance += impactValue;
    });

    // Return the accumulated balance after processing all characters.
    return finalBalance;
}

/**
 * This is the primary entry point for the application's execution flow.
 * It orchestrates reading the raw input, processing it, and outputting the result.
 *
 * @param {string} rawInputString - The entire input data received, typically from stdin.
 */
function applicationEntryPoint(rawInputString) {
    // Call the core logic function to compute the desired numerical outcome.
    const processedResult = calculateNetValue(rawInputString);

    // Format the numerical result into a string, ensuring a newline character
    // is appended for proper output display in terminal environments.
    const formattedOutputMessage = String(processedResult) + '\n';

    // Write the final formatted message to the standard output stream.
    process.stdout.write(formattedOutputMessage);
}

// The following section is standard boilerplate code for competitive programming environments.
// It ensures that the script correctly reads input from standard input (stdin)
// and passes it to the main application function. This part should not be altered.
applicationEntryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));
// For local debugging or testing with a file:
// applicationEntryPoint(require('fs').readFileSync('./sample_data.txt', 'utf-8'));