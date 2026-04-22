'use strict';

/**
 * Calculates the sum of interior angles of a polygon given its number of sides.
 * This function processes raw string input, validates it, and then performs the calculation.
 *
 * @param {string} rawInputText The raw string input, expected to be a number representing the side count.
 * @returns {void} Prints the calculated sum of angles to the console.
 */
function computePolygonInternalAngles(rawInputText) {
    // Define a constant for the base degrees in a triangle, used in the polygon angle formula.
    // This is an added intermediate variable for clarity and potential reusability (Type III).
    const DEGREES_PER_TRIANGLE_UNIT = 180;

    // Attempt to parse the input string into an integer.
    // Using parseInt with radix 10 for explicit base conversion (Type II/III - more robust parsing).
    let polygonSidesCount = parseInt(rawInputText.trim(), 10);

    // --- Input Validation and Guard Clauses (Type III Additions) ---

    // Check if the parsed input is actually a valid number.
    if (isNaN(polygonSidesCount)) {
        console.error("Error: Provided input is not a valid numerical representation of polygon sides. Please provide an integer.");
        // Exit the function if input is invalid.
        return;
    }

    // Check if the polygon has a minimum of 3 sides.
    // A geometric polygon requires at least 3 sides to form a closed shape.
    if (polygonSidesCount < 3) {
        // Log a warning but proceed with calculation, as the formula still works mathematically,
        // though it represents a degenerate or non-standard polygon for N < 3.
        // This is a behavioral update and guard clause (Type III).
        console.warn(`Warning: A polygon typically requires at least 3 sides. Calculating for ${polygonSidesCount} sides.`);
        // For N=0,1,2, the formula (N-2)*180 gives -360, -180, 0 respectively.
        // The problem implicitly assumes valid N for a polygon, but this adds robustness.
    }

    // --- Core Calculation (Type III Modifications - Intermediate Steps) ---

    // Calculate the number of triangles a polygon can be divided into from one vertex.
    // This is an intermediate step, breaking down the original formula (Type III).
    const equivalentTriangleCount = polygonSidesCount - 2;

    // Calculate the total sum of interior angles.
    // This uses the intermediate constant and variable (Type III).
    const totalInteriorAngleSum = equivalentTriangleCount * DEGREES_PER_TRIANGLE_UNIT;

    // Output the final result to the standard output.
    // The output mechanism remains similar but is now contextualized by the preceding logic.
    console.log(totalInteriorAngleSum);
}

/**
 * Helper function to read input from standard input (stdin).
 * Encapsulates the file system reading logic for better modularity (Type III addition).
 * @returns {string} The trimmed content read from stdin.
 */
function acquireInputData() {
    // Use 'utf8' encoding to properly interpret characters.
    // .trim() removes leading/trailing whitespace, including newlines (Type II/III refinement).
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

// Execute the main logic by first acquiring the input and then processing it.
// This separates input acquisition from the main processing function (Type III structural change).
const receivedInputLine = acquireInputData();
computePolygonInternalAngles(receivedInputLine);