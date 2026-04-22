const fileSystemModule = require('fs');

// --- Input Acquisition Phase ---

// Retrieve the file descriptor for standard input
const standardInputDescriptor = process.stdin.fd;
let totalBytesToRead;

// Attempt to get statistics about the standard input stream to determine its size.
// This is a synchronous operation, suitable for script startup.
try {
    const streamStatistics = fileSystemModule.fstatSync(standardInputDescriptor);
    totalBytesToRead = streamStatistics.size;

    // Implement a guard clause for empty input
    if (totalBytesToRead === 0) {
        console.error("Input stream is empty. No data to process.");
        process.exit(1); // Exit with a non-zero status code to indicate an error
    }
} catch (error) {
    // Handle potential errors during file system stat retrieval
    console.error(`Failed to retrieve standard input stream statistics: ${error.message}`);
    process.exit(1);
}

// Allocate a new buffer to store the incoming data from standard input.
// Using Buffer.alloc for security and explicit initialization to zeros.
const inputDataBuffer = Buffer.alloc(totalBytesToRead);

// Synchronously read the entire content of standard input into the allocated buffer.
const actualBytesReadCount = fileSystemModule.readSync(
    standardInputDescriptor,
    inputDataBuffer,
    0,
    totalBytesToRead,
    0 // Start reading from the beginning of the stream
);

// Convert the raw buffer data into a UTF-8 string, considering only the actually read bytes.
// Then, split the string into an array of lines.
// A filter is added to discard any empty lines, which commonly occur if the input ends with a newline character.
const processedInputLines = inputDataBuffer
    .toString('utf8', 0, actualBytesReadCount)
    .split('\n')
    .filter(lineContent => lineContent.trim() !== ''); // Ensure non-empty and non-whitespace-only lines

// --- Core Processing Execution ---

// Invoke the main function responsible for processing the coordinate data.
analyzeQuadrilateralSlopes();

// --- Main Logic Function Definition ---

/**
 * Processes each line of input, expecting 8 comma-separated numeric coordinates
 * representing a quadrilateral's vertices (A, B, C, D). It calculates the slopes
 * of the four segments (AB, BC, CD, DA) and determines if the count of
 * non-negative slopes is odd or even.
 */
function analyzeQuadrilateralSlopes() {
    // Determine the number of valid input lines to iterate over.
    const numberOfInputRecords = processedInputLines.length;

    // Iterate through each record (line) provided in the input.
    for (let recordIndex = 0; recordIndex < numberOfInputRecords; recordIndex++) {
        const currentRecordLine = processedInputLines[recordIndex];
        const coordinateValueStrings = currentRecordLine.split(',');

        // --- Input Validation for Current Record ---
        // Ensure that each line contains exactly 8 coordinate values.
        const expectedCoordinateCount = 8;
        if (coordinateValueStrings.length !== expectedCoordinateCount) {
            console.error(`Validation Warning: Skipping line ${recordIndex + 1}. Expected ${expectedCoordinateCount} coordinates, found ${coordinateValueStrings.length}.`);
            continue; // Skip this malformed line and proceed to the next one.
        }

        // Initialize a counter for segments with non-negative slopes.
        let nonNegativeSlopeSegmentCount = 0;

        // Explicitly parse string coordinates into floating-point numbers for arithmetic operations.
        // This improves readability and guards against unexpected string behavior in calculations.
        const xA = parseFloat(coordinateValueStrings[0]);
        const yA = parseFloat(coordinateValueStrings[1]);
        const xB = parseFloat(coordinateValueStrings[2]);
        const yB = parseFloat(coordinateValueStrings[3]);
        const xC = parseFloat(coordinateValueStrings[4]);
        const yC = parseFloat(coordinateValueStrings[5]);
        const xD = parseFloat(coordinateValueStrings[6]);
        const yD = parseFloat(coordinateValueStrings[7]);

        // --- Helper Function for Slope Calculation ---
        /**
         * Calculates the slope of a line segment defined by two points (p1_x, p1_y) and (p2_x, p2_y).
         * The formula used is (p1_y - p2_y) / (p1_x - p2_x), matching the original code's pattern.
         * Handles vertical lines (deltaX_val = 0) by returning Infinity or -Infinity,
         * and identical points (deltaX_val = 0 and deltaY_val = 0) by returning NaN.
         * @param {number} p1_x - X-coordinate of the first point.
         * @param {number} p1_y - Y-coordinate of the first point.
         * @param {number} p2_x - X-coordinate of the second point.
         * @param {number} p2_y - Y-coordinate of the second point.
         * @returns {number} The slope of the segment, or +/-Infinity for vertical lines, or NaN for identical points.
         */
        const calculateSegmentSlope = (p1_x, p1_y, p2_x, p2_y) => {
            const deltaY_val = p1_y - p2_y;
            const deltaX_val = p1_x - p2_x;

            if (deltaX_val === 0) {
                // Vertical line: check direction for +/- Infinity
                if (deltaY_val > 0) return Infinity;
                if (deltaY_val < 0) return -Infinity;
                return NaN; // Both deltaX and deltaY are 0, indicating identical points.
            }
            return deltaY_val / deltaX_val;
        };

        // --- Slope Calculation for Quadrilateral Segments ---
        // Calculate the slope for each of the four segments of the quadrilateral.
        const slopeSegmentAB = calculateSegmentSlope(xA, yA, xB, yB); // Slope from A to B
        const slopeSegmentBC = calculateSegmentSlope(xB, yB, xC, yC); // Slope from B to C
        const slopeSegmentCD = calculateSegmentSlope(xC, yC, xD, yD); // Slope from C to D
        const slopeSegmentDA = calculateSegmentSlope(xD, yD, xA, yA); // Slope from D to A (closing segment)

        // --- Counting Non-Negative Slopes ---
        // Increment the counter if a segment's slope is greater than or equal to zero.
        // This includes positive slopes and zero slopes (horizontal lines).
        if (slopeSegmentAB >= 0) {
            nonNegativeSlopeSegmentCount++;
        }
        if (slopeSegmentBC >= 0) {
            nonNegativeSlopeSegmentCount++;
        }
        if (slopeSegmentCD >= 0) {
            nonNegativeSlopeSegmentCount++;
        }
        if (slopeSegmentDA >= 0) {
            nonNegativeSlopeSegmentCount++;
        }

        // --- Output Generation ---
        // Determine the final result based on the parity of the non-negative slope count.
        // If the count is odd, output 'YES'; otherwise, output 'NO'.
        const isCountOdd = (nonNegativeSlopeSegmentCount % 2) !== 0;
        const finalResult = isCountOdd ? 'YES' : 'NO';
        console.log(finalResult);
    }
}