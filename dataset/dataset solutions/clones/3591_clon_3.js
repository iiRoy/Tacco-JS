function computeMinimumJourney(rawInputString) {
  // Deconstruct the incoming raw string input into an array of lines.
  const inputLines = rawInputString.split("\n");

  // Parse the first line to obtain the total number of points and the required segment size.
  // Using `const` for parameters that remain constant throughout execution.
  const problemParameters = inputLines[0].split(" ");
  let totalPointsCount = parseInt(problemParameters[0], 10); // N
  let requiredSegmentLength = parseInt(problemParameters[1], 10); // K

  // Initialize an array to store the parsed coordinate values.
  let initialCoordinateSet = [];
  // Split the second line of input to get individual coordinate strings.
  const coordinateStrings = inputLines[1].split(" ");

  // Populate the initial coordinate set and simultaneously count negative numbers.
  // The count of negatives might be used for specific logic branches related to sorted arrays.
  let negativeNumbersInitialCount = 0;
  for (let pointIndex = 0; pointIndex < totalPointsCount; pointIndex++) {
    const numericValue = parseInt(coordinateStrings[pointIndex], 10);
    initialCoordinateSet.push(numericValue);
    if (numericValue < 0) {
      negativeNumbersInitialCount++;
    }
  }

  // Initialize the variable to store the minimum travel cost found so far.
  // Using `Number.MAX_SAFE_INTEGER` provides a robust initial upper bound.
  let overallMinimalJourneyCost = Number.MAX_SAFE_INTEGER;

  // --- Type III Change: Refactored Zero Handling ---
  // The original code explicitly finds and removes a '0' coordinate.
  // This version filters out all '0's to create a new, refined coordinate list.
  const zeroFilteredCoordinates = initialCoordinateSet.filter(coordVal => coordVal !== 0);
  
  // Adjust the effective count of points and the required segment length.
  // If any zeros were removed, and we still need to visit points,
  // the 'requiredSegmentLength' effectively decreases by one for each zero visited for free.
  // (Assuming '0' counts as a visited point without cost).
  let effectivePointsAvailable = zeroFilteredCoordinates.length;
  if (initialCoordinateSet.length > zeroFilteredCoordinates.length && requiredSegmentLength > 0) {
      requiredSegmentLength--;
  }

  // --- Type III Change: Added Guard Clauses for Early Exits ---
  // If the required segment length becomes zero or negative (e.g., if K was 1 and 0 was removed),
  // no travel is needed, so the cost is 0.
  if (requiredSegmentLength <= 0) {
      console.log(0);
      return;
  }
  // If no points remain after filtering zeros, the cost is 0 as no journey can be made.
  if (effectivePointsAvailable === 0) {
      console.log(0);
      return;
  }
  // If the required segment length is greater than the available points,
  // it's impossible to form such a segment. The problem implies 0 cost in such situations.
  if (requiredSegmentLength > effectivePointsAvailable) {
      console.log(0);
      return;
  }

  // --- Type III Change: Introduced a Helper Function ---
  // This helper calculates the minimum cost when a segment spans across the origin (0).
  // It considers two paths: left-turn-right or right-turn-left.
  const calculateSpanZeroCost = (leftPoint, rightPoint) => {
    // Path 1: Go left to `leftPoint`, return to 0, then go right to `rightPoint`.
    const pathOneCost = (2 * Math.abs(leftPoint)) + rightPoint;
    // Path 2: Go right to `rightPoint`, return to 0, then go left to `leftPoint`.
    const pathTwoCost = Math.abs(leftPoint) + (2 * rightPoint);
    return Math.min(pathOneCost, pathTwoCost);
  };

  // --- Type III Change: Simplified Main Logic Loop ---
  // The original code had a special `n!=2` condition which is now integrated into the general loop.
  // This loop iterates through all possible starting indices for a segment of `requiredSegmentLength`.
  // The loop condition `effectivePointsAvailable - requiredSegmentLength` ensures `windowEndIndex` is valid.
  for (let windowStartIdx = 0; windowStartIdx <= effectivePointsAvailable - requiredSegmentLength; windowStartIdx++) {
    // Determine the first and last coordinates of the current window (segment).
    const currentWindowFirstCoord = zeroFilteredCoordinates[windowStartIdx];
    const currentWindowLastCoord = zeroFilteredCoordinates[windowStartIdx + requiredSegmentLength - 1];

    // Evaluate the cost based on the segment's position relative to the origin (0).
    // The problem implicitly assumes the `zeroFilteredCoordinates` array is sorted.

    // Scenario 1: The segment spans across the origin.
    // This occurs when the first coordinate is negative and the last is positive.
    if (currentWindowFirstCoord < 0 && currentWindowLastCoord > 0) {
      overallMinimalJourneyCost = Math.min(
        overallMinimalJourneyCost,
        calculateSpanZeroCost(currentWindowFirstCoord, currentWindowLastCoord)
      );
    }
    // Scenario 2: The entire segment is on the negative side (all coordinates are negative).
    // The cost is simply the absolute value of the leftmost (most negative) coordinate.
    // (Since 0s are filtered, `currentWindowLastCoord <= 0` implies all are negative).
    else if (currentWindowLastCoord <= 0) {
      overallMinimalJourneyCost = Math.min(
        overallMinimalJourneyCost,
        Math.abs(currentWindowFirstCoord)
      );
    }
    // Scenario 3: The entire segment is on the positive side (all coordinates are positive).
    // The cost is simply the value of the rightmost (most positive) coordinate.
    // (Since 0s are filtered, `currentWindowFirstCoord >= 0` implies all are positive).
    else if (currentWindowFirstCoord >= 0) {
      overallMinimalJourneyCost = Math.min(
        overallMinimalJourneyCost,
        currentWindowLastCoord
      );
    }
    // Given sorted input and filtered zeros, these three scenarios cover all possibilities.
  }

  // Output the calculated overall minimum journey cost.
  console.log(overallMinimalJourneyCost);
}

// Standard boilerplate for reading input in competitive programming environments.
// Reads the entire content of `/dev/stdin` as a UTF-8 string and passes it to the main function.
computeMinimumJourney(require("fs").readFileSync("/dev/stdin", "utf8"));