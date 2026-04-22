/**
 * @fileoverview This module provides a utility for calculating string edit distances,
 * specifically the Levenshtein distance, using dynamic programming.
 * It also supports incremental updates to the input sequence.
 */

// A potential reference for the algorithm: https://en.wikipedia.org/wiki/Levenshtein_distance

// Define constants for clarity and maintainability.
const OPERATION_COST_MATCH = 0;
const OPERATION_COST_MISMATCH = 1;
const OPERATION_COST_INSERTION = 1;
const OPERATION_COST_DELETION = 1;
const DEFAULT_UNINITIALIZED_VALUE = Infinity;
const NO_PREVIOUS_CELL = [-1, -1]; // Sentinel for traceback path initialization

/**
 * Manages the computation of edit distance between a reference string and an evolving input string.
 */
class StringSimilarityEngine {
  /**
   * Internal 2D array representing the dynamic programming grid.
   * `_distanceGrid[i][j]` stores the Levenshtein distance between
   * the first `i` characters of the processed sequence and the first `j` characters of the reference sequence.
   */
  #distanceGrid;

  /**
   * Internal 2D array storing traceback pointers for path reconstruction.
   * `_pathTracker[i][j]` stores the `[row, col]` of the cell from which `_distanceGrid[i][j]` was derived.
   */
  #pathTracker;

  /**
   * The fixed reference string, broken into individual characters.
   */
  #referenceSequenceChars;

  /**
   * The current input string being compared against the reference, broken into individual characters.
   */
  #processedSequenceChars;

  /**
   * Initializes a new instance of the StringSimilarityEngine.
   * @param {string} referenceText - The base string to compare against.
   * @throws {Error} If the referenceText is not a string or is empty.
   */
  constructor(referenceText) {
    if (typeof referenceText !== 'string' || referenceText.length === 0) {
      throw new Error("Reference text must be a non-empty string for similarity calculation.");
    }

    this.#referenceSequenceChars = Array.from(referenceText);
    const refLen = this.#referenceSequenceChars.length;

    // Initialize the first row of the DP grid.
    // The distance from an empty string to the first 'j' chars of refText is 'j' (all insertions).
    this.#distanceGrid = [Array.from({ length: refLen + 1 }, (_, index) => index)];
    this.#pathTracker = [Array.from({ length: refLen + 1 }, (_, index) => [0, index - 1])];
    this.#pathTracker[0][0] = NO_PREVIOUS_CELL; // Base case: no predecessor for (0,0)

    this.#processedSequenceChars = []; // Start with an empty input sequence.
  }

  /**
   * Extends or truncates the current processed sequence and recomputes the edit distances
   * from a specified starting point. This allows for efficient partial updates.
   * Time complexity: O(|referenceSequence| * |newSegment|).
   * @param {number} startPosition - The index in the processed sequence from which to apply the new segment.
   *                                 The existing processed sequence will be truncated at this point.
   * @param {string} newSegment - The string segment to append to the processed sequence.
   * @throws {Error} If startPosition is out of bounds or newSegment is not a string.
   */
  recomputeFrom(startPosition, newSegment) {
    if (startPosition < 0 || startPosition > this.#processedSequenceChars.length) {
      throw new Error(`Invalid start position (${startPosition}). Must be within [0, current processed length].`);
    }
    if (typeof newSegment !== 'string') {
      throw new Error("New segment must be a string.");
    }

    // Truncate the processed sequence and the DP grid/path tracker up to the startPosition.
    this.#processedSequenceChars.splice(startPosition);
    this.#distanceGrid.length = startPosition + 1; // Keep the row for startPosition
    this.#pathTracker.length = startPosition + 1;

    // Append the new segment characters.
    const segmentChars = Array.from(newSegment);
    this.#processedSequenceChars.push(...segmentChars);

    const currentInputLen = this.#processedSequenceChars.length;
    const refSeqLen = this.#referenceSequenceChars.length;

    // Iterate through new rows that need to be computed or recomputed.
    for (let currentRow = startPosition + 1; currentRow <= currentInputLen; currentRow++) {
      // Initialize a new row for the distance grid and path tracker.
      const newDistanceRow = new Array(refSeqLen + 1).fill(DEFAULT_UNINITIALIZED_VALUE);
      const newPathRow = new Array(refSeqLen + 1).fill(NO_PREVIOUS_CELL);

      // Distance from first 'currentRow' chars of input to empty refText is 'currentRow' (all deletions).
      newDistanceRow[0] = currentRow;
      newPathRow[0] = [currentRow - 1, 0]; // Trace back to the cell above (deletion)

      this.#distanceGrid.push(newDistanceRow);
      this.#pathTracker.push(newPathRow);

      // Compute distances for the current row across all reference sequence characters.
      for (let currentCol = 1; currentCol <= refSeqLen; currentCol++) {
        // Character comparison for match/mismatch cost.
        const charMatchCost = (this.#processedSequenceChars[currentRow - 1] === this.#referenceSequenceChars[currentCol - 1])
          ? OPERATION_COST_MATCH
          : OPERATION_COST_MISMATCH;

        // Calculate potential distances from three possible previous cells:
        // 1. Substitution (diagonal): _distanceGrid[currentRow-1][currentCol-1] + charMatchCost
        // 2. Deletion (up): _distanceGrid[currentRow-1][currentCol] + OPERATION_COST_DELETION
        // 3. Insertion (left): _distanceGrid[currentRow][currentCol-1] + OPERATION_COST_INSERTION

        const diagonalCost = this.#distanceGrid[currentRow - 1][currentCol - 1] + charMatchCost;
        const upCost = this.#distanceGrid[currentRow - 1][currentCol] + OPERATION_COST_DELETION;
        const leftCost = this.#distanceGrid[currentRow][currentCol - 1] + OPERATION_COST_INSERTION;

        // Find the minimum cost and update the current cell.
        const minimumCost = Math.min(diagonalCost, upCost, leftCost);
        this.#distanceGrid[currentRow][currentCol] = minimumCost;

        // Record the path that led to this minimum cost.
        if (minimumCost === diagonalCost) {
          newPathRow[currentCol] = [currentRow - 1, currentCol - 1];
        } else if (minimumCost === upCost) {
          newPathRow[currentCol] = [currentRow - 1, currentCol];
        } else { // minimumCost === leftCost
          newPathRow[currentCol] = [currentRow, currentCol - 1];
        }
      }
    }
  }

  /**
   * Reconstructs the optimal alignment path to identify matched characters.
   * It returns two boolean arrays indicating which characters in the input and reference
   * sequences were part of a "match" operation (i.e., didn't incur a mismatch cost).
   * Time complexity: O(|inputSequence| + |referenceSequence|).
   * @returns {{processedSequenceMatches: boolean[], referenceSequenceMatches: boolean[]}}
   * An object containing two arrays of booleans. `true` indicates a matched character.
   */
  generateAlignmentReport() {
    const currentInputLen = this.#processedSequenceChars.length;
    const refSeqLen = this.#referenceSequenceChars.length;

    // Initialize arrays to track matched characters.
    const processedSequenceMatches = new Array(currentInputLen).fill(false);
    const referenceSequenceMatches = new Array(refSeqLen).fill(false);

    let currentRow = currentInputLen;
    let currentCol = refSeqLen;

    // Trace back from the bottom-right corner of the DP grid.
    while (currentRow > 0 || currentCol > 0) {
      const [prevRow, prevCol] = this.#pathTracker[currentRow][currentCol];

      // Check if the current cell's value was derived from a 'match' (0 cost substitution).
      // This happens if the distance didn't increase from the diagonal predecessor,
      // and the characters were indeed the same.
      if (prevRow === currentRow - 1 && prevCol === currentCol - 1) { // Diagonal move (substitution/match)
        if (this.#distanceGrid[prevRow][prevCol] === this.#distanceGrid[currentRow][currentCol]) {
          // This implies charMatchCost was 0, so it was a true match.
          processedSequenceMatches[currentRow - 1] = true;
          referenceSequenceMatches[currentCol - 1] = true;
        }
      }
      // Move to the previous cell in the traceback path.
      currentRow = prevRow;
      currentCol = prevCol;
    }

    return {
      processedSequenceMatches,
      referenceSequenceMatches
    };
  }

  /**
   * Returns the complete 2D distance matrix.
   * @returns {number[][]} The dynamic programming distance grid.
   */
  get distanceMatrix() {
    // Return a shallow copy to prevent external modification of the internal state.
    return this.#distanceGrid.map(row => [...row]);
  }

  /**
   * Returns the final Levenshtein distance between the current processed sequence
   * and the reference sequence.
   * @returns {number} The Levenshtein distance.
   */
  get finalDistance() {
    const currentInputLen = this.#processedSequenceChars.length;
    const refSeqLen = this.#referenceSequenceChars.length;
    if (currentInputLen === 0 && refSeqLen === 0) return 0;
    if (currentInputLen === 0) return refSeqLen;
    if (refSeqLen === 0) return currentInputLen;
    return this.#distanceGrid[currentInputLen][refSeqLen];
  }
}

// --- Main execution block for command-line usage ---
(function() {
  const SCRIPT_NAME = 'edit-distance-calculator';

  /**
   * Orchestrates the calculation of Levenshtein distance from standard input.
   * @param {string} inputPayload - The input string containing two lines: reference text and query text.
   */
  function executeCalculation(inputPayload) {
    if (!inputPayload || typeof inputPayload !== 'string') {
      console.error(`${SCRIPT_NAME}: Error: No input payload provided.`);
      process.exit(1);
    }

    const lines = inputPayload.trim().split("\n");
    if (lines.length < 2) {
      console.error(`${SCRIPT_NAME}: Error: Input must contain at least two lines (reference and query text).`);
      process.exit(1);
    }

    const referenceText = lines[0];
    const queryText = lines[1];

    try {
      const similarityEngine = new StringSimilarityEngine(referenceText);
      // Update the input sequence from index 0 with the entire query text.
      similarityEngine.recomputeFrom(0, queryText);

      // Output the final Levenshtein distance.
      console.log(similarityEngine.finalDistance);

      // Optional: Log alignment report for debugging/visualization
      // const alignment = similarityEngine.generateAlignmentReport();
      // console.log("Input Matches:", alignment.processedSequenceMatches);
      // console.log("Reference Matches:", alignment.referenceSequenceMatches);

    } catch (error) {
      console.error(`${SCRIPT_NAME}: Calculation failed:`, error.message);
      process.exit(1);
    }
  }

  // Check if running in a Node.js environment to read from stdin.
  if (typeof require !== 'undefined' && require.main === module) {
    try {
      const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
      executeCalculation(rawInput);
    } catch (error) {
      console.error(`${SCRIPT_NAME}: Failed to read from stdin:`, error.message);
      process.exit(1);
    }
  } else {
    // For browser or other environments, expose the class or provide a dummy runner.
    // console.log("StringSimilarityEngine class is available.");
    // window.StringSimilarityEngine = StringSimilarityEngine; // Example for browser
  }
})();