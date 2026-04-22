/**
 * Represents a single game piece with a category label and an ordinal value.
 * This class provides methods for comparison and string representation.
 */
class GamePiece {
  /**
   * Constructs a new GamePiece instance.
   * @param {string} inputCategory - The category label for the piece (e.g., 'Spade', 'Heart').
   * @param {string|number} inputRank - The raw rank value for the piece (e.g., 'K', '10', 1).
   */
  constructor(inputCategory, inputRank) {
    // Ensure category label is a string and trim any whitespace
    this.categoryLabel = String(inputCategory).trim();
    // Parse the rank as an integer, defaulting to 0 if invalid
    const parsedRank = parseInt(inputRank, 10);
    this.ordinalValue = isNaN(parsedRank) ? 0 : parsedRank;
  }

  /**
   * Creates a GamePiece from an array of two elements [category, rank].
   * This is a static factory method for convenient object instantiation.
   * @param {Array<string>} pieceData - An array where pieceData[0] is category and pieceData[1] is rank.
   * @returns {GamePiece} A new GamePiece instance.
   * @throws {Error} If the input array is invalid or malformed.
   */
  static fromArray(pieceData) {
    if (!Array.isArray(pieceData) || pieceData.length < 2) {
      throw new Error("Invalid array format for GamePiece creation: expected [category, rank].");
    }
    return new GamePiece(pieceData[0], pieceData[1]);
  }

  /**
   * Determines if this game piece is identical to another game piece.
   * Compares both the ordinal value and the category label for exact match.
   * @param {GamePiece} otherPiece - The other GamePiece to compare with.
   * @returns {boolean} True if both pieces are identical in value and category, false otherwise.
   */
  isIdenticalTo(otherPiece) {
    // Guard against comparing with non-GamePiece objects
    if (!(otherPiece instanceof GamePiece)) {
      console.warn("isIdenticalTo: Comparison attempted with non-GamePiece object.");
      return false;
    }
    return this.ordinalValue === otherPiece.ordinalValue && this.categoryLabel === otherPiece.categoryLabel;
  }

  /**
   * Compares the rank of this game piece to another game piece.
   * This method establishes a total order based on ordinal value.
   * @param {GamePiece} otherPiece - The other GamePiece to compare with.
   * @returns {number} 0 if ranks are equal, -1 if this piece's rank is less, 1 if greater.
   * @throws {Error} If otherPiece is not a valid GamePiece, indicating an invalid comparison.
   */
  determineOrder(otherPiece) {
    // Enforce type safety for comparison
    if (!(otherPiece instanceof GamePiece)) {
      throw new Error("Cannot determine order: 'otherPiece' must be a GamePiece object.");
    }

    const currentRank = this.ordinalValue;
    const partnerRank = otherPiece.ordinalValue;

    if (currentRank === partnerRank) {
      return 0; // Ranks are the same
    } else if (currentRank < partnerRank) {
      return -1; // This piece has a lower rank
    } else {
      return 1; // This piece has a higher rank
    }
  }

  /**
   * Provides a concise string representation of the game piece.
   * @returns {string} A formatted string, e.g., "CATEGORY RANK".
   */
  describeUnit() {
    return `${this.categoryLabel} ${this.ordinalValue}`;
  }
}

/**
 * Helper function to atomically swap two elements within an array.
 * This ensures clean and readable swap operations in sorting algorithms.
 * @param {Array} arrayReference - The array whose elements are to be swapped.
 * @param {number} indexA - The index of the first element.
 * @param {number} indexB - The index of the second element.
 */
const swapElements = (arrayReference, indexA, indexB) => {
  // Use a temporary variable for the swap to avoid data loss.
  const temporaryValue = arrayReference[indexA];
  arrayReference[indexA] = arrayReference[indexB];
  arrayReference[indexB] = temporaryValue;
};

/**
 * Partitions a sub-array around a chosen pivot element (last element).
 * Elements less than or equal to the pivot are placed before it,
 * and elements greater than the pivot are placed after it.
 * @param {Array<GamePiece>} targetCollection - The array of GamePiece objects to partition.
 * @param {number} lowIndex - The starting index (inclusive) of the current sub-array.
 * @param {number} highIndex - The ending index (inclusive) of the current sub-array.
 * @returns {number} The final index of the pivot element after partitioning.
 */
function executePartitioning(targetCollection, lowIndex, highIndex) {
  // Select the last element of the sub-array as the pivot.
  const pivotUnit = targetCollection[highIndex];
  let boundaryIndex = lowIndex - 1; // Tracks the boundary of elements smaller than or equal to the pivot.

  // Iterate through the sub-array from the start to just before the pivot.
  for (let scanIndex = lowIndex; scanIndex < highIndex; scanIndex++) {
    // If the current element is less than or equal to the pivot,
    // increment the boundary index and swap the elements.
    if (targetCollection[scanIndex].determineOrder(pivotUnit) <= 0) {
      boundaryIndex++;
      swapElements(targetCollection, boundaryIndex, scanIndex);
    }
  }

  // After the loop, all elements less than or equal to the pivot are on the left of boundaryIndex + 1.
  // Place the pivot element in its correct sorted position.
  swapElements(targetCollection, boundaryIndex + 1, highIndex);
  return boundaryIndex + 1; // Return the pivot's new, final index.
}

/**
 * Implements the QuickSort algorithm for an array of GamePiece objects.
 * This is a recursive, in-place sorting algorithm.
 * @param {Array<GamePiece>} targetCollection - The array of GamePiece objects to sort.
 * @param {number} lowIndex - The starting index (inclusive) for the current sort operation.
 * @param {number} highIndex - The ending index (inclusive) for the current sort operation.
 */
function performPartitionSort(targetCollection, lowIndex, highIndex) {
  // Base case: if the sub-array has one or zero elements, it's considered sorted.
  if (lowIndex >= highIndex) {
    return;
  }

  // Perform the partitioning step and obtain the pivot's final index.
  const pivotFinalPosition = executePartitioning(targetCollection, lowIndex, highIndex);

  // Recursively sort the sub-arrays on either side of the pivot.
  performPartitionSort(targetCollection, lowIndex, pivotFinalPosition - 1); // Sort elements to the left of the pivot.
  performPartitionSort(targetCollection, pivotFinalPosition + 1, highIndex); // Sort elements to the right of the pivot.
}


/**
 * Main application entry point.
 * This IIFE (Immediately Invoked Function Expression) orchestrates
 * reading input, sorting game pieces, checking stability, and outputting results.
 */
(function runApplication() {
  let rawInputContent;
  const standardInputPath = '/dev/stdin';

  // Safely attempt to read input from the standard input stream.
  try {
    const fileSystemModule = require('fs');
    rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  } catch (error) {
    console.error(`ERROR: Failed to read input from ${standardInputPath}. Details: ${error.message}`);
    process.exit(1); // Terminate the program if input cannot be read.
  }

  // Process input lines: split by newline and filter out any empty lines.
  const inputDataLines = rawInputContent.split('\n').filter(line => line.trim().length > 0);

  // The first line typically indicates the total count of elements.
  // We consume it but don't strictly rely on its value, preferring dynamic array length.
  const totalElementsCountHint = inputDataLines.shift();

  // If no actual data lines remain after processing the count, output a message and exit.
  if (inputDataLines.length === 0) {
    console.log("No game pieces provided for processing.");
    console.log("Stable"); // An empty set is trivially stable.
    return;
  }

  // Parse each remaining line into a GamePiece object using the static factory method.
  const originalUnitsCollection = inputDataLines.map(line => {
    try {
      return GamePiece.fromArray(line.split(' '));
    } catch (parseError) {
      console.error(`ERROR: Could not parse line "${line}" into a GamePiece. Details: ${parseError.message}`);
      process.exit(1); // Exit on parsing errors to prevent incorrect behavior.
    }
  });

  // Create a shallow copy of the original collection.
  // This copy will be sorted by QuickSort, while the original is preserved for stability checks.
  const sortedUnitsContainer = originalUnitsCollection.slice();

  // Execute the QuickSort algorithm on the copied collection.
  // The sorting range is from the first element (index 0) to the last.
  performPartitionSort(sortedUnitsContainer, 0, sortedUnitsContainer.length - 1);

  // --- Start of Stability Check Logic ---
  // To verify stability, we need to track the original positions of elements.
  // We create an intermediate array where each object contains a GamePiece and its initial index.
  const indexedOriginalUnits = originalUnitsCollection.map((unit, initialPosition) => ({
    pieceValue: unit,
    originalIndex: initialPosition
  }));

  // Perform a stable sort on the indexed original units.
  // This sort uses `determineOrder` for primary comparison and `originalIndex` for tie-breaking.
  const stablySortedIndexedUnits = indexedOriginalUnits.sort((unitA, unitB) => {
    const rankComparison = unitA.pieceValue.determineOrder(unitB.pieceValue);
    // If ranks are equal, use the original index to preserve relative order (stable sort).
    if (rankComparison !== 0) {
      return rankComparison;
    }
    return unitA.originalIndex - unitB.originalIndex;
  });

  // Compare the QuickSorted array with the stably sorted array to determine stability.
  let stabilityStatusFlag = true;
  if (sortedUnitsContainer.length !== stablySortedIndexedUnits.length) {
    stabilityStatusFlag = false; // Mismatched lengths indicate a critical issue or instability.
  } else {
    // Iterate through both sorted arrays and compare elements.
    for (let i = 0; i < sortedUnitsContainer.length; i++) {
      const quickSortedPiece = sortedUnitsContainer[i];
      const stablySortedPiece = stablySortedIndexedUnits[i].pieceValue;

      // If any corresponding pieces are not identical, the QuickSort was not stable.
      if (!quickSortedPiece.isIdenticalTo(stablySortedPiece)) {
        stabilityStatusFlag = false;
        break; // No need to check further once an instability is found.
      }
    }
  }
  // --- End of Stability Check Logic ---

  // Output the stability determination.
  console.log(stabilityStatusFlag ? 'Stable' : 'Not stable');

  // Format and output the elements of the QuickSorted array.
  const formattedSortedOutput = sortedUnitsContainer.map(piece => piece.describeUnit()).join('\n');
  console.log(formattedSortedOutput);
})();