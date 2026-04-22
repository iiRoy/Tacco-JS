// This module processes a single line of coordinate data to determine the remaining vertices of a square.
// Given two adjacent vertices (P1 and P2), it calculates the coordinates of P3 and P4.

/**
 * Calculates the coordinates of the third and fourth vertices of a square.
 * The square is formed by two given adjacent vertices, P1 and P2.
 * The calculation assumes a counter-clockwise orientation for P1-P2-P3-P4.
 *
 * @param {string} rawDataString - A string containing space-separated integer coordinates: "x1 y1 x2 y2".
 * @returns {string} A space-separated string of the calculated coordinates: "x3 y3 x4 y4",
 *                   or an error message if input parsing fails.
 */
function ProcessCoordinatesForSquare(rawDataString) {
    // Validate the initial input string to ensure it's not empty or invalid.
    if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
        return "ERROR: INPUT_DATA_MISSING_OR_INVALID";
    }

    // Extract the first significant line from the input string and trim whitespace.
    const coordinateLine = rawDataString.trim().split('\n')[0];

    // Split the line into individual string tokens based on spaces.
    const stringTokens = coordinateLine.split(' ');

    // Verify that exactly four coordinate values were provided.
    if (stringTokens.length !== 4) {
        return "ERROR: INCORRECT_NUMBER_OF_COORDINATES_SUPPLIED";
    }

    // Attempt to convert string tokens into numeric values.
    const numericValues = stringTokens.map(str => {
        const num = Number(str);
        // Include a check for non-numeric input values.
        if (isNaN(num)) {
            return "ERROR: NON_NUMERIC_COORDINATE_ENCOUNTERED";
        }
        return num;
    });

    // Check if any errors occurred during the numeric conversion process.
    if (numericValues.some(val => typeof val === 'string' && val.startsWith("ERROR"))) {
        // Return the first error encountered for debugging purposes.
        return numericValues.find(val => typeof val === 'string' && val.startsWith("ERROR"));
    }

    // Destructure the parsed numeric coordinates for better readability.
    const [
        pt1x, // X-coordinate of the first reference point (P1)
        pt1y, // Y-coordinate of the first reference point (P1)
        pt2x, // X-coordinate of the second reference point (P2)
        pt2y  // Y-coordinate of the second reference point (P2)
    ] = numericValues;

    // Calculate the vector components (delta_x, delta_y) representing the segment P1P2.
    // These intermediate variables improve clarity and reduce redundant calculations.
    const deltaX_vec = pt2x - pt1x;
    const deltaY_vec = pt2y - pt1y;

    // Calculate the coordinates of the third vertex (P3).
    // This is achieved by rotating the vector P1P2 by 90 degrees counter-clockwise
    // around P2. A vector (dx, dy) rotated 90 deg CCW becomes (-dy, dx).
    const pt3x = pt2x - deltaY_vec;
    const pt3y = pt2y + deltaX_vec;

    // Calculate the coordinates of the fourth vertex (P4).
    // This point completes the square and is found by adding the rotated vector
    // (-deltaY_vec, deltaX_vec) to the first point P1.
    const pt4x = pt1x - deltaY_vec;
    const pt4y = pt1y + deltaX_vec;

    // Construct the final output string using a template literal for clean formatting.
    const outputResult = `${pt3x} ${pt3y} ${pt4x} ${pt4y}`;

    // Return the formatted string of calculated coordinates.
    return outputResult;
}

// Immediately Invoked Function Expression (IIFE) for the main execution flow.
// This structure encapsulates the main logic and prevents global scope pollution.
(function executeCoordinateCalculation() {
    let rawInputData;
    try {
        // Attempt to read all content from the standard input file descriptor.
        rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (fileReadError) {
        // Log an error message if reading from stdin fails, providing details.
        console.log(`ERROR: FAILED_TO_ACQUIRE_INPUT_STREAM_DATA - ${fileReadError.message}`);
        // Exit the execution gracefully if input cannot be read.
        return;
    }

    // Invoke the core processing function with the obtained input data.
    const finalCoordinateOutput = ProcessCoordinatesForSquare(rawInputData);

    // Print the final computed output to standard output.
    console.log(finalCoordinateOutput);
})();