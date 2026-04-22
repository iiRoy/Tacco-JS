'use strict';

// This module encapsulates advanced array manipulation functionalities, specifically for generating permutations.
// It uses an immediately invoked function expression (IIFE) to avoid polluting the global scope.
(function() {
  /**
   * A recursive utility function to build all possible permutations (arrangements) of elements.
   * This function operates by selecting one element at a time from the remaining pool,
   * appending it to the current formation, and then recursively calling itself with the reduced set.
   *
   * @private
   * @param {Array<Array<any>>} collectedResults - The primary array where all final permutations will be stored.
   * @param {Array<any>} currentPartialSequence - The sequence of elements built so far in the current recursive path.
   * @param {Array<any>} availableElements - The pool of elements from which to choose for the next step.
   * @param {number} desiredSequenceLength - The target length for each complete permutation.
   */
  const recursivelyGenerateArrangements = (collectedResults, currentPartialSequence, availableElements, desiredSequenceLength) => {
    // Input validation: A negative length for a sequence is illogical.
    if (desiredSequenceLength < 0) {
      console.error("Error: Desired sequence length cannot be negative in permutation generation.");
      return;
    }

    // Base case: If the current partial sequence has reached the desired length,
    // it means a complete permutation has been formed. Store it and terminate this path.
    if (desiredSequenceLength === 0) {
      collectedResults.push(currentPartialSequence);
      return;
    }

    // Recursive step: Iterate through the available elements.
    // For each element, consider it as the next item in the sequence.
    if (availableElements.length > 0) {
      for (let selectionIndex = 0; selectionIndex < availableElements.length; ++selectionIndex) {
        const selectedItem = availableElements[selectionIndex];
        const remainingForNextStep = [];

        // Construct the new set of available elements by excluding the 'selectedItem'.
        for (let k = 0; k < availableElements.length; ++k) {
          if (k !== selectionIndex) {
            remainingForNextStep.push(availableElements[k]);
          }
        }

        // Recursively call the function with:
        // 1. The updated partial sequence (current + selected item).
        // 2. The reduced set of available elements.
        // 3. Decremented desired sequence length.
        recursivelyGenerateArrangements(
          collectedResults,
          currentPartialSequence.concat(selectedItem),
          remainingForNextStep,
          desiredSequenceLength - 1
        );
      }
    }
    // Implicit base case: If availableElements.length is 0 and desiredSequenceLength > 0,
    // no further permutations can be formed along this path, and the recursion naturally unwinds.
  };

  /**
   * Extends the native Array prototype with a method to generate all permutations of its elements.
   * This method uses the 'recursivelyGenerateArrangements' helper function.
   *
   * @param {number} [lengthToPermute] - Optional. Specifies the length of the permutations to generate.
   *                                      If omitted or null/undefined, permutations of the full array length are produced.
   * @returns {Array<Array<any>>} An array containing all generated permutations, where each permutation is itself an array.
   */
  // Add a guard to prevent re-definition if the method already exists.
  if (!Array.prototype.deriveArrangements) {
    Object.defineProperty(Array.prototype, 'deriveArrangements', {
      value: function(lengthToPermute) {
        // Determine the actual length for permutation generation.
        let effectivePermutationLength = (lengthToPermute === undefined || lengthToPermute === null) ? this.length : lengthToPermute;

        // Robustness check for the provided length.
        if (effectivePermutationLength < 0 || effectivePermutationLength > this.length) {
          console.warn(`Warning: Requested permutation length (${effectivePermutationLength}) is invalid for an array of size ${this.length}. Defaulting to full array length.`);
          effectivePermutationLength = this.length; // Fallback to generating full permutations.
        }

        const allGeneratedSequences = []; // Container for the final results.
        const startingPrefix = []; // An empty array to begin the recursive process.
        const sourceElementsCopy = [...this]; // Create a shallow copy to prevent modification of the original array during recursion.

        // Initiate the recursive generation process.
        recursivelyGenerateArrangements(allGeneratedSequences, startingPrefix, sourceElementsCopy, effectivePermutationLength);

        return allGeneratedSequences;
      },
      writable: true, // Allows the property to be reassigned later if necessary.
      configurable: true // Allows the property to be redefined or deleted.
    });
  }
})();

// --- Main application logic for processing input and calculating rank difference ---

/**
 * A utility function to parse a string of space-separated numbers into an array of integers.
 * Includes basic validation for input.
 *
 * @param {string} inputDataString - The string containing numbers.
 * @returns {Array<number>} An array of parsed numbers, or an empty array if parsing fails.
 */
const extractNumericArray = (inputDataString) => {
  if (typeof inputDataString !== 'string' || inputDataString.trim() === '') {
    return []; // Return an empty array for invalid or empty string inputs.
  }
  // Split the string by spaces, map each part to a Number, and filter out any non-numeric results (NaNs).
  return inputDataString.split(' ').map(Number).filter(value => !isNaN(value));
};

/**
 * The primary function that processes the raw input lines to determine the
 * lexicographical rank difference between two specific permutations.
 *
 * @param {Array<string>} rawInputContentLines - An array where each element is a line from the input.
 */
const executeRankDifferenceCalculation = (rawInputContentLines) => {
  // Validate the minimum number of input lines.
  if (!rawInputContentLines || rawInputContentLines.length < 3) {
    console.error("Error: Insufficient input lines provided for processing.");
    return;
  }

  // Parse the total count of elements, which defines the permutation set.
  const totalElementQuantity = parseInt(rawInputContentLines[0], 10);
  if (isNaN(totalElementQuantity) || totalElementQuantity <= 0) {
    console.error("Error: The first line must contain a positive integer representing the element count.");
    return;
  }

  // Parse the two sequences (permutations) that we need to find ranks for.
  const primarySequence = extractNumericArray(rawInputContentLines[1]);
  const secondarySequence = extractNumericArray(rawInputContentLines[2]);

  // Perform basic validation on the parsed sequences.
  if (primarySequence.length !== totalElementQuantity || secondarySequence.length !== totalElementQuantity) {
    console.warn(`Warning: One or both input sequences do not match the declared element quantity (${totalElementQuantity}). Proceeding with potentially incorrect data.`);
  }

  // Convert the numerical sequences into string representations for lexicographical comparison.
  // Explicitly convert numbers to strings before joining.
  const primarySequenceAsString = primarySequence.map(String).join('');
  const secondarySequenceAsString = secondarySequence.map(String).join('');

  // Generate a canonical base array (e.g., [1, 2, ..., N]) from which to derive all permutations.
  // This ensures a consistent set of permutations regardless of the specific values in primarySequence/secondarySequence,
  // assuming they are permutations of 1..N.
  const canonicalBaseArray = Array.from({
    length: totalElementQuantity
  }, (_, index) => index + 1);

  // Generate all possible permutations of the canonical base array.
  // Utilizing the custom prototype method 'deriveArrangements'.
  const completePermutationSet = canonicalBaseArray.deriveArrangements();

  // Transform each numerical permutation array into a single string for sorting and comparison.
  const stringifiedPermutationSet = completePermutationSet.map(sequenceArray => sequenceArray.map(String).join(''));

  // Sort the stringified permutations lexicographically. This establishes their ranks.
  stringifiedPermutationSet.sort();

  let primarySequenceRank = -1; // Initialize ranks to -1 to indicate 'not found'.
  let secondarySequenceRank = -1;
  let allRanksFound = false; // Flag to optimize the search loop.

  // Iterate through the sorted list to find the ranks of our target sequences.
  for (let currentRankIndex = 0; currentRankIndex < stringifiedPermutationSet.length; ++currentRankIndex) {
    const currentPermutationString = stringifiedPermutationSet[currentRankIndex];

    if (currentPermutationString === primarySequenceAsString) {
      primarySequenceRank = currentRankIndex;
    }
    if (currentPermutationString === secondarySequenceAsString) {
      secondarySequenceRank = currentRankIndex;
    }

    // If both target sequences have been found, we can terminate the loop early.
    if (primarySequenceRank !== -1 && secondarySequenceRank !== -1) {
      allRanksFound = true;
      break;
    }
  }

  // Report an error if one or both sequences were not found in the generated set.
  if (!allRanksFound) {
    console.error("Warning: One or both target sequences could not be found among the generated permutations. Ranks may be inaccurate.");
  }

  // Calculate the absolute difference between the found ranks.
  // Using a ternary operator for calculating absolute difference.
  const absoluteRankDifference = (primarySequenceRank > secondarySequenceRank) ?
    (primarySequenceRank - secondarySequenceRank) :
    (secondarySequenceRank - primarySequenceRank);

  // Output the final computed difference to the console.
  console.log(absoluteRankDifference);
};

// Initiate the process by reading input from standard input (e.g., /dev/stdin in Unix-like systems).
// The input is read as UTF-8, split into lines, and then passed to the main processing function.
executeRankDifferenceCalculation(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));