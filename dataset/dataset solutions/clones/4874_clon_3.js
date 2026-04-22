'use strict';

// This module processes a series of cutting operations on a rectangular canvas
// and calculates the area of the remaining valid region.
const computeValidArea = (inputPayloadString) => {

    // --- Input Validation and Preprocessing ---

    // Ensure the input string is not empty or just whitespace.
    if (!inputPayloadString || inputPayloadString.trim() === '') {
        // If no input is provided, there's no canvas, thus no area.
        return 0;
    }

    // A utility function to safely parse a string into an integer.
    // It handles potential non-numeric values by returning 0, and ensures integer values.
    const extractInteger = (valueString) => {
        const parsedNumber = Number(valueString);
        if (isNaN(parsedNumber)) {
            // In a production environment, this might throw an error or log a warning.
            // For competitive programming, returning 0 is a common fallback for invalid data.
            return 0;
        }
        // Ensure integer values by flooring, as coordinates are typically integers.
        return Math.floor(parsedNumber);
    };

    // Split the entire input string into individual lines, removing any leading/trailing whitespace.
    const dataRowStrings = inputPayloadString.trim().split('\n');

    // --- Initial Canvas Dimensions and Operation Count Parsing ---

    // The first line contains the initial width, height, and number of operations.
    const firstRowValues = dataRowStrings[0].split(' ').map(extractInteger);

    // Validate the structure of the first line.
    if (firstRowValues.length < 3) {
        // If the first line doesn't contain enough parameters, the input is malformed.
        return 0;
    }

    // Extract the initial canvas dimensions and the total number of cutting operations.
    let initialWidth = firstRowValues[0];
    let initialHeight = firstRowValues[1];
    const totalOperations = firstRowValues[2];

    // Basic validation for initial canvas dimensions.
    // A canvas with zero or negative dimensions has no area.
    if (initialWidth <= 0 || initialHeight <= 0) {
        return 0;
    }

    // --- Initialize Boundary Coordinates ---

    // Instead of an array of corner objects, we maintain the minimum and maximum
    // X and Y coordinates that define the current active rectangular area.
    let currentMinX = 0;
    let currentMinY = 0;
    let currentMaxX = initialWidth;
    let currentMaxY = initialHeight;

    // --- Process Cutting Operations ---

    // Skip the first line as it's already processed, and iterate through the remaining lines.
    const operationDefinitionRows = dataRowStrings.slice(1);

    // Loop through each cutting operation.
    // We iterate up to `totalOperations` or the available data, whichever is smaller.
    for (let opIndex = 0; opIndex < totalOperations; ++opIndex) {
        // Ensure there is actual data for the current operation index.
        if (opIndex >= operationDefinitionRows.length) {
            // If we run out of operation data before reaching `totalOperations`, stop.
            break;
        }

        const currentOpRow = operationDefinitionRows[opIndex];
        const opParameters = currentOpRow.split(' ').map(extractInteger);

        // Validate the structure of the current operation line.
        if (opParameters.length < 3) {
            // If an operation line is malformed, skip it and continue to the next.
            continue;
        }

        // Extract the X and Y coordinates and the type of cut for the current operation.
        const cutXCoordinate = opParameters[0];
        const cutYCoordinate = opParameters[1];
        const cutInstructionCode = opParameters[2];

        // Apply the cutting logic based on the instruction code.
        // Each case updates either a min or max boundary for X or Y.
        switch (cutInstructionCode) {
            case 1: // Cut along x = cutXCoordinate, keeping the region where x >= cutXCoordinate (right part).
                currentMinX = Math.max(currentMinX, cutXCoordinate);
                break;
            case 2: // Cut along x = cutXCoordinate, keeping the region where x <= cutXCoordinate (left part).
                currentMaxX = Math.min(currentMaxX, cutXCoordinate);
                break;
            case 3: // Cut along y = cutYCoordinate, keeping the region where y >= cutYCoordinate (top part).
                currentMinY = Math.max(currentMinY, cutYCoordinate);
                break;
            case 4: // Cut along y = cutYCoordinate, keeping the region where y <= cutYCoordinate (bottom part).
                currentMaxY = Math.min(currentMaxY, cutYCoordinate);
                break;
            default:
                // If an unknown operation code is encountered, it is ignored.
                // A warning could be logged here in a debug environment.
                break;
        }

        // --- Early Exit Optimization ---
        // If at any point the minimum boundary exceeds or equals the maximum boundary
        // in either dimension, the rectangle has collapsed, and its area is 0.
        // Further operations cannot restore a collapsed rectangle.
        if (currentMinX >= currentMaxX || currentMinY >= currentMaxY) {
            return 0; // Return 0 immediately to save computation.
        }
    }

    // --- Final Area Calculation ---

    // Calculate the effective width and height of the remaining rectangle.
    const effectiveRemainingWidth = currentMaxX - currentMinX;
    const effectiveRemainingHeight = currentMaxY - currentMinY;

    // The area is the product of width and height.
    // If either dimension is non-positive (which should ideally be caught by the early exit,
    // but included here as a final safeguard), the area is 0.
    const finalCalculatedArea = (effectiveRemainingWidth > 0 && effectiveRemainingHeight > 0)
        ? effectiveRemainingWidth * effectiveRemainingHeight
        : 0;

    return finalCalculatedArea;
};

// --- Execution Entry Point ---

// Read the entire input from standard input as a UTF-8 string.
const rawInputStringFromStdin = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the raw input data.
const finalAreaResult = computeValidArea(rawInputStringFromStdin);

// Output the calculated area to standard output.
console.log(finalAreaResult);