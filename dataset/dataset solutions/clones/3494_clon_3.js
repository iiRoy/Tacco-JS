'use strict';

/**
 * Parses a string to an integer, providing a default value if parsing fails.
 * @param {string} strValue - The string to parse.
 * @param {number} defaultValue - The value to return if parsing results in NaN.
 * @returns {number} The parsed integer or the default value.
 */
const parseInteger = (strValue, defaultValue = 0) => {
    const parsed = parseInt(strValue, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Calculates the Manhattan distance between two points (x1, y1) and (x2, y2).
 * @param {number} x1 - X-coordinate of the first point.
 * @param {number} y1 - Y-coordinate of the first point.
 * @param {number} x2 - X-coordinate of the second point.
 * @param {number} y2 - Y-coordinate of the second point.
 * @returns {number} The Manhattan distance.
 */
const calculateManhattanDistance = (x1, y1, x2, y2) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

/**
 * Determines if a single observation point's data is consistent with a
 * hypothetical pyramid defined by its apex coordinates and total height.
 * Handles cases where the observed height is zero (point on the pyramid's base).
 *
 * @param {number} currentApexX - The X-coordinate of the hypothetical pyramid's apex.
 * @param {number} currentApexY - The Y-coordinate of the hypothetical pyramid's apex.
 * @param {number} proposedPyramidHeight - The total height of the hypothetical pyramid.
 * @param {number} observedPointX - The X-coordinate of the observation point.
 * @param {number} observedPointY - The Y-coordinate of the observation point.
 * @param {number} observedPointH - The height observed at the observation point.
 * @returns {boolean} True if the observation is consistent, false otherwise.
 */
const checkObservationConsistency = (currentApexX, currentApexY, proposedPyramidHeight, observedPointX, observedPointY, observedPointH) => {
    const distanceToObsPoint = calculateManhattanDistance(currentApexX, currentApexY, observedPointX, observedPointY);

    if (observedPointH === 0) {
        // If observed height is 0, the point must be exactly on the base edge of the pyramid.
        // This implies the pyramid's total height must be equal to the Manhattan distance from its apex.
        return proposedPyramidHeight === distanceToObsPoint;
    } else {
        // If observed height is greater than 0, the pyramid's total height
        // must be the sum of the observed height and the Manhattan distance.
        // Also, the proposed pyramid height must be at least the observed height.
        // (This second condition is implicitly covered by the first equality check if all values are non-negative)
        return proposedPyramidHeight === observedPointH + distanceToObsPoint;
    }
};

/**
 * The main function to locate the pyramid's apex coordinates and its total height.
 * It iterates through all possible apex coordinates within a 101x101 grid (0-100)
 * and checks for consistency with all provided observation points.
 *
 * @param {string[]} problemDataLines - An array of strings, where the first string
 *                                      is the number of observation points, and
 *                                      subsequent strings are "x y h" for each point.
 */
const locatePyramidApex = problemDataLines => {
    const totalObservationCount = parseInteger(problemDataLines[0]);

    // Pre-allocate arrays for observation data.
    // Using Array.from for explicit size and initial undefined elements.
    const observationXCoords = Array.from({ length: totalObservationCount });
    const observationYCoords = Array.from({ length: totalObservationCount });
    const observationHeights = Array.from({ length: totalObservationCount });

    // Constants for parsing data within each line
    const X_COORD_INDEX = 0;
    const Y_COORD_INDEX = 1;
    const H_COORD_INDEX = 2;

    // Parse the input data for each observation point.
    for (let dataLineIdx = 0; dataLineIdx < totalObservationCount; ++dataLineIdx) {
        const currentLineTokens = problemDataLines[dataLineIdx + 1].split(' ');
        observationXCoords[dataLineIdx] = parseInteger(currentLineTokens[X_COORD_INDEX]);
        observationYCoords[dataLineIdx] = parseInteger(currentLineTokens[Y_COORD_INDEX]);
        observationHeights[dataLineIdx] = parseInteger(currentLineTokens[H_COORD_INDEX]);
    }

    // Define the search boundaries for the pyramid's apex.
    const MIN_GRID_COORD = 0;
    const MAX_GRID_COORD = 100;

    // Iterate through all possible X-coordinates for the pyramid's apex.
    for (let candidateApexX = MIN_GRID_COORD; candidateApexX <= MAX_GRID_COORD; ++candidateApexX) {
        // Iterate through all possible Y-coordinates for the pyramid's apex.
        for (let candidateApexY = MIN_GRID_COORD; candidateApexY <= MAX_GRID_COORD; ++candidateApexY) {

            // Determine a hypothetical total height for the pyramid based on the first observation point.
            // This height will then be validated against all other points.
            const initialObsX = observationXCoords[0];
            const initialObsY = observationYCoords[0];
            const initialObsH = observationHeights[0];
            const initialManhattanDistance = calculateManhattanDistance(candidateApexX, candidateApexY, initialObsX, initialObsY);
            const hypothesizedPyramidHeight = initialObsH + initialManhattanDistance;

            // Flag to track if the current (candidateApexX, candidateApexY) and
            // hypothesizedPyramidHeight are consistent with all observations.
            let allObservationsAreConsistent = true;

            // Loop through all observation points (starting from the second one, as the first was used to hypothesize height).
            for (let checkObsIdx = 0; checkObsIdx < totalObservationCount; ++checkObsIdx) {
                const currentObsX = observationXCoords[checkObsIdx];
                const currentObsY = observationYCoords[checkObsIdx];
                const currentObsH = observationHeights[checkObsIdx];

                // If the hypothesized height leads to a negative observed height for a point with H > 0,
                // or if it's otherwise inconsistent, this candidate is invalid.
                if (!checkObservationConsistency(candidateApexX, candidateApexY, hypothesizedPyramidHeight, currentObsX, currentObsY, currentObsH)) {
                    allObservationsAreConsistent = false;
                    break; // No need to check further observations for this candidate apex.
                }
            }

            // If all observations were consistent with this candidate apex and height, we found our solution.
            if (allObservationsAreConsistent) {
                // Output the found apex coordinates and the pyramid's total height.
                console.log(`${candidateApexX} ${candidateApexY} ${hypothesizedPyramidHeight}`);
                return; // Exit the function as the problem asks for a single solution.
            }
        }
    }
};

// Entry point for the Node.js environment.
// Reads input from standard input, splits it by newline, and passes it to the main logic.
locatePyramidApex(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));