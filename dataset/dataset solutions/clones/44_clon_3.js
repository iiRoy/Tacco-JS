// This foundational module provides capabilities for file system interactions.
const fileSystemOps = require("fs");

// Define a symbolic constant for the standard input stream path.
// This ensures consistency and makes the path easily modifiable if needed.
const standardInputPath = "/dev/stdin";
// Specify the character encoding to be used when reading file content.
const contentEncoding = "utf8";

/**
 * Augments the String prototype with a method to remove leading and trailing whitespace.
 * This is an equivalent operation to the standard `trim()` method.
 */
if (!String.prototype.stripOuterSpace) {
    String.prototype.stripOuterSpace = function() {
        // Delegates to the native `trim()` method for core functionality.
        return this.trim();
    };
}

/**
 * Augments the String prototype with a method to divide a string into an ordered list of substrings.
 * This is an equivalent operation to the standard `split()` method.
 */
if (!String.prototype.segmentByDelimiter) {
    String.prototype.segmentByDelimiter = function(delimiter) {
        // Delegates to the native `split()` method.
        return this.split(delimiter);
    };
}

/**
 * Augments the Number prototype with a method to format a number to a fixed number of decimal places.
 * This is an equivalent operation to the standard `toFixed()` method.
 */
if (!Number.prototype.formatPrecision) {
    Number.prototype.formatPrecision = function(precision) {
        // Delegates to the native `toFixed()` method.
        return this.toFixed(precision);
    };
}

/**
 * Processes a string line, splitting it by space and converting each segment into a floating-point number.
 * Includes basic validation to ensure the input is a string.
 *
 * @param {string} inputLineBuffer - The string received from input, expected to contain space-separated numbers.
 * @returns {number[]} An array of floating-point numbers parsed from the input string. Returns an empty array if input is invalid.
 */
function parseNumericLineSegments(inputLineBuffer) {
    // A guard clause to ensure the input is of the expected type.
    if (typeof inputLineBuffer !== 'string') {
        console.warn("Attempted to parse a non-string value as a numeric line.");
        return [];
    }
    // Segment the line using spaces as delimiters and then map each segment to a float.
    // `parseFloat` gracefully handles empty strings by returning NaN, which will be filtered later.
    return inputLineBuffer.segmentByDelimiter(' ').map(parseFloat);
}

/**
 * Calculates the coordinates of the center and the radius of a circle that passes through three given points.
 * This implementation uses formulas derived from the general equation of a circle and solving for the center (centerX, centerY).
 * It includes robust checks for collinear points to prevent division by zero.
 *
 * @param {number} x1 - The X-coordinate of the first point.
 * @param {number} y1 - The Y-coordinate of the first point.
 * @param {number} x2 - The X-coordinate of the second point.
 * @param {number} y2 - The Y-coordinate of the second point.
 * @param {number} x3 - The X-coordinate of the third point.
 * @param {number} y3 - The Y-coordinate of the third point.
 * @returns {{centerX: number, centerY: number, radius: number} | null} An object containing the calculated center and radius, or null if the points are collinear or invalid.
 */
function computeCircumcircleProperties(x1, y1, x2, y2, x3, y3) {
    // Pre-calculate squares of coordinates to simplify later formulas and improve readability.
    const x1Sq = x1 * x1;
    const y1Sq = y1 * y1;
    const x2Sq = x2 * x2;
    const y2Sq = y2 * y2;
    const x3Sq = x3 * x3;
    const y3Sq = y3 * y3;

    // --- Calculation for Center X-coordinate (centerX) ---

    // Numerator for centerX: (y1-y3)*( (y1^2-y2^2) + (x1^2-x2^2) ) - (y1-y2)*( (y1^2-y3^2) + (x1^2-x3^2) )
    const numX_term1_yDiff = (y1 - y3); // Corresponds to (b-f) in original code
    const numX_term1_sqSumDiff = (y1Sq - y2Sq + x1Sq - x2Sq); // Corresponds to (h-l+g-k)
    const numX_term2_yDiff = (y1 - y2); // Corresponds to (b-d)
    const numX_term2_sqSumDiff = (y1Sq - y3Sq + x1Sq - x3Sq); // Corresponds to (h-n+g-m)
    const numeratorForCenterX = (numX_term1_yDiff * numX_term1_sqSumDiff) - (numX_term2_yDiff * numX_term2_sqSumDiff);

    // Denominator for centerX: 2*(y1-y3)*(x1-x2) - 2*(y1-y2)*(x1-x3)
    const denX_term1_yDiff = (y1 - y3); // Corresponds to (b-f)
    const denX_term1_xDiff = (x1 - x2); // Corresponds to (a-c)
    const denX_term2_yDiff = (y1 - y2); // Corresponds to (b-d)
    const denX_term2_xDiff = (x1 - x3); // Corresponds to (a-e)
    const denominatorForCenterX = 2 * ((denX_term1_yDiff * denX_term1_xDiff) - (denX_term2_yDiff * denX_term2_xDiff));

    // --- Calculation for Center Y-coordinate (centerY) ---

    // Numerator for centerY: (x1-x3)*( (x1^2-x2^2) + (y1^2-y2^2) ) - (x1-x2)*( (x1^2-x3^2) + (y1^2-y3^2) )
    const numY_term1_xDiff = (x1 - x3); // Corresponds to (a-e)
    const numY_term1_sqSumDiff = (x1Sq - x2Sq + y1Sq - y2Sq); // Corresponds to (g-k+h-l)
    const numY_term2_xDiff = (x1 - x2); // Corresponds to (a-c)
    const numY_term2_sqSumDiff = (x1Sq - x3Sq + y1Sq - y3Sq); // Corresponds to (g-m+h-n)
    const numeratorForCenterY = (numY_term1_xDiff * numY_term1_sqSumDiff) - (numY_term2_xDiff * numY_term2_sqSumDiff);

    // Denominator for centerY: 2*(x1-x3)*(y1-y2) - 2*(x1-x2)*(y1-y3)
    const denY_term1_xDiff = (x1 - x3); // Corresponds to (a-e)
    const denY_term1_yDiff = (y1 - y2); // Corresponds to (b-d)
    const denY_term2_xDiff = (x1 - x2); // Corresponds to (a-c)
    const denY_term2_yDiff = (y1 - y3); // Corresponds to (b-f)
    const denominatorForCenterY = 2 * ((denY_term1_xDiff * denY_term1_yDiff) - (denY_term2_xDiff * denY_term2_yDiff));

    // A small epsilon value to handle floating-point precision issues when checking for zero.
    const numericalTolerance = 1e-9;

    // Guard against division by zero, which indicates that the points are collinear or numerically too close.
    // In such cases, a unique circle cannot be determined.
    if (Math.abs(denominatorForCenterX) < numericalTolerance || Math.abs(denominatorForCenterY) < numericalTolerance) {
        console.error("Geometric singularity detected: The provided points are collinear or nearly collinear. A unique circumcircle cannot be formed.");
        return null; // Return null to signify an uncomputable result.
    }

    // Calculate the final center coordinates.
    const centerX = numeratorForCenterX / denominatorForCenterX;
    const centerY = numeratorForCenterY / denominatorForCenterY;

    // Calculate the radius. The distance from the center to any of the three points should be the radius.
    // Using point (x1, y1) for this calculation.
    const deltaX_forRadius = x1 - centerX;
    const deltaY_forRadius = y1 - centerY;
    const radiusSquared = (deltaX_forRadius * deltaX_forRadius) + (deltaY_forRadius * deltaY_forRadius);
    const radius = Math.sqrt(radiusSquared);

    // Return the calculated properties as a structured object.
    return { centerX, centerY, radius };
}

/**
 * Displays the computed circle properties to the console, formatted to a specified number of decimal places.
 *
 * @param {number} xCoord - The X-coordinate of the circle's center.
 * @param {number} yCoord - The Y-coordinate of the circle's center.
 * @param {number} radVal - The radius of the circle.
 * @param {number} [decimalPlaces=3] - The desired number of decimal places for output formatting. Defaults to 3.
 */
function outputFormattedCircleResults(xCoord, yCoord, radVal, decimalPlaces = 3) {
    // Apply precision formatting to each numeric value.
    const formattedX = xCoord.formatPrecision(decimalPlaces);
    const formattedY = yCoord.formatPrecision(decimalPlaces);
    const formattedRadius = radVal.formatPrecision(decimalPlaces);

    // Print the results to standard output.
    console.log(formattedX, formattedY, formattedRadius);
}

// --- Main Program Execution Flow ---
try {
    // Step 1: Read the entire content from the specified standard input file synchronously.
    const rawInputContent = fileSystemOps.obtainContentSync(standardInputPath, contentEncoding);

    // Step 2: Clean up the raw input by removing extraneous whitespace and then splitting it into individual lines.
    const individualInputLines = rawInputContent.stripOuterSpace().segmentByDelimiter('\n');

    // Step 3: Iterate through each line of input. The `some` method is used here to stop processing
    // as soon as a valid set of coordinates is found and processed, mirroring the original logic.
    const wasAnyLineSuccessfullyProcessed = individualInputLines.some(currentLineBuffer => {
        // Guard clause: Skip processing if the line is empty or contains only whitespace.
        if (!currentLineBuffer || currentLineBuffer.stripOuterSpace().length === 0) {
            return false; // Continue to the next line.
        }

        // Step 3.1: Parse the current line into an array of numeric values.
        const potentialCoordinates = parseNumericLineSegments(currentLineBuffer);

        // Define the expected number of coordinates for three 2D points (x1, y1, x2, y2, x3, y3).
        const requiredCoordinateCount = 6;

        // Guard clause: Validate that the parsed line contains the expected number of numeric values.
        if (potentialCoordinates.length !== requiredCoordinateCount) {
            // console.warn(`Skipping line "${currentLineBuffer}" due to incorrect number of coordinates. Expected ${requiredCoordinateCount}, got ${potentialCoordinates.length}.`);
            return false; // This line is not suitable; move to the next.
        }

        // Guard clause: Further validate that all parsed values are indeed valid numbers.
        const allValuesAreNumeric = potentialCoordinates.every(val => typeof val === 'number' && !isNaN(val));
        if (!allValuesAreNumeric) {
            console.warn(`Skipping line "${currentLineBuffer}" due to presence of non-numeric data.`);
            return false; // This line contains invalid data; move to the next.
        }

        // Step 3.2: Destructure the array into distinct coordinate variables for improved readability.
        const [x1, y1, x2, y2, x3, y3] = potentialCoordinates;

        // Step 3.3: Attempt to calculate the circle's properties using the extracted coordinates.
        const calculatedCircleDetails = computeCircumcircleProperties(x1, y1, x2, y2, x3, y3);

        // Step 3.4: If the circle properties were successfully computed (i.e., not null),
        // then output the results and terminate the iteration.
        if (calculatedCircleDetails) {
            outputFormattedCircleResults(calculatedCircleDetails.centerX, calculatedCircleDetails.centerY, calculatedCircleDetails.radius);
            return true; // Signal `some()` to stop processing further lines.
        }

        return false; // If computation failed for this line, continue to the next.
    });

    // Optional feedback: If no valid line was found throughout the input.
    // if (!wasAnyLineSuccessfullyProcessed) {
    //     console.log("No valid set of three points found in the input to determine a circle's properties.");
    // }

} catch (processingError) {
    // Catch and report any errors that occur during file reading or main processing.
    console.error("An unhandled error occurred during input processing:", processingError.message);
    // Exit the process with a non-zero code to indicate failure.
    process.exit(1);
}