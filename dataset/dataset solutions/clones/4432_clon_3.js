// This program is designed to calculate the total number of internal intersection points
// within a grid defined by two positive integer dimensions.
// It retrieves these dimensions from the standard input stream.

// Import the necessary Node.js module for file system operations.
const fileInputHandler = require('fs');

// Define a constant for the decrement value used in dimension adjustments.
// This value is typically 1, as it represents the reduction for internal segments.
const GRID_DIMENSION_ADJUSTMENT = 1;

/**
 * Executes the primary logic of the application:
 * 1. Reads raw input from the standard input.
 * 2. Parses the input to extract two integer dimensions.
 * 3. Validates and processes these dimensions.
 * 4. Calculates the product of the adjusted dimensions.
 * 5. Prints the final result to the console.
 */
function processGridDimensionsAndComputeResult() {
    // Attempt to read the complete content from the standard input file descriptor.
    // The input is expected to be UTF-8 encoded.
    const rawDataBuffer = fileInputHandler.readFileSync('/dev/stdin', 'utf8');

    // Split the raw input content by newline characters.
    // We are interested only in the very first line of input.
    const firstLineOfInput = rawDataBuffer.split('\n')[0];

    // Further split the first line by space characters to obtain individual string tokens.
    // These tokens are expected to represent the two grid dimensions.
    const dimensionStringTokens = firstLineOfInput.split(' ');

    // Declare variables to hold the parsed numeric values of the dimensions.
    // Initialize them with a default value that ensures (default - ADJUSTMENT) is 0.
    let primaryGridExtent = GRID_DIMENSION_ADJUSTMENT;
    let secondaryGridExtent = GRID_DIMENSION_ADJUSTMENT;

    // --- Input Validation and Parsing for the First Dimension ---
    // Check if at least one token is available in the parsed input.
    if (dimensionStringTokens.length > 0) {
        // Parse the first token into an integer. Use base 10 for clarity.
        const parsedPrimaryValue = parseInt(dimensionStringTokens[0], 10);
        // If parsing results in NaN (Not a Number), or if the value is less than 1,
        // default to GRID_DIMENSION_ADJUSTMENT to ensure a non-negative result after subtraction.
        primaryGridExtent = (isNaN(parsedPrimaryValue) || parsedPrimaryValue < 1) ? GRID_DIMENSION_ADJUSTMENT : parsedPrimaryValue;
    }

    // --- Input Validation and Parsing for the Second Dimension ---
    // Check if at least two tokens are available in the parsed input.
    if (dimensionStringTokens.length > 1) {
        // Parse the second token into an integer. Use base 10.
        const parsedSecondaryValue = parseInt(dimensionStringTokens[1], 10);
        // Similar validation for the second dimension.
        secondaryGridExtent = (isNaN(parsedSecondaryValue) || parsedSecondaryValue < 1) ? GRID_DIMENSION_ADJUSTMENT : parsedSecondaryValue;
    }

    // Calculate the adjusted primary factor. This represents the number of internal segments along one axis.
    // We use Math.max(0, ...) to ensure the factor is never negative, even if input was 0 or 1.
    const adjustedPrimaryFactor = Math.max(0, primaryGridExtent - GRID_DIMENSION_ADJUSTMENT);

    // Calculate the adjusted secondary factor. This represents the number of internal segments along the other axis.
    const adjustedSecondaryFactor = Math.max(0, secondaryGridExtent - GRID_DIMENSION_ADJUSTMENT);

    // The final result is the product of these two adjusted factors.
    // This product gives the total count of internal grid cells.
    const finalCalculatedCount = adjustedPrimaryFactor * adjustedSecondaryFactor;

    // Output the computed result to the standard output stream.
    console.log(finalCalculatedCount);
}

// Invoke the main function to start the computation.
processGridDimensionsAndComputeResult();