class GameToken {
  /**
   * Constructs a new GameToken instance.
   * @param {string} symbol - The symbol or suit identifier of the token.
   * @param {number} rank - The numeric rank or face value of the token.
   */
  constructor(symbol, rank) {
    // Store the symbol as a string.
    this.symbolIdentifier = String(symbol);
    // Store the rank as a number.
    this.numericRank = Number(rank);
  }

  /**
   * Checks if this token is equivalent to another token.
   * Equivalence is determined by matching both numeric rank and symbol identifier.
   * @param {GameToken} anotherToken - The other token to compare against.
   * @returns {boolean} True if both tokens have the same rank and symbol, false otherwise.
   */
  areEquivalent(anotherToken) {
    return this.numericRank === anotherToken.numericRank && this.symbolIdentifier === anotherToken.symbolIdentifier;
  }

  /**
   * Compares the numeric rank of this token with another token.
   * @param {GameToken} otherToken - The token to compare with.
   * @returns {number} 0 if ranks are equal, -1 if this token's rank is lower, 1 if this token's rank is higher.
   */
  compareRanks(otherToken) {
    if (this.numericRank === otherToken.numericRank) {
      return 0; // Ranks are identical
    } else if (this.numericRank < otherToken.numericRank) {
      return -1; // This token has a smaller rank
    } else {
      return 1; // This token has a larger rank
    }
  }

  /**
   * Returns a string representation of the token.
   * @returns {string} A string in the format "SYMBOL RANK".
   */
  toString() {
    return `${this.symbolIdentifier} ${this.numericRank}`;
  }
}

// Immediately invoked function expression (IIFE) to encapsulate the main program logic.
(function processInputAndSort() {
  // Read all lines from standard input, trim whitespace, and split into an array of strings.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the total number of elements. Remove it from the array and parse as a number.
  const totalElements = Number(inputDataRows.shift());

  // Process the remaining input lines:
  // 1. Split each raw entry string by space to get components (symbol and rank).
  // 2. Map these components to new GameToken objects.
  const initialCollection = inputDataRows.map(rawEntry => rawEntry.split(' ')).map(parts => new GameToken(parts[0], parts[1]));

  // Create a copy of the initial collection for the quick sort algorithm.
  const sortableCollection = initialCollection.concat();

  // Execute the quick sort algorithm on the mutable collection.
  // The range is from index 0 to totalElements - 1.
  performQuickSort(sortableCollection, 0, totalElements - 1);

  // Determine if the quick sort was stable.
  // This is done by comparing the quick-sorted array with a standard JavaScript sort (which is stable for primitive types,
  // and for objects if the comparison function provides a consistent order).
  // The `every` method checks if all elements in the stably sorted array are equivalent
  // to the corresponding elements in the quick-sorted array at the same index.
  console.log(
    initialCollection
      .sort((first, second) => first.compareRanks(second)) // Use JS built-in sort for stable comparison
      .every((currentItem, index) => currentItem.areEquivalent(sortableCollection[index])) // Check equivalence
      ? 'Stable' // Output if the quick sort maintained relative order of equal elements
      : 'Not stable' // Output if the quick sort did not maintain relative order
  );

  // Print the quick-sorted collection, with each token on a new line.
  console.log(sortableCollection.join('\n'));
})(); // End of the main program execution block.

/**
 * Implements the Quick Sort algorithm.
 * Note: This function redefines itself internally to handle recursion.
 * @param {Array<GameToken>} dataElements - The array of GameToken objects to be sorted.
 * @param {number} lowBound - The starting index of the sub-array to sort.
 * @param {number} highBound - The ending index of the sub-array to sort.
 */
function performQuickSort(dataElements, lowBound, highBound) {
  /**
   * Helper function to partition the array around a pivot element.
   * Elements smaller than or equal to the pivot are moved to its left,
   * and elements greater than the pivot are moved to its right.
   * @param {Array<GameToken>} elements - The array segment to partition.
   * @param {number} startIdx - The starting index of the segment.
   * @param {number} endIdx - The ending index of the segment (pivot is at this index).
   * @returns {number} The final index of the pivot element after partitioning.
   */
  const establishPivot = function(elements, startIdx, endIdx) {
    // Choose the last element as the pivot.
    let pivotElement = elements[endIdx];
    // `smallerElementsBoundary` tracks the boundary between elements smaller than/equal to pivot
    // and elements greater than pivot.
    let smallerElementsBoundary = startIdx - 1;

    // Iterate through the segment from startIdx to endIdx - 1.
    for (let currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
      // If the current element's rank is less than or equal to the pivot's rank,
      // move it to the 'smaller elements' section.
      if (elements[currentIdx].compareRanks(pivotElement) <= 0) {
        smallerElementsBoundary++; // Expand the 'smaller elements' section
        // Swap the current element with the element at `smallerElementsBoundary`.
        [elements[smallerElementsBoundary], elements[currentIdx]] = [elements[currentIdx], elements[smallerElementsBoundary]];
      }
    }
    // Place the pivot element in its correct sorted position.
    // Swap the pivot (originally at endIdx) with the element just after the 'smaller elements' section.
    [elements[smallerElementsBoundary + 1], elements[endIdx]] = [elements[endIdx], elements[smallerElementsBoundary + 1]];

    // Return the final index of the pivot.
    return smallerElementsBoundary + 1;
  }; // End of establishPivot helper function.

  // Redefine the `performQuickSort` function to be the recursive quicksort logic.
  // This is a specific pattern from the original code that must be preserved.
  performQuickSort = function(elementsCollection, lowerBound, upperBound) {
    // Base case for recursion: if the sub-array has one or zero elements, it's already sorted.
    if (lowerBound < upperBound) {
      // Partition the array and get the pivot's final position.
      let pivotFinalPosition = establishPivot(elementsCollection, lowerBound, upperBound);

      // Recursively sort the sub-array to the left of the pivot.
      performQuickSort(elementsCollection, lowerBound, pivotFinalPosition - 1);
      // Recursively sort the sub-array to the right of the pivot.
      performQuickSort(elementsCollection, pivotFinalPosition + 1, upperBound);
    }
  };

  // Initial call to the (now redefined) recursive quicksort function.
  // This call uses the parameters passed to the *original* `performQuickSort` function.
  performQuickSort(dataElements, lowBound, highBound);
}
