const ProcessInput = (rawData) => {
  // This function processes the raw input string to determine if a target location is reachable.
  // The input is expected to contain two lines:
  // 1. A string of movement commands, where 'T' signifies a turn and sequences of characters
  //    between 'T's (or at the beginning/end) represent a number of steps.
  // 2. A string containing two space-separated integers, representing the absolute target X and Y coordinates.

  const parsedLines = rawData.split("\r\n"); // Splitting input into lines, assuming Windows-style line endings as per original.
  if (parsedLines.length < 2) {
    // Early exit if input format is incorrect (e.g., not enough lines).
    console.log("No");
    return;
  }

  const commandSequence = parsedLines[0];
  const targetCoordinatesAsString = parsedLines[1];

  // Helper function to safely parse numerical target coordinates.
  const extractNumericTargets = (coordStr) => {
    const parts = coordStr.split(" ");
    if (parts.length !== 2) {
      throw new Error("Target coordinate string is improperly formatted.");
    }
    // Using unary plus for type conversion, an alternative to Number().
    return [+parts[0], +parts[1]];
  };

  let targetXPosition, targetYPosition;
  try {
    [targetXPosition, targetYPosition] = extractNumericTargets(targetCoordinatesAsString);
  } catch (error) {
    // If parsing fails, the target is considered unreachable.
    console.log("No");
    return;
  }

  // The command sequence is split by 'T' to isolate segments of linear movement.
  // Each segment's length indicates the number of steps taken in that particular direction.
  const pathSegments = commandSequence.split("T");

  // The first segment's length represents an initial movement along the X-axis.
  // This movement is assumed to be in the positive X direction.
  const initialXDisplacement = pathSegments[0].length;

  // Calculate the absolute remaining displacement needed for each axis.
  // For X: The target X is relative to the origin, so we subtract the initial X movement.
  //        The absolute value is taken because subsequent X-axis movements can be in either direction.
  // For Y: The target Y is directly the absolute Y coordinate.
  const requiredAbsoluteDisplacements = [
    Math.abs(targetXPosition - initialXDisplacement),
    Math.abs(targetYPosition)
  ];

  // Arrays to store the lengths of individual movements for X and Y axes,
  // excluding the initial X movement.
  const xAxisMoveLengths = [];
  const yAxisMoveLengths = [];
  let totalPossibleXMovement = 0; // Sum of all lengths that can contribute to X-axis displacement.
  let totalPossibleYMovement = 0; // Sum of all lengths that can contribute to Y-axis displacement.

  // Iterate through the path segments starting from the second one (index 1),
  // as the first segment was handled as initial X displacement.
  // Movements alternate between Y and X axes after the initial X movement:
  // segmentIndex 1 (odd) -> Y-axis
  // segmentIndex 2 (even) -> X-axis
  // segmentIndex 3 (odd) -> Y-axis, and so on.
  for (let idx = 1; idx < pathSegments.length; ++idx) {
    const segmentStepCount = pathSegments[idx].length;

    // A segment with zero length implies a turn without movement, which can be ignored.
    if (segmentStepCount === 0) {
      continue;
    }

    if (idx % 2 === 0) { // Even index segments contribute to X-axis movement.
      xAxisMoveLengths.push(segmentStepCount);
      totalPossibleXMovement += segmentStepCount;
    } else { // Odd index segments contribute to Y-axis movement.
      yAxisMoveLengths.push(segmentStepCount);
      totalPossibleYMovement += segmentStepCount;
    }
  }

  // Sort the movement lengths. This can be beneficial for some subset sum algorithms,
  // although not strictly required for the DP approach used below.
  xAxisMoveLengths.sort((a, b) => a - b);
  yAxisMoveLengths.sort((a, b) => a - b);

  /**
   * Determines if a specific target distance can be achieved along a single axis
   * by selectively "flipping" the direction of some movements.
   * This is a variation of the subset sum problem.
   *
   * @param {number[]} availableMovementSteps - An array of lengths for movements along one axis.
   * @param {number} requiredAxisMagnitude - The absolute displacement magnitude to achieve for this axis.
   * @param {number} sumOfAllAxisSteps - The total sum of all `availableMovementSteps`.
   * @returns {boolean} True if the `requiredAxisMagnitude` is reachable, false otherwise.
   */
  const canAchieveAxisTarget = (availableMovementSteps, requiredAxisMagnitude, sumOfAllAxisSteps) => {
    // If the target magnitude is greater than the total possible movement, it's impossible.
    if (requiredAxisMagnitude > sumOfAllAxisSteps) {
      return false;
    }

    // If the target magnitude is exactly the total sum, it's reachable by moving all segments positively.
    if (requiredAxisMagnitude === sumOfAllAxisSteps) {
      return true;
    }

    // If `requiredAxisMagnitude < sumOfAllAxisSteps`, some movements must be "flipped"
    // (i.e., instead of adding to the total, they subtract).
    // Each flipped move of length 'L' reduces the total sum by 2*L.
    // Therefore, the difference `(sumOfAllAxisSteps - requiredAxisMagnitude)` must be an even number.
    const magnitudeDifference = sumOfAllAxisSteps - requiredAxisMagnitude;
    if (magnitudeDifference % 2 !== 0) {
      return false; // An odd difference means it's impossible to reach.
    }

    // `targetFlipSum` is the sum of lengths of moves that need to be flipped.
    const targetFlipSum = magnitudeDifference / 2;

    // Guard against impossible `targetFlipSum` values.
    if (targetFlipSum < 0 || targetFlipSum > sumOfAllAxisSteps) {
        return false;
    }

    // Dynamic programming approach to find if a subset sums to `targetFlipSum`.
    // `dp[s]` will be true if a sum `s` can be formed using a subset of `availableMovementSteps`.
    const dpTable = new Array(targetFlipSum + 1).fill(false);
    dpTable[0] = true; // A sum of 0 is always achievable (by selecting no movements).

    // Iterate through each available movement step.
    for (const currentStepLength of availableMovementSteps) {
      // Iterate backwards from `targetFlipSum` down to `currentStepLength`.
      // This ensures that each `currentStepLength` is used at most once in forming a sum.
      for (let s = targetFlipSum; s >= currentStepLength; --s) {
        // If sum `s` was already achievable, or if `s - currentStepLength` was achievable
        // (meaning we can form `s` by adding `currentStepLength` to a previous sum),
        // then `s` becomes achievable.
        dpTable[s] = dpTable[s] || dpTable[s - currentStepLength];
      }
    }

    return dpTable[targetFlipSum];
  };

  let finalResult = "No"; // Initialize the result to "No".

  // Check if both the X-axis and Y-axis targets are independently reachable.
  // If both conditions are met, then the overall target is reachable.
  if (
    canAchieveAxisTarget(xAxisMoveLengths, requiredAbsoluteDisplacements[0], totalPossibleXMovement) &&
    canAchieveAxisTarget(yAxisMoveLengths, requiredAbsoluteDisplacements[1], totalPossibleYMovement)
  ) {
    finalResult = "Yes";
  }

  // Output the final determination.
  console.log(finalResult);
};

// This line handles reading from standard input and invoking the main processing function.
// It should not be modified as per the problem's instructions.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));