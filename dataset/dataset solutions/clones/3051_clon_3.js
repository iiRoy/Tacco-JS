const DataStreamProcessor = (() => {
  // This factory function initializes and returns an instance of the InputLineReader.
  // It acts as the primary entry point for creating a data parsing utility.
  function createParserInstance(rawInputString) {
    return new InputLineReader(rawInputString);
  }

  /**
   * InputLineReader: A class designed to process multi-line string input,
   * providing methods to extract values, lines, or blocks of data,
   * with options for type conversion (string vs. number).
   */
  class InputLineReader {
    /**
     * Constructs an InputLineReader instance.
     * @param {string} sourceContent - The entire input provided as a single string.
     */
    constructor(sourceContent) {
      // Internal buffer storing each line of the input as an array element.
      // The input is trimmed to remove leading/trailing whitespace, then split by newline characters.
      this.lineBuffer = sourceContent.trim().split("\n");
      // Index pointing to the current line being processed within the lineBuffer.
      this.currentLineIndex = 0;
      // A temporary buffer to hold tokens (words) of the current line, used by extractSingleValue.
      this.currentLineTokens = [];
    }

    /**
     * Internal helper method to ensure the `currentLineTokens` buffer is populated
     * from the `lineBuffer` if it's empty and more lines are available.
     * @private
     * @returns {boolean} True if tokens are available for reading, false otherwise.
     */
    _ensureCurrentLineTokensLoaded() {
      // Loop until tokens are loaded or no more lines are available.
      while (this.currentLineTokens.length === 0 && this.currentLineIndex < this.lineBuffer.length) {
        let currentRawLine = this.lineBuffer[this.currentLineIndex];
        // Validate if the line is a non-empty string before splitting.
        if (typeof currentRawLine === "string" && currentRawLine.trim().length > 0) {
          this.currentLineTokens = currentRawLine.trim().split(" ");
        } else {
          // If the line is empty or invalid, advance to the next line and try again.
          this.currentLineIndex++;
          // If we run out of lines, break the loop.
          if (this.currentLineIndex >= this.lineBuffer.length) {
            break;
          }
        }
      }
      return this.currentLineTokens.length > 0; // Indicate if tokens are successfully loaded.
    }

    /**
     * Extracts the last token from the current line's token buffer.
     * If the current line is exhausted, it attempts to load the next line.
     * @param {boolean} [asString=false] - If true, the token is returned as a string; otherwise, as a number.
     * @returns {string|number} The extracted token, or an empty string/NaN if no more tokens.
     */
    extractSingleValue(asString = false) {
      if (!this._ensureCurrentLineTokensLoaded()) {
        // If no tokens can be loaded, return a default "empty" value.
        return asString ? "" : NaN;
      }

      // Retrieve the last token from the internal buffer.
      const poppedToken = this.currentLineTokens.pop();

      // If the token buffer for the current line is now empty, advance the line index.
      if (this.currentLineTokens.length === 0) {
        this.currentLineIndex++;
      }

      // Return the token, applying type conversion if 'asString' is false.
      return asString ? poppedToken : Number(poppedToken);
    }

    /**
     * Reads the entire current line, splits it into tokens, and advances the line pointer.
     * The internal `currentLineTokens` buffer is cleared as this method consumes a whole line.
     * @param {boolean} [keepOriginalType=false] - If true, tokens are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all tokens from the processed line.
     */
    fetchLineValues(keepOriginalType = false) {
      // Guard clause: Check if there are any lines left to read.
      if (this.currentLineIndex >= this.lineBuffer.length) {
        return [];
      }

      // Get the current line content and immediately advance the line pointer.
      const currentLineContent = this.lineBuffer[this.currentLineIndex++];
      // Clear any leftover tokens from previous `extractSingleValue` calls as we're processing a new line.
      this.currentLineTokens = [];

      // Split the line into individual tokens.
      const splitTokens = currentLineContent.trim().split(" ");

      // Return the tokens, conditionally converting them to numbers.
      return keepOriginalType ? splitTokens : splitTokens.map(value => Number(value));
    }

    /**
     * Reads a specified number of lines (`numLines`), processing each into an array of tokens.
     * Each processed line forms an inner array, resulting in a 2D array.
     * @param {number} numLines - The count of lines to read and process.
     * @param {boolean} [retainRawStrings=false] - If true, tokens are kept as strings; otherwise, converted to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the block of data.
     */
    obtainMultiLineData(numLines, retainRawStrings = false) {
      // Guard clause: Ensure a positive number of lines is requested.
      if (numLines <= 0) {
        return [];
      }

      const collectedDataBlock = [];
      // Calculate the actual number of lines to read, respecting the buffer's bounds.
      const linesToProcess = Math.min(numLines, this.lineBuffer.length - this.currentLineIndex);

      // Iterate and process each line in the requested block.
      for (let k = 0; k < linesToProcess; k++) {
        const lineContent = this.lineBuffer[this.currentLineIndex++];
        const lineSplitTokens = lineContent.trim().split(" ");
        collectedDataBlock.push(retainRawStrings ? lineSplitTokens : lineSplitTokens.map(val => Number(val)));
      }
      // Clear `currentLineTokens` as multiple lines have been consumed.
      this.currentLineTokens = [];
      return collectedDataBlock;
    }

    /**
     * Reads a specified number of lines (`numLines`) directly, returning each line as a single value.
     * No internal splitting by spaces occurs; each line is treated as one token.
     * @param {number} numLines - The count of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, lines are returned as strings; otherwise, attempted as numbers.
     * @returns {Array<string|number>} An array where each element is a processed line.
     */
    retrieveLineBlock(numLines, returnAsStrings = false) {
      // Guard clause: Ensure a positive number of lines is requested.
      if (numLines <= 0) {
        return [];
      }

      const collectedLineBlock = [];
      // Calculate the actual number of lines to read, respecting the buffer's bounds.
      const linesToRetrieve = Math.min(numLines, this.lineBuffer.length - this.currentLineIndex);

      // Iterate and retrieve each line.
      for (let k = 0; k < linesToRetrieve; k++) {
        const lineData = this.lineBuffer[this.currentLineIndex++];
        collectedLineBlock.push(returnAsStrings ? lineData.trim() : Number(lineData.trim()));
      }
      // Clear `currentLineTokens` as multiple lines have been consumed.
      this.currentLineTokens = [];
      return collectedLineBlock;
    }
  }

  return createParserInstance;
})();

// --- Application Logic and Execution ---

let inputContentString;
try {
  // Attempt to read input from standard input, typically used in competitive programming.
  // Using 'node:fs' for explicit Node.js module import.
  const fsModule = require("node:fs");
  inputContentString = fsModule.readFileSync("/dev/stdin", "utf8");
} catch (ioError) {
  // If reading from /dev/stdin fails (e.g., on Windows without WSL, or file not found).
  console.error("Error reading from /dev/stdin. Check file path or permissions:", ioError.message);
  // Provide a fallback dummy input for local testing or demonstration purposes.
  // This ensures the script can still run even without external input.
  inputContentString = "7\n10 5 12 8 15 3 20"; // Example data: 7 buildings with specified heights
  console.warn("Using fallback dummy input for execution:", JSON.stringify(inputContentString));
}

// Initialize the input data handler using the processed input string.
const inputDataHandler = DataStreamProcessor(inputContentString);

/**
 * Solves the main problem: counting "visible" buildings from the left.
 * A building is considered visible if its height is greater than or equal to
 * the maximum height of any building encountered to its left.
 * @returns {number} The total count of visible buildings.
 */
function solveProblem() {
  // Read the total number of buildings from the input.
  const totalBuildingCount = inputDataHandler.extractSingleValue();

  // Guard clause: Handle invalid or zero building count.
  if (isNaN(totalBuildingCount) || totalBuildingCount <= 0) {
    return 0; // No buildings to process, so zero visible.
  }

  // Read the array of building heights.
  const buildingHeights = inputDataHandler.fetchLineValues();

  // Another guard clause: Check for a mismatch between declared count and actual data length.
  if (buildingHeights.length < totalBuildingCount) {
    console.warn(`Input Warning: Declared ${totalBuildingCount} buildings, but only ${buildingHeights.length} heights were provided.`);
    // Adjust totalBuildingCount to prevent out-of-bounds access if data is shorter.
    // If buildingHeights is longer, the loop below will naturally respect totalBuildingCount.
  }

  let countOfVisibleBuildings = 0; // Accumulator for the final result.
  let highestPointReached = 0;     // Keeps track of the maximum height seen so far.

  // Iterate through each building's height.
  for (let currentIdx = 0; currentIdx < totalBuildingCount; currentIdx++) {
    // Ensure we don't access beyond the actual available height data.
    if (currentIdx >= buildingHeights.length) {
      break; // Stop if we've processed all available heights.
    }

    const currentBuildingElevation = buildingHeights[currentIdx];

    // Check if the current building is visible (i.e., its height is greater than or equal to
    // the highest building encountered before it).
    if (currentBuildingElevation >= highestPointReached) {
      highestPointReached = currentBuildingElevation; // Update the record for the highest point.
      countOfVisibleBuildings++;                      // Increment the count of visible buildings.
    }
  }

  return countOfVisibleBuildings;
}

// Execute the problem-solving function and print its result to the console.
console.log(solveProblem());