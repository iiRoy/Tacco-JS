const readStandardInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

/**
 * Processes a raw string input containing numerical data to determine
 * the minimum number of elements that need to be changed to make
 * all even-indexed elements identical and all odd-indexed elements identical,
 * with the constraint that the even-indexed common value cannot be the same
 * as the odd-indexed common value, if possible.
 *
 * @param {string} rawDataString The input string, typically from stdin.
 */
function processInputData(rawDataString) {
  // Defensive check for input validity
  if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    // In a competitive programming context, this usually isn't strictly necessary
    // as input is assumed to be valid, but good for robust code.
    console.error("Error: Input data is empty or invalid.");
    return;
  }

  // Split the input into individual lines and trim any surrounding whitespace
  const linesOfText = rawDataString.trim().split('\n');

  // Parse the total count of elements from the first line
  const totalElementsCount = Number(linesOfText[0]);

  // Validate the parsed count
  if (isNaN(totalElementsCount) || totalElementsCount <= 0) {
    console.error("Error: Invalid or non-positive total element count.");
    return;
  }

  // Parse all numeric tokens from the second line, converting them directly to numbers
  const allNumericTokens = linesOfText[1].split(' ').map(Number);

  // Further validation: check if the number of tokens matches the declared count
  if (allNumericTokens.length !== totalElementsCount) {
    // This could indicate malformed input or an unexpected scenario
    // For this problem, we'll proceed with the parsed 'allNumericTokens.length' if it differs,
    // or assume 'totalElementsCount' is the authoritative length for the loop below.
    // Sticking to 'totalElementsCount' as per problem statement.
  }

  // Initialize two arrays to store numbers based on their original position's parity
  const evenPositionValues = [];
  const oddPositionValues = [];

  // Iterate through the original tokens and distribute them
  for (let currentIdx = 0; currentIdx < totalElementsCount; ++currentIdx) {
    // Use bitwise AND for a slightly different parity check (equivalent to % 2)
    if (!(currentIdx & 1)) { // If currentIdx is even (0, 2, 4...)
      evenPositionValues.push(allNumericTokens[currentIdx]);
    } else { // If currentIdx is odd (1, 3, 5...)
      oddPositionValues.push(allNumericTokens[currentIdx]);
    }
  }

  // Sort both arrays numerically. This is crucial for the `determineMajorMinorCounts` method.
  evenPositionValues.sort((valA, valB) => valA - valB);
  oddPositionValues.sort((valA, valB) => valA - valB);

  /**
   * Extends Array.prototype with a utility function to find the two most frequent elements
   * and their counts in a sorted array. It assumes the array is already sorted.
   *
   * @returns {Array<Array<number|null>>} An array containing two [value, count] pairs.
   *   The first pair is the most frequent, the second is the second most frequent.
   *   If fewer than two unique elements exist, placeholders like [null, 0] are used.
   */
  Array.prototype.determineMajorMinorCounts = function() {
    // Handle edge case of an empty array to prevent errors
    if (this.length === 0) {
      return [[null, 0], [null, 0]];
    }

    const frequencyList = [];
    let currentObservedValue = this[0];
    let currentOccurrenceCount = 0;

    // Loop through the sorted array to count consecutive identical elements
    for (let j = 0; j < this.length; ++j) {
      if (this[j] === currentObservedValue) {
        currentOccurrenceCount++;
      } else {
        // When a new value is encountered, store the count for the previous value
        frequencyList.push([currentObservedValue, currentOccurrenceCount]);
        // Reset for the new value
        currentObservedValue = this[j];
        currentOccurrenceCount = 1;
      }
    }
    // After the loop, ensure the count for the very last sequence of values is added
    frequencyList.push([currentObservedValue, currentOccurrenceCount]);

    // Sort the collected frequency pairs based on their counts in descending order
    frequencyList.sort((pairA, pairB) => pairB[1] - pairA[1]);

    // Guarantee that the result always contains at least two frequency pairs.
    // If there's only one unique element (or none, though handled above),
    // add a placeholder for the second most frequent.
    while (frequencyList.length < 2) {
      frequencyList.push([null, 0]);
    }

    // Return the top two frequency pairs (most frequent and second most frequent)
    return [
      [frequencyList[0][0], frequencyList[0][1]],
      [frequencyList[1][0], frequencyList[1][1]]
    ];
  };

  // Calculate the frequency statistics for both even and odd positioned value sets
  const evenFreqStats = evenPositionValues.determineMajorMinorCounts();
  const oddFreqStats = oddPositionValues.determineMajorMinorCounts();

  let minimumReplacementsNeeded = 0; // This variable will store the final answer

  // Extract the most frequent values and their counts for better readability
  const evenMajorValue = evenFreqStats[0][0];
  const evenMajorCount = evenFreqStats[0][1];
  const evenMinorCount = evenFreqStats[1][1]; // Count of the second most frequent even value

  const oddMajorValue = oddFreqStats[0][0];
  const oddMajorCount = oddFreqStats[0][1];
  const oddMinorCount = oddFreqStats[1][1]; // Count of the second most frequent odd value

  // Determine the minimum replacements based on whether the most frequent values clash
  if (evenMajorValue !== oddMajorValue) {
    // Case 1: The most frequent values in even and odd positions are different.
    // We can make all even positions `evenMajorValue` and all odd positions `oddMajorValue`.
    // The number of replacements is the total elements minus the sum of their counts.
    minimumReplacementsNeeded = totalElementsCount - (evenMajorCount + oddMajorCount);
  } else {
    // Case 2: The most frequent values in even and odd positions are the same.
    // We cannot use the same value for both even and odd positions.
    // We must consider two alternative scenarios and choose the one requiring fewer replacements:
    // Scenario A: Keep the `evenMajorValue` for even positions, and use the
    //             `oddMinorValue` (second most frequent) for odd positions.
    const replacementsForScenarioA = totalElementsCount - (evenMajorCount + oddMinorCount);

    // Scenario B: Use the `evenMinorValue` (second most frequent) for even positions,
    //             and keep the `oddMajorValue` for odd positions.
    const replacementsForScenarioB = totalElementsCount - (evenMinorCount + oddMajorCount);

    // The minimum replacements needed is the smaller of these two scenarios.
    minimumReplacementsNeeded = Math.min(replacementsForScenarioA, replacementsForScenarioB);
  }

  // Output the final calculated result to standard output
  console.log(minimumReplacementsNeeded);
}

// Invoke the main processing function with data obtained from standard input
processInputData(readStandardInput());