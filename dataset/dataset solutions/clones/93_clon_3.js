const fileSystem = require('node:fs'); // Import the Node.js file system module for input operations.

/**
 * Computes the Euclidean distance between two points in a 2D Cartesian coordinate system.
 * This helper function avoids Math.pow for squaring to potentially improve performance slightly
 * and enhance readability for simple squaring operations.
 *
 * @param {number} point1X - The X-coordinate of the first point.
 * @param {number} point1Y - The Y-coordinate of the first point.
 * @param {number} point2X - The X-coordinate of the second point.
 * @param {number} point2Y - The Y-coordinate of the second point.
 * @returns {number} The calculated distance between the two points.
 */
function calculateEuclideanDistance(point1X, point1Y, point2X, point2Y) {
    const horizontalDifference = point1X - point2X;
    const verticalDifference = point1Y - point2Y;
    const sumOfSquaredDifferences = (horizontalDifference * horizontalDifference) + (verticalDifference * verticalDifference);
    return Math.sqrt(sumOfSquaredDifferences);
}

/**
 * Determines and returns a numerical code representing the spatial relationship
 * between two circles. The logic for these codes is derived directly from the
 * problem's specifications to maintain functional equivalence.
 *
 * Relationship Codes:
 *   0: Circles are entirely separate; there is no overlap or contact.
 *   1: Circles intersect at two distinct points, or they touch externally at one point.
 *   2: The second circle (C2) is completely contained within the first circle (C1),
 *      or it touches C1 internally at one point.
 *  -2: The first circle (C1) is completely contained within the second circle (C2),
 *      or it touches C2 internally at one point.
 *
 * @param {number} circleOneCenterX - X-coordinate of the first circle's center.
 * @param {number} circleOneCenterY - Y-coordinate of the first circle's center.
 * @param {number} circleOneRadius - Radius of the first circle.
 * @param {number} circleTwoCenterX - X-coordinate of the second circle's center.
 * @param {number} circleTwoCenterY - Y-coordinate of the second circle's center.
 * @param {number} circleTwoRadius - Radius of the second circle.
 * @returns {number} An integer indicating the geometric relationship.
 */
function determineCircleRelationCode(
    circleOneCenterX, circleOneCenterY, circleOneRadius,
    circleTwoCenterX, circleTwoCenterY, circleTwoRadius
) {
    let relationResultCode; // Variable to store the computed relationship code.

    // Compute the distance between the centers of the two circles.
    const centerSeparationDistance = calculateEuclideanDistance(
        circleOneCenterX, circleOneCenterY,
        circleTwoCenterX, circleTwoCenterY
    );

    // Pre-calculate sums and differences of radii for use in conditions.
    const sumOfBothRadii = circleOneRadius + circleTwoRadius;
    const radiusDifference_C1_minus_C2 = circleOneRadius - circleTwoRadius;
    const radiusDifference_C2_minus_C1 = circleTwoRadius - circleOneRadius;

    // Check the primary condition: Are the circles entirely separate?
    // If the distance between centers is greater than the sum of their radii, they cannot touch or overlap.
    if (centerSeparationDistance > sumOfBothRadii) {
        relationResultCode = 0; // Circles are distinct and non-overlapping.
    } else {
        // If not entirely separate, they must either intersect, touch, or one must contain the other.
        // The problem's logic sets a default of '1' for intersection/external touch,
        // then refines this if internal containment conditions are met.
        relationResultCode = 1; // Default: intersecting or touching externally.

        // Secondary condition: Is the second circle (C2) inside or touching the first circle (C1) internally?
        // This applies when the distance is less than or equal to (Radius1 - Radius2).
        if (centerSeparationDistance <= radiusDifference_C1_minus_C2) {
            relationResultCode = 2; // C2 is enclosed by or touches C1 internally.
        }

        // Tertiary condition: Is the first circle (C1) inside or touching the second circle (C2) internally?
        // This applies when the distance is less than or equal to (Radius2 - Radius1).
        // IMPORTANT: If both secondary and tertiary conditions are true (e.g., for identical concentric circles,
        // where distance = 0 and R1 = R2, making R1-R2=0 and R2-R1=0), the LAST assignment will prevail.
        // This behavior precisely mirrors the original code's sequential if-statements.
        if (centerSeparationDistance <= radiusDifference_C2_minus_C1) {
            relationResultCode = -2; // C1 is enclosed by or touches C2 internally.
        }
    }

    return relationResultCode;
}

/**
 * Orchestrates the entire process: reading input, parsing data,
 * calculating circle relationships, and printing the results.
 * This serves as the main execution block for the script.
 */
function executeCircleRelationshipProcessor() {
    let rawInputString;
    // Attempt to read all input data from the standard input stream.
    // '/dev/stdin' is a common convention for reading standard input in Node.js
    // environments, especially in competitive programming platforms.
    try {
        rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        // Log an error if input cannot be read and terminate gracefully.
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        return;
    }

    // Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
    const processedInputLines = rawInputString.trim().split('\n');

    // The first line of input specifies the total count of test cases to process.
    // Use Number.parseInt with a radix for explicit base-10 conversion.
    const totalNumberOfTestCases = Number.parseInt(processedInputLines.shift(), 10);

    // Perform basic validation on the parsed number of test cases.
    if (isNaN(totalNumberOfTestCases) || totalNumberOfTestCases < 0) {
        console.error("Error: The first line of input must be a non-negative integer representing the number of test cases.");
        return;
    }

    // Loop through each test case, from the first (index 0) up to the total count.
    for (let currentCaseIdentifier = 0; currentCaseIdentifier < totalNumberOfTestCases; currentCaseIdentifier++) {
        const currentCaseLine = processedInputLines[currentCaseIdentifier];

        // Ensure that a line of data actually exists for the current test case.
        if (!currentCaseLine) {
            console.error(`Warning: Missing data line for test case #${currentCaseIdentifier + 1}. Skipping.`);
            continue; // Move to the next iteration if data is missing.
        }

        // Parse the current line: split by spaces and convert each segment to a number.
        // This yields an array of six numerical parameters: [C1x, C1y, R1, C2x, C2y, R2].
        const circleParametersArray = currentCaseLine.split(' ').map(Number);

        // Validate the parsed parameters: check if exactly 6 numbers were parsed and none are NaN.
        if (circleParametersArray.length !== 6 || circleParametersArray.some(val => isNaN(val))) {
            console.error(`Warning: Invalid parameter format for test case #${currentCaseIdentifier + 1}. Expected 6 numbers, got "${currentCaseLine}". Skipping.`);
            continue; // Skip this test case if parameters are malformed.
        }

        // Use array destructuring to assign the parsed numerical values to descriptive variables.
        const [
            circleA_X, circleA_Y, circleA_Radius,
            circleB_X, circleB_Y, circleB_Radius
        ] = circleParametersArray;

        // Call the core logic function to compute the relationship for the current pair of circles.
        const computedRelationshipStatus = determineCircleRelationCode(
            circleA_X, circleA_Y, circleA_Radius,
            circleB_X, circleB_Y, circleB_Radius
        );

        // Output the resulting relationship code to standard output.
        console.log(computedRelationshipStatus);
    }
}

// Initiate the main program execution.
executeCircleRelationshipProcessor();