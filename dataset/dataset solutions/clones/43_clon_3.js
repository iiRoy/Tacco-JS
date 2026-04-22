const calculateSquare = (value) => value * value;

const formatDecimalOutput = (numberValue) => numberValue.toFixed(3);

/**
 * Processes raw input data to find the circumcenter and circumradius
 * for multiple sets of three 2D points (triangles).
 *
 * The input is expected to be a string where:
 * - The first line contains an integer 'N', representing the number of test cases.
 * - Each subsequent line contains six space-separated floating-point numbers:
 *   x1 y1 x2 y2 x3 y3, which are the coordinates of the three vertices of a triangle.
 *
 * For each valid triangle, the function calculates and prints:
 * - The x-coordinate of the circumcenter.
 * - The y-coordinate of the circumcenter.
 * - The circumradius (distance from circumcenter to any vertex).
 * All outputs are formatted to three decimal places.
 *
 * Includes robust input validation and error handling for malformed data or degenerate triangles.
 *
 * @param {string} rawInputString - The complete input data as a single string.
 */
function determineCircumcircleProperties(rawInputString) {
    // Stage 1: Initial input parsing and validation.
    // Trim any leading/trailing whitespace from the entire input string, then split into individual lines.
    const individualInputLines = rawInputString.trim().split('\n');

    // Attempt to extract the total number of scenarios from the very first line.
    const scenarioCountString = individualInputLines.shift(); // Removes the first line and returns it.
    const totalScenarios = Number(scenarioCountString);

    // Critical validation: Ensure the total number of scenarios is a valid positive integer.
    if (isNaN(totalScenarios) || !Number.isInteger(totalScenarios) || totalScenarios < 0) {
        console.error("Error: The first line of input must be a non-negative integer indicating the number of test cases.");
        return; // Terminate execution if the input is fundamentally flawed.
    }

    // Stage 2: Iterate through each provided scenario (triangle).
    for (let currentScenarioIdx = 0; currentScenarioIdx < totalScenarios; currentScenarioIdx++) {
        // Defensive check: Verify that there are enough data lines for the declared number of scenarios.
        if (currentScenarioIdx >= individualInputLines.length) {
            console.error(`Warning: Expected ${totalScenarios} scenarios, but input data ended prematurely after ${currentScenarioIdx} lines.`);
            break; // Stop processing further if input is incomplete.
        }

        // Parse coordinates for the current triangle from its respective line.
        const currentCoordinateStrings = individualInputLines[currentScenarioIdx].split(' ');
        const currentNumericCoordinates = currentCoordinateStrings.map(Number);

        // Validation: Ensure exactly six valid numbers (three 2D points) are provided for each scenario.
        if (currentNumericCoordinates.length !== 6 || currentNumericCoordinates.some(isNaN)) {
            console.error(`Error: Scenario ${currentScenarioIdx + 1} has invalid or insufficient coordinate data. Expected 6 numbers.`);
            continue; // Skip this malformed scenario and proceed to the next.
        }

        // Destructure the array for clarity, assigning coordinates to descriptive variable names.
        const [
            point1X, point1Y,
            point2X, point2Y,
            point3X, point3Y
        ] = currentNumericCoordinates;

        // Stage 3: Pre-calculate common terms for the circumcenter formulas.
        // These differences are used extensively in the numerator and denominator.
        const deltaY_2_1 = point2Y - point1Y; // (y2 - y1)
        const deltaX_2_1 = point2X - point1X; // (x2 - x1)
        const deltaY_3_2 = point3Y - point2Y; // (y3 - y2)
        const deltaX_3_2 = point3X - point2X; // (x3 - x2)

        // Calculate a core part of the denominator. This term is related to twice the signed area of the triangle.
        // If this term is zero, the points are collinear, and a unique circumcenter does not exist.
        const denominatorCore = (deltaY_2_1 * deltaX_3_2) - (deltaX_2_1 * deltaY_3_2);
        const fullDenominatorForX = 2 * denominatorCore;

        // Guard clause: Detect collinear points (degenerate triangle).
        if (fullDenominatorForX === 0) {
            console.log("Collinear points detected. Circumcenter and circumradius are undefined for this triangle.");
            continue; // Skip this degenerate scenario.
        }

        // Pre-calculate squared magnitudes (x^2 + y^2) for each point.
        const magSq_P1 = calculateSquare(point1X) + calculateSquare(point1Y);
        const magSq_P2 = calculateSquare(point2X) + calculateSquare(point2Y);
        const magSq_P3 = calculateSquare(point3X) + calculateSquare(point3Y);

        // Intermediate terms for the numerators, derived from the original formula structure.
        const termSqDiff_P3_P2 = magSq_P3 - magSq_P2; // (x3^2 + y3^2) - (x2^2 + y2^2)
        const termSqDiff_P2_P1 = magSq_P2 - magSq_P1; // (x2^2 + y2^2) - (x1^2 + y1^2)

        // Stage 4: Calculate circumcenter coordinates using the algebraic formulas.
        // Numerator for the X-coordinate of the circumcenter.
        const numeratorForCircumX = (termSqDiff_P3_P2 * deltaY_2_1) - (termSqDiff_P2_P1 * deltaY_3_2);
        const finalCircumcenterX = numeratorForCircumX / fullDenominatorForX;

        // Numerator for the Y-coordinate of the circumcenter.
        // Note: The denominator for Y in the original formula has a sign inversion compared to X's denominator.
        // (x2-x1)*(y3-y2) - (y2-y1)*(x3-x2) = -[(y2-y1)*(x3-x2) - (x2-x1)*(y3-y2)] = -denominatorCore
        const fullDenominatorForY = 2 * ((deltaX_2_1 * deltaY_3_2) - (deltaY_2_1 * deltaX_3_2));
        const numeratorForCircumY = (termSqDiff_P3_P2 * deltaX_2_1) - (termSqDiff_P2_P1 * deltaX_3_2);
        const finalCircumcenterY = numeratorForCircumY / fullDenominatorForY;

        // Stage 5: Calculate the circumradius.
        // The circumradius is the distance from the circumcenter to any of the three vertices.
        // Using point1 (x1, y1) for calculation.
        const radiusSquared = calculateSquare(point1X - finalCircumcenterX) + calculateSquare(point1Y - finalCircumcenterY);
        const finalCircumradius = Math.sqrt(radiusSquared);

        // Stage 6: Output the results for the current scenario.
        // Format all three values to three decimal places before printing.
        console.log(`${formatDecimalOutput(finalCircumcenterX)} ${formatDecimalOutput(finalCircumcenterY)} ${formatDecimalOutput(finalCircumradius)}`);
    }
}

// Entry point: Read input from standard input and pass it to the main processing function.
determineCircumcircleProperties(require('fs').readFileSync('/dev/stdin', 'utf8'));