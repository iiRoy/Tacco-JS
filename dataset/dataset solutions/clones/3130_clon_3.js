const InputProcessor = (() => {
  // Factory function to create a new reader instance for processing input.
  function createInputReader(rawInputContent) {
    return new DataStreamParser(rawInputContent);
  }

  /**
   * @class DataStreamParser
   * @description Handles sequential reading of input lines and tokens from a given string.
   *              It provides methods to extract single values, entire lines, or blocks of lines.
   */
  class DataStreamParser {
    /** @type {string[][]} */
    #sourceLines; // Stores all input lines, pre-split into tokens.
    /** @type {number} */
    #currentLinePointer = 0; // Index of the line currently being processed or next to be processed.
    /** @type {string[] | null} */
    #activeLineTokens = null; // Buffer for tokens of the current line, used for right-to-left reading.

    /**
     * Initializes the parser with the raw input text.
     * @param {string} rawText The complete input string, typically from a file.
     */
    constructor(rawText) {
      // Trim whitespace from the input, split into lines, and then split each line into tokens.
      this.#sourceLines = rawText.trim().split("\n").map(line => line.split(" "));
    }

    /**
     * Internal helper to ensure the #activeLineTokens buffer is populated from the current line.
     * This method mimics the original 'a' function's behavior of processing tokens from right-to-left
     * and only advancing the line pointer once the current line is fully consumed by `fetchSingleValue`.
     * @private
     * @throws {Error} If an attempt is made to read beyond the end of the input stream.
     */
    #prepareCurrentLineForTokens() {
      // If the token buffer is empty or not initialized, load tokens from the next line.
      if (this.#activeLineTokens === null || this.#activeLineTokens.length === 0) {
        if (this.#currentLinePointer >= this.#sourceLines.length) {
          throw new Error("End of input stream reached. Cannot fetch more tokens.");
        }
        // Load the current line's tokens and reverse them to facilitate right-to-left popping.
        this.#activeLineTokens = [...this.#sourceLines[this.#currentLinePointer]].reverse();
        // The line pointer is NOT advanced here; it advances only when the last token is popped.
      }
    }

    /**
     * Reads and returns a single token from the current line, consuming it from right-to-left.
     * The internal line pointer advances only after all tokens on the current line are read.
     * @param {boolean} returnAsString If true, returns the token as a string; otherwise, attempts number conversion.
     * @returns {string | number} The next available token.
     * @throws {Error} If no more tokens are available.
     */
    fetchSingleValue(returnAsString = false) {
      this.#prepareCurrentLineForTokens();
      const token = this.#activeLineTokens.pop();

      // After popping, if the current line's token buffer is empty, advance the line pointer.
      if (this.#activeLineTokens.length === 0) {
        this.#currentLinePointer++;
        this.#activeLineTokens = null; // Clear buffer to ensure the next call loads a new line.
      }

      // Handle potential undefined token (though #prepareCurrentLineForTokens should prevent this).
      if (token === undefined) {
        throw new Error("Unexpected error: Failed to retrieve token from prepared line.");
      }

      return returnAsString ? token : Number(token);
    }

    /**
     * Reads an entire line as an array of tokens. This method consumes and advances the line pointer immediately.
     * It bypasses the #activeLineTokens buffer, treating the line as a whole unit.
     * @param {boolean} returnAsStringArray If true, returns an array of strings; otherwise, attempts number conversion for each token.
     * @returns {Array<string | number>} An array containing all tokens from the consumed line.
     * @throws {Error} If an attempt is made to read beyond the end of the input stream.
     */
    fetchLineAsArray(returnAsStringArray = false) {
      if (this.#currentLinePointer >= this.#sourceLines.length) {
        throw new Error("End of input stream reached. Cannot fetch more lines.");
      }
      // This method consumes a whole line, so any pending #activeLineTokens for the old line are discarded.
      this.#activeLineTokens = null;
      // Get the tokens for the current line and advance the pointer. Filter out any empty strings.
      const lineElements = this.#sourceLines[this.#currentLinePointer++].filter(t => t !== '');
      return returnAsStringArray ? lineElements : lineElements.map(val => Number(val));
    }

    /**
     * Reads a specified number of lines, treating each line as an array of tokens, to form a matrix.
     * @param {number} numberOfLines The count of lines to read for the matrix.
     * @param {boolean} returnAsStringMatrix If true, returns a 2D array of strings; otherwise, attempts number conversion.
     * @returns {Array<Array<string | number>>} A 2D array representing the matrix.
     * @throws {Error} If not enough lines are available for the requested matrix size.
     */
    fetchMatrixOfValues(numberOfLines, returnAsStringMatrix = false) {
      const collectedRows = [];
      for (let i = 0; i < numberOfLines; i++) {
        collectedRows.push(this.fetchLineAsArray(returnAsStringMatrix));
      }
      return collectedRows;
    }

    /**
     * Reads a specified number of lines, assuming each line contains a single value.
     * Returns these values as a flat 1D array.
     * @param {number} numberOfLines The count of lines to read.
     * @param {boolean} returnAsStringArray If true, returns an array of strings; otherwise, attempts number conversion.
     * @returns {Array<string | number>} A 1D array of values.
     * @throws {Error} If not enough lines are available.
     */
    fetchBlockOfValues(numberOfLines, returnAsStringArray = false) {
      const collectedValues = [];
      for (let i = 0; i < numberOfLines; i++) {
        if (this.#currentLinePointer >= this.#sourceLines.length) {
          throw new Error("End of input stream reached. Not enough lines for block read.");
        }
        // This method implicitly assumes each line has only one relevant token.
        // Discard any pending tokens in #activeLineTokens as we're processing a full line.
        this.#activeLineTokens = null;
        const singleValue = this.#sourceLines[this.#currentLinePointer++][0]; // Take the first token.
        collectedValues.push(returnAsStringArray ? singleValue : Number(singleValue));
      }
      return collectedValues;
    }
  }

  return createInputReader;
})();

// Instantiate the input reader by reading from standard input.
const inputReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main solution logic and print its output.
console.log(processSolution());

/**
 * Main function to orchestrate the solution for the problem.
 * It reads initial parameters, performs a parity check, and then
 * initiates a recursive Gray code path generation.
 * @returns {string} The final result string ("NO" if no path, or "YES" followed by the Gray code sequence).
 */
function processSolution() {
  // Read the number of bits (N) for the Gray code.
  const bitCount = inputReader.fetchSingleValue();
  // Read the starting integer value (A).
  const startValue = inputReader.fetchSingleValue();
  // Read the ending integer value (B).
  const endValue = inputReader.fetchSingleValue();

  // Calculate the total number of set bits (1s) across both start and end values.
  // This is a crucial parity check for the existence of a specific type of Gray code path.
  const totalSetBits = countSetBits(startValue) + countSetBits(endValue);

  // If the total number of set bits is even, no valid Gray code path exists
  // under the problem's specific constraints.
  // Rewritten `x % 2 === 0` to `!(totalSetBits & 1)` for a minor structural change.
  if (!(totalSetBits & 1)) {
    return "NO";
  }

  // Initialize the array to store the generated Gray code sequence.
  // Its size will be 2^bitCount, as a Gray code sequence for N bits has 2^N elements.
  const grayCodeSequence = new Array(1 << bitCount);

  // Start the recursive generation process.
  // Parameters: current value, target value, bitmask of bits already fixed/skipped, current index in sequence.
  generatePathRecursive(startValue, endValue, 0, 0);

  // If the initial parity check passed and the recursive function completed, a solution exists.
  // The original code printed "YES" as a side effect; here, we embed it in the return string.
  return "YES\n" + grayCodeSequence.join(" ");

  /**
   * Helper function to count the number of set bits (1s) in a 32-bit integer.
   * Uses Brian Kernighan's algorithm for efficiency.
   * @param {number} num The integer whose set bits are to be counted.
   * @returns {number} The count of set bits.
   */
  function countSetBits(num) {
    let count = 0;
    let tempNum = num; // Use a temporary variable to avoid modifying the original 'num'
    while (tempNum > 0) {
      tempNum &= (tempNum - 1); // This operation clears the least significant set bit.
      count++;
    }
    return count;
  }

  /**
   * Recursively generates a Gray code path between a current value and a target value.
   * This function populates the `grayCodeSequence` array with the generated path.
   *
   * The logic is based on dividing the problem into two sub-problems.
   * For each bit position:
   * 1. If the bit is already "visited" (marked in `fixedOrSkippedBits`), it's skipped.
   * 2. If the bit is the same in `current` and `target`, it's flipped to create intermediate values.
   * 3. If the bit is different in `current` and `target`, it's flipped in one branch and marked as "visited".
   *
   * @param {number} current The current integer value in the Gray code path.
   * @param {number} target The target integer value to reach.
   * @param {number} fixedOrSkippedBits A bitmask indicating bits that have been "fixed" or "skipped"
   *                                    in this particular branch of recursion.
   * @param {number} currentSequenceIndex The starting index in the `grayCodeSequence` array for this sub-problem.
   */
  function generatePathRecursive(current, target, fixedOrSkippedBits, currentSequenceIndex) {
    // Base case: If the current value is the same as the target, we've found a segment of the path.
    if (current === target) {
      grayCodeSequence[currentSequenceIndex] = current;
      return;
    }

    // Calculate the XOR difference to identify bits that differ between current and target.
    const xorDifference = current ^ target;

    // Temporary values for the two recursive branches.
    let branchValueA = current;
    let branchValueB = current;

    // Flags to ensure that only the *first* encountered bit of each type (same/different)
    // is flipped for the respective branches, adhering to Gray code generation rules.
    let allowFlipForSameBits = true; // Controls flipping for bits where `current` and `target` are identical.
    let allowFlipForDiffBits = true; // Controls flipping for bits where `current` and `target` differ.

    let bitsSkippedInThisBranch = 0; // Counts bits that are part of `fixedOrSkippedBits`.

    // Iterate through all possible bit positions (from 0 to bitCount - 1).
    for (let bitPosition = 0; bitPosition < bitCount; bitPosition++) {
      const singleBitMask = 1 << bitPosition;

      // If this bit position is already marked as 'fixed' or 'skipped' in the current recursive context,
      // we increment our counter and move to the next bit. This bit will not be changed in this path segment.
      if ((singleBitMask & fixedOrSkippedBits) !== 0) {
        bitsSkippedInThisBranch++;
        continue;
      }

      // Case 1: The current bit is the same in `current` and `target` (i.e., not set in `xorDifference`).
      // We flip this bit in both `branchValueA` and `branchValueB`, but only for the first such bit encountered.
      if ((xorDifference & singleBitMask) === 0) {
        if (allowFlipForSameBits) {
          allowFlipForSameBits = false; // Ensure this operation happens only once per recursive call for this type of bit.
          branchValueA ^= singleBitMask; // Flip bit in branch A.
          branchValueB ^= singleBitMask; // Flip bit in branch B.
        }
      }
      // Case 2: The current bit is different in `current` and `target` (i.e., set in `xorDifference`).
      // We flip this bit in `branchValueB` and mark it as 'fixed' or 'skipped' for subsequent recursive calls.
      // This also happens only for the first such bit encountered.
      else { // (xorDifference & singleBitMask) !== 0
        if (allowFlipForDiffBits) {
          allowFlipForDiffBits = false; // Ensure this operation happens only once per recursive call for this type of bit.
          branchValueB ^= singleBitMask; // Flip bit in branch B.
          // Mark this bit as 'fixed' or 'skipped' for the recursive sub-problems stemming from this point.
          fixedOrSkippedBits |= singleBitMask;
        }
      }
    }

    // First recursive call: Explores the path from `current` to `branchValueA`.
    // The `fixedOrSkippedBits` and `currentSequenceIndex` are passed without modification for this branch.
    generatePathRecursive(current, branchValueA, fixedOrSkippedBits, currentSequenceIndex);

    // Second recursive call: Explores the path from `branchValueB` to `target`.
    // The `currentSequenceIndex` for this branch is offset by a calculated amount.
    // The offset is `2^(bitCount - bitsSkippedInThisBranch - 1)`, which correctly places
    // the sub-sequence within the overall Gray code array.
    generatePathRecursive(branchValueB, target, fixedOrSkippedBits,
                          currentSequenceIndex + (1 << (bitCount - bitsSkippedInThisBranch - 1)));
  }
}