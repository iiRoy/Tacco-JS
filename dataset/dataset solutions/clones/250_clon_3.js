const fileOperations = require("fs"); // Import the native Node.js file system module.

/**
 * Parses a string into an integer, ensuring base-10 conversion.
 * This helper function provides a dedicated point for potential future
 * validation or custom parsing logic if requirements evolve.
 * @param {string} inputStringValue - The string representation of a number.
 * @returns {number} The integer value.
 */
function convertToDecimalInteger(inputStringValue) {
    // Ensure the input is treated as a base-10 number.
    // The Number.parseInt function is robust for this use case.
    return Number.parseInt(inputStringValue, 10);
}

let cumulativeTotal = 0; // Initialize the accumulator for the sum.

try {
    // Attempt to read the entire content from the standard input stream.
    // Using '/dev/stdin' is a common convention for standard input on POSIX systems.
    const sourceContent = fileOperations.readFileSync("/dev/stdin", "utf8");

    // Preliminary check: If the input content is empty or just whitespace,
    // we can issue a warning and proceed with a sum of zero.
    if (!sourceContent || sourceContent.trim().length === 0) {
        console.warn("Input stream appears to be empty. No numbers to process.");
        // The cumulativeTotal remains 0, which is correct in this scenario.
    } else {
        // Employ a regular expression to extract all sequences of digits from the content.
        // The 'g' flag ensures that all occurrences are matched, not just the first.
        const digitSequences = sourceContent.match(/\d+/g);

        // Check if any numeric sequences were actually found.
        // If not, the sum should remain zero.
        if (!digitSequences || digitSequences.length === 0) {
            console.warn("No numeric patterns found in the provided input. Sum will be zero.");
        } else {
            // Iterate through each identified sequence of digits.
            // Using a for...of loop for clear, modern iteration.
            for (const currentSequence of digitSequences) {
                // Convert the current digit sequence string into an actual number.
                const numericValue = convertToDecimalInteger(currentSequence);
                // Add the converted number to our running total.
                cumulativeTotal += numericValue;
            }
        }
    }

} catch (processingError) {
    // If any error occurs during file reading or processing, catch it and report.
    console.error(`An unexpected error occurred during input processing: ${processingError.message}`);
    // In a production environment, you might want to exit with an error code.
    process.exit(1);
}

// Display the final calculated sum to the console.
console.log(`The final aggregated sum of all numbers is: ${cumulativeTotal}`);