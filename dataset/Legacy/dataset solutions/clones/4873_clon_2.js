'use strict';

/**
 * Processes the raw input data to calculate the area of a rectangle
 * after a series of cutting operations.
 * @param {string} rawData - The complete input string, typically from standard input.
 */
const processInput = (rawData) => {
    // Split the input string into an array of lines, removing any leading/trailing whitespace.
    const parsedLines = rawData.trim().split('\n');

    // The first line contains the initial width (W), height (H), and number of operations (N).
    // Parse these values into numerical variables.
    const initialConfig = parsedLines[0].split(' ').map(numericVal => Number(numericVal));
    let initialWidth = initialConfig[0]; // Original width of the canvas
    let initialHeight = initialConfig[1]; // Original height of the canvas
    let numOperations = initialConfig[2]; // Total number of cutting operations

    // Extract the X coordinates, Y coordinates, and operation types from the subsequent lines.
    // Each line from the second onwards represents one operation.
    const operationDetails = parsedLines.slice(1, parsedLines.length);

    let xCoordinates = operationDetails.map(elementLine => Number(elementLine.split(' ')[0]));
    let yCoordinates = operationDetails.map(elementLine => Number(elementLine.split(' ')[1]));
    let operationTypes = operationDetails.map(elementLine => Number(elementLine.split(' ')[2]));

    // Initialize the four boundary points of the rectangle.
    // The order is: [bottom-left, top-left, top-right, bottom-right].
    // These points will be adjusted based on the cutting operations.
    let boundaryPoints = [
        { coordX: 0, coordY: 0 },
        { coordX: 0, coordY: initialHeight },
        { coordX: initialWidth, coordY: initialHeight },
        { coordX: initialWidth, coordY: 0 }
    ];

    // Iterate through each cutting operation.
    for (let idx = 0; idx < operationTypes.length; idx++) {
        let currentOperation = operationTypes[idx]; // Get the type of the current operation.

        // Apply the cutting logic based on the operation type.
        // Each case effectively shrinks the rectangle from one side.
        switch (currentOperation) {
            case 1: // Cut from the left side (x < X_i)
                // The new minimum X for the bottom-left and top-left corners is Xs[idx].
                // We take the maximum to ensure the boundary moves rightwards.
                boundaryPoints[0].coordX = xCoordinates[idx] > boundaryPoints[0].coordX ? xCoordinates[idx] : boundaryPoints[0].coordX;
                boundaryPoints[1].coordX = xCoordinates[idx] > boundaryPoints[1].coordX ? xCoordinates[idx] : boundaryPoints[1].coordX;
                break;
            case 2: // Cut from the right side (x > X_i)
                // The new maximum X for the top-right and bottom-right corners is Xs[idx].
                // We take the minimum to ensure the boundary moves leftwards.
                boundaryPoints[2].coordX = xCoordinates[idx] < boundaryPoints[2].coordX ? xCoordinates[idx] : boundaryPoints[2].coordX;
                boundaryPoints[3].coordX = xCoordinates[idx] < boundaryPoints[3].coordX ? xCoordinates[idx] : boundaryPoints[3].coordX;
                break;
            case 3: // Cut from the bottom side (y < Y_i)
                // The new minimum Y for the bottom-left and bottom-right corners is Ys[idx].
                // We take the maximum to ensure the boundary moves upwards.
                boundaryPoints[0].coordY = yCoordinates[idx] > boundaryPoints[0].coordY ? yCoordinates[idx] : boundaryPoints[0].coordY;
                boundaryPoints[3].coordY = yCoordinates[idx] > boundaryPoints[3].coordY ? yCoordinates[idx] : boundaryPoints[3].coordY;
                break;
            case 4: // Cut from the top side (y > Y_i)
                // The new maximum Y for the top-left and top-right corners is Ys[idx].
                // We take the minimum to ensure the boundary moves downwards.
                boundaryPoints[1].coordY = yCoordinates[idx] < boundaryPoints[1].coordY ? yCoordinates[idx] : boundaryPoints[1].coordY;
                boundaryPoints[2].coordY = yCoordinates[idx] < boundaryPoints[2].coordY ? yCoordinates[idx] : boundaryPoints[2].coordY;
                break;
        }
    }

    // Calculate the final dimensions of the remaining rectangle.
    // Note: The original calculation `corners[0].x - corners[2].x` and `corners[0].y - corners[1].y`
    // implies that `corners[0]` holds the effective right/top boundary and `corners[2]` / `corners[1]`
    // hold the effective left/bottom boundary respectively, which results in potentially negative values
    // for `finalWidth` and `finalHeight` if the rectangle is valid.
    // This behavior is preserved, and the final output handles the absolute value or zero.
    const finalWidth = boundaryPoints[0].coordX - boundaryPoints[2].coordX;
    const finalHeight = boundaryPoints[0].coordY - boundaryPoints[1].coordY;

    // Compute the area. This value might be negative if `finalWidth` or `finalHeight` are negative.
    const areaResult = finalHeight * finalWidth;

    // If either dimension is negative, it means the cutting operations have
    // resulted in an invalid or collapsed rectangle (e.g., left boundary crossed right boundary).
    // In such cases, the area is considered 0.
    if (finalWidth < 0 || finalHeight < 0) {
        console.log(0);
        return; // Terminate execution if no valid area remains.
    }

    // Output the calculated area. If `areaResult` is negative (due to the inverted dimension calculation),
    // it should be treated as 0, otherwise output the positive area.
    console.log(areaResult >= 0 ? areaResult : 0);
};

// Read the input from standard input (typically a file or piped data)
// and then invoke the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
