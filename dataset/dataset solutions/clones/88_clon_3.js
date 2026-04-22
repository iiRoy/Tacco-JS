const fileSystemModule = require('fs'); // Import the file system module for I/O operations.

// Define a small constant for floating-point comparisons to avoid precision issues.
// This epsilon value helps determine if a floating-point number is effectively zero.
const FLOAT_COMPARE_EPSILON = 1e-9;

// Attempt to read the entire standard input synchronously.
// Ensure UTF-8 encoding for proper character interpretation.
let rawInputData;
try {
    rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (ioError) {
    // Handle potential errors during file reading, e.g., file not found or permission issues.
    console.error("Error reading input from /dev/stdin:", ioError.message);
    // Exit or handle gracefully if input is critical.
    process.exit(1);
}

// Basic validation: Check if input data was actually read.
if (!rawInputData || rawInputData.trim().length === 0) {
    console.error("No input data provided or input is empty.");
    process.exit(1);
}

// Split the raw input string into an array of individual lines.
// Trim any leading/trailing whitespace from the entire input before splitting.
const processedInputLines = rawInputData.trim().split('\n');

// Extract the number of test cases from the first line of input.
// Use parseInt with radix 10 for explicit base conversion.
const numberOfTestCases = parseInt(processedInputLines.shift(), 10);

// Validate the number of test cases.
if (isNaN(numberOfTestCases) || numberOfTestCases < 0) {
    console.error("Invalid number of test cases received:", numberOfTestCases);
    process.exit(1);
}

// Initialize a counter for the current test case being processed.
let currentCaseIterator = 0;

// Iterate through each test case using a while loop.
while (currentCaseIterator < numberOfTestCases) {
    // Retrieve the line containing coordinate data for the current test case.
    const currentCoordinateLine = processedInputLines.shift();

    // Guard clause: Ensure a line was available for processing.
    if (!currentCoordinateLine) {
        console.error(`Missing coordinate data for test case ${currentCaseIterator + 1}.`);
        // Optionally, continue to the next iteration or break. For now, we'll break.
        break;
    }

    // Split the current line into individual string parts based on spaces.
    const coordinateStringSegments = currentCoordinateLine.split(' ');

    // Another guard clause: Verify that we have enough coordinate values.
    const EXPECTED_COORDINATE_COUNT = 8;
    if (coordinateStringSegments.length < EXPECTED_COORDINATE_COUNT) {
        console.error(`Insufficient coordinate values for test case ${currentCaseIterator + 1}. Expected ${EXPECTED_COORDINATE_COUNT}, got ${coordinateStringSegments.length}.`);
        currentCaseIterator++; // Move to next case even if current one is malformed.
        continue;
    }

    // Parse the 8 coordinate values from the string segments.
    // These represent two line segments: (p1X, p1Y)-(p2X, p2Y) and (p3X, p3Y)-(p4X, p4Y).
    const p1X = parseFloat(coordinateStringSegments[0]);
    const p1Y = parseFloat(coordinateStringSegments[1]);
    const p2X = parseFloat(coordinateStringSegments[2]);
    const p2Y = parseFloat(coordinateStringSegments[3]);
    const p3X = parseFloat(coordinateStringSegments[4]);
    const p3Y = parseFloat(coordinateStringSegments[5]);
    const p4X = parseFloat(coordinateStringSegments[6]);
    const p4Y = parseFloat(coordinateStringSegments[7]);

    // Validate parsed coordinates to ensure they are valid numbers.
    if (isNaN(p1X) || isNaN(p1Y) || isNaN(p2X) || isNaN(p2Y) ||
        isNaN(p3X) || isNaN(p3Y) || isNaN(p4X) || isNaN(p4Y)) {
        console.error(`Invalid numeric coordinate found for test case ${currentCaseIterator + 1}. Skipping.`);
        currentCaseIterator++;
        continue;
    }

    // Calculate the components of the first vector (representing the first line segment).
    // Vector A: from (p1X, p1Y) to (p2X, p2Y)
    const vectorAX = p2X - p1X;
    const vectorAY = p2Y - p1Y;

    // Calculate the components of the second vector (representing the second line segment).
    // Vector B: from (p3X, p3Y) to (p4X, p4Y)
    const vectorBX = p4X - p3X;
    const vectorBY = p4Y - p3Y;

    // To check if two 2D line segments (or vectors) are parallel, we can use their cross product.
    // For 2D vectors (Ax, Ay) and (Bx, By), their "cross product" (which is actually the magnitude
    // of the 3D cross product if they were in the XY plane) is Ax*By - Ay*Bx.
    // If this value is zero, the vectors are parallel.
    const crossProductDeterminant = (vectorAX * vectorBY) - (vectorAY * vectorBX);

    // Compare the cross product determinant to zero using the defined epsilon for floating-point safety.
    // If the absolute value of the determinant is less than epsilon, they are considered parallel.
    if (Math.abs(crossProductDeterminant) < FLOAT_COMPARE_EPSILON) {
        // If the segments are parallel (or collinear), output 'YES'.
        console.log('YES');
    } else {
        // Otherwise, they are not parallel, output 'NO'.
        console.log('NO');
    }

    // Increment the counter to move to the next test case.
    currentCaseIterator++;
}