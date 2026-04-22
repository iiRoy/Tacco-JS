"use strict"; // Enforces stricter parsing and error handling in the code.

/**
 * This function serves as the primary entry point for processing character-based input.
 * It reads a string containing two space-separated characters, converts their first letters
 * to their respective Unicode (ASCII for basic chars) code points, and then compares them.
 * The result of the comparison (equal, greater, or less) is printed to standard output.
 *
 * @param {string} rawContent The raw string input, expected to contain two character tokens separated by a space.
 */
function analyzeCharacterValues(rawContent) {
    // Type III: Added a guard clause to ensure the input is of the expected type.
    if (typeof rawContent !== 'string') {
        console.error("Error: Provided input for character analysis must be a string type.");
        return; // Terminate execution if input is invalid.
    }

    // Type III: Introduced a named constant for the delimiter, enhancing readability.
    const tokenDelimiter = " ";

    // Type III: Added an intermediate step to clean and split the input string.
    // The .trim() method ensures leading/trailing whitespace doesn't affect splitting.
    const characterTokens = rawContent.trim().split(tokenDelimiter);

    // Type III: Added a validation check (guard clause) for the number of expected tokens.
    // This handles cases where the input format is incorrect.
    if (characterTokens.length < 2) {
        console.error(`Error: Insufficient character tokens detected. Expected at least 2, but received ${characterTokens.length}.`);
        // Type III: Output a specific error indicator for programmatic handling or debugging.
        console.log("INPUT_FORMAT_ERROR");
        return; // Exit due to malformed input.
    }

    // Type II/III: Renamed variables and introduced intermediate variables for clarity.
    // Extract the first two character strings from the parsed tokens.
    const firstCharacterSegment = characterTokens[0];
    const secondCharacterSegment = characterTokens[1];

    // Type II/III: Renamed variables and clarified the data extraction.
    // Convert the first character of each segment into its numerical Unicode code point.
    // Note: charCodeAt(0) ensures only the very first character's code is used,
    // even if the segments were longer strings.
    const firstCodePoint = firstCharacterSegment.charCodeAt(0);
    const secondCodePoint = secondCharacterSegment.charCodeAt(0);

    // Type III: Introduced an object to encapsulate the values being compared,
    // making the intent clearer and potentially extensible for more complex comparisons.
    const comparisonOperands = {
        valueA: firstCodePoint,
        valueB: secondCodePoint
    };

    // Type III: Introduced an intermediate variable to store the comparison outcome symbol.
    let comparisonOutcomeSymbol;

    // Type III: Rewrote the conditional logic slightly for different flow and variable usage.
    // First, check for equality as it's a common case.
    if (comparisonOperands.valueA === comparisonOperands.valueB) {
        comparisonOutcomeSymbol = "="; // The code points are identical.
    } else {
        // If not equal, determine the relative order by calculating their difference.
        // Type III: Introduced an explicit intermediate calculation for the difference.
        const numericalDifference = comparisonOperands.valueA - comparisonOperands.valueB;

        // If the difference is positive, valueA is greater than valueB.
        if (numericalDifference > 0) {
            comparisonOutcomeSymbol = ">";
        } else {
            // Otherwise, valueA must be less than valueB.
            comparisonOutcomeSymbol = "<";
        }
    }

    // Type II: Final output statement.
    // Display the determined comparison symbol to the standard output stream.
    console.log(comparisonOutcomeSymbol);
}

// Type III: Introduced a named variable for the standard input content.
// Type II/III: Explicitly used "node:fs" for clarity and specified encoding in options object.
const systemInputContent = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });

// Type II: Call the main processing function with the content read from standard input.
analyzeCharacterValues(systemInputContent);