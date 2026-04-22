// This function processes raw input string to determine the number of ways a
// rectangle of specified dimensions can be placed within a square grid.
// It assumes the input provides grid size, rectangle height, and rectangle width
// on separate lines.
function processInputData(rawData) {
    // Step 1: Input validation for the raw data itself.
    // Ensure the input is a non-empty string.
    if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Error: Provided input data is invalid, empty, or not a string.");
        return; // Terminate execution gracefully if input is bad.
    }

    // Step 2: Parse the input string into individual lines.
    // .trim() removes leading/trailing whitespace, including potential final newlines,
    // making the split more reliable.
    const inputLines = rawData.trim().split('\n');

    // Define the expected number of parameters (grid dimension, rectangle height, rectangle width).
    const REQUIRED_PARAMETER_COUNT = 3;

    // Step 3: Validate the number of lines received.
    // Ensure that all necessary parameters are present in the input.
    if (inputLines.length < REQUIRED_PARAMETER_COUNT) {
        console.error(`Error: Insufficient input parameters. Expected ${REQUIRED_PARAMETER_COUNT}, but received ${inputLines.length}.`);
        console.error("Please provide grid dimension, rectangle height, and rectangle width on separate lines.");
        return; // Terminate if not enough data.
    }

    // Step 4: Extract and parse the numerical values from the input lines.
    // Using parseInt with radix 10 ensures explicit conversion to integer.
    const gridSquareDimension = parseInt(inputLines[0], 10); // Represents 'N'
    const placementHeight = parseInt(inputLines[1], 10);    // Represents 'H'
    const placementWidth = parseInt(inputLines[2], 10);     // Represents 'W'

    // Step 5: Implement a helper for robust numerical validation.
    // Checks if a value is a valid positive integer.
    const validateDimensionValue = (value, name) => {
        if (isNaN(value) || value <= 0) {
            console.error(`Error: Invalid or non-positive value for ${name} detected: '${inputLines[REQUIRED_PARAMETER_COUNT - 3 + inputLines.indexOf(String(value))] || value}'. All dimensions must be positive integers.`);
            return false;
        }
        return true;
    };

    // Step 6: Apply validation to all parsed dimensions.
    // If any dimension is invalid, log an error and exit.
    if (!validateDimensionValue(gridSquareDimension, "Grid Dimension (N)") ||
        !validateDimensionValue(placementHeight, "Rectangle Height (H)") ||
        !validateDimensionValue(placementWidth, "Rectangle Width (W)")) {
        return; // Exit if any validation fails.
    }

    // Step 7: Calculate the number of possible horizontal placement options.
    // A rectangle of width 'W' can be placed at N - W + 1 distinct horizontal start positions
    // within an N-sized grid (assuming 1-based indexing for positions).
    // Math.max(0, ...) ensures the result is never negative, which would happen if W > N.
    // In such cases, there are 0 valid placements.
    const numberOfHorizontalPositions = Math.max(0, gridSquareDimension - placementWidth + 1);

    // Step 8: Calculate the number of possible vertical placement options.
    // Similarly, a rectangle of height 'H' can be placed at N - H + 1 distinct vertical start positions.
    const numberOfVerticalPositions = Math.max(0, gridSquareDimension - placementHeight + 1);

    // Step 9: Determine the total number of unique configurations.
    // The total number of ways is the product of independent horizontal and vertical options.
    const totalUniqueConfigurations = numberOfHorizontalPositions * numberOfVerticalPositions;

    // Step 10: Output the final result to the console.
    console.log(totalUniqueConfigurations);
}

// Main execution block for reading input and invoking the processing logic.
// This pattern is common in environments like Node.js for competitive programming.
try {
    // Attempt to read the entire content of standard input synchronously.
    // '/dev/stdin' is a common path for standard input in Unix-like systems.
    // 'utf8' specifies the character encoding.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Call the primary function to process the data obtained from standard input.
    processInputData(standardInputContent);
} catch (initialError) {
    // Catch and report any errors that occur during the file reading or initial setup phase.
    console.error("An unhandled error occurred during input acquisition or initial processing:", initialError.message);
    // Optionally, provide more details for debugging.
    if (initialError.stack) {
        console.error(initialError.stack);
    }
}