"use strict";

const MODULO_VALUE = 998244353; // Defines the modulus for calculations to prevent integer overflow.

/**
 * Processes raw input string to solve a dynamic programming problem
 * involving valid step distances determined by range coverages.
 *
 * @param {string} rawDataString The entire input as a single string.
 */
const processInputData = (rawDataString) => {
  // Step 1: Input Parsing and Initial Setup
  // Clean up the raw string by trimming whitespace and splitting into individual lines.
  const inputLines = rawDataString.trim().split("\n");

  // Extract the primary problem parameters (N and K) from the first line.
  const firstLineParts = inputLines[0].split(" ");
  const totalElements = parseInt(firstLineParts[0], 10); // N: Total number of elements/positions to consider (0 to N-1).
  const numRanges = parseInt(firstLineParts[1], 10); // K: Number of allowed jump ranges.

  // Implement basic validation for the parsed input parameters.
  // Ensure totalElements is positive and numRanges is non-negative.
  if (isNaN(totalElements) || totalElements <= 0 || isNaN(numRanges) || numRanges < 0) {
    // In a production environment, this might throw an error or handle invalid input more robustly.
    console.error("Error: Invalid input parameters for totalElements or numRanges.");
    return; // Halt execution for invalid input.
  }

  // Parse the definitions of allowed ranges (L, R pairs) from subsequent lines.
  // Each range [L, R] specifies a valid jump length.
  const rangeDefinitions = inputLines
    .slice(1, totalElements + 1) // Slice from line 1 up to N lines (inclusive).
    .map((lineContent) => lineContent.split(" ").map((strVal) => parseInt(strVal, 10)));

  // Note: An unused 'steps' variable from the original code has been intentionally removed
  // as it did not contribute to the final solution logic in this context.

  // Step 2: Determine Valid Step Distances using the Difference Array (IMOS) Method
  // Initialize a difference array to mark the start and end points of coverage.
  // Array size is totalElements + 2 to accommodate indices up to totalElements + 1 (for R+1).
  const coverageDifferenceArray = Array.from({
    length: totalElements + 2
  }, () => 0);

  // Apply the range updates to the difference array.
  // For each range [startPos, endPos], increment at 'startPos' and decrement at 'endPos + 1'.
  for (let rangeIdx = 0; rangeIdx < numRanges; rangeIdx++) {
    const currentRange = rangeDefinitions[rangeIdx];
    const startPos = currentRange[0];
    const endPos = currentRange[1];

    // Validate if the range boundaries are within expected limits before applying updates.
    // This adds robustness against malformed input data.
    if (startPos >= 0 && startPos <= totalElements && endPos >= 0 && endPos <= totalElements) {
      coverageDifferenceArray[startPos]++;
      coverageDifferenceArray[endPos + 1]--;
    } else {
      // Optional: Log a warning for out-of-bounds range definitions.
      // console.warn(`Skipping an invalid range definition: [${startPos}, ${endPos}]`);
    }
  }

  // Calculate prefix sums on the difference array to find positions with active coverage.
  // These covered positions represent the valid step magnitudes.
  const validStepDistances = [];
  let currentCoverageLevel = 0; // Tracks the aggregate coverage count at the current position.

  // Iterate from position 0 up to totalElements - 1 (inclusive), matching original `S` behavior.
  for (let posIdx = 0; posIdx < totalElements; posIdx++) {
    // Add the difference value at the current position to update the coverage level.
    currentCoverageLevel += coverageDifferenceArray[posIdx];

    // If the current position has a positive coverage level, it signifies a valid step distance.
    if (currentCoverageLevel > 0) {
      validStepDistances.push(posIdx);
    }
  }

  // Step 3: Dynamic Programming to Count Ways
  // Initialize the DP array where waysToReach[i] stores the number of ways to reach position 'i'.
  // All positions are initially unreachable (0 ways). Array size totalElements (0 to N-1).
  const waysToReach = Array.from({
    length: totalElements
  }, () => 0);

  // Base Case: There is exactly one way to reach the starting position (position 0).
  waysToReach[0] = 1;

  // Cache the number of unique valid step distances for efficient iteration.
  const numValidSteps = validStepDistances.length;

  // Iterate through each target position from 1 up to totalElements - 1.
  for (let targetPos = 1; targetPos < totalElements; targetPos++) {
    let accumulatedWaysForCurrentPos = 0; // Accumulator for ways to reach the current targetPos.

    // For each valid step distance, check if it can lead to the current targetPos.
    for (let stepIdx = 0; stepIdx < numValidSteps; stepIdx++) {
      const currentStepMagnitude = validStepDistances[stepIdx];

      // Calculate the previous position from which this step could have been taken.
      const previousPos = targetPos - currentStepMagnitude;

      // Check for two conditions:
      // 1. previousPos must be a valid index (non-negative).
      // 2. previousPos must have been reachable (waysToReach[previousPos] > 0).
      if (previousPos >= 0 && waysToReach[previousPos] > 0) {
        // Add the ways to reach the previous position to the current sum.
        // Apply modulo arithmetic to keep the numbers within bounds and prevent overflow.
        accumulatedWaysForCurrentPos = (accumulatedWaysForCurrentPos + waysToReach[previousPos]) % MODULO_VALUE;
      }
    }

    // Store the total number of ways found for the current target position.
    waysToReach[targetPos] = accumulatedWaysForCurrentPos;
  }

  // The final solution is the number of ways to reach the last element,
  // which is at index (totalElements - 1).
  const finalResult = waysToReach[totalElements - 1];
  console.log(finalResult);
};

// Main execution entry point: Reads input from standard input and starts the processing.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));