'use strict';

// Primary function to process the input data and calculate the resulting area.
const processInputData = (rawDataString) => {
    // Helper function to parse a string of space-separated numbers into an array of integers.
    // This enhances readability and avoids repetition.
    const parseNumericLine = (lineContent) => {
        // Trim any leading/trailing whitespace from the line and split by space.
        // Then convert each string part to an integer using base 10.
        return lineContent.trim().split(' ').map(strVal => parseInt(strVal, 10));
    };

    // Trim whitespace from the raw input and split it into individual lines.
    const inputLines = rawDataString.trim().split('\n');

    // --- Input Validation and Initial Setup ---

    // Guard clause: If there's no input, the area is zero.
    if (inputLines.length === 0 || inputLines[0].trim() === '') {
        console.log(0);
        return;
    }

    // Parse the first line which contains the initial dimensions and number of constraints.
    const initialParameters = parseNumericLine(inputLines[0]);

    // Ensure the first line has at least 3 values (width, height, num_operations).
    if (initialParameters.length < 3) {
        // In a real application, this might throw an error or log a warning.
        // For competitive programming, we often assume valid input format.
        console.log(0); // Malformed input line implies no valid area.
        return;
    }

    // Extract initial width, height, and count of operations from the parsed parameters.
    const initialCanvasWidth = initialParameters[0];
    const initialCanvasHeight = initialParameters[1];
    const numberOfOperations = initialParameters[2];

    // Initialize the bounding box representing the current valid area.
    // We use min/max coordinates to define the rectangle, which is a common and robust approach.
    let currentMinX = 0;
    let currentMinY = 0;
    let currentMaxX = initialCanvasWidth;
    let currentMaxY = initialCanvasHeight;

    // Early exit if the initial canvas itself has zero or negative dimensions.
    // This is an additional guard clause to handle invalid initial states.
    if (currentMaxX <= currentMinX || currentMaxY <= currentMinY) {
        console.log(0);
        return;
    }

    // --- Parsing Operation Data ---

    // Pre-allocate arrays to store the X, Y coordinates and types of each operation.
    // This is more efficient than repeatedly pushing to dynamic arrays or using multiple maps.
    const operationXCoords = new Array(numberOfOperations);
    const operationYCoords = new Array(numberOfOperations);
    const operationTypes = new Array(numberOfOperations);

    // Determine the actual number of operation lines available in the input,
    // ensuring we don't try to read beyond the end of the `inputLines` array.
    const actualOperationCount = Math.min(numberOfOperations, inputLines.length - 1);

    // Loop through the remaining lines to parse each operation's data.
    for (let opIdx = 0; opIdx < actualOperationCount; opIdx++) {
        const currentOperationLine = parseNumericLine(inputLines[opIdx + 1]);
        // Basic validation for line content, assuming 3 numbers per operation (X, Y, Type).
        if (currentOperationLine.length >= 3) {
            operationXCoords[opIdx] = currentOperationLine[0];
            operationYCoords[opIdx] = currentOperationLine[1];
            operationTypes[opIdx] = currentOperationLine[2];
        } else {
            // If a line is malformed, we could log a warning or simply skip it.
            // For this problem, we'll proceed, assuming valid data for the parsed parts.
            // A more robust solution might handle this as an error.
        }
    }

    // --- Applying Constraints (Cuts) ---

    // Iterate through each constraint to update the bounding box.
    // Each operation effectively 'cuts' a portion of the canvas, shrinking the valid area.
    for (let opIndex = 0; opIndex < actualOperationCount; opIndex++) {
        const operationKind = operationTypes[opIndex];
        const xValue = operationXCoords[opIndex];
        const yValue = operationYCoords[opIndex];

        // Apply the cut based on the operation type using Math.max/min for clarity.
        switch (operationKind) {
            case 1: // Type 1: Cut from the left side. The new minimum X must be at least xValue.
                currentMinX = Math.max(currentMinX, xValue);
                break;
            case 2: // Type 2: Cut from the right side. The new maximum X must be at most xValue.
                currentMaxX = Math.min(currentMaxX, xValue);
                break;
            case 3: // Type 3: Cut from the bottom side. The new minimum Y must be at least yValue.
                currentMinY = Math.max(currentMinY, yValue);
                break;
            case 4: // Type 4: Cut from the top side. The new maximum Y must be at most yValue.
                currentMaxY = Math.min(currentMaxY, yValue);
                break;
            // Default case: handle unexpected operation types.
            default:
                // console.warn(`Unknown operation type encountered: ${operationKind}. Skipping.`);
                break;
        }
    }

    // --- Final Area Calculation ---

    // Calculate the final dimensions of the remaining valid area.
    // If currentMinX has crossed currentMaxX (or vice-versa), the resulting width will be zero or negative.
    const resultingWidth = currentMaxX - currentMinX;
    const resultingHeight = currentMaxY - currentMinY;

    let finalArea = 0; // Initialize the area to zero.

    // If both dimensions are positive, calculate the area.
    // Otherwise, the area is zero (e.g., if the cuts completely eliminated the rectangle).
    if (resultingWidth > 0 && resultingHeight > 0) {
        finalArea = resultingWidth * resultingHeight;
    } else {
        // This block explicitly ensures that if width or height is zero or negative,
        // the final area correctly remains 0.
        finalArea = 0;
    }

    // Output the calculated area to standard output.
    console.log(finalArea);
};

// --- Entry Point for Script Execution ---

// This conditional block ensures that the main processing function is called
// only when the script is executed directly (e.g., `node script.js`),
// and not when it's imported as a module into another script.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        // Read the entire input from standard input as a UTF-8 string.
        const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the raw content to our processing function.
        processInputData(fileContent);
    } catch (error) {
        // Robust error handling for file reading issues.
        console.error("An error occurred while reading input from /dev/stdin:", error.message);
        // Exit with a non-zero code to indicate an error.
        process.exit(1);
    }
} else {
    // This section could be used for exporting the function for testing or module usage.
    // For this context, it's a placeholder for Type III structural addition.
    // For example:
    // module.exports = processInputData;
}