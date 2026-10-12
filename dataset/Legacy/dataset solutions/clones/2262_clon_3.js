/**
 * This script computes the radius of the minimum enclosing circle for a given set of 2D points.
 * The algorithm handles edge cases for two points and then iterates through all unique triplets
 * of points to find a candidate circle. For each triplet, it determines if the triangle formed
 * is obtuse/right-angled (in which case the diameter is the longest side) or acute (using the
 * circumcircle). It then validates if the candidate circle encloses all points.
 * The specific iteration and early-exit logic implies a particular problem constraint
 * where the first valid enclosing circle found by this enumeration is considered the answer.
 */

/**
 * Parses a string of input data and calculates the radius of the minimum enclosing circle.
 *
 * @param {string} rawInputData The input string, where the first line is the number of points (N),
 *                              followed by N lines, each containing two space-separated integers (x y)
 *                              representing point coordinates.
 * @returns {number} The calculated radius of the minimum enclosing circle.
 */
function calculateMinEnclosingRadius(rawInputData) {

    // --- Helper Functions for Geometry Calculations ---

    /**
     * Parses a single point string "x y" into a [x, y] array.
     * @param {string} pointString A string representing a 2D point (e.g., "10 20").
     * @returns {number[]} An array [x, y] of parsed coordinates.
     */
    const parseCoordinatePair = (pointString) => {
        const coordinateParts = pointString.split(" ");
        // Using Number.parseFloat for robustness, though problem typically implies integers.
        return [Number.parseFloat(coordinateParts[0]), Number.parseFloat(coordinateParts[1])];
    };

    /**
     * Computes the squared Euclidean distance between two points.
     * @param {number[]} pA The first point [x, y].
     * @param {number[]} pB The second point [x, y].
     * @returns {number} The squared distance between pA and pB.
     */
    const computeSquaredDistance = (pA, pB) => {
        const deltaX = pA[0] - pB[0];
        const deltaY = pA[1] - pB[1];
        // Using direct multiplication for performance and clarity over Math.pow(val, 2).
        return deltaX * deltaX + deltaY * deltaY;
    };

    /**
     * Determines the squared radius of a circle given its center and any point on its circumference.
     * @param {number[]} centerCoords The center of the circle [cx, cy].
     * @param {number[]} boundaryPoint A point on the circle's circumference [px, py].
     * @returns {number} The squared radius.
     */
    const getSquaredRadiusFromCenterAndPoint = (centerCoords, boundaryPoint) => {
        return computeSquaredDistance(centerCoords, boundaryPoint);
    };

    // --- Input Parsing ---

    let inputLines = rawInputData.split("\n");
    const totalPointCount = Number.parseInt(inputLines[0], 10);

    // Extract point coordinates from the input lines, skipping the first line (which contains totalPointCount).
    // The slice operation also implicitly handles potential empty lines at the end.
    const pointList = inputLines.slice(1, totalPointCount + 1).map(parseCoordinatePair);

    let calculatedMinRadius = 0.0; // Initialize the result, using a floating-point type for precision.

    // --- Main Algorithm Logic ---

    // Edge case: If there are only two points, the minimum enclosing circle has
    // the segment connecting them as its diameter.
    if (totalPointCount === 2) {
        const distanceBetweenPoints = Math.sqrt(computeSquaredDistance(pointList[0], pointList[1]));
        calculatedMinRadius = distanceBetweenPoints / 2.0;
    } else {
        // General case: Iterate through all unique combinations of three points (P_a, P_b, P_c).
        // This specific iteration strategy and early exit is a direct clone of the original logic.
        for (let idxP1 = 0; idxP1 < totalPointCount; ++idxP1) {
            for (let idxP2 = idxP1 + 1; idxP2 < totalPointCount; ++idxP2) {
                for (let idxP3 = idxP2 + 1; idxP3 < totalPointCount; ++idxP3) {

                    const pA = pointList[idxP1];
                    const pB = pointList[idxP2];
                    const pC = pointList[idxP3];

                    let candidateCircleCenterX = 0.0;
                    let candidateCircleCenterY = 0.0;
                    let candidateCircleSquaredRadius = 0.0;

                    // Calculate squared lengths of the sides of the triangle formed by P_a, P_b, P_c.
                    const sideSqAB = computeSquaredDistance(pA, pB);
                    const sideSqAC = computeSquaredDistance(pA, pC);
                    const sideSqBC = computeSquaredDistance(pB, pC);

                    // Store sides along with an identifier (0 for AB, 1 for AC, 2 for BC)
                    const triangleSidesWithIdentifiers = [
                        [sideSqAB, 0], // Squared length of side AB
                        [sideSqAC, 1], // Squared length of side AC
                        [sideSqBC, 2]  // Squared length of side BC
                    ];

                    // Sort sides by length in descending order to easily identify the longest side.
                    triangleSidesWithIdentifiers.sort((s1, s2) => s2[0] - s1[0]);

                    const longestSideSquared = triangleSidesWithIdentifiers[0][0];
                    const middleSideSquared = triangleSidesWithIdentifiers[1][0];
                    const shortestSideSquared = triangleSidesWithIdentifiers[2][0];
                    const longestSideIdentifier = triangleSidesWithIdentifiers[0][1];

                    // Check if the triangle is obtuse or right-angled (longest side squared > sum of other two).
                    // If true, the minimum enclosing circle for these three points has the longest side as its diameter.
                    if (longestSideSquared > middleSideSquared + shortestSideSquared) {
                        let diameterPoint1, diameterPoint2;
                        if (longestSideIdentifier === 0) { // Side AB is the longest
                            diameterPoint1 = pA;
                            diameterPoint2 = pB;
                        } else if (longestSideIdentifier === 1) { // Side AC is the longest
                            diameterPoint1 = pA;
                            diameterPoint2 = pC;
                        } else { // Side BC is the longest
                            diameterPoint1 = pB;
                            diameterPoint2 = pC;
                        }

                        candidateCircleCenterX = (diameterPoint1[0] + diameterPoint2[0]) / 2.0;
                        candidateCircleCenterY = (diameterPoint1[1] + diameterPoint2[1]) / 2.0;
                        candidateCircleSquaredRadius = getSquaredRadiusFromCenterAndPoint([candidateCircleCenterX, candidateCircleCenterY], diameterPoint1);
                    } else {
                        // The triangle is acute or right-angled, so its circumcircle is the candidate circle.
                        // Calculate the circumcenter (cx, cy) and circumradius (r^2).
                        const x1 = pA[0], y1 = pA[1];
                        const x2 = pB[0], y2 = pB[1];
                        const x3 = pC[0], y3 = pC[1];

                        const p1SquaredMagnitude = x1 * x1 + y1 * y1;
                        const p2SquaredMagnitude = x2 * x2 + y2 * y2;
                        const p3SquaredMagnitude = x3 * x3 + y3 * y3;

                        // Denominator for circumcenter formulas. If this is zero, the points are collinear.
                        const determinant = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));

                        // Guard clause: If points are collinear (determinant is zero or very close to zero),
                        // the circumcenter is undefined (at infinity). In this case,
                        // the MEC for these three points is defined by the two outermost points,
                        // which effectively falls back to the longest side as diameter logic.
                        if (Math.abs(determinant) < 1e-9) { // Use a small epsilon for floating point comparison.
                            let diameterPoint1_collinear, diameterPoint2_collinear;
                            if (longestSideIdentifier === 0) { // Side AB was the longest
                                diameterPoint1_collinear = pA;
                                diameterPoint2_collinear = pB;
                            } else if (longestSideIdentifier === 1) { // Side AC was the longest
                                diameterPoint1_collinear = pA;
                                diameterPoint2_collinear = pC;
                            } else { // Side BC was the longest
                                diameterPoint1_collinear = pB;
                                diameterPoint2_collinear = pC;
                            }
                            candidateCircleCenterX = (diameterPoint1_collinear[0] + diameterPoint2_collinear[0]) / 2.0;
                            candidateCircleCenterY = (diameterPoint1_collinear[1] + diameterPoint2_collinear[1]) / 2.0;
                            candidateCircleSquaredRadius = getSquaredRadiusFromCenterAndPoint([candidateCircleCenterX, candidateCircleCenterY], diameterPoint1_collinear);
                        } else {
                            // Calculate circumcenter coordinates using a standard formula.
                            candidateCircleCenterX = (p1SquaredMagnitude * (y2 - y3) + p2SquaredMagnitude * (y3 - y1) + p3SquaredMagnitude * (y1 - y2)) / determinant;
                            candidateCircleCenterY = (p1SquaredMagnitude * (x3 - x2) + p2SquaredMagnitude * (x1 - x3) + p3SquaredMagnitude * (x2 - x1)) / determinant;
                            candidateCircleSquaredRadius = getSquaredRadiusFromCenterAndPoint([candidateCircleCenterX, candidateCircleCenterY], pA);
                        }
                    }

                    // --- Validation Step ---
                    // Check if this candidate circle (derived from 3 points) actually encloses ALL 'N' points.
                    let allPointsAreEnclosed = true;
                    for (let currentPointIdx = 0; currentPointIdx < totalPointCount; ++currentPointIdx) {
                        const currentPoint = pointList[currentPointIdx];
                        // Compare squared distance to avoid Math.sqrt until the very end.
                        // Add a small epsilon (1e-9) to tolerate floating point inaccuracies
                        // when checking if a point is strictly outside the circle.
                        if (computeSquaredDistance([candidateCircleCenterX, candidateCircleCenterY], currentPoint) > candidateCircleSquaredRadius + 1e-9) {
                            allPointsAreEnclosed = false;
                            break; // A point is outside, so this circle is not valid for all N points.
                        }
                    }

                    // If a valid enclosing circle is found, update the result and break out of all loops.
                    // This specific breaking logic is a direct replication of the original code's behavior,
                    // implying that the first such circle found by this enumeration is the desired answer.
                    if (allPointsAreEnclosed) {
                        calculatedMinRadius = Math.sqrt(candidateCircleSquaredRadius);
                        // Break out of the innermost loop (idxP3).
                        break;
                    }
                }
                // Check if a solution was found and propagate the break to the middle loop (idxP2).
                if (calculatedMinRadius !== 0.0) {
                    break;
                }
            }
            // Check if a solution was found and propagate the break to the outermost loop (idxP1).
            if (calculatedMinRadius !== 0.0) {
                break;
            }
        }
    }

    // --- Output Result ---
    // The original code used '%s' for logging, which converts the number to a string.
    // Using '%f' ensures it's formatted as a floating-point number when logging.
    console.log('%f', calculatedMinRadius);
    return calculatedMinRadius;
}

// --- Execution Entry Point ---
// This section mimics the original environment where the script is executed,
// typically reading input from standard input in a Node.js-like environment.
const executeSolution = () => {
    // Check if running in a Node.js environment with the 'fs' module available.
    if (typeof require === 'function' && typeof module === 'object' && module.exports) {
        const fileSystem = require("fs");
        const inputFromFile = fileSystem.readFileSync("/dev/stdin", "utf8");
        calculateMinEnclosingRadius(inputFromFile);
    }
    // No explicit 'else' for browser environments, as the problem context is typically server-side/CLI.
};

// Initiate the execution of the solution.
executeSolution();