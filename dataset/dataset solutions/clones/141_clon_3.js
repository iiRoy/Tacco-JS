const fileSystemUtility = require('fs');

/**
 * Attempts to parse a string into a floating-point number.
 * Returns NaN if the input string cannot be successfully converted to a number.
 * @param {string} textValue - The string to be parsed.
 * @returns {number} The parsed float or NaN.
 */
function safelyParseFloat(textValue) {
    const numericalRepresentation = parseFloat(textValue);
    return isNaN(numericalRepresentation) ? NaN : numericalRepresentation;
}

/**
 * Calculates the gradient (slope) of a line segment defined by two points.
 * Handles vertical lines by returning Infinity or -Infinity, consistent with division by zero.
 * @param {number} xCoordA - X-coordinate of the first point.
 * @param {number} yCoordA - Y-coordinate of the first point.
 * @param {number} xCoordB - X-coordinate of the second point.
 * @param {number} yCoordB - Y-coordinate of the second point.
 * @returns {number} The computed slope value.
 */
const calculateLineSegmentGradient = (xCoordA, yCoordA, xCoordB, yCoordB) => {
    const horizontalDifference = xCoordB - xCoordA;
    const verticalDifference = yCoordB - yCoordA;

    // Division by zero for horizontalDifference will result in Infinity, -Infinity, or NaN (0/0).
    // The original logic handles these cases correctly for the non-negative check.
    return verticalDifference / horizontalDifference;
};

/**
 * Determines a binary outcome string ('TRUE' or 'FALSE') based on whether a given count is odd or even.
 * @param {number} evaluationCount - The integer count to check.
 * @returns {string} 'TRUE' if count is odd, 'FALSE' if count is even.
 */
const generateBinaryOutcome = (evaluationCount) => {
    // Using a strict inequality check for oddness.
    return (evaluationCount % 2 !== 0) ? 'TRUE' : 'FALSE';
};

/**
 * Processes a collection of input data lines, each containing geometric coordinates.
 * For each valid line, it calculates segment gradients and outputs a specific pattern result.
 * @param {string[]} dataLinesForProcessing - An array of raw string lines from the input source.
 */
function analyzeGeometricPattern(dataLinesForProcessing) {
    const REQUIRED_COORDINATE_PAIR_COUNT = 4; // Four points means 8 coordinate values.
    const EXPECTED_NUMERIC_VALUES_PER_LINE = REQUIRED_COORDINATE_PAIR_COUNT * 2;

    for (let currentLineIndex = 0; currentLineIndex < dataLinesForProcessing.length; ++currentLineIndex) {
        const currentInputRow = dataLinesForProcessing[currentLineIndex].trim();

        // Skip any lines that are empty after trimming whitespace.
        if (currentInputRow.length === 0) {
            continue;
        }

        // Divide the line into its individual coordinate string components.
        const stringCoordinateTokens = currentInputRow.split(',');

        // Enforce the expected number of coordinate components.
        if (stringCoordinateTokens.length !== EXPECTED_NUMERIC_VALUES_PER_LINE) {
            console.error(`Warning: Skipping malformed input line #${currentLineIndex + 1}. Expected ${EXPECTED_NUMERIC_VALUES_PER_LINE} values, found ${stringCoordinateTokens.length}. Content: "${currentInputRow}"`);
            continue;
        }

        // Convert string tokens to an array of numbers, validating each conversion.
        const parsedNumericCoordinates = [];
        let lineParsingFailed = false;
        for (const token of stringCoordinateTokens) {
            const coordinateValue = safelyParseFloat(token);
            if (isNaN(coordinateValue)) {
                console.error(`Error: Non-numeric coordinate found in line #${currentLineIndex + 1}: "${token}". Skipping line. Content: "${currentInputRow}"`);
                lineParsingFailed = true;
                break;
            }
            parsedNumericCoordinates.push(coordinateValue);
        }

        if (lineParsingFailed) {
            continue; // Proceed to the next line if current one had parsing issues.
        }

        // Destructure the parsed numeric coordinates for explicit point representation.
        const [
            point1X, point1Y,
            point2X, point2Y,
            point3X, point3Y,
            point4X, point4Y
        ] = parsedNumericCoordinates;

        // Compute the slopes for the four segments connecting the points in sequence (P1-P2, P2-P3, P3-P4, P4-P1).
        const gradientSegmentA = calculateLineSegmentGradient(point1X, point1Y, point2X, point2Y);
        const gradientSegmentB = calculateLineSegmentGradient(point2X, point2Y, point3X, point3Y);
        const gradientSegmentC = calculateLineSegmentGradient(point3X, point3Y, point4X, point4Y);
        const gradientSegmentD = calculateLineSegmentGradient(point4X, point4Y, point1X, point1Y);

        // Aggregate all calculated gradients into a single collection.
        const allGradients = [
            gradientSegmentA,
            gradientSegmentB,
            gradientSegmentC,
            gradientSegmentD
        ];

        // Count how many of these gradients are non-negative (i.e., greater than or equal to zero).
        let nonNegativeGradientCounter = 0;
        for (const currentGradientValue of allGradients) {
            if (currentGradientValue >= 0) {
                nonNegativeGradientCounter++;
            }
        }
        
        // Log the final result based on the parity of the non-negative gradient count.
        console.log(generateBinaryOutcome(nonNegativeGradientCounter));
    }
}

// --- Application Entry Point ---
let standardInputContents = '';
try {
    // Attempt to read all data from standard input in one go, as UTF-8 text.
    standardInputContents = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
} catch (inputReadError) {
    // If reading from stdin fails, log an error and terminate the process.
    console.error('Fatal Error: Unable to read from standard input. Details:', inputReadError.message);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Prepare the input: split into lines and remove any completely empty lines.
const processedInputLineArray = standardInputContents
    .split('\n')
    .filter(individualLine => individualLine.trim().length > 0);

// Initiate the primary analysis function with the cleaned input data.
analyzeGeometricPattern(processedInputLineArray);