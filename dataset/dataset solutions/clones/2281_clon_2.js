'use strict';

// This module provides functionality to generate permutations of an array.
// It extends the Array prototype for convenience.
(function() {
  /**
   * Recursively generates permutations.
   * @param {Array<Array<any>>} resultCollection - The array to store all generated permutations.
   * @param {Array<any>} currentSequence - The current partial permutation being built.
   * @param {Array<any>} remainingElements - The elements still available to choose from.
   * @param {number} countToSelect - The number of elements still needed for the current permutation.
   */
  const computeArrangements = function(resultCollection, currentSequence, remainingElements, countToSelect) {
    let selectedItem, idx, tempRemaining, totalLength;

    if (countToSelect > 0) {
      for (idx = 0, totalLength = remainingElements.length; idx < totalLength; ++idx) {
        tempRemaining = remainingElements.slice(0); // Create a shallow copy
        selectedItem = tempRemaining.splice(idx, 1); // Remove one element
        computeArrangements(resultCollection, currentSequence.concat(selectedItem), tempRemaining, countToSelect - 1);
      }
    } else {
      // Base case: a complete permutation has been formed
      resultCollection.push(currentSequence);
    }
  };

  /*
   * Extends the native Array prototype with a method to generate permutations.
   * Usage example: [1, 2, 3].getArrangements(2)
   * Returns: [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1], [3, 2]]
   */
  Array.prototype.getArrangements = function(selectionSize) {
    // If selectionSize is not specified, default to the array's full length
    if (selectionSize == null) {
      selectionSize = this.length;
    }
    let finalArrangements = [];
    // Initiate the recursive permutation generation
    computeArrangements(finalArrangements, [], this, selectionSize);
    return finalArrangements;
  };
})();

/**
 * Main function to process input and calculate the absolute difference
 * between the indices of two given permutations in a sorted list of all permutations.
 * @param {string[]} rawDataLines - An array of strings, each representing a line of input.
 */
const processInputData = rawDataLines => {
  // Parse the number of elements (N)
  const elementCount = parseInt(rawDataLines[0]);

  // Parse the first sequence (P) from the second line
  const firstSequence = rawDataLines[1].split(' ').map(val => parseInt(val));

  // Parse the second sequence (Q) from the third line
  const secondSequence = rawDataLines[2].split(' ').map(val => parseInt(val));

  // Convert the sequences to string representations for comparison
  let firstSequenceString = firstSequence.join('');
  let secondSequenceString = secondSequence.join('');

  // Generate all permutations of the first sequence and convert them to strings
  let allPermutationStrings = firstSequence.getArrangements().map(val => val.join(''));

  // Sort the generated permutation strings lexicographically
  allPermutationStrings.sort();

  let firstSequenceIndex, secondSequenceIndex;

  // Find the indices of the original sequences in the sorted list
  for (let loopCounter = 0; loopCounter < allPermutationStrings.length; loopCounter++) {
    if (firstSequenceString == allPermutationStrings[loopCounter]) {
      firstSequenceIndex = loopCounter;
    }
    if (secondSequenceString == allPermutationStrings[loopCounter]) {
      secondSequenceIndex = loopCounter;
    }
  }

  // Output the absolute difference between the found indices
  console.log(Math.abs(firstSequenceIndex - secondSequenceIndex));
};

// Read input from standard input and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
