// Import the necessary file system module for input operations.
const fileSystemUtility = require("fs");

// Define the standard input file path.
const standardInputPath = "/dev/stdin";

// Read the raw textual content from the specified input path.
// The content is assumed to be encoded in UTF-8 format.
let sourceDataBuffer = fileSystemUtility.readFileSync(standardInputPath, "utf8");

// Pre-process the raw input: remove any leading or trailing whitespace
// from the entire string to ensure cleaner segment parsing.
sourceDataBuffer = sourceDataBuffer.trim();

// Implement a basic validation check: if the source data is empty after trimming,
// it indicates an issue with the input, so an error message is displayed, and the process exits.
if (!sourceDataBuffer) {
    console.error("Execution Aborted: No valid content was received from the standard input.");
    process.exit(1); // Terminate with an error code.
}

// Split the processed source data into individual segments based on space characters.
// Additionally, each segment is trimmed to remove any internal leading/trailing whitespace.
const inputSegments = sourceDataBuffer.split(' ').map(part => part.trim());

// Another critical validation step: ensure that there are at least two segments available
// for the comparison operation. If not, output an error and exit.
if (inputSegments.length < 2) {
    console.error("Execution Aborted: Insufficient input segments for comparison. Expected at least two distinct parts.");
    process.exit(1);
}

// Extract the first two segments into dedicated, descriptive variables for clarity.
const primarySegment = inputSegments[0];
const secondarySegment = inputSegments[1];

// A variable to store the resulting comparison symbol.
let comparisonSymbol;

/**
 * Determines the lexicographical relationship between two string values.
 * This helper function encapsulates the core comparison logic.
 * @param {string} leftVal - The first string value to compare.
 * @param {string} rightVal - The second string value to compare.
 * @returns {string} A single character ('=', '<', or '>') representing the outcome.
 */
function evaluateStringRelationship(leftVal, rightVal) {
    // Check for strict equality first.
    if (leftVal === rightVal) {
        return '=';
    }
    // If not equal, check if the left value is lexicographically greater than the right.
    // The order of these checks can vary without changing the functional outcome,
    // but this arrangement prioritizes the 'greater than' scenario after equality.
    else if (leftVal > rightVal) {
        return '>';
    }
    // If neither equal nor greater, the left value must be lexicographically less than the right.
    else {
        return '<';
    }
}

// Utilize the helper function to compute the comparison result for our segments.
comparisonSymbol = evaluateStringRelationship(primarySegment, secondarySegment);

// Output the final determined comparison symbol to the console.
console.log(comparisonSymbol);