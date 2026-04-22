const OUTPUT_DECIMAL_PRECISION = 6; // Defines the standard precision for numerical output.

/**
 * Computes a specialized geometric metric between two 2D points.
 * This function expects the first element of `inputDataRows` to contain
 * four space-separated numerical coordinates representing (x1, y1, x2, y2).
 * The calculated metric is sqrt(|x2-x1| + |y2-y1|).
 *
 * @param {string[]} inputDataRows - An array of strings, where the first string
 *                                   should hold the space-delimited point coordinates.
 */
function computeSpatialMetric(inputDataRows) {
    // --- Robust Input Validation ---
    // Verify that input data was provided at all.
    if (!inputDataRows || inputDataRows.length === 0) {
        console.error("Execution Aborted: No input data rows were supplied for metric calculation.");
        return; // Terminate execution gracefully.
    }

    // Extract the primary string containing coordinate information.
    const coordinateRawString = inputDataRows[0];

    // Ensure the coordinate string is valid and not empty.
    if (typeof coordinateRawString !== 'string' || coordinateRawString.trim().length === 0) {
        console.error("Execution Aborted: The initial input row for coordinates is either invalid or empty.");
        return;
    }

    // Parse the coordinate string into its individual numerical components.
    // The `filter(Boolean)` step ensures that any empty strings resulting from
    // multiple spaces are removed, preventing issues with `Number()` conversion.
    const coordinateSegments = coordinateRawString.split(/\s+/).filter(Boolean);

    // Validate the number of extracted coordinate segments.
    const EXPECTED_COORDINATE_COUNT = 4;
    if (coordinateSegments.length < EXPECTED_COORDINATE_COUNT) {
        console.error(`Execution Aborted: Insufficient coordinate values. Expected ${EXPECTED_COORDINATE_COUNT}, but found ${coordinateSegments.length}.`);
        return;
    }

    // --- Coordinate Parsing with Type Coercion and Validation ---
    // Convert string segments to numbers using the unary plus operator,
    // which is a concise way to perform type coercion.
    const firstPointX = +coordinateSegments[0];
    const firstPointY = +coordinateSegments[1];
    const secondPointX = +coordinateSegments[2];
    const secondPointY = +coordinateSegments[3];

    // Post-parsing validation to ensure all coordinates are valid numbers.
    if (isNaN(firstPointX) || isNaN(firstPointY) || isNaN(secondPointX) || isNaN(secondPointY)) {
        console.error("Execution Aborted: One or more parsed coordinate values are not valid numbers.");
        return;
    }

    // --- Metric Calculation Steps ---
    // Calculate the absolute difference between the X-coordinates.
    const absoluteDifferenceX = Math.abs(secondPointX - firstPointX);
    // Calculate the absolute difference between the Y-coordinates.
    const absoluteDifferenceY = Math.abs(secondPointY - firstPointY);

    // Sum these absolute differences.
    const sumOfAbsoluteDifferences = absoluteDifferenceX + absoluteDifferenceY;

    // The final metric is the square root of this sum.
    const resultantMetricValue = Math.sqrt(sumOfAbsoluteDifferences);

    // --- Output Generation with Final Validation ---
    // Check if the calculated metric is a finite number before attempting to format.
    if (!Number.isFinite(resultantMetricValue)) {
        console.error("Execution Aborted: The computed metric value is not a finite number (e.g., Infinity or NaN).", resultantMetricValue);
        return;
    }

    // Format the numerical result to the predefined decimal precision and print it.
    console.log(resultantMetricValue.toFixed(OUTPUT_DECIMAL_PRECISION));
}

/**
 * Performs a cyclic shift (rotation) on a given string based on a specified index.
 * The part of the string from `splitPoint` to the end is moved to the beginning,
 * followed by the part from the beginning up to `splitPoint`.
 *
 * @param {string} originalText - The source string to be manipulated.
 * @param {number} splitPoint - The index at which to divide the string for rearrangement.
 * @returns {string} The string after segment manipulation.
 */
function manipulateStringSegments(originalText, splitPoint) {
    // --- Input Type and Boundary Validation ---
    // Ensure the primary input is treated as a string.
    if (typeof originalText !== 'string') {
        console.warn("Warning: 'originalText' parameter is not a string. Attempting type coercion.");
        originalText = String(originalText);
    }

    // Sanitize the split point to ensure it's an integer and within valid bounds.
    let effectiveSplitIndex = Math.floor(splitPoint); // Ensure integer index.

    if (effectiveSplitIndex < 0) {
        effectiveSplitIndex = 0; // Negative index defaults to the start of the string.
    } else if (effectiveSplitIndex > originalText.length) {
        effectiveSplitIndex = originalText.length; // Index beyond length defaults to the end.
    }

    // --- String Segment Extraction ---
    // Extract the segment from the determined split point to the end of the string.
    const suffixSegment = originalText.slice(effectiveSplitIndex);
    // Extract the segment from the beginning of the string up to the split point.
    const prefixSegment = originalText.slice(0, effectiveSplitIndex);

    // --- Concatenation and Result ---
    // Combine the segments in the desired rotated order.
    return suffixSegment + prefixSegment;
}

// --- Standard Input Stream Processing ---
// An array to store incoming binary data chunks from stdin.
const incomingDataBuffer = [];

// Register an event listener for 'data' events on the standard input stream.
// Each 'dataPacket' received is a Buffer object.
process.stdin.on('data', (dataPacket) => {
    // Accumulate the incoming data packets.
    incomingDataBuffer.push(dataPacket);
});

// Register an event listener for the 'end' event on the standard input stream.
// This signifies that all input has been received.
process.stdin.on('end', () => {
    // --- Post-Input Assembly and Processing ---
    // Check if any data was actually received before proceeding.
    if (incomingDataBuffer.length === 0) {
        console.error("No input data was detected from the standard input stream.");
        // Call the main function with an empty array; its internal validation will handle it.
        computeSpatialMetric([]);
        return;
    }

    // Concatenate all received Buffer chunks into a single Buffer,
    // then convert this combined Buffer into a UTF-8 encoded string.
    const completeInputString = Buffer.concat(incomingDataBuffer).toString('utf8');

    // Split the complete string into individual lines.
    // Each line is trimmed to remove leading/trailing whitespace, and
    // any resulting empty lines are filtered out.
    const processedInputLines = completeInputString
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    // --- Core Logic Invocation ---
    // Pass the thoroughly processed input lines to the primary calculation function.
    computeSpatialMetric(processedInputLines);
});

// --- Robust Error Handling for Standard Input ---
// Register an event listener for any potential errors during stdin operations.
process.stdin.on('error', (operationError) => {
    console.error("An unhandled error occurred during standard input stream processing:", operationError);
    process.exit(1); // Exit the process with a non-zero code to indicate an error.
});