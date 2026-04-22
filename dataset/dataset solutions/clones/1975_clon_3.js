"use strict";

// A small utility to abstract the process of obtaining raw program input from the standard stream.
const obtainRawProgramInput = () => require("fs").readFileSync("/dev/stdin", "utf8");

// The primary function that orchestrates input processing, validation, and the main computation logic.
const manageApplicationFlow = (inputDataSource) => {
  // Step 1: Parse the incoming data string into an array of individual lines.
  const programLines = inputDataSource.trim().split("\n");

  // Step 2: Implement robust input validation to ensure the data structure is as expected.
  // Check for the minimum required number of lines.
  if (programLines.length < 2) {
    console.error("Operation halted: Insufficient data lines for processing. Expected at least 2 lines.");
    process.exit(1); // Terminate with an error code.
  }

  // Extract and parse the total count of elements from the first line.
  const totalItemCount = Number(programLines[0]);
  // Validate the parsed count: must be a valid positive number.
  if (isNaN(totalItemCount) || totalItemCount <= 0) {
    console.error("Operation halted: Invalid or non-positive item count detected in the first line.");
    process.exit(1);
  }

  // Extract and parse the sequence of numerical values from the second line.
  // Each string entry is trimmed and converted to a number.
  const primaryValueSequence = programLines[1].split(" ").map(entryStr => Number(entryStr.trim()));
  // Validate that the length of the parsed sequence matches the declared item count.
  if (primaryValueSequence.length !== totalItemCount) {
    console.error("Operation halted: Mismatch between declared item count and the actual sequence length.");
    process.exit(1);
  }

  // Step 3: Initialize a memoization cache to optimize the recursive computation.
  // This map will store results of subproblems to avoid redundant calculations.
  // The key format will be: "currentSequenceIndex_sortedAvailableTargetsString".
  const memoizationCache = new Map();

  // Step 4: Define the core recursive function to calculate the maximum achievable weighted sum.
  // This function explores different pairings of elements from 'primaryValueSequence'
  // with 'availableTargetPositions' to maximize the total score.
  const calculateMaximumWeightedSum = (currentSequenceIndex, availableTargetPositions) => {
    // Base case: If there are no more elements left to process in the sequence, the sum contribution is zero.
    if (currentSequenceIndex < 0) {
      return 0;
    }

    // Generate a unique cache key for the current state.
    // Sorting 'availableTargetPositions' ensures that the cache key is consistent
    // regardless of the order in which target positions are presented.
    const sortedTargetsKey = availableTargetPositions.slice().sort((a, b) => a - b).join(",");
    const cacheKey = `${currentSequenceIndex}_${sortedTargetsKey}`;

    // Check if the result for this specific state has already been computed and cached.
    if (memoizationCache.has(cacheKey)) {
      return memoizationCache.get(cacheKey);
    }

    // Initialize the maximum sum for the current state to a very small number.
    // This ensures any valid path contribution will be greater.
    let currentMaxSum = -Infinity;

    // Retrieve the value of the current element from the primary sequence.
    const valueAtIndex = primaryValueSequence[currentSequenceIndex];

    // Iterate through each currently available target position to try a potential pairing.
    for (const selectedTargetPosition of availableTargetPositions) {
      // Construct the set of remaining target positions for the subsequent recursive call.
      // This is done by filtering out the 'selectedTargetPosition'.
      const remainingTargetPositions = availableTargetPositions.filter(
        (posCandidate) => posCandidate !== selectedTargetPosition
      );

      // Calculate the absolute difference (distance) between the current sequence index
      // and the chosen target position.
      const positionDelta = Math.abs(currentSequenceIndex - selectedTargetPosition);

      // Calculate the score contribution for the current pairing and recursively add
      // the maximum sum obtainable from the rest of the sequence and remaining positions.
      const pathContribution =
        (valueAtIndex * positionDelta) +
        calculateMaximumWeightedSum(currentSequenceIndex - 1, remainingTargetPositions);

      // Update the maximum sum found so far for the current state.
      if (pathContribution > currentMaxSum) {
        currentMaxSum = pathContribution;
      }
    }

    // Store the newly computed maximum sum for the current state in the cache
    // before returning it, to optimize future calls with the same state.
    memoizationCache.set(cacheKey, currentMaxSum);
    return currentMaxSum;
  };

  // Step 5: Prepare the initial set of target positions for the first call to the recursive function.
  // This creates an array [0, 1, ..., totalItemCount - 1].
  const initialPositionSet = Array.from({ length: totalItemCount }, (_, index) => index);

  // Step 6: Initiate the main computation process.
  // Start from the last element of the primary sequence (totalItemCount - 1)
  // and with all target positions initially available.
  const finalComputedOutcome = calculateMaximumWeightedSum(totalItemCount - 1, initialPositionSet);

  // Step 7: Output the final calculated maximum sum to the console.
  console.log(finalComputedOutcome);
};

// Step 8: Execute the entire application flow by calling the main orchestration function
// with the raw input obtained from the system's standard input.
manageApplicationFlow(obtainRawProgramInput());