// File: PointInTriangleChecker.js - A utility for determining if a point lies within a planar triangle.

/**
 * Computes the area of a triangle using Heron's formula, given its three side lengths.
 * Includes robustness checks for floating-point arithmetic and degenerate triangles.
 *
 * @param {number} lengthA - The length of the first side.
 * @param {number} lengthB - The length of the second side.
 * @param {number} lengthC - The length of the third side.
 * @returns {number} The calculated area of the triangle, or 0 if degenerate/invalid input.
 */
const determinePlanarRegionSize = (lengthA, lengthB, lengthC) => {
    // Basic validation for side lengths: they must be non-negative.
    // In real-world scenarios, one might also check the triangle inequality,
    // but Heron's formula naturally handles impossible triangles by returning NaN or 0.
    if (lengthA < 0 || lengthB < 0 || lengthC < 0) {
        // Log a warning for unexpected negative input, then return 0 as area.
        console.warn("Warning: Attempted to calculate area with negative side length(s). Returning 0.");
        return 0.0;
    }

    // Calculate the semi-perimeter (half the perimeter).
    const halfPerimeter = (lengthA + lengthB + lengthC) / 2.0;

    // Calculate the terms (s - side) for Heron's formula.
    // Using Math.max(0, ...) to prevent negative values due to floating-point
    // inaccuracies when dealing with very small or degenerate triangles,
    // which would otherwise result in NaN when taking the square root.
    const termA = Math.max(0.0, halfPerimeter - lengthA);
    const termB = Math.max(0.0, halfPerimeter - lengthB);
    const termC = Math.max(0.0, halfPerimeter - lengthC);

    // The product under the square root.
    const productForSqrt = halfPerimeter * termA * termB * termC;

    // Compute and return the final area.
    const regionSize = Math.sqrt(productForSqrt);
    return regionSize;
};

/**
 * Calculates the Euclidean distance between two points (x1, y1) and (x2, y2).
 *
 * @param {number} coord1X - The X-coordinate of the first point.
 * @param {number} coord1Y - The Y-coordinate of the first point.
 * @param {number} coord2X - The X-coordinate of the second point.
 * @param {number} coord2Y - The Y-coordinate of the second point.
 * @returns {number} The distance between the two points.
 */
const calculateEuclideanDistance = (coord1X, coord1Y, coord2X, coord2Y) => {
    const deltaX = coord1X - coord2X;
    const deltaY = coord1Y - coord2Y;
    // Calculate squared differences and sum them, then take the square root.
    // Using multiplication instead of Math.pow for squared terms.
    return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
};

// Define a small floating-point tolerance for comparisons.
// This accounts for potential precision errors when comparing calculated areas.
const FLOATING_POINT_TOLERANCE = 0.00005;

// Access the Node.js file system module for input operations.
const fileSystemInterface = require('fs');

// Read all input content from standard input synchronously, interpreted as UTF-8 text.
const rawInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

// Pre-process the input: remove leading/trailing whitespace and split into an array of lines.
const processedInputLines = rawInputContent.trim().split('\n');

// Iterate over each line of processed input data.
for (const currentLineData of processedInputLines) {
    // Skip any lines that are empty or contain only whitespace.
    if (currentLineData.trim().length === 0) {
        continue; // Move to the next input line.
    }

    // Parse the numeric values from the current line.
    // Each value is expected to be a space-separated coordinate.
    const parsedCoordinates = currentLineData.split(' ').map(val => parseFloat(val));

    // Implement a guard clause to ensure that enough coordinate data is provided.
    // We expect 8 numbers: (x1, y1, x2, y2, x3, y3, xp, yp).
    if (parsedCoordinates.length < 8) {
        console.error(`Error: Incomplete coordinate data encountered on line: "${currentLineData}". Skipping.`);
        continue; // Skip this malformed line and proceed to the next.
    }

    // Use array destructuring to extract individual coordinate values for better readability.
    // The main triangle vertices are A, B, C, and the query point is P.
    const [
        vertexAX, vertexAY,
        vertexBX, vertexBY,
        vertexCX, vertexCY,
        queryPointX, queryPointY
    ] = parsedCoordinates;

    // Calculate the lengths of the three sides of the primary triangle (ABC).
    const sideABLength = calculateEuclideanDistance(vertexAX, vertexAY, vertexBX, vertexBY);
    const sideACLength = calculateEuclideanDistance(vertexAX, vertexAY, vertexCX, vertexCY);
    const sideBCLength = calculateEuclideanDistance(vertexBX, vertexBY, vertexCX, vertexCY);

    // Calculate the distances from the query point P to each vertex of the primary triangle.
    const distPtoA = calculateEuclideanDistance(queryPointX, queryPointY, vertexAX, vertexAY);
    const distPtoB = calculateEuclideanDistance(queryPointX, queryPointY, vertexBX, vertexBY);
    const distPtoC = calculateEuclideanDistance(queryPointX, queryPointY, vertexCX, vertexCY);

    // Compute the area of the main triangle (ABC).
    const mainTriangleTotalArea = determinePlanarRegionSize(sideABLength, sideACLength, sideBCLength);

    // Compute the sum of the areas of three smaller triangles formed by the query point P
    // and two vertices of the main triangle (PAB, PAC, PBC).
    // This is a core part of the point-in-triangle test using area summation.
    const sumOfComponentAreas = determinePlanarRegionSize(sideABLength, distPtoA, distPtoB) +
                                determinePlanarRegionSize(sideACLength, distPtoA, distPtoC) +
                                determinePlanarRegionSize(sideBCLength, distPtoB, distPtoC);

    // Determine if the query point P is located inside (or on the boundary of)
    // the main triangle ABC by comparing the total area with the sum of component areas.
    // If the point is inside, these areas should be approximately equal.
    const computedAreaDifference = Math.abs(mainTriangleTotalArea - sumOfComponentAreas);

    // Output "YES" if the point is considered inside the triangle within the defined tolerance,
    // otherwise output "NO".
    if (computedAreaDifference < FLOATING_POINT_TOLERANCE) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}