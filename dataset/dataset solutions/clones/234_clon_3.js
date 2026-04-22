const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Define a small constant for floating-point comparisons to determine near-zero values.
const FLOAT_COMPARISON_TOLERANCE = 1e-9;

/**
 * Creates a 2D vector from two points.
 * @param {number} startX - The X-coordinate of the starting point.
 * @param {number} startY - The Y-coordinate of the starting point.
 * @param {number} endX - The X-coordinate of the ending point.
 * @param {number} endY - The Y-coordinate of the ending point.
 * @returns {{x: number, y: number}} An object representing the vector components.
 */
function generateVector(startX, startY, endX, endY) {
    // Calculate the displacement in X and Y directions.
    return { x: endX - startX, y: endY - startY };
}

/**
 * Calculates the dot product of two 2D vectors.
 * The dot product is a scalar value that indicates the relationship between two vectors.
 * For orthogonal vectors, the dot product is zero.
 * @param {{x: number, y: number}} vecA - The first vector.
 * @param {{x: number, y: number}} vecB - The second vector.
 * @returns {number} The dot product of the two vectors.
 */
function computeDotProduct(vecA, vecB) {
    return (vecA.x * vecB.x) + (vecA.y * vecB.y);
}

/**
 * Determines if two vectors are orthogonal (perpendicular) within a given tolerance.
 * @param {{x: number, y: number}} vectorOne - The first vector.
 * @param {{x: number, y: number}} vectorTwo - The second vector.
 * @param {number} tolerance - The maximum absolute value for the dot product to be considered zero.
 * @returns {boolean} True if the vectors are orthogonal, false otherwise.
 */
function checkIfOrthogonal(vectorOne, vectorTwo, tolerance) {
    const dotProdResult = computeDotProduct(vectorOne, vectorTwo);
    // Check if the dot product is very close to zero, accounting for floating-point inaccuracies.
    return Math.abs(dotProdResult) < tolerance;
}

// Process the raw input data: remove leading/trailing whitespace and split into individual lines.
const inputLineSegments = rawInputData.trim().split("\n");

// An array to store the computed results for each line segment pair.
const finalJudgements = [];

// Iterate over each line representing a set of segment coordinates.
inputLineSegments.forEach(currentSegmentString => {
    // Parse the string into an array of numbers.
    // Ensure that all parts are converted to numbers; if not, `isNaN` will be true.
    const numericCoordinates = currentSegmentString.split(" ").map(Number);

    // Basic validation: ensure we have exactly 8 numbers and they are all valid numbers.
    if (numericCoordinates.length !== 8 || numericCoordinates.some(Number.isNaN)) {
        finalJudgements.push("INVALID_DATA"); // Add an error message for malformed input
        return; // Skip to the next line
    }

    // Extract the individual coordinate values for the two line segments.
    // Segment 1: from (p1x, p1y) to (p2x, p2y)
    const p1x = numericCoordinates[0];
    const p1y = numericCoordinates[1];
    const p2x = numericCoordinates[2];
    const p2y = numericCoordinates[3];

    // Segment 2: from (p3x, p3y) to (p4x, p4y)
    const p3x = numericCoordinates[4];
    const p3y = numericCoordinates[5];
    const p4x = numericCoordinates[6];
    const p4y = numericCoordinates[7];

    // Generate the direction vectors for both segments.
    const firstSegmentVector = generateVector(p1x, p1y, p2x, p2y);
    const secondSegmentVector = generateVector(p3x, p3y, p4x, p4y);

    let orthogonalityVerdict = "NO"; // Default assumption is not perpendicular.

    // Determine if the two vectors are orthogonal using the dot product method.
    // This method inherently handles vertical and horizontal lines without special casing.
    if (checkIfOrthogonal(firstSegmentVector, secondSegmentVector, FLOAT_COMPARISON_TOLERANCE)) {
        orthogonalityVerdict = "YES";
    }

    finalJudgements.push(orthogonalityVerdict);
});

// Output all collected results to the console.
finalJudgements.forEach(conclusion => console.log(conclusion));