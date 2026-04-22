// This module defines a core function to process input and calculate a derived area.
// It aims to determine a 'net' or 'remaining' area based on two sets of dimensions provided as string input.

/**
 * Parses a string line containing two space-separated numbers into an array of integers.
 * Includes basic validation to ensure the input format is correct and values are numeric.
 *
 * @param {string} lineContent - The string containing two numeric dimensions.
 * @param {number} lineIndex - The 0-based index of the line being processed, for error reporting.
 * @returns {number[]} An array containing two parsed integer dimensions. Returns [0, 0] on parsing errors.
 */
const parseDimensionsFromLine = (lineContent, lineIndex) => {
    // Remove leading/trailing whitespace and split the string by space.
    const dimensionParts = lineContent.trim().split(" ");

    // Validate that exactly two parts were found.
    if (dimensionParts.length !== 2) {
        console.error(`Processing Error: Line ${lineIndex + 1} does not contain precisely two space-separated values. Found: ${dimensionParts.length} parts.`);
        return [0, 0]; // Return default values to prevent further errors.
    }

    // Convert string parts to integers using base 10.
    const firstDimension = parseInt(dimensionParts[0], 10);
    const secondDimension = parseInt(dimensionParts[1], 10);

    // Validate that both parsed values are indeed numbers.
    if (isNaN(firstDimension) || isNaN(secondDimension)) {
        console.error(`Processing Error: Non-numeric dimensions detected on line ${lineIndex + 1}. Raw values: "${dimensionParts[0]}", "${dimensionParts[1]}".`);
        return [0, 0]; // Return default values.
    }

    return [firstDimension, secondDimension];
};

/**
 * Calculates a derived area based on two pairs of dimensions.
 * The formula used is (PrimaryHeight - SecondaryHeight) * (PrimaryWidth - SecondaryWidth).
 *
 * @param {string} fullInputString - The complete raw input string, expected to have two lines.
 * @returns {number} The calculated area. Logs the result to console.
 */
function computeEffectiveArea(fullInputString) {
    // Split the entire input string into individual lines.
    // .filter(Boolean) removes any empty strings resulting from extra newlines.
    const processedLines = fullInputString.split("\n").filter(Boolean);

    // Implement a guard clause to ensure sufficient input lines are present.
    if (processedLines.length < 2) {
        console.error("Input Data Error: Expected at least two lines of dimensions for calculation. Received fewer.");
        // Output a default or error value if input is insufficient.
        console.log(0);
        return 0;
    }

    // Parse the first line to get the primary object's dimensions.
    // Using descriptive names for clarity.
    const [primaryObjectHeight, primaryObjectWidth] = parseDimensionsFromLine(processedLines[0], 0);

    // Parse the second line to get the secondary object's dimensions.
    const [secondaryObjectHeight, secondaryObjectWidth] = parseDimensionsFromLine(processedLines[1], 1);

    // Calculate the difference in height and width.
    // These are intermediate steps making the final calculation more readable.
    const heightDifference = primaryObjectHeight - secondaryObjectHeight;
    const widthDifference = primaryObjectWidth - secondaryObjectWidth;

    // Compute the final result using the derived differences.
    const resultingArea = heightDifference * widthDifference;

    // Output the final computed area to the standard output.
    // A separate function could be used for more complex output formatting.
    console.log(resultingArea);

    // Return the calculated value for potential further use or testing.
    return resultingArea;
}

// This block handles the standard input/output operations for the program.
// It reads all data from standard input and passes it to the main processing function.
// This structure is common in competitive programming environments.
(function initiateProcessing() {
    try {
        // Read the entire content of the standard input stream as a UTF-8 string.
        const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

        // Invoke the main calculation function with the received input.
        // The function itself handles logging the result.
        computeEffectiveArea(stdinContent);
    } catch (errorDetails) {
        // Basic error handling for file system operations or unexpected issues.
        console.error("An error occurred during input reading or processing:", errorDetails.message);
        console.log(0); // Output a default value in case of unhandled exceptions.
    }
})();