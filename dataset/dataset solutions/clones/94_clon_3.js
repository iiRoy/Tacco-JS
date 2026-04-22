// This comprehensive module encapsulates the entire application logic within a self-executing function.
// It is designed to process geometric data for circle relationships, reading its raw input from a file.
((rawInputContent) => {

  // --- Core Utility Functions ---

  /**
   * Calculates the Euclidean distance between two points (x1, y1) and (x2, y2).
   * This is a fundamental geometric calculation, often used in spatial problems.
   * @param {number} p1x - The X-coordinate of the first point.
   * @param {number} p1y - The Y-coordinate of the first point.
   * @param {number} p2x - The X-coordinate of the second point.
   * @param {number} p2y - The Y-coordinate of the second point.
   * @returns {number} The straight-line distance between the two points.
   */
  const computePointDistance = (p1x, p1y, p2x, p2y) => {
    // Determine the horizontal displacement.
    const horizontalDelta = p2x - p1x;
    // Determine the vertical displacement.
    const verticalDelta = p2y - p1y;
    // Apply the Pythagorean theorem: distance = sqrt((deltaX)^2 + (deltaY)^2).
    // Using multiplication for squaring can be more performant than Math.pow(x, 2) and often clearer.
    return Math.sqrt(horizontalDelta * horizontalDelta + verticalDelta * verticalDelta);
  };

  // --- Input Preparation and Parsing ---

  // Ensure any trailing newline characters are removed from the raw input string.
  // `trimEnd()` is more robust than `replace(/\n$/, '')` as it handles various trailing whitespace.
  const cleanedFileContent = rawInputContent.trimEnd();

  // Divide the processed file content into individual lines, each representing a part of the input.
  const contentLines = cleanedFileContent.split('\n');

  // The first line of the input is expected to contain the total number of test cases.
  // `parseInt` is used with radix 10 for explicit base conversion.
  const totalOperationCycles = parseInt(contentLines.shift(), 10);

  // --- Initial Input Validation ---
  // A crucial guard clause to ensure the integrity of the input.
  // If the number of cycles is not a valid positive integer, an error is logged, and execution stops.
  if (isNaN(totalOperationCycles) || totalOperationCycles <= 0) {
    console.error("Processing Halt: The initial input line must specify a valid positive integer for the number of test scenarios.");
    return; // Exit the IIFE early.
  }

  // An array to systematically store the outcome code for each processed test case.
  // This facilitates collecting all results before a single, final output operation.
  const outcomeCodesBuffer = [];

  // --- Main Processing Loop for Each Test Case ---
  // Iterate precisely the number of times indicated by `totalOperationCycles`.
  for (let currentCycleIteration = 0; currentCycleIteration < totalOperationCycles; currentCycleIteration++) {
    // Fetch the line of data corresponding to the current test case.
    const currentCaseDataLine = contentLines[currentCycleIteration];

    // --- Per-Case Input Data Validation ---
    // Verify that a data line actually exists for the current iteration.
    if (!currentCaseDataLine) {
      outcomeCodesBuffer.push("Input Error: Data line missing for scenario " + (currentCycleIteration + 1));
      continue; // Skip to the next iteration if data is malformed or missing.
    }

    // Parse the space-separated values from the data line into an array of numbers.
    // `map(Number)` efficiently converts each string segment to a numerical type.
    const parsedNumericalValues = currentCaseDataLine.split(' ').map(Number);

    // --- Parameter Count and Type Validation ---
    // Ensure that exactly six numerical parameters (x, y, r for two circles) are present and valid.
    if (parsedNumericalValues.length !== 6 || parsedNumericalValues.some(val => isNaN(val))) {
      outcomeCodesBuffer.push("Input Error: Incorrect number or type of parameters for scenario " + (currentCycleIteration + 1));
      continue; // Proceed to the next test case.
    }

    // Utilize array destructuring for clear and concise assignment of parameters.
    // This significantly enhances readability by giving meaningful names to each value.
    const [
      circleAlphaX, circleAlphaY, circleAlphaRadius,
      circleBetaX, circleBetaY, circleBetaRadius
    ] = parsedNumericalValues;

    // --- Geometric Analysis ---
    // Calculate the distance separating the central points of the two circles.
    const separationDistance = computePointDistance(
      circleAlphaX, circleAlphaY,
      circleBetaX, circleBetaY
    );

    // Compute the sum of the radii; essential for detecting external intersection or separation.
    const radiiTotal = circleAlphaRadius + circleBetaRadius;
    // Compute the absolute difference between the radii; critical for detecting containment.
    const radiiAbsoluteDifference = Math.abs(circleAlphaRadius - circleBetaRadius);

    let relationshipIdentifier; // This variable will store the integer code representing the spatial relationship.

    // --- Decision Logic for Circle Relationships ---
    // This block determines the exact relationship between the two circles.

    // Condition 1: Circles are completely separate.
    // This is true if the distance between centers is greater than the sum of their radii.
    if (separationDistance > radiiTotal) {
      relationshipIdentifier = 0;
    }
    // Condition 2: One circle fully contains the other without touching.
    // This occurs if the distance between centers is less than the absolute difference of their radii.
    // An important edge case: if radii are equal, `radiiAbsoluteDifference` is 0.
    // In such a scenario, `separationDistance < 0` would be the condition, which is impossible for a valid distance.
    // Therefore, this `else if` branch correctly won't be entered if the radii are identical.
    else if (separationDistance < radiiAbsoluteDifference) {
      // Sub-condition 2a: Circle Alpha contains Circle Beta.
      if (circleAlphaRadius > circleBetaRadius) {
        relationshipIdentifier = 2;
      }
      // Sub-condition 2b: Circle Beta contains Circle Alpha.
      else if (circleBetaRadius > circleAlphaRadius) {
        relationshipIdentifier = -2;
      }
      // Sub-condition 2c: Radii are equal, implying `separationDistance < 0` to enter this block, which is impossible.
      // This `else` block is logically unreachable under normal geometric principles.
      // If it were somehow reached (e.g., due to floating point inaccuracies with a tiny negative distance),
      // it would suggest an intersection or touch, hence the fallback to '1'.
      else {
        relationshipIdentifier = 1; // Fallback, should not be hit.
      }
    }
    // Condition 3: Circles intersect at one or two points, or touch externally/internally.
    // This is the default outcome if neither of the above conditions is met.
    // This includes cases where circles touch at a single point (external or internal).
    else {
      relationshipIdentifier = 1;
    }

    // Add the determined relationship code for the current scenario to our collection.
    outcomeCodesBuffer.push(relationshipIdentifier);
  }

  // --- Final Output Generation ---
  // Concatenate all collected results into a single string, with each outcome on a new line.
  // This is then printed to the standard output.
  console.log(outcomeCodesBuffer.join('\n'));

// The entire IIFE is invoked immediately by passing the content read from `/dev/stdin`.
// `require('fs').readFileSync` is a Node.js-specific API for synchronous file reading.
// `/dev/stdin` is a standard Unix path for reading from standard input.
// 'utf8' specifies the character encoding to interpret the file content.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));