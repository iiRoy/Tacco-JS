class PlayingPiece {
  /**
   * Initializes a new playing piece with a given symbol and numerical rank.
   * @param {string} symb - The symbol or suit of the playing piece (e.g., 'H', 'S').
   * @param {number} numVal - The numerical rank or face value of the piece (e.g., 1, 10, 13).
   */
  constructor(symb, numVal) {
    // Basic validation for input types
    if (typeof symb !== 'string' || typeof numVal !== 'number' || isNaN(numVal)) {
      console.warn("Warning: Invalid input types for PlayingPiece constructor. Coercing values.");
    }
    this.pieceSymbol = String(symb).toUpperCase().trim(); // Store symbol as uppercase string
    this.numericalRank = Number(numVal); // Store numerical rank as a number
  }

  /**
   * Checks if this playing piece is identical to another playing piece.
   * @param {PlayingPiece} anotherPiece - The other playing piece to compare against.
   * @returns {boolean} True if both pieces have the same symbol and numerical rank, false otherwise.
   */
  isIdenticalTo(anotherPiece) {
    // Guard clause: ensure the other object is a valid PlayingPiece instance
    if (!(anotherPiece instanceof PlayingPiece)) {
      // console.error("Error: Comparison target is not a PlayingPiece instance.");
      return false; // Cannot be identical if types don't match
    }
    // Perform a direct comparison of properties
    const sameRank = this.numericalRank === anotherPiece.numericalRank;
    const sameSymbol = this.pieceSymbol === anotherPiece.pieceSymbol;
    return sameRank && sameSymbol;
  }

  /**
   * Determines the relative order of this playing piece compared to another.
   * Follows standard comparison rules:
   * - Returns 0 if pieces are of equal rank.
   * - Returns -1 if this piece's rank is less than the other's.
   * - Returns 1 if this piece's rank is greater than the other's.
   * @param {PlayingPiece} anotherPiece - The other playing piece for comparison.
   * @returns {number} -1, 0, or 1 based on rank comparison.
   */
  determineOrder(anotherPiece) {
    // Guard clause for type safety
    if (!(anotherPiece instanceof PlayingPiece)) {
      // console.error("Error: Comparison target is not a PlayingPiece instance for ordering.");
      // For robust sorting, we might throw an error or define an arbitrary order.
      // For this context, let's assume non-PlayingPiece items are "greater"
      return -1;
    }

    // Calculate the difference and use Math.sign for a concise return value
    const rankDifference = this.numericalRank - anotherPiece.numericalRank;
    return Math.sign(rankDifference);
  }

  /**
   * Provides a string representation of the playing piece.
   * @returns {string} A formatted string showing the piece's symbol and rank.
   */
  getRepresentation() {
    return `[${this.pieceSymbol}-${this.numericalRank}]`; // Alternative string format
  }
}

/**
 * Implements the QuickSort algorithm for an array of PlayingPiece objects.
 * This version uses the last element as the pivot and a Lomuto partition scheme.
 * @param {PlayingPiece[]} dataArray - The array of playing pieces to be sorted in-place.
 * @param {number} startIndex - The starting index of the subarray to sort.
 * @param {number} endIndex - The ending index of the subarray to sort.
 */
function performQuickSort(dataArray, startIndex, endIndex) {
  // Base case: if the subarray has 0 or 1 element, it's already sorted.
  if (startIndex >= endIndex) {
    return;
  }

  /**
   * Partitions the subarray around a pivot element.
   * Elements smaller than or equal to the pivot are moved to its left,
   * and elements greater than the pivot are moved to its right.
   * @param {PlayingPiece[]} arr - The array being sorted.
   * @param {number} lowBound - The lower bound of the current partition.
   * @param {number} highBound - The upper bound of the current partition (pivot's initial position).
   * @returns {number} The final index of the pivot element after partitioning.
   */
  const partitionElements = (arr, lowBound, highBound) => {
    const pivotPiece = arr[highBound]; // Choose the last element as the pivot
    let boundaryIndex = lowBound - 1; // Index of the smaller element

    // Iterate through the subarray from lowBound to highBound-1
    for (let currentIdx = lowBound; currentIdx < highBound; currentIdx++) {
      // If the current element's rank is less than or equal to the pivot's rank
      if (arr[currentIdx].determineOrder(pivotPiece) <= 0) {
        boundaryIndex++; // Increment boundary index
        // Swap elements at boundaryIndex and currentIdx
        [arr[boundaryIndex], arr[currentIdx]] = [arr[currentIdx], arr[boundaryIndex]];
      }
    }

    // Place the pivot element in its correct sorted position
    // Swap arr[boundaryIndex + 1] and arr[highBound] (the pivot)
    [arr[boundaryIndex + 1], arr[highBound]] = [arr[highBound], arr[boundaryIndex + 1]];
    return boundaryIndex + 1; // Return the final index of the pivot
  };

  // Find the pivot's final position
  const pivotFinalPosition = partitionElements(dataArray, startIndex, endIndex);

  // Recursively sort the subarrays before and after the pivot
  performQuickSort(dataArray, startIndex, pivotFinalPosition - 1);
  performQuickSort(dataArray, pivotFinalPosition + 1, endIndex);
}

// Main execution block wrapped in an IIFE for scope isolation
(function executeProcess() {
  const FILE_INPUT_PATH = '/dev/stdin'; // Standard input path
  const STABILITY_MESSAGE_STABLE = 'Stable';
  const STABILITY_MESSAGE_UNSTABLE = 'Not stable';

  let rawFileContent;
  try {
    const fileSystem = require('node:fs'); // Use 'node:fs' for modern Node.js
    rawFileContent = fileSystem.readFileSync(FILE_INPUT_PATH, { encoding: 'utf8', flag: 'r' });
  } catch (error) {
    console.error(`Failed to read input file at ${FILE_INPUT_PATH}:`, error.message);
    process.exit(1); // Exit with an error code
  }

  // Process input lines: trim whitespace, split by newline, filter out empty lines
  const processedInputLines = rawFileContent
    .trim()
    .split(/\r?\n/) // Handles both Windows and Unix newlines
    .filter(line => line.length > 0); // Remove any completely empty lines

  // Extract the total number of elements from the first line
  const totalElementsCount = Number(processedInputLines.shift());
  if (isNaN(totalElementsCount) || totalElementsCount < 0) {
      console.error("Error: Invalid or missing number of elements in input.");
      process.exit(1);
  }
  if (totalElementsCount === 0) {
      console.log(STABILITY_MESSAGE_STABLE);
      console.log("");
      return;
  }

  // Map remaining lines to PlayingPiece objects
  const initialPiecesCollection = processedInputLines
    .map(singleLine => singleLine.split(/\s+/).filter(part => part.length > 0)) // Split by whitespace, filter empty parts
    .map(componentParts => new PlayingPiece(componentParts[0], componentParts[1]));

  // Create a shallow copy for sorting, preserving the original array for stability check
  const sortablePiecesCopy = Array.from(initialPiecesCollection);

  // Execute the quick sort procedure on the copy
  performQuickSort(sortablePiecesCopy, 0, totalElementsCount - 1);

  // --- Stability Check Logic ---
  // Helper to augment each piece with its original index
  const pieceWithOriginalIndex = (item, originalIdx) => ({
    actualPiece: item,
    initialPosition: originalIdx
  });

  // Comparator for the stability check:
  // Sorts primarily by piece rank, then by original index for ties
  const stabilityComparator = (indexedA, indexedB) => {
    const rankComparison = indexedA.actualPiece.determineOrder(indexedB.actualPiece);
    // If ranks are equal, use original position to maintain stability
    if (rankComparison === 0) {
      return indexedA.initialPosition - indexedB.initialPosition;
    }
    return rankComparison;
  };

  // 1. Create an indexed version of the original array and sort it stably
  const stablySortedInitialCollection = initialPiecesCollection
    .map(pieceWithOriginalIndex)
    .sort(stabilityComparator);

  // 2. Compare the stably sorted original collection with the result of the quick sort
  let isSortingAlgorithmStable = true;
  for (let k = 0; k < totalElementsCount; k++) {
    const originalSortedPiece = stablySortedInitialCollection[k].actualPiece;
    const quickSortResultPiece = sortablePiecesCopy[k];

    // If any corresponding pieces are not identical, the sort is unstable
    if (!originalSortedPiece.isIdenticalTo(quickSortResultPiece)) {
      isSortingAlgorithmStable = false;
      break; // No need to check further
    }
  }

  // Output the stability result
  console.log(isSortingAlgorithmStable ? STABILITY_MESSAGE_STABLE : STABILITY_MESSAGE_UNSTABLE);

  // Output the sorted array (using the new representation method)
  console.log(sortablePiecesCopy.map(piece => piece.getRepresentation()).join('\n'));

})(); // End of IIFE