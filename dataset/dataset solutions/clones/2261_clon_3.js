/*
 * This module processes geometric point data to find the radius of the minimum enclosing circle
 * for a set of points, considering all possible triplets of points.
 *
 * The algorithm iterates through all combinations of three distinct points (P_i, P_j, P_k).
 * For each triplet, it determines the minimum enclosing circle that would contain just those three points.
 * This candidate circle is identified based on the triangle formed by the triplet:
 *   1. If the triangle is obtuse or right-angled (longest side squared > sum of other two sides squared),
 *      the minimum enclosing circle's diameter is the longest side. Its center is the midpoint of that side.
 *   2. If the triangle is acute-angled, the minimum enclosing circle is the circumcircle of the three points.
 *      Its center and radius are calculated using circumcenter formulas.
 *
 * After finding this candidate circle for the triplet, it verifies if ALL initial N points are contained
 * within this candidate circle (including points on the boundary, with a small tolerance for floats).
 * If all N points are successfully enclosed, then this circle's radius is considered the solution,
 * and the process terminates early, as this heuristic assumes the MEC will be defined by 2 or 3 points.
 *
 * This approach is a brute-force method for finding a minimum enclosing circle, specific to the pattern
 * observed in the original problem context.
 */

/**
 * A small constant used for floating-point comparisons to account for precision errors.
 */
const FLOATING_POINT_EPSILON = 1e-9;

/**
 * Calculates the squared Euclidean distance between two points.
 * @param {Array<number>} firstPoint - The first point, represented as an array [x, y].
 * @param {Array<number>} secondPoint - The second point, represented as an array [x, y].
 * @returns {number} The squared distance between the two points.
 */
const calculateEuclideanDistanceSquared = (firstPoint, secondPoint) => {
  const deltaX = firstPoint[0] - secondPoint[0];
  const deltaY = firstPoint[1] - secondPoint[1];
  return deltaX * deltaX + deltaY * deltaY;
};

/**
 * Checks if all points in a given collection are located within or exactly on the boundary
 * of a specified circle.
 * @param {Array<Array<number>>} allPointCoordinates - An array containing all [x, y] coordinate pairs.
 * @param {number} circleCenterX - The X-coordinate of the circle's center.
 * @param {number} circleCenterY - The Y-coordinate of the circle's center.
 * @param {number} circleRadiusSquared - The squared radius of the circle.
 * @returns {boolean} True if every point is within the circle, false otherwise.
 */
const verifyAllPointsAreContained = (allPointCoordinates, circleCenterX, circleCenterY, circleRadiusSquared) => {
  for (let currentPointIdx = 0; currentPointIdx < allPointCoordinates.length; currentPointIdx++) {
    const iteratingPoint = allPointCoordinates[currentPointIdx];
    const distanceSqToCenter = calculateEuclideanDistanceSquared(iteratingPoint, [circleCenterX, circleCenterY]);
    // Compare with a small epsilon to handle floating point inaccuracies for boundary points.
    if (distanceSqToCenter > circleRadiusSquared + FLOATING_POINT_EPSILON) {
      return false; // Found a point that lies outside the circle.
    }
  }
  return true; // All points are within or on the boundary of the circle.
};

/**
 * Main function to process raw input data and determine the minimum enclosing circle's radius.
 * @param {string} rawInputBuffer - The complete raw input string, typically from stdin.
 * @returns {number} The radius of the minimum enclosing circle. Returns 0 if no valid points are provided.
 */
function determineMinimumEnclosingCircleRadius(rawInputBuffer) {
  // Split the input string into an array of lines.
  let inputLines = rawInputBuffer.split("\n");

  // The first line contains the total count of points.
  const totalPointCount = parseInt(inputLines[0], 10);

  // Handle edge cases: if point count is invalid or zero, return 0.
  if (isNaN(totalPointCount) || totalPointCount <= 0) {
    return 0;
  }

  // Extract and parse the coordinate data for the points.
  // We take 'totalPointCount' lines starting from the second line.
  const pointCoordinateStrings = inputLines.slice(1, totalPointCount + 1);

  // Convert string coordinates into an array of [x, y] number pairs.
  const geometricPointsCollection = pointCoordinateStrings.map(line =>
    line.split(" ").map(coordString => parseInt(coordString, 10))
  );

  // Variable to store the final minimum radius, initialized to 0 (indicating no solution found yet).
  let finalMinimumRadius = 0;

  // Iterate through all unique combinations of three distinct points (P_A, P_B, P_C).
  // These three points will form a candidate triangle for the minimum enclosing circle.
  for (let pointIndexA = 0; pointIndexA < totalPointCount; pointIndexA++) {
    for (let pointIndexB = pointIndexA + 1; pointIndexB < totalPointCount; pointIndexB++) {
      for (let pointIndexC = pointIndexB + 1; pointIndexC < totalPointCount; pointIndexC++) {

        // Retrieve the three current points.
        const currentPointA = geometricPointsCollection[pointIndexA];
        const currentPointB = geometricPointsCollection[pointIndexB];
        const currentPointC = geometricPointsCollection[pointIndexC];

        // Calculate the squared lengths of the sides of the triangle formed by P_A, P_B, P_C.
        const sideAB_Sq = calculateEuclideanDistanceSquared(currentPointA, currentPointB);
        const sideAC_Sq = calculateEuclideanDistanceSquared(currentPointA, currentPointC);
        const sideBC_Sq = calculateEuclideanDistanceSquared(currentPointB, currentPointC);

        // Store side data: squared length, and the two points that form the side.
        const triangleSideMeasurements = [
          { lengthSquared: sideAB_Sq, endpoint1: currentPointA, endpoint2: currentPointB },
          { lengthSquared: sideAC_Sq, endpoint1: currentPointA, endpoint2: currentPointC },
          { lengthSquared: sideBC_Sq, endpoint1: currentPointB, endpoint2: currentPointC }
        ];

        // Sort the sides in descending order by their squared lengths.
        triangleSideMeasurements.sort((s1, s2) => s2.lengthSquared - s1.lengthSquared);

        const longestSide = triangleSideMeasurements[0];
        const secondLongestSide = triangleSideMeasurements[1];
        const shortestSide = triangleSideMeasurements[2];

        let circleCandidateCenterX = 0;
        let circleCandidateCenterY = 0;
        let circleCandidateRadiusSquared = 0;

        // Check for obtuse or right-angled triangle condition (a^2 > b^2 + c^2).
        // If true, the minimum enclosing circle's diameter is the longest side.
        const isTriangleObtuseOrRight = longestSide.lengthSquared > secondLongestSide.lengthSquared + shortestSide.lengthSquared;

        if (isTriangleObtuseOrRight) {
          // The center of the circle is the midpoint of the longest side.
          circleCandidateCenterX = (longestSide.endpoint1[0] + longestSide.endpoint2[0]) / 2;
          circleCandidateCenterY = (longestSide.endpoint1[1] + longestSide.endpoint2[1]) / 2;
          // The radius squared is (longestSideLength / 2)^2, which simplifies to longestSideLengthSq / 4.
          circleCandidateRadiusSquared = longestSide.lengthSquared / 4;
        } else {
          // The triangle is acute-angled. The minimum enclosing circle is its circumcircle.
          // Calculate the circumcenter (cx, cy) and circumradius squared (r2).

          // Pre-calculate squared magnitudes for points to simplify expressions.
          const magSqA = currentPointA[0] * currentPointA[0] + currentPointA[1] * currentPointA[1];
          const magSqB = currentPointB[0] * currentPointB[0] + currentPointB[1] * currentPointB[1];
          const magSqC = currentPointC[0] * currentPointC[0] + currentPointC[1] * currentPointC[1];

          // Denominator for circumcenter Y-coordinate calculation.
          const yDenominatorTerm1 = (currentPointC[0] - currentPointA[0]) * (currentPointA[1] - currentPointB[1]);
          const yDenominatorTerm2 = (currentPointB[0] - currentPointA[0]) * (currentPointA[1] - currentPointC[1]);
          const commonDenominator = 2 * (yDenominatorTerm1 - yDenominatorTerm2);

          // Handle collinear points: if denominator is zero (or very close), points are collinear.
          // In such a case, the MEC is defined by two points, which should have been caught by the obtuse/right check.
          if (Math.abs(commonDenominator) < FLOATING_POINT_EPSILON) {
            continue; // Skip this triplet if points are effectively collinear.
          }

          // Calculate circumcenter Y-coordinate using the original algebraic form.
          const yNumeratorTerm1 = (currentPointC[0] - currentPointA[0]) * (magSqA - magSqB);
          const yNumeratorTerm2 = (currentPointB[0] - currentPointA[0]) * (magSqA - magSqC);
          circleCandidateCenterY = (yNumeratorTerm1 - yNumeratorTerm2) / commonDenominator;

          // Calculate circumcenter X-coordinate using the original algebraic form.
          // This uses the equation of the perpendicular bisector.
          if (currentPointA[0] !== currentPointB[0]) {
            const xNumeratorPart1 = (2 * currentPointA[1] - currentPointB[1]) * circleCandidateCenterY;
            const xNumeratorPart2 = magSqB - magSqA; // Equivalent to Math.pow(x[j][0],2)+Math.pow(x[j][1],2) - (Math.pow(x[i][0],2)+Math.pow(x[i][1],2))
            circleCandidateCenterX = (xNumeratorPart1 + xNumeratorPart2) / (2 * (currentPointB[0] - currentPointA[0]));
          } else { // currentPointA[0] === currentPointB[0], so they form a vertical line.
            // Use the perpendicular bisector between currentPointA and currentPointC instead.
            // This implicitly assumes currentPointA[0] !== currentPointC[0], which should be true if not all 3 points are collinear vertically.
            const xNumeratorPart1 = (2 * currentPointA[1] - currentPointC[1]) * circleCandidateCenterY;
            const xNumeratorPart2 = magSqC - magSqA; // Equivalent to Math.pow(x[k][0],2)+Math.pow(x[k][1],2) - (Math.pow(x[i][0],2)+Math.pow(x[i][1],2))
            circleCandidateCenterX = (xNumeratorPart1 + xNumeratorPart2) / (2 * (currentPointC[0] - currentPointA[0]));
          }

          // Determine the squared radius from the center to any of the three points (e.g., currentPointA).
          circleCandidateRadiusSquared = calculateEuclideanDistanceSquared(currentPointA, [circleCandidateCenterX, circleCandidateCenterY]);
        }

        // After finding a candidate circle for the current triplet, verify if it encloses ALL 'N' points.
        const isCandidateCircleGloballyValid = verifyAllPointsAreContained(
          geometricPointsCollection,
          circleCandidateCenterX,
          circleCandidateCenterY,
          circleCandidateRadiusSquared
        );

        // If this circle successfully encloses all points, it's the solution.
        if (isCandidateCircleGloballyValid) {
          finalMinimumRadius = Math.sqrt(circleCandidateRadiusSquared);
          // Terminate all nested loops immediately as the solution is found.
          pointIndexA = totalPointCount; // Forces outer loop to terminate
          pointIndexB = totalPointCount; // Forces middle loop to terminate
          pointIndexC = totalPointCount; // Forces inner loop to terminate
        }
      }
    }
  }

  // Print the final result to standard output.
  console.log('%f', finalMinimumRadius); // Using %f for floating-point output.
  return finalMinimumRadius;
}

/**
 * Debugging utility for testing with predefined inputs and outputs, typically in a browser environment.
 * @param {number} testCaseIdentifier - A numerical identifier for the specific test case.
 */
function debugExecutionHarness(testCaseIdentifier) {
  // Attempt to retrieve input, expected output, and result display elements from the DOM.
  const inputElement = document.getElementById("input" + testCaseIdentifier);
  const outputElement = document.getElementById("output" + testCaseIdentifier);
  const resultDisplayElement = document.getElementById("result" + testCaseIdentifier);

  if (!inputElement || !outputElement || !resultDisplayElement) {
    console.error(`Error: Missing DOM elements for test case ${testCaseIdentifier}.`);
    return;
  }

  const testInputData = inputElement.value;
  // Parse the expected output as a float, typically from the first line of the output element's value.
  const expectedResultValue = parseFloat(outputElement.value.split("\n")[0]);

  // Execute the main processing function with the test input.
  const actualResultValue = determineMinimumEnclosingCircleRadius(testInputData);

  // Compare the actual result with the expected result using a tolerance for floating-point values.
  let testOutcome = "WA"; // Default to "Wrong Answer"
  if (Math.abs(actualResultValue - expectedResultValue) < FLOATING_POINT_EPSILON) {
    testOutcome = "AC"; // "Accepted" if within tolerance
  }

  // Update the result display element with the test outcome.
  resultDisplayElement.innerHTML = testOutcome;
  console.log(`Test ${testCaseIdentifier}: Input: "${testInputData.trim()}", Expected: ${expectedResultValue}, Actual: ${actualResultValue}, Status: ${testOutcome}`);
}

// Entry point for execution in a Node.js environment (e.g., competitive programming platforms).
// Reads input from `/dev/stdin` and invokes the main processing logic.
if (typeof require !== 'undefined' && require.main === module) {
    determineMinimumEnclosingCircleRadius(require("fs").readFileSync("/dev/stdin", "utf8"));
}