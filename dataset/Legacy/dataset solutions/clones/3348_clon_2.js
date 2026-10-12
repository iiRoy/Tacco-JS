'use strict';

/**
 * Processes the input data to calculate the number of valid pairings.
 * This function determines the total ways to match individuals based on compatibility.
 * @param {string} rawInputText - The raw string input from standard input.
 */
function ProcessInputData(rawInputText) {
  // Clean up the input string and split it into individual lines.
  let processedLines = rawInputText.trim().split(/\n/);

  // Extract the total number of individuals (N) from the first line.
  const totalPeopleCount = parseInt(processedLines.shift(), 10);

  // Calculate the bitmask representing all individuals selected.
  const finalBitmask = Math.pow(2, totalPeopleCount);

  // Define the modulo constant for calculations to prevent overflow.
  const moduloValue = Math.pow(10, 9) + 7;

  // Parse the remaining lines into a 2D array (compatibility grid).
  processedLines = processedLines.map(lineContent =>
    lineContent.split(/\s+/).map(numericValue => parseInt(numericValue, 10))
  );

  // Assign the parsed data to a more descriptive variable.
  const compatibilityGrid = processedLines;

  // Initialize the dynamic programming table.
  // Each entry will be an object mapping bitmasks to counts.
  const memoizationTable = Array.from({ length: totalPeopleCount }, () => ({}));

  // Set the base case for the DP table: before any person is considered,
  // there's one way to have an empty set (mask 0).
  memoizationTable[-1] = { 0: 1 };

  // Pre-calculate bitmask values for each position (1 << i).
  const bitPositionValues = Array.from({ length: totalPeopleCount }, (_, bitIndex) => (1 << bitIndex));

  /*
   * The algorithm iterates through individuals from the first to the last.
   * memoizationTable[personIndex][currentMask] stores the count of ways
   * to match individuals up to 'personIndex' resulting in 'currentMask'
   * representing the set of matched partners.
   */

  // Iterate through each person, from -1 (initial state) up to N-2.
  // The (personIndex + 1) will be the current person being matched.
  for (let personIndex = -1; personIndex < totalPeopleCount - 1; personIndex++) {
    // For each existing state in the current person's DP entry:
    Object.keys(memoizationTable[personIndex]).forEach(function(currentMaskKey) {
      // Convert the string key back to a number.
      let currentMask = parseInt(currentMaskKey, 10);

      // Apply modulo operation to the current count to keep numbers manageable.
      memoizationTable[personIndex][currentMask] %= moduloValue;

      // Try to match the next person (personIndex + 1) with an available candidate.
      for (let candidateIndex = 0; candidateIndex < totalPeopleCount; candidateIndex++) {
        // Check if the candidate is already taken in the current mask.
        if ((currentMask & bitPositionValues[candidateIndex]) > 0) {
          continue; // Skip if candidate is already matched.
        }

        // Check if the current person and candidate are compatible.
        if (compatibilityGrid[personIndex + 1][candidateIndex] === 0) {
          continue; // Skip if they are not compatible.
        }

        // Calculate the new mask by adding the current candidate.
        const nextMask = currentMask + bitPositionValues[candidateIndex];

        // Update the DP table for the next person and the new mask.
        // Add the count from the previous state to the new state.
        memoizationTable[personIndex + 1][nextMask] = (memoizationTable[personIndex + 1][nextMask] || 0) + memoizationTable[personIndex][currentMask];
      }
    });
  }

  // The final result is the count for the last person (N-1) with all candidates matched (M-1 mask).
  // If no such entry exists, it defaults to 0. Apply modulo one last time.
  console.log((memoizationTable[totalPeopleCount - 1][finalBitmask - 1] || 0) % moduloValue);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
