// Define an alias for the file system module for clarity and potential future changes.
const fileSystemUtility = require("node:fs");

// Define the standard input path as a constant to make it easily configurable.
const standardInputPath = "/dev/stdin";

/**
 * Safely parses a string into a floating-point number.
 * It includes a default value in case parsing fails or the input is invalid.
 * @param {string} inputString - The string to parse.
 * @param {number} [defaultValue=0.0] - The default value to return if parsing fails.
 * @returns {number} The parsed number or the default value.
 */
const parseNumericValue = (inputString, defaultValue = 0.0) => {
    // Attempt to parse the string into a float.
    const parsedValue = parseFloat(inputString);
    // Check if the parsed value is a valid number.
    // If not, return the default value.
    if (isNaN(parsedValue)) {
        // In a production system, one might log a warning here.
        // process.stderr.write(`Warning: Invalid numeric input '${inputString}'. Using default value ${defaultValue}.\n`);
        return defaultValue;
    }
    return parsedValue;
};

/**
 * Calculates the area of a trapezoid given its two parallel bases and perpendicular height.
 * @param {number} baseOne - The length of the first parallel base.
 * @param {number} baseTwo - The length of the second parallel base.
 * @param {number} perpendicularHeight - The perpendicular height of the trapezoid.
 * @returns {number} The calculated area of the trapezoid.
 */
const computeTrapezoidSurfaceArea = (baseOne, baseTwo, perpendicularHeight) => {
    // Intermediate step: calculate the sum of the parallel bases.
    const sumOfBases = baseOne + baseTwo;

    // Another intermediate step: calculate half of the sum.
    const averageBaseLength = sumOfBases / 2.0;

    // Final calculation for the area.
    const areaResult = averageBaseLength * perpendicularHeight;

    return areaResult;
};

// Main execution block.
let inputContentBuffer;
try {
    // Attempt to read the entire content of the standard input file.
    // Specify 'utf8' encoding explicitly for string conversion from the buffer.
    inputContentBuffer = fileSystemUtility.readFileSync(standardInputPath, { encoding: "utf8" });
} catch (readError) {
    // If there's an error reading the file (e.g., file not found, permissions),
    // log it to standard error and exit the process with an error code.
    process.stderr.write(`Error reading input file at '${standardInputPath}': ${readError.message}\n`);
    // Optionally, perform a default calculation or provide a fallback.
    // For this example, we'll just exit.
    process.exit(1);
}

// Process the input content.
// First, remove any leading/trailing whitespace from the entire content string.
// Then, split the content into an array of strings based on newline characters.
const lineSegments = inputContentBuffer.trim().split("\n");

// Type III: Add a guard clause for input validation.
// Ensure that we have at least three lines of input for the two bases and the height.
const MINIMUM_EXPECTED_LINES = 3;
if (lineSegments.length < MINIMUM_EXPECTED_LINES) {
    process.stderr.write(`Error: Insufficient input lines. Expected at least ${MINIMUM_EXPECTED_LINES} lines, but received ${lineSegments.length}.\n`);
    process.exit(1); // Terminate if input is critically malformed.
}

// Extract and parse the numeric values from the input lines.
// Utilize the robust parseNumericValue function for each dimension.
const baseValueOne = parseNumericValue(lineSegments[0], 0.0);         // Corresponds to original 'a'
const baseValueTwo = parseNumericValue(lineSegments[1], 0.0);         // Corresponds to original 'b'
const altitudeMeasurement = parseNumericValue(lineSegments[2], 0.0);  // Corresponds to original 'h'

// Type III: Add a validation fragment for non-negative dimensions.
// Geometric calculations typically expect non-negative lengths.
if (baseValueOne < 0 || baseValueTwo < 0 || altitudeMeasurement < 0) {
    process.stderr.write("Warning: One or more input dimensions are negative. Geometric calculations typically assume non-negative values.\n");
    // Depending on requirements, one might choose to exit here or proceed with the calculation.
    // For this scenario, we proceed, but issue a warning.
}

// Perform the area calculation using the dedicated function.
const finalCalculatedArea = computeTrapezoidSurfaceArea(baseValueOne, baseValueTwo, altitudeMeasurement);

// Output the final result to standard output.
// Use process.stdout.write for direct output, adding a descriptive string.
// Format the output to a fixed number of decimal places for consistency and readability.
process.stdout.write(`The computed trapezoid surface area is: ${finalCalculatedArea.toFixed(3)}\n`);

// End of script execution.