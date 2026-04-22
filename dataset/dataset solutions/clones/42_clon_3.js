// This script processes geometric point data from standard input to calculate circumcenters and circumradii.
// Each line of input is expected to contain six space-separated floating-point numbers:
// x1 y1 x2 y2 x3 y3, representing the coordinates of three distinct points (Point1, Point2, Point3).
// The program then computes the (x, y) coordinates of the circumcenter and the circumradius
// for the triangle formed by these three points. Results are outputted to three decimal places.

// Acquire the Node.js file system module for input operations.
const fileSystemModule = require("fs");

/**
 * Safely parses a string into a floating-point number.
 * Returns 0.0 if the string cannot be parsed or results in NaN,
 * preventing potential issues with invalid input data.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed float or 0.0 if invalid.
 */
const parseNumericValue = (inputString) => {
    const parsedNumber = parseFloat(inputString);
    // Return the number if valid, otherwise return 0.0 to avoid NaN in calculations.
    // Note: In competitive programming, input is often guaranteed to be valid,
    // but this adds robustness as a Type III change.
    return isNaN(parsedNumber) ? 0.0 : parsedNumber;
};

// Read all input from the standard input stream (`/dev/stdin`).
// The input is decoded as UTF-8, trimmed of leading/trailing whitespace,
// and then split into an array of individual lines.
// Empty lines are filtered out to prevent processing malformed entries.
const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const dataLines = rawInputBuffer.trim().split('\n').filter(line => line.length > 0);

// Iterate over each valid line of input data.
// The `forEach` method is used here to process all lines, as its return value is not needed,
// which is functionally equivalent to the original `some` method's behavior when its callback
// consistently returns a falsy value (or implicitly `undefined`).
dataLines.forEach(function(currentDataEntry) {
    // Split the current line by spaces to obtain individual coordinate strings.
    const coordinateComponents = currentDataEntry.split(' ');

    // Perform a basic validation: ensure exactly six coordinate values are provided.
    // If the input line is malformed, a warning is logged, and the line is skipped.
    if (coordinateComponents.length !== 6) {
        console.error(`Warning: Input line skipped due to incorrect number of coordinates. Expected 6, got ${coordinateComponents.length}: "${currentDataEntry}"`);
        return; // Proceed to the next line of input.
    }

    // Parse the string coordinates into floating-point numbers.
    // Point A = (pointAX, pointAY)
    const pointAX = parseNumericValue(coordinateComponents[0]);
    const pointAY = parseNumericValue(coordinateComponents[1]);
    // Point B = (pointBX, pointBY)
    const pointBX = parseNumericValue(coordinateComponents[2]);
    const pointBY = parseNumericValue(coordinateComponents[3]);
    // Point C = (pointCX, pointCY)
    const pointCX = parseNumericValue(coordinateComponents[4]);
    const pointCY = parseNumericValue(coordinateComponents[5]);

    // Pre-calculate squared values for each coordinate.
    // This improves readability of the circumcenter formulas and avoids redundant operations.
    const pointAXSquared = pointAX * pointAX;
    const pointAYSquared = pointAY * pointAY;
    const pointBXSquared = pointBX * pointBX;
    const pointBYSquared = pointBY * pointBY;
    const pointCXSquared = pointCX * pointCX;
    const pointCYSquared = pointCY * pointCY;

    // Calculate the sum of squares (distance from origin squared) for each point.
    const sumSquaresPointA = pointAXSquared + pointAYSquared;
    const sumSquaresPointB = pointBXSquared + pointBYSquared;
    const sumSquaresPointC = pointCXSquared + pointCYSquared;

    // Calculate common differences between coordinates.
    // These terms appear repeatedly in the circumcenter formulas.
    const deltaY_AB = pointAY - pointBY; // (y1 - y2)
    const deltaY_AC = pointAY - pointCY; // (y1 - y3)
    const deltaX_AB = pointAX - pointBX; // (x1 - x2)
    const deltaX_AC = pointAX - pointCX; // (x1 - x3)
    const deltaY_BC = pointBY - pointCY; // (y2 - y3)
    const deltaX_BC = pointBX - pointCX; // (x2 - x3)

    // Calculate the common denominator for the circumcenter coordinates.
    // This expression represents twice the signed area of the triangle formed by the three points.
    // If this denominator is zero, the points are collinear, and a unique circumcircle does not exist.
    // The formula used here is derived from the original code's algebraic structure.
    const circumcenterDenominator = 2 * (deltaY_AC * deltaX_AB - deltaY_AB * deltaX_AC);

    // Define a small epsilon for floating-point comparisons.
    const NEAR_ZERO_THRESHOLD = 1e-9;

    // Check if the points are collinear or identical (degenerate triangle).
    // If the denominator is close to zero, a unique circumcenter cannot be determined.
    if (Math.abs(circumcenterDenominator) < NEAR_ZERO_THRESHOLD) {
        // While the original code would produce `Infinity` or `NaN` in this case,
        // adding an explicit check and logging an informational message is a Type III enhancement.
        // We still proceed with the division, which will naturally result in `Infinity` or `NaN` for coordinates.
        console.error(`Note: Points are collinear or not distinct. Circumcenter calculations may yield Infinity/NaN for input: "${currentDataEntry}"`);
    }

    // Calculate the numerator for the circumcenter's X-coordinate (circumcenterX).
    // This expression is derived from the original code's `p` numerator.
    const circumcenterX_Numerator = (deltaY_AC * (sumSquaresPointA - sumSquaresPointB)) -
                                    (deltaY_AB * (sumSquaresPointA - sumSquaresPointC));

    // Calculate the numerator for the circumcenter's Y-coordinate (circumcenterY).
    // This expression is derived from the original code's `q` numerator.
    const circumcenterY_Numerator = (deltaX_AC * (sumSquaresPointA - sumSquaresPointB)) -
                                    (deltaX_AB * (sumSquaresPointA - sumSquaresPointC));

    // Compute the circumcenter coordinates.
    // If `circumcenterDenominator` is zero, these values will be `Infinity` or `NaN`.
    const circumcenterX = circumcenterX_Numerator / circumcenterDenominator;
    const circumcenterY = circumcenterY_Numerator / circumcenterDenominator;

    // Calculate the circumradius. This is the distance from the circumcenter to any of the three points.
    // Using Point A for the distance calculation: sqrt((x_A - circumcenterX)^2 + (y_A - circumcenterY)^2).
    // Breaking down the calculation into intermediate steps for clarity.
    const deltaX_Center_A = pointAX - circumcenterX;
    const deltaY_Center_A = pointAY - circumcenterY;
    const circumradiusSquared = (deltaX_Center_A * deltaX_Center_A) + (deltaY_Center_A * deltaY_Center_A);
    const circumradius = Math.sqrt(circumradiusSquared);

    // Format the computed circumcenter coordinates and circumradius to three decimal places.
    // Using a template literal for a more modern and readable output format.
    console.log(
        `${circumcenterX.toFixed(3)} ${circumcenterY.toFixed(3)} ${circumradius.toFixed(3)}`
    );
});

// End of script execution.