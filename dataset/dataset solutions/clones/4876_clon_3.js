// This function processes a raw string containing coordinate data and operations.
// It determines the final area of a bounding box after applying various constraints.
function calculateEffectiveRegionArea(sourceDataString) {
    // Break down the entire input string into individual lines.
    // Trimming ensures no leading/trailing empty lines affect the split.
    const dataLines = sourceDataString.trim().split("\n");

    // If there are no data lines, we cannot proceed.
    if (dataLines.length === 0) {
        // No input means no area can be determined.
        return 0;
    }

    // The very first line defines the initial dimensions of our conceptual canvas.
    const initialBoundsString = dataLines[0];
    const initialBoundParts = initialBoundsString.split(" ");

    // Basic validation for the initial bounds line. It must contain at least two numbers.
    if (initialBoundParts.length < 2) {
        // Malformed input.
        return 0;
    }

    // Parse the initial maximum X and Y coordinates.
    // Initialize our rectangular region's boundaries.
    let currentRightEdge = parseInt(initialBoundParts[0], 10); // Represents the max X-coordinate
    let currentLeftEdge = 0;                                    // Represents the min X-coordinate
    let currentTopEdge = parseInt(initialBoundParts[1], 10);    // Represents the max Y-coordinate
    let currentBottomEdge = 0;                                  // Represents the min Y-coordinate

    // Define constants for operation types to improve readability and maintainability.
    const OP_ADJUST_LEFT_BOUND = 1;
    const OP_ADJUST_RIGHT_BOUND = 2;
    const OP_ADJUST_BOTTOM_BOUND = 3;
    const OP_ADJUST_TOP_BOUND = 4;

    // Iterate through the subsequent data entries, starting from the second line (index 1).
    // These lines contain operations to modify the region's boundaries.
    for (let currentLineIdx = 1; currentLineIdx < dataLines.length; currentLineIdx++) {
        const lineContent = dataLines[currentLineIdx];

        // Skip empty lines to prevent errors during parsing.
        if (lineContent.trim() === "") {
            continue;
        }

        const coordinateAndOpParts = lineContent.split(" ");

        // Ensure we have all three expected parts: X, Y, and Operation Type.
        if (coordinateAndOpParts.length < 3) {
            // Malformed data line, log a warning and skip it.
            console.warn(`Warning: Skipping malformed data line (insufficient parts): "${lineContent}"`);
            continue;
        }

        // Parse the numerical values from the current line.
        const opXCoord = parseInt(coordinateAndOpParts[0], 10);
        const opYCoord = parseInt(coordinateAndOpParts[1], 10);
        const operationType = parseInt(coordinateAndOpParts[2], 10);

        // Validate parsed numbers. If any are not numbers, skip the line.
        if (isNaN(opXCoord) || isNaN(opYCoord) || isNaN(operationType)) {
            console.warn(`Warning: Skipping line with non-numeric values: "${lineContent}"`);
            continue;
        }

        // Apply the boundary modification based on the operation type.
        // Using a switch statement for clearer logic flow compared to chained if/else if.
        switch (operationType) {
            case OP_ADJUST_LEFT_BOUND: // Type 1: Move the minimum X boundary to the right.
                // The new minimum X must be greater than the current minimum X.
                currentLeftEdge = Math.max(currentLeftEdge, opXCoord);
                break;
            case OP_ADJUST_RIGHT_BOUND: // Type 2: Move the maximum X boundary to the left.
                // The new maximum X must be less than the current maximum X.
                currentRightEdge = Math.min(currentRightEdge, opXCoord);
                break;
            case OP_ADJUST_BOTTOM_BOUND: // Type 3: Move the minimum Y boundary upwards.
                // The new minimum Y must be greater than the current minimum Y.
                currentBottomEdge = Math.max(currentBottomEdge, opYCoord);
                break;
            case OP_ADJUST_TOP_BOUND: // Type 4: Move the maximum Y boundary downwards.
                // The new maximum Y must be less than the current maximum Y.
                currentTopEdge = Math.min(currentTopEdge, opYCoord);
                break;
            default:
                // Handle unrecognized operation types. Log a warning and skip this operation.
                console.warn(`Warning: Unknown operation type encountered: ${operationType} on line: "${lineContent}"`);
                break;
        }
    }

    // After processing all operations, calculate the final dimensions of the region.
    const finalWidth = currentRightEdge - currentLeftEdge;
    const finalHeight = currentTopEdge - currentBottomEdge;

    // If the width or height is non-positive, the region has collapsed or is invalid.
    // In such cases, the area is considered to be zero.
    if (finalWidth <= 0 || finalHeight <= 0) {
        return 0;
    } else {
        // Otherwise, return the positive area of the valid region.
        return finalWidth * finalHeight;
    }
}

// This section handles standard input/output for competitive programming environments.
// It reads all data from standard input, passes it to our primary processing function,
// and then prints the computed result to standard output.
// This part is typically provided by the problem setter and should remain untouched.
const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const computedAreaResult = calculateEffectiveRegionArea(standardInputData);
console.log(computedAreaResult);