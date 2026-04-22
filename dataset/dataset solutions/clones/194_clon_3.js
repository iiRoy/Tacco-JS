// This module processes numerical inputs from standard input,
// classifying them into various weight categories based on predefined thresholds.
// This implementation represents a Type III clone, featuring extensive structural
// and lexical modifications from an original, simpler version.

// Import the necessary file system functionality from Node.js core.
const fileSystemAccessUtility = require("fs");

// Define constants for the input source path and the character encoding.
// These replace hardcoded string literals for better maintainability and clarity.
const standardInputSourceIdentifier = "/dev/stdin";
const characterEncodingScheme = "utf8";

/**
 * Categorizes a given numerical weight value into a specific class.
 * This function replaces a long, nested ternary expression with a more
 * readable and maintainable if-else if ladder, improving code clarity.
 *
 * @param {number} inputWeightMeasurement - The numerical weight to be classified.
 * @returns {string} The determined weight category or an indicator for unclassifiable data.
 */
function determineWeightCategory(inputWeightMeasurement) {
    // Implement robust input validation as a guard clause.
    // This checks if the input is a valid positive number, preventing errors
    // and providing clear feedback for malformed data.
    if (typeof inputWeightMeasurement !== 'number' || isNaN(inputWeightMeasurement) || inputWeightMeasurement <= 0.0) {
        return "Unclassifiable Data Point"; // A specific string for invalid inputs.
    }

    // Apply the classification logic using a series of conditional checks.
    // Each condition checks for a specific range, ordered from highest to lowest.
    if (inputWeightMeasurement > 91.0) {
        return 'Super Heavyweight'; // Slightly altered category names for variation.
    } else if (inputWeightMeasurement > 81.0) {
        return 'Cruiserweight';
    } else if (inputWeightMeasurement > 75.0) {
        return 'Super Middleweight';
    } else if (inputWeightMeasurement > 69.0) {
        return 'Light Middleweight';
    } else if (inputWeightMeasurement > 64.0) {
        return 'Welterweight';
    } else if (inputWeightMeasurement > 60.0) {
        return 'Light Welterweight';
    } else if (inputWeightMeasurement > 57.0) {
        return 'Lightweight';
    } else if (inputWeightMeasurement > 54.0) {
        return 'Featherweight';
    } else if (inputWeightMeasurement > 51.0) {
        return 'Bantamweight';
    } else if (inputWeightMeasurement > 48.0) {
        return 'Flyweight';
    } else {
        // This is the default category for all weights less than or equal to 48.0.
        return 'Light Flyweight';
    }
}

// Read the entire content synchronously from the standard input source.
// The raw content is stored in a dedicated variable.
const entireInputContentBuffer = fileSystemAccessUtility.readFileSync(standardInputSourceIdentifier, characterEncodingScheme);

// Process the raw input:
// 1. Split the buffer content by one or more whitespace characters using a regular expression.
//    This is more robust than splitting by a single space or generic `\s`.
// 2. Filter out any resulting empty strings or strings containing only whitespace,
//    ensuring that only meaningful numerical tokens are processed.
const filteredNumericalTokens = entireInputContentBuffer
    .split(/[\s]+/) // Renamed the 'split' operation conceptually.
    .filter(tokenSegment => tokenSegment.trim().length > 0); // Explicit filtering logic.

// Iterate over each valid numerical token obtained from the input.
// A traditional 'for' loop is used here instead of 'forEach' for structural variation.
for (let tokenIndex = 0; tokenIndex < filteredNumericalTokens.length; tokenIndex++) {
    const currentInputString = filteredNumericalTokens[tokenIndex]; // Introduce a helper variable.

    // Convert the string token to a floating-point number.
    // Using `parseFloat` offers flexibility for decimal inputs.
    const parsedNumericWeight = parseFloat(currentInputString);

    // Call the dedicated classification function with the parsed numerical value.
    const resultingWeightClassification = determineWeightCategory(parsedNumericWeight);

    // Display the classification result only if it's a valid category.
    // This implicitly handles and skips "Unclassifiable Data Point" entries.
    if (resultingWeightClassification !== "Unclassifiable Data Point") {
        console.log(resultingWeightClassification);
    }
    // An alternative could be to log a warning for unclassifiable data:
    // else {
    //     console.warn(`Skipping malformed input: "${currentInputString}"`);
    // }
}

// The script concludes after processing all input tokens.