const INPUT_ENCODING = 'utf8';
const LINE_DELIMITER = '\n';
const VALUE_DELIMITER = ' ';
const TRUE_RESULT_MSG = 'YES';
const FALSE_RESULT_MSG = 'NO';
const COMPARISON_PRECISION = 6;
const REQUIRED_COORDINATES_PER_LINE = 8;

const fileSystemModule = require('fs');

/**
 * Computes the gradient (slope) of a line segment defined by two points.
 * Handles vertical lines by returning Infinity and identical points by returning NaN.
 * @param {number} xA - X-coordinate of the first point.
 * @param {number} yA - Y-coordinate of the first point.
 * @param {number} xB - X-coordinate of the second point.
 * @param {number} yB - Y-coordinate of the second point.
 * @returns {number} The slope value, Infinity for vertical lines, or NaN for identical points.
 */
function calculateLineGradient(xA, yA, xB, yB) {
    const deltaX = xB - xA;
    const deltaY = yB - yA;

    if (deltaX === 0) {
        if (deltaY === 0) {
            return NaN; // Degenerate case: identical points
        }
        return Infinity; // Vertical line
    }

    return deltaY / deltaX;
}

/**
 * Prints a given message to the standard output.
 * @param {string} messageToDisplay - The string content to be printed.
 */
function outputConsoleMessage(messageToDisplay) {
    console.log(messageToDisplay);
}

/**
 * Processes a single input string, extracting coordinate data and comparing slopes.
 * It expects 8 space-separated numeric values representing two pairs of 2D points.
 * @param {string} dataLine - A line of text containing coordinate data.
 */
function evaluateCoordinateData(dataLine) {
    const trimmedLine = dataLine.trim();
    if (!trimmedLine) {
        return; // Skip empty or whitespace-only lines
    }

    const coordinateTokens = trimmedLine.split(VALUE_DELIMITER);

    if (coordinateTokens.length < REQUIRED_COORDINATES_PER_LINE) {
        return; // Not enough data to form two line segments
    }

    // Convert string tokens to floating-point numbers
    const numericCoordinates = coordinateTokens
        .slice(0, REQUIRED_COORDINATES_PER_LINE)
        .map(val => parseFloat(val));

    // Validate if all parsed values are actual numbers
    if (numericCoordinates.some(isNaN)) {
        return; // Skip lines with non-numeric data
    }

    // Extracting points for the first line segment
    const p1_x1 = numericCoordinates[0];
    const p1_y1 = numericCoordinates[1];
    const p1_x2 = numericCoordinates[2];
    const p1_y2 = numericCoordinates[3];

    // Extracting points for the second line segment
    const p2_x1 = numericCoordinates[4];
    const p2_y1 = numericCoordinates[5];
    const p2_x2 = numericCoordinates[6];
    const p2_y2 = numericCoordinates[7];

    // Calculate gradients for both segments
    const firstSegmentGradient = calculateLineGradient(p1_x1, p1_y1, p1_x2, p1_y2);
    const secondSegmentGradient = calculateLineGradient(p2_x1, p2_y1, p2_x2, p2_y2);

    // Compare gradients after formatting to a fixed precision, as per original logic.
    // This approach effectively compares their string representations.
    const formattedGradientA = firstSegmentGradient.toFixed(COMPARISON_PRECISION);
    const formattedGradientB = secondSegmentGradient.toFixed(COMPARISON_PRECISION);

    if (formattedGradientA === formattedGradientB) {
        outputConsoleMessage(TRUE_RESULT_MSG);
    } else {
        outputConsoleMessage(FALSE_RESULT_MSG);
    }
}

// Main execution block: Read input from standard input and process each line.
try {
    const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', INPUT_ENCODING);
    const allInputLines = rawInputContent.split(LINE_DELIMITER);

    // Iterate through each line and apply the processing logic
    allInputLines.forEach(evaluateCoordinateData);

} catch (inputReadError) {
    // In a production environment, this error would be logged or handled more gracefully.
    // For competitive programming, sometimes simple failure or exit is sufficient.
    // console.error("An error occurred while attempting to read input:", inputReadError.message);
}