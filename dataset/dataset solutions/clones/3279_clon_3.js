// This module is designed to calculate the total number of distinct top-left placement coordinates
// for a smaller rectangular object within a larger square grid.
// The input consists of three numerical values: the grid's side length, the object's height,
// and the object's width, all provided as a multi-line string.

/**
 * A dedicated utility to parse a raw string of newline-separated numbers
 * into an array of numerical values. This function ensures robustness by
 * handling potential empty inputs and converting each line to a number.
 *
 * @param {string} textualDataLines - The raw string input, where each line represents a number.
 * @returns {Array<number>} An array containing the parsed numerical values.
 */
const parseNumericLinesIntoArray = (textualDataLines) => {
    // Defensive check: if no input string is provided, return an empty array.
    if (typeof textualDataLines !== 'string' || textualDataLines.length === 0) {
        // For a more critical application, an error might be thrown here.
        return [];
    }

    // Trim any leading or trailing whitespace from the entire input string.
    // Then, split the string into an array of individual line strings.
    // Finally, use the Number constructor as a mapping function to convert
    // each string line into its numerical equivalent.
    const numericCollection = textualDataLines
        .trim()
        .split('\n')
        .map(Number); // Converts each string element to a number

    return numericCollection;
};

/**
 * Calculates the number of unique ways a rectangular object can be positioned
 * within a square grid. The calculation is based on the grid's dimension (N),
 * the object's height (H), and its width (W).
 *
 * The formula used is (N - H + 1) * (N - W + 1), which represents the product
 * of available vertical and horizontal starting positions.
 *
 * @param {string} rawSourceText - The complete input as a string, expected to
 *                                 contain N, H, and W on separate lines.
 * @returns {number} The total count of possible arrangements. Returns 0 if
 *                   input is invalid or if the object cannot fit.
 */
function determineValidPlacementCount(rawSourceText) {
    // Initial validation to ensure the raw input string is not empty or null.
    if (!rawSourceText) {
        console.error("Critical Error: No input data supplied to the calculation function.");
        return 0; // Cannot compute without data.
    }

    // Use the helper function to convert the multi-line input string
    // into an array of numbers. This abstracts the parsing logic.
    const extractedNumericalParameters = parseNumericLinesIntoArray(rawSourceText);

    // Validate that we have exactly three parameters: N, H, W.
    // Any other count indicates malformed input.
    const expectedParameterCount = 3;
    if (extractedNumericalParameters.length !== expectedParameterCount) {
        console.warn(`Input Warning: Expected ${expectedParameterCount} parameters (Grid, Height, Width), but received ${extractedNumericalParameters.length}. Assuming no valid placements.`);
        return 0;
    }

    // Destructure or assign parameters to clearly named constants for readability.
    // This maps the array indices to their conceptual meaning.
    const gridMasterDimension = extractedNumericalParameters[0]; // Represents 'N'
    const objectVerticalExtent = extractedNumericalParameters[1]; // Represents 'H'
    const objectHorizontalExtent = extractedNumericalParameters[2]; // Represents 'W'

    // Further validation: ensure all dimensions are positive.
    // A grid or object with zero or negative dimensions is not physically meaningful.
    if (gridMasterDimension <= 0 || objectVerticalExtent <= 0 || objectHorizontalExtent <= 0) {
        console.warn("Dimension Warning: All grid and object dimensions must be positive integers. Returning 0 placements.");
        return 0;
    }

    // Calculate the number of possible vertical starting positions for the object.
    // This is the grid dimension minus the object's height, plus one.
    // If the object's height exceeds the grid's dimension, this value will be zero or negative.
    const potentialVerticalSpots = gridMasterDimension - objectVerticalExtent + 1;

    // Calculate the number of possible horizontal starting positions for the object.
    // Similarly, this is the grid dimension minus the object's width, plus one.
    // If the object's width exceeds the grid's dimension, this value will be zero or negative.
    const potentialHorizontalSpots = gridMasterDimension - objectHorizontalExtent + 1;

    // Ensure that the number of available spots is not negative.
    // If potential spots are negative (object too large), it effectively means zero spots.
    const actualVerticalSpots = Math.max(0, potentialVerticalSpots);
    const actualHorizontalSpots = Math.max(0, potentialHorizontalSpots);

    // The total number of valid top-left placement coordinates is the product
    // of the actual available vertical and horizontal spots.
    const finalPlacementTally = actualVerticalSpots * actualHorizontalSpots;

    // Return the computed result.
    return finalPlacementTally;
}

// --- Application Entry Point ---

// Define the standard input file path as a constant.
// This is typical for competitive programming environments.
const standardInputSource = "/dev/stdin";

// Utilize Node.js's 'fs' module to synchronously read the content
// of the standard input file. The content is expected to be UTF-8 encoded.
const receivedRawInputString = require("fs").readFileSync(standardInputSource, "utf8");

// Invoke the main calculation function with the obtained raw input string.
// Store the computed result in a descriptive constant.
const computedOverallResult = determineValidPlacementCount(receivedRawInputString);

// Output the final numerical result to the console.
console.log(computedOverallResult);