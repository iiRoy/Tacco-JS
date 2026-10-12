const fileSystem = require('fs');

const FLOATING_POINT_TOLERANCE = 1e-10;

function parseLineToNumbers(lineString) {
    return lineString.split(" ").map(Number);
}

function determinePerpendicularity(pointCoordinates) {
    const [x_a, y_a, x_b, y_b, x_c, y_c, x_d, y_d] = pointCoordinates;

    const vector1_deltaX = x_b - x_a;
    const vector1_deltaY = y_b - y_a;
    const vector2_deltaX = x_d - x_c;
    const vector2_deltaY = y_d - y_c;

    // Check for vertical lines first
    if (Math.abs(vector1_deltaX) < FLOATING_POINT_TOLERANCE) {
        // Line 1 is vertical. For perpendicularity, Line 2 must be horizontal.
        return Math.abs(vector2_deltaY) < FLOATING_POINT_TOLERANCE;
    } else if (Math.abs(vector2_deltaX) < FLOATING_POINT_TOLERANCE) {
        // Line 2 is vertical. For perpendicularity, Line 1 must be horizontal.
        return Math.abs(vector1_deltaY) < FLOATING_POINT_TOLERANCE;
    } else {
        // Neither line is vertical. Calculate slopes.
        const slopeOfLine1 = vector1_deltaY / vector1_deltaX;
        const slopeOfLine2 = vector2_deltaY / vector2_deltaX;
        // Perpendicular if product of slopes is -1
        return Math.abs(slopeOfLine1 * slopeOfLine2 + 1) < FLOATING_POINT_TOLERANCE;
    }
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.trim().split("\n");

for (const currentInputLine of inputLinesArray) {
    const parsedNumbers = parseLineToNumbers(currentInputLine);
    const isPerpendicularResult = determinePerpendicularity(parsedNumbers);
    const outputString = isPerpendicularResult ? "YES" : "NO";
    console.log(outputString);
}
