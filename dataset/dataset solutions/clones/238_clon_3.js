// This module facilitates interaction with the file system, essential for reading standard input.
const fileSystemUtility = require('fs');

// Defines the file descriptor for standard input, which is typically 0 on Unix-like systems.
const standardInputDescriptor = process.stdin.fd;

// Attempt to determine the total byte size of the standard input stream.
// Includes a safeguard for scenarios where the stream might be empty or inaccessible.
let totalByteCount;
try {
    totalByteCount = fileSystemUtility.fstatSync(standardInputDescriptor).size;
} catch (error) {
    // Log an error if the input size cannot be determined and set size to zero.
    console.error(`Error: Could not retrieve standard input stream size. Details: ${error.message}`);
    totalByteCount = 0;
}

// If no data is indicated by the stream size, output a message and terminate the process gracefully.
if (totalByteCount === 0) {
    console.log("No input data detected on standard input. Terminating application.");
    process.exit(0);
}

// Allocate a new buffer of the exact size determined for the standard input.
const rawInputBuffer = Buffer.alloc(totalByteCount);

// Perform a synchronous read operation to transfer data from standard input into the buffer.
// Error handling is included to catch potential issues during the read process.
let actualBytesRead = 0;
try {
    actualBytesRead = fileSystemUtility.readSync(standardInputDescriptor, rawInputBuffer, 0, totalByteCount, 0);
} catch (error) {
    // If reading fails, log the error and exit with a non-zero status code to indicate failure.
    console.error(`Critical Error: Failed to read from standard input. Details: ${error.message}`);
    process.exit(1);
}

// Convert the raw buffer content into a UTF-8 string.
// Then, trim any leading/trailing whitespace and split the string into an array of lines.
const processedInputLines = rawInputBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

// Initiate the primary logic of the application to process the rectangle intersection queries.
executeRectangleIntersectionAnalysis();

/**
 * @typedef {object} RectangleBoundary
 * @property {number} x1 - The x-coordinate of the first corner (e.g., left or right).
 * @property {number} y1 - The y-coordinate of the first corner (e.g., top or bottom).
 * @property {number} x2 - The x-coordinate of the second corner.
 * @property {number} y2 - The y-coordinate of the second corner.
 */

/**
 * Parses a single line of text into an array of numbers.
 * It handles potential empty lines or multiple spaces between numbers.
 * @param {string} textLine - The input string line to parse.
 * @returns {number[]} An array containing the numeric values extracted from the line.
 */
function parseNumericValuesFromLine(textLine) {
    // Return an empty array immediately if the line is null, undefined, or empty after trimming.
    if (!textLine || textLine.trim().length === 0) {
        return [];
    }
    // Split the line by spaces, filter out any empty strings that result from multiple spaces,
    // and then convert each remaining string segment into a number.
    return textLine.split(' ').filter(segment => segment !== '').map(Number);
}

/**
 * Determines whether two given rectangles, defined by their corner coordinates, overlap.
 * This function assumes that the coordinates represent the extent of the rectangles
 * along the X and Y axes, where x1/y1 can be less than or greater than x2/y2,
 * as long as they define the bounds.
 *
 * @param {RectangleBoundary} rectangleA - The first rectangle's boundary coordinates.
 * @param {RectangleBoundary} rectangleB - The second rectangle's boundary coordinates.
 * @returns {boolean} `true` if the rectangles intersect or touch, `false` otherwise.
 */
function checkIntersectionOfRectangles(rectangleA, rectangleB) {
    // Check for overlap along the horizontal axis.
    // Two rectangles overlap horizontally if the left edge of one is to the left of the right edge of the other,
    // AND the right edge of the first is to the right of the left edge of the second.
    const hasHorizontalOverlap = (rectangleA.x1 <= rectangleB.x2 && rectangleB.x1 <= rectangleA.x2);

    // Check for overlap along the vertical axis using the same logic.
    const hasVerticalOverlap = (rectangleA.y1 <= rectangleB.y2 && rectangleB.y1 <= rectangleA.y2);

    // For overall intersection, both horizontal and vertical overlaps must be present.
    return hasHorizontalOverlap && hasVerticalOverlap;
}

/**
 * Main application logic. Iterates through each processed input line,
 * parses rectangle coordinates, checks for intersection, and prints the result.
 */
function executeRectangleIntersectionAnalysis() {
    // Reference to the standard output stream for printing results.
    const consoleOutput = console;

    // Loop through every line that was successfully read from standard input.
    for (let currentLineIndex = 0; currentLineIndex < processedInputLines.length; currentLineIndex++) {
        const currentInputLine = processedInputLines[currentLineIndex];

        // Parse the current line into an array of numeric values.
        const parsedNumericValues = parseNumericValuesFromLine(currentInputLine);

        // Validate that exactly 8 numeric values (for two rectangles) were provided.
        if (parsedNumericValues.length !== 8) {
            consoleOutput.warn(`Skipping line ${currentLineIndex + 1}: Expected 8 coordinate values, but received ${parsedNumericValues.length}.`);
            continue; // Skip this malformed line and proceed to the next.
        }

        // Construct the first rectangle object from the first four parsed values.
        const rectangleAlpha = {
            x1: parsedNumericValues[0],
            y1: parsedNumericValues[1],
            x2: parsedNumericValues[2],
            y2: parsedNumericValues[3]
        };

        // Construct the second rectangle object from the next four parsed values.
        const rectangleBeta = {
            x1: parsedNumericValues[4],
            y1: parsedNumericValues[5],
            x2: parsedNumericValues[6],
            y2: parsedNumericValues[7]
        };

        // Determine if the two constructed rectangles overlap using the dedicated helper function.
        const areTheyIntersecting = checkIntersectionOfRectangles(rectangleAlpha, rectangleBeta);

        // Output 'YES' if an intersection is found, otherwise output 'NO'.
        consoleOutput.log(areTheyIntersecting ? 'YES' : 'NO');
    }
}