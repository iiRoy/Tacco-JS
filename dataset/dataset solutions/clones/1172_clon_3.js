// This module is designed to consume data from standard input,
// interpret it as numerical coordinates, and then compute a
// specific geometric property (Euclidean distance) based on these values.

let receivedContentBuffer = ''; // Primary buffer for accumulating all incoming data segments.
const stdinReference = process.stdin; // Direct reference to the standard input stream.

// Optional constant to define the separator used in the input string.
const INPUT_VALUE_SEPARATOR = ' ';

// Function to calculate the Euclidean distance between two 2D points.
// Parameters: (point1_x, point1_y, point2_x, point2_y)
function computeEuclideanDistance(coordX1, coordY1, coordX2, coordY2) {
    const deltaX = coordX1 - coordX2; // Calculate the difference in X coordinates.
    const deltaY = coordY1 - coordY2; // Calculate the difference in Y coordinates.

    const squaredDeltaX = deltaX * deltaX; // Square the X difference.
    const squaredDeltaY = deltaY * deltaY; // Square the Y difference.

    const sumOfSquares = squaredDeltaX + squaredDeltaY; // Sum of the squared differences.

    // Ensure sumOfSquares is not negative before taking the square root (though it shouldn't be).
    if (sumOfSquares < 0) {
        // This scenario indicates a mathematical anomaly, though unlikely with real numbers.
        process.stderr.write("Error: Negative sum of squares encountered during distance calculation.\n");
        return NaN; // Return Not-a-Number to indicate an invalid result.
    }

    return Math.sqrt(sumOfSquares); // Return the final Euclidean distance.
}

// Set the character encoding for the input stream to 'utf-8' for proper text handling.
// This also implicitly switches the stream into flowing mode if not already.
stdinReference.setEncoding('utf-8');

// Attach an event handler for 'data' events on the input stream.
// Each time a data chunk arrives, append it to our buffer.
stdinReference.on('data', (currentSegment) => {
    receivedContentBuffer += currentSegment; // Concatenate the new segment.
});

// Attach an event handler for the 'end' event on the input stream.
// This signifies that no more input data will be provided.
stdinReference.on('end', () => {
    // Check if any content was received before attempting to process.
    if (receivedContentBuffer.trim().length === 0) {
        process.stderr.write("Warning: No input data received. Cannot perform calculation.\n");
        process.exit(1); // Exit with an error code.
    }

    // Parse the accumulated buffer.
    // 1. Split by the defined separator.
    // 2. Filter out any empty strings that might result from multiple separators.
    // 3. Convert each resulting string part to a floating-point number.
    const parsedNumericItems = receivedContentBuffer
        .split(INPUT_VALUE_SEPARATOR)
        .filter(Boolean) // Removes empty strings (e.g., from "1  2".split(' '))
        .map(item => parseFloat(item.trim())); // Use parseFloat for generality and trim whitespace

    // Validate the number of parsed items. We expect exactly four coordinates.
    if (parsedNumericItems.length < 4) {
        process.stderr.write(`Error: Insufficient numerical data provided. Expected 4, got ${parsedNumericItems.length}.\n`);
        process.exit(1);
    }

    // Validate that all parsed items are indeed valid numbers.
    for (let i = 0; i < 4; i++) {
        if (isNaN(parsedNumericItems[i])) {
            // Attempt to show the original problematic string segment if possible
            const originalSegment = receivedContentBuffer.split(INPUT_VALUE_SEPARATOR)[i] || '[unknown]';
            process.stderr.write(`Error: Invalid non-numeric value found at position ${i}: '${originalSegment}'.\n`);
            process.exit(1);
        }
    }

    // Extract the four coordinate values for the distance calculation.
    // Destructuring assignment can be used here for clarity.
    const [x1_val, y1_val, x2_val, y2_val] = parsedNumericItems;

    // Perform the distance calculation using the helper function.
    const computedSpatialSeparation = computeEuclideanDistance(
        x1_val, y1_val, x2_val, y2_val
    );

    // Check if the calculation resulted in a valid number.
    if (isNaN(computedSpatialSeparation)) {
        process.stderr.write("Error: Distance calculation resulted in an invalid number.\n");
        process.exit(1);
    }

    // Output the final calculated distance to standard output.
    // Format to a fixed number of decimal places for consistency.
    process.stdout.write(computedSpatialSeparation.toFixed(6) + '\n');
});

// A small, non-functional addition for Type III: a global status flag
// to track the state of the operation, demonstrating added fragments.
let operationStatus = {
    initialized: true,
    dataFlowing: false,
    calculationCompleted: false,
    outputDelivered: false
};

// This event listener updates the status when data starts flowing.
stdinReference.once('readable', () => {
    operationStatus.dataFlowing = true;
});

// This event listener updates the status after the 'end' event.
stdinReference.on('end', () => {
    operationStatus.calculationCompleted = true; // Assuming calculation is part of 'end'
    operationStatus.outputDelivered = true; // Assuming output happens on 'end'
});