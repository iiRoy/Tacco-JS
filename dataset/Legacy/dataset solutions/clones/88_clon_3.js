var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = fileContent.split('\n');

// Helper function to convert a space-separated string of numbers into an array of floating-point numbers.
function extractNumericCoordinates(lineOfText) {
    const stringParts = lineOfText.split(' ');
    const numericValues = [];
    let currentPartIndex = 0;
    while (currentPartIndex < stringParts.length) {
        numericValues.push(parseFloat(stringParts[currentPartIndex]));
        currentPartIndex++;
    }
    return numericValues;
}

// Helper function to determine if two line segments are parallel.
// Segment A is defined by (ax1, ay1) and (ax2, ay2).
// Segment B is defined by (bx1, by1) and (bx2, by2).
function checkSegmentParallelism(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    // Calculate the change in x and y for the first segment (vector A).
    const deltaX_A = ax2 - ax1;
    const deltaY_A = ay2 - ay1;

    // Calculate the change in x and y for the second segment (vector B).
    const deltaX_B = bx2 - bx1;
    const deltaY_B = by2 - by1;

    // For two vectors (dx1, dy1) and (dx2, dy2) to be parallel, their 2D cross product must be zero:
    // (dx1 * dy2) - (dx2 * dy1) == 0
    // This is equivalent to: (dx1 * dy2) == (dx2 * dy1)

    // The original code's comparison: ((x2 - x1) * (y4 - y3)) == ((x4 - x3) * (y2 - y1))
    // Maps to: (deltaX_A * deltaY_B) == (deltaX_B * deltaY_A)

    const crossProductTerm1 = deltaX_A * deltaY_B;
    const crossProductTerm2 = deltaX_B * deltaY_A;

    // Floating-point comparisons require careful handling, typically by comparing fixed-precision strings.
    const fixedPrecisionTerm1 = crossProductTerm1.toFixed(12);
    const fixedPrecisionTerm2 = crossProductTerm2.toFixed(12);

    return fixedPrecisionTerm1 === fixedPrecisionTerm2;
}

var numTestCases = +dataLines.shift(); // The first line indicates the number of test cases.

for (let currentCaseIndex = 0; currentCaseIndex < numTestCases; currentCaseIndex++) {
    const currentLineOfCoordinates = dataLines.shift();
    const parsedNumericValues = extractNumericCoordinates(currentLineOfCoordinates);

    // Destructure the array of 8 numbers into individual coordinate variables for clarity.
    const [
        segment1_x1, segment1_y1,
        segment1_x2, segment1_y2,
        segment2_x1, segment2_y1,
        segment2_x2, segment2_y2
    ] = parsedNumericValues;

    // Use the helper function to check if the two segments are parallel.
    if (checkSegmentParallelism(
        segment1_x1, segment1_y1, segment1_x2, segment1_y2,
        segment2_x1, segment2_y1, segment2_x2, segment2_y2
    )) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}
