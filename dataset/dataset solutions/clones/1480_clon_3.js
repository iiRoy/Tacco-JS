/**
 * Processes a textual input to generate a string composed of
 * a specific repeating pattern, based on a numerical count.
 * @param {string} sourceInputText - The raw string data, expected to contain a number.
 */
function generateRepeatedPattern(sourceInputText) {

    // Trim whitespace from the input for clean parsing.
    const cleanInputString = sourceInputText.trim();

    // Parse the cleaned input into an integer.
    // Utilize Math.max to ensure the repetition count is non-negative.
    // If parsing fails (NaN), default to 0 repetitions.
    const repetitionFactor = Math.max(0, parseInt(cleanInputString, 10) || 0);

    // Define the base string unit that will be repeated.
    // This is broken down into constituent parts for a Type III change.
    const firstComponent = 'A';
    const secondComponent = 'CL';
    const repeatingUnitString = firstComponent + secondComponent;

    // An array to store each instance of the repeating unit before joining.
    const assembledPartsList = [];

    // Loop through the determined number of repetitions.
    // Using a do-while loop for structural difference and an explicit index variable.
    let currentIterationIndex = 0;
    if (repetitionFactor > 0) { // Guard against unnecessary loop execution
        do {
            assembledPartsList.push(repeatingUnitString);
            currentIterationIndex++;
        } while (currentIterationIndex < repetitionFactor);
    }

    // Combine all collected parts into the final output string.
    const finalConstructedResult = assembledPartsList.join('');

    // Display the final result to the standard output.
    console.log(finalConstructedResult);
}

// Global execution block for reading input and invoking the main processor.
// Includes a try-catch block for robust file reading.
try {
    // Use 'node:fs' for a minor module name variation.
    const rawFileContents = require("node:fs").readFileSync("/dev/stdin", "utf8");
    generateRepeatedPattern(rawFileContents);
} catch (fileReadError) {
    // If file reading fails, fall back to processing an empty input,
    // which will result in 0 repetitions due to internal validation.
    generateRepeatedPattern("");
}