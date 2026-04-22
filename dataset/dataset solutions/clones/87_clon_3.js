const fileSystemModule = require("fs"); // Import the file system utility module

// --- Configuration Constants ---
const standardInputPath = "/dev/stdin"; // Define the path for standard input
const encodingType = "utf8";             // Specify the character encoding for input
const outputPrecisionDigits = 6;         // Number of decimal places for slope comparison

/**
 * Parses a single line of string input into an array of numbers.
 * It handles potential multiple spaces and converts string parts to numeric values.
 *
 * @param {string} lineContent The raw string line from the input.
 * @returns {number[]} An array of numerical coordinates.
 */
function parseLineToNumbers(lineContent) {
    // Split the line by one or more spaces and filter out any empty strings
    // that might result from multiple spaces or leading/trailing spaces.
    const stringParts = lineContent.trim().split(/\s+/);

    // Convert each string part to a floating-point number.
    const numericValues = stringParts.map(Number);

    return numericValues;
}

/**
 * Calculates the slope of a line segment defined by two points (x1, y1) and (x2, y2).
 * Handles vertical lines by returning Infinity or -Infinity.
 *
 * @param {number} x1 The x-coordinate of the first point.
 * @param {number} y1 The y-coordinate of the first point.
 * @param {number} x2 The x-coordinate of the second point.
 * @param {number} y2 The y-coordinate of the second point.
 * @returns {number} The slope of the segment, or Infinity/-Infinity for vertical lines, or NaN if points are identical.
 */
function determineSegmentSlope(x1, y1, x2, y2) {
    const deltaY = y2 - y1; // Calculate the change in y-coordinates
    const deltaX = x2 - x1; // Calculate the change in x-coordinates

    // Check for vertical line (deltaX is zero)
    if (deltaX === 0) {
        // If deltaY is also zero, it's a single point, slope is undefined (NaN).
        // Otherwise, it's a vertical line, slope is Infinity or -Infinity.
        return deltaY === 0 ? NaN : (deltaY > 0 ? Infinity : -Infinity);
    }

    // Return the standard slope (rise over run)
    return deltaY / deltaX;
}

// --- Main Program Execution ---
try {
    // Obtain the entire content from standard input synchronously.
    const rawInputContent = fileSystemModule.obtainContentSynchronously(standardInputPath, encodingType);

    // Split the raw content into individual lines.
    // Filter out any empty lines that might occur (e.g., at the end of the file).
    const inputLines = rawInputContent.split('\n').filter(line => line.trim().length > 0);

    // Iterate over each processed line of input.
    for (const currentInputLine of inputLines) {
        // Parse the current line into an array of numbers.
        const numericCoordinates = parseLineToNumbers(currentInputLine);

        // A guard clause to ensure we have exactly 8 numeric values (x1, y1, x2, y2, x3, y3, x4, y4).
        if (numericCoordinates.length !== 8 || numericCoordinates.some(isNaN)) {
            // Optionally, log an error or skip malformed lines.
            // For this problem, we'll just skip and continue processing valid lines.
            // console.error(`Skipping malformed line: "${currentInputLine}" - Expected 8 numbers.`);
            continue;
        }

        // Destructure the array of coordinates into meaningful variables for clarity.
        const [
            segmentOneX1, segmentOneY1, segmentOneX2, segmentOneY2,
            segmentTwoX1, segmentTwoY1, segmentTwoX2, segmentTwoY2
        ] = numericCoordinates;

        // Calculate the slope for the first line segment.
        const slopeOfSegmentOne = determineSegmentSlope(
            segmentOneX1, segmentOneY1, segmentOneX2, segmentOneY2
        );

        // Calculate the slope for the second line segment.
        const slopeOfSegmentTwo = determineSegmentSlope(
            segmentTwoX1, segmentTwoY1, segmentTwoX2, segmentTwoY2
        );

        // Convert the calculated slopes to fixed-point strings for comparison.
        // This is crucial for floating-point equality checks and matches problem requirements.
        const formattedSlopeOne = slopeOfSegmentOne.toFixed(outputPrecisionDigits);
        const formattedSlopeTwo = slopeOfSegmentTwo.toFixed(outputPrecisionDigits);

        // Determine if the two line segments are parallel by comparing their formatted slopes.
        // Also handle cases where one or both slopes resulted in NaN (e.g., zero-length segments).
        // If either is NaN, they are not considered parallel in this context unless both are NaN (which means both are single points).
        // The toFixed() method on NaN throws an error, so we must check for it.
        let areSegmentsParallel;
        if (isNaN(slopeOfSegmentOne) || isNaN(slopeOfSegmentTwo)) {
            // If either slope is NaN, they are parallel only if both are NaN
            // (meaning both "segments" are effectively points).
            areSegmentsParallel = isNaN(slopeOfSegmentOne) && isNaN(slopeOfSegmentTwo);
        } else {
            areSegmentsParallel = (formattedSlopeOne === formattedSlopeTwo);
        }

        // Output the result based on the parallelism check.
        console.log(areSegmentsParallel ? 'YES' : 'NO');
    }

} catch (processingError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An error occurred during input processing:", processingError.message);
    // Exit with a non-zero status code to indicate an error.
    process.exit(1);
}