// This JavaScript program is designed to process numerical dimension data
// from standard input, identifying specific geometric patterns within each triplet.
// It leverages Node.js file system capabilities for input handling.

// Import the file system module. Using a descriptive alias for clarity.
const fileSystemUtility = require('fs');

/**
 * Initiates the primary analysis workflow: reading input, parsing data,
 * applying pattern recognition logic, and finally reporting the aggregated results.
 * This function orchestrates the entire process.
 * @returns {void}
 */
function executeDimensionalPatternAnalysis() {
    let rawContentBuffer; // Variable to hold the raw input string.

    // Attempt to securely read the input data from the standard input stream.
    // In many environments (like competitive programming platforms), '/dev/stdin'
    // is the conventional path for standard input.
    try {
        rawContentBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    } catch (inputReadError) {
        // Log an error if reading fails and terminate execution gracefully.
        console.error("ERROR: Unable to read data from standard input. Details:", inputReadError.message);
        return; // Exit the function if input cannot be processed.
    }

    // Pre-process the raw input data:
    // 1. Remove any leading or trailing whitespace from the entire block of text.
    // 2. Split the cleaned content into an array of individual lines, using newline characters as delimiters.
    const processedInputLines = rawContentBuffer.trim().split('\n');

    // Initialize dedicated counters for the distinct patterns we are tracking.
    // `countOfPythagoreanTriples` tallies triplets (x, y, z) that satisfy x^2 + y^2 = z^2.
    let countOfPythagoreanTriples = 0;
    // `countOfFirstTwoEqual` tallies triplets (x, y, z) where the first two dimensions, x and y, are identical.
    let countOfFirstTwoEqual = 0;

    // Iterate through each line of the input data using a `for...of` loop,
    // which provides a clean way to access each element of the `processedInputLines` array.
    for (const currentLineString of processedInputLines) {
        // Normalize the current line by trimming whitespace.
        const trimmedCurrentLine = currentLineString.trim();

        // Skip processing if the line is empty after trimming, avoiding parsing errors.
        if (trimmedCurrentLine.length === 0) {
            continue;
        }

        // Divide the line into its constituent string parts based on the comma delimiter.
        const stringComponentArray = trimmedCurrentLine.split(',');

        // Perform a validation check: ensure that exactly three components were found.
        // If not, log a warning and proceed to the next line.
        if (stringComponentArray.length !== 3) {
            console.warn(`[DATA WARNING] Skipping malformed line "${trimmedCurrentLine}". Expected 3 comma-separated values, but found ${stringComponentArray.length}.`);
            continue;
        }

        // Convert the string components into their numeric equivalents.
        // The `Number` constructor function can be directly used with `map` for type conversion.
        const numericDimensionValues = stringComponentArray.map(Number);

        // Another validation step: verify that all converted values are indeed valid numbers.
        // `Number.isNaN` checks if a value is "Not-a-Number". `some()` checks if any element fails this test.
        if (numericDimensionValues.some(Number.isNaN)) {
            console.warn(`[DATA WARNING] Skipping line "${trimmedCurrentLine}" due to non-numeric values present.`);
            continue;
        }

        // Use array destructuring to assign the numeric values to clearly named constants.
        const [dimensionX, dimensionY, dimensionZ] = numericDimensionValues;

        // Calculate the squares of each dimension for the Pythagorean check.
        // The exponentiation operator (**) is used as an alternative to `Math.pow(base, 2)` or `base * base`.
        const squareOfDimensionX = dimensionX ** 2;
        const squareOfDimensionY = dimensionY ** 2;
        const squareOfDimensionZ = dimensionZ ** 2;

        // Apply the primary pattern recognition logic:
        // Check if the sum of the squares of the first two dimensions equals the square of the third.
        // Strict equality (`===`) is used for precise comparison.
        if ((squareOfDimensionX + squareOfDimensionY) === squareOfDimensionZ) {
            countOfPythagoreanTriples++; // Increment the counter for right-angled patterns.
        }
        // If the first condition is not met, check for the secondary pattern:
        // whether the first two dimensions (X and Y) are equal.
        // This `else if` ensures that a triplet is counted for at most one category.
        else if (dimensionX === dimensionY) {
            countOfFirstTwoEqual++; // Increment the counter for patterns with equal first two dimensions.
        }
        // Lines that do not match either of these patterns are simply ignored for counting purposes.
    }

    // Output a summary of the analysis, providing clear and descriptive results.
    // Template literals are employed for easy string interpolation.
    console.log(`\n--- Dimensional Pattern Analysis Summary ---`);
    console.log(`Total patterns identified as Pythagorean triples (X² + Y² = Z²): ${countOfPythagoreanTriples}`);
    console.log(`Total patterns identified with the first two dimensions being equal (X = Y): ${countOfFirstTwoEqual}`);
    console.log(`--------------------------------------------`);
}

// Execute the main analysis function to begin processing.
executeDimensionalPatternAnalysis();