"use strict";

/**
 * Orchestrates the primary data processing logic.
 * Reads input, processes number sequences, and calculates a final score based on specific rules.
 * @param {string} rawDataString - The raw input string containing numbers.
 */
function processInputData(rawDataString) {
  // Parsing input lines
  const inputLinesArray = rawDataString.split('\n');

  // Input validation: Ensure there are enough lines
  if (inputLinesArray.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least 2 lines.");
    return; // Early exit due to invalid input structure
  }

  // Extracting the initial count for the number sequence
  const initialCount = parseInt(inputLinesArray[0].trim(), 10); // Added radix and trim for robustness

  // Validate initialCount value
  if (isNaN(initialCount) || initialCount <= 0) {
    console.error(`Error: Invalid initial count provided: "${inputLinesArray[0]}". Must be a positive integer.`);
    return; // Early exit due to invalid count
  }

  // Helper function to parse numbers from a string line. Now an arrow function.
  const parseNumbersFromLine = (textLine) =>
    textLine.split(/\s+/) // Split by one or more whitespace characters
      .filter(Boolean) // Remove any empty strings resulting from multiple spaces
      .map(numStr => parseInt(numStr.trim(), 10)); // Parse each trimmed string to an integer

  // Extract and limit the number sequence based on initialCount
  const numberSequence = parseNumbersFromLine(inputLinesArray[1]).slice(0, initialCount);

  // Data structure to track number frequencies. Renamed from 'map' to 'occurrenceTracker'.
  const occurrenceTracker = new Map();

  // Populate the frequency tracker.
  // Using a more concise idiom for map population and a standard for...of loop.
  for (const currentNumber of numberSequence) {
    // Basic validation for numbers in the sequence
    if (typeof currentNumber !== 'number' || isNaN(currentNumber)) {
      console.warn(`Warning: Non-numeric or invalid value encountered in sequence: "${currentNumber}". Skipping this value.`);
      continue; // Skip invalid numbers
    }
    occurrenceTracker.set(currentNumber, (occurrenceTracker.get(currentNumber) || 0) + 1);
  }

  let finalScore = 0; // Renamed from 'result'

  // Main processing loop: continues as long as there are numbers in the tracker
  // Each iteration processes a connected component of numbers
  while (occurrenceTracker.size > 0) {
    // Extract the first available entry from the map.
    // Assuming modern JS (ES6+) for direct array destructuring.
    const [startingValue, initialFreq] = occurrenceTracker.entries().next().value; // Renamed variables

    // Decrement the frequency of the starting value or remove it if count reaches zero.
    // Renamed from 'remove' to 'decrementAndClean'.
    decrementAndClean(occurrenceTracker, startingValue, initialFreq);

    // Initialize a queue for graph traversal (using Array.pop() makes it LIFO, like DFS)
    const explorationQueue = [startingValue]; // Renamed from 'queue'
    let leftBranchNodes = 0; // Renamed from 'left'
    let rightBranchNodes = 0; // Renamed from 'right'

    // Process nodes in the queue until it's empty
    while (explorationQueue.length > 0) {
      const activeNode = explorationQueue.pop(); // Renamed from 'current'. LIFO traversal.

      // Determine the 'direction' based on the node's sign (negative implies right branch)
      const isRightDirection = activeNode < 0; // Renamed from 'rightFlag'
      const absoluteNodeValue = Math.abs(activeNode); // Renamed from 'i'

      // Increment counts based on the determined direction
      if (!isRightDirection) {
        leftBranchNodes++;
      } else {
        rightBranchNodes++;
      }

      // Generate potential difference values related to powers of two.
      // Renamed from 'diffs' to 'generatePowerDifferences'.
      const differenceList = generatePowerDifferences(absoluteNodeValue);

      // Iterate through the generated difference values
      for (const differenceValue of differenceList) {
        // Attempt to decrement/remove the difference value from the tracker.
        // This implicitly checks if the value exists and is available.
        if (decrementAndClean(occurrenceTracker, differenceValue)) {
          // If successful, add the related node to the queue for further exploration.
          // The sign of the added node depends on the current traversal direction.
          explorationQueue.push(isRightDirection ? differenceValue : -differenceValue);
        }
      }
    }

    // After exploring a full component, add the minimum of the two branch counts to the final score.
    finalScore += Math.min(leftBranchNodes, rightBranchNodes);
  }

  // Output the calculated final score
  console.log(finalScore);
}

// Input reading from standard input. Wrapped in try/catch for robust error handling.
try {
  processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
} catch (error) {
  console.error("An error occurred during input reading or data processing:", error.message);
  // Optionally, log the full stack trace for debugging
  // console.error(error.stack);
}


// The 'binarySearch' function from the original code was unused and has been completely removed
// as a Type III modification, simplifying the overall codebase.


/**
 * Generates a list of positive differences between powers of two and a given base value.
 * This function identifies potential 'partner' numbers based on a specific mathematical relationship.
 * @param {number} baseValue - The number to compare against powers of two.
 * @returns {Array<number>} An array of positive differences found.
 */
function generatePowerDifferences(baseValue) { // Renamed from 'diffs'
  const differenceList = []; // Renamed from 'res'
  // Iterate through powers of two up to a predefined limit.
  // The limit is chosen based on the problem constraints (e.g., maximum possible input value).
  const MAX_POWER_LIMIT = 2 * 1e9 + 1; // Max value for difference calculation, slightly above 2e9
  for (let powerOfTwo = 2; powerOfTwo < MAX_POWER_LIMIT; powerOfTwo *= 2) { // Renamed from 'tar'
    const calculatedDiff = powerOfTwo - baseValue; // Renamed from 'd'
    // Only include positive differences as valid 'partners'.
    if (calculatedDiff > 0) {
      differenceList.push(calculatedDiff);
    }
  }
  return differenceList;
}

/**
 * Decrements the frequency of a key in the occurrence tracker.
 * If the frequency drops to 0 or below, the key is removed from the map.
 * This function acts as a 'consumption' mechanism for numbers during traversal.
 * @param {Map<number, number>} trackerMap - The map tracking number frequencies. Renamed from 'map'.
 * @param {number} targetKey - The key whose frequency is to be decremented. Renamed from 'key'.
 * @param {number} [initialFrequency] - Optional: The current frequency of the key. If not provided,
 *                                      it's fetched from the map. This optimizes access if frequency is already known.
 * @returns {boolean} True if the key was found and its frequency was successfully decremented/removed, false otherwise.
 */
function decrementAndClean(trackerMap, targetKey, initialFrequency) { // Renamed from 'remove'
  // Use the provided frequency if available, otherwise fetch from the map.
  let currentFrequency = initialFrequency !== undefined ? initialFrequency : trackerMap.get(targetKey); // Renamed from 'val'

  // Guard clause: if the key is not found in the map or its frequency is invalid (e.g., <= 0),
  // it cannot be decremented, so return false.
  if (currentFrequency === undefined || currentFrequency <= 0) {
    return false;
  }

  // If frequency is greater than 1, just decrement it.
  if (currentFrequency > 1) {
    trackerMap.set(targetKey, currentFrequency - 1);
  } else {
    // If frequency is 1, decrementing it would make it 0, so remove the key entirely.
    trackerMap.delete(targetKey);
  }
  return true;
}