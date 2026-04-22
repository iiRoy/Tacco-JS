class GamePiece {
  // Represents a card-like element with a suit and a numerical rank.
  constructor(inputSymbol, inputNumerical) {
    // Ensure the suit is always a string.
    this.suitSymbol = String(inputSymbol || 'UNKNOWN');
    // Parse the numerical rank, defaulting to 0 if invalid.
    this.rankValue = Number.isFinite(Number(inputNumerical)) ? parseInt(inputNumerical, 10) : 0;
  }

  /**
   * Checks if this GamePiece is functionally identical to another.
   * @param {GamePiece} otherPiece - The other GamePiece to compare against.
   * @returns {boolean} True if both suit and rank match, false otherwise.
   */
  areIdentical(otherPiece) {
    // Basic type check for robustness.
    if (!(otherPiece instanceof GamePiece)) {
      return false;
    }
    // Compare both the rank and the suit for equality.
    return this.rankValue === otherPiece.rankValue && this.suitSymbol === otherPiece.suitSymbol;
  }

  /**
   * Determines the relative order of this GamePiece compared to another.
   * Follows standard comparison conventions: -1 if less, 0 if equal, 1 if greater.
   * @param {GamePiece} anotherPiece - The GamePiece to compare with.
   * @returns {number} -1, 0, or 1 based on rank comparison.
   */
  compareForSorting(anotherPiece) {
    // Return early if ranks are equal.
    if (this.rankValue === anotherPiece.rankValue) {
      return 0;
    }
    // Use a ternary operator for concise comparison.
    return (this.rankValue < anotherPiece.rankValue) ? -1 : 1;
  }

  /**
   * Provides a string representation of the GamePiece.
   * @returns {string} A combined string of the suit and rank.
   */
  obtainStringRepresentation() {
    // Utilize template literals for easy formatting.
    return `${this.suitSymbol} ${this.rankValue}`;
  }

  /**
   * Validates if the GamePiece has sensible values.
   * @returns {boolean} True if valid, false otherwise.
   */
  isValid() {
    return typeof this.suitSymbol === 'string' && this.suitSymbol.length > 0 &&
           Number.isInteger(this.rankValue) && this.rankValue >= 0; // Assuming non-negative ranks
  }

  /**
   * Static factory method to create a GamePiece from an array of tokens.
   * @param {string[]} dataTokens - An array where the first element is the suit and the second is the rank.
   * @returns {GamePiece} A new GamePiece instance.
   */
  static createFromTokens(dataTokens) {
    if (!Array.isArray(dataTokens) || dataTokens.length < 2) {
      console.error("Warning: Invalid data tokens for GamePiece creation.");
      return new GamePiece('ERR', 0); // Return a default/error piece
    }
    return new GamePiece(dataTokens[0], dataTokens[1]);
  }
}

// Helper function to swap two elements in an array.
function swapElements(targetArray, firstIndex, secondIndex) {
  // Perform the swap using temporary variable for clarity.
  const tempVal = targetArray[firstIndex];
  targetArray[firstIndex] = targetArray[secondIndex];
  targetArray[secondIndex] = tempVal;
}

/**
 * Partitions a segment of an array around a chosen pivot element.
 * Elements less than or equal to the pivot are moved to its left.
 * @param {Array<GamePiece>} collection - The array of GamePiece objects.
 * @param {number} lowIdx - The starting index of the segment.
 * @param {number} highIdx - The ending index of the segment (pivot element).
 * @returns {number} The final index of the pivot element.
 */
function _partitionSubroutine(collection, lowIdx, highIdx) {
  // Choose the last element as the pivot.
  const pivotElement = collection[highIdx];
  // Initialize pointer for elements smaller than pivot.
  let leftScanPointer = lowIdx - 1;

  // Iterate through the segment from lowIdx to highIdx - 1.
  for (let rightScanIterator = lowIdx; rightScanIterator < highIdx; rightScanIterator++) {
    // If current element is less than or equal to the pivot.
    if (collection[rightScanIterator].compareForSorting(pivotElement) <= 0) {
      leftScanPointer++; // Increment the pointer for smaller elements.
      // Swap the current element with the element at leftScanPointer.
      swapElements(collection, leftScanPointer, rightScanIterator);
    }
  }
  // Place the pivot element in its correct sorted position.
  swapElements(collection, leftScanPointer + 1, highIdx);
  return leftScanPointer + 1; // Return the final position of the pivot.
}

/**
 * Sorts an array of GamePiece objects using the QuickSort algorithm.
 * This is the primary recursive sorting function.
 * @param {Array<GamePiece>} targetCollection - The array to be sorted.
 * @param {number} lowBoundaryIndex - The starting index of the segment to sort.
 * @param {number} highBoundaryIndex - The ending index of the segment to sort.
 */
function performRecursiveSort(targetCollection, lowBoundaryIndex, highBoundaryIndex) {
  // Basic validation for the input array.
  if (!Array.isArray(targetCollection) || targetCollection.length === 0) {
    console.warn("Attempted to sort an invalid or empty collection.");
    return;
  }

  // Base case: if the segment has 0 or 1 element, it's already sorted.
  if (lowBoundaryIndex < highBoundaryIndex) {
    // Determine the pivot's final position after partitioning.
    const finalPivotPosition = _partitionSubroutine(targetCollection, lowBoundaryIndex, highBoundaryIndex);

    // Recursively sort the sub-array before the pivot.
    performRecursiveSort(targetCollection, lowBoundaryIndex, finalPivotPosition - 1);
    // Recursively sort the sub-array after the pivot.
    performRecursiveSort(targetCollection, finalPivotPosition + 1, highBoundaryIndex);
  }
}

// Helper function for reading input from stdin.
const retrieveInputData = () => {
  try {
    // Using 'fs' module to read from standard input.
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Trim whitespace and split into individual lines.
    return rawData.trim().split('\n');
  } catch (error) {
    console.error("Error reading input data:", error.message);
    return []; // Return an empty array on error.
  }
};

/**
 * Main application entry point (Immediately Invoked Function Expression).
 * Handles input processing, sorting, stability check, and output.
 */
(function applicationEntry() {
  // Read all input lines.
  const inputSegmentCollection = retrieveInputData();

  // Guard clause for empty input.
  if (inputSegmentCollection.length === 0) {
    console.log("No input provided. Exiting.");
    return;
  }

  // The first line usually contains the total count of items, which we discard here.
  const totalItemCountStr = inputSegmentCollection.shift();
  const totalItemCount = parseInt(totalItemCountStr, 10);

  // Validate the item count.
  if (isNaN(totalItemCount) || totalItemCount <= 0) {
    console.error("Invalid or non-positive item count specified. Proceeding with available items.");
  }

  // Map raw input lines to GamePiece objects.
  const originalItemSet = inputSegmentCollection
    .map(line => line.split(' '))
    .map(tokens => GamePiece.createFromTokens(tokens));

  // Create a mutable copy for the QuickSort algorithm.
  const fastSortedItemSet = [...originalItemSet]; // Using spread operator for a shallow copy.

  // Log the number of items being processed.
  console.log(`Processing ${originalItemSet.length} game pieces.`);

  // Perform the QuickSort on the mutable copy.
  performRecursiveSort(fastSortedItemSet, 0, fastSortedItemSet.length - 1);

  // --- Stability Check ---
  // Create a separate sorted version of the original array using JavaScript's built-in sort (which is stable for objects).
  const builtInSortedSet = [...originalItemSet].sort((itemA, itemB) => itemA.compareForSorting(itemB));

  // Compare the built-in sorted array with the QuickSorted array to determine stability.
  // Iterate through both arrays to check if corresponding elements are identical.
  let isSortStable = true;
  if (builtInSortedSet.length !== fastSortedItemSet.length) {
    isSortStable = false; // Length mismatch implies instability or error.
  } else {
    for (let indexPos = 0; indexPos < builtInSortedSet.length; indexPos++) {
      if (!builtInSortedSet[indexPos].areIdentical(fastSortedItemSet[indexPos])) {
        isSortStable = false;
        break; // Found a difference, so it's not stable.
      }
    }
  }

  // Output the stability result.
  const stabilityMessage = isSortStable ? 'Stable' : 'Not stable';
  console.log(stabilityMessage);

  // Output the QuickSorted array's string representation, each on a new line.
  console.log(fastSortedItemSet.map(piece => piece.obtainStringRepresentation()).join('\n'));

})(); // End of applicationEntry IIFE.