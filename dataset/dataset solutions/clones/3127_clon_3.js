const InputStreamHandler = (function () {
  /**
   * Factory function to create an instance of the InputSource.
   * @param {string} rawInputText - The complete input string to be processed.
   * @returns {InputSource} A new instance of InputSource.
   */
  const createInputSource = function (rawInputText) {
    return new InputSource(rawInputText);
  };

  /**
   * Represents a handler for processing raw input text line by line.
   * Manages the current reading position and provides methods to extract data.
   * @class
   */
  function InputSource(rawInputText) {
    // Trim whitespace from the overall input and split into an array of lines.
    this._processedLines = rawInputText.trim().split("\n");
    // Initialize the current line index, starting from the beginning.
    this._currentLineIndex = 0;
  }

  /**
   * Extracts a single token from the current line. If the line is being read for the first time,
   * it's reversed and split into tokens. Subsequent calls pop tokens from the end.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts numeric conversion.
   * @returns {(string|number|null)} The extracted token, or null if no more tokens are available.
   */
  InputSource.prototype.extractSingleValue = function (returnAsString = false) {
    const cachedLines = this._processedLines;
    const linePointer = this._currentLineIndex;

    // Check if we've run out of lines to process.
    if (linePointer >= cachedLines.length) {
      return null; // Or throw an error, depending on desired behavior for EOF.
    }

    // If the current line is still a raw string, process it.
    // The original code reverses and splits. We'll pre-process it once.
    if (typeof cachedLines[linePointer] === "string") {
      cachedLines[linePointer] = cachedLines[linePointer].split(" ").reverse();
    }

    const currentLineTokens = cachedLines[linePointer];
    let extractedToken = currentLineTokens.pop();

    // If the current line is now empty after popping, advance to the next line.
    if (currentLineTokens.length === 0) {
      this._currentLineIndex++;
    }

    // Return the token, either as a string or a number.
    if (returnAsString) {
      return extractedToken;
    } else {
      // Attempt numeric conversion. If it's not a valid number, `+` will result in NaN.
      const numericValue = +extractedToken;
      // Optional: Add a check for NaN if strict numeric input is required.
      // if (isNaN(numericValue)) throw new Error(`Expected numeric token, got "${extractedToken}"`);
      return numericValue;
    }
  };

  /**
   * Reads the entire current line, splits it into tokens, and optionally converts them to numbers.
   * Advances the line pointer after reading.
   * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, attempts numeric conversion for each.
   * @returns {Array<(string|number)>} An array of tokens from the current line.
   */
  InputSource.prototype.fetchLineValues = function (returnAsStrings = false) {
    // Ensure we don't read beyond the available lines.
    if (this._currentLineIndex >= this._processedLines.length) {
      return []; // Return an empty array if no more lines.
    }

    const currentRawLine = this._processedLines[this._currentLineIndex];
    this._currentLineIndex++; // Advance the line pointer immediately.

    const tokens = currentRawLine.split(" ");

    if (returnAsStrings) {
      return tokens;
    } else {
      // Map each token to its numeric equivalent.
      return tokens.map((token) => +token);
    }
  };

  /**
   * Reads 'lineCount' number of lines, treating each as a row of space-separated values,
   * forming a 2D array (matrix).
   * @param {number} lineCount - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, all values are strings; otherwise, attempts numeric conversion.
   * @returns {Array<Array<(string|number)>>} A matrix of values.
   */
  InputSource.prototype.obtainMultiLineData = function (lineCount, returnAsStrings = false) {
    const collectedData = [];
    const startingLine = this._currentLineIndex;
    const endingLine = startingLine + lineCount;

    // Check for sufficient lines before attempting to slice.
    if (endingLine > this._processedLines.length) {
      // Adjust lineCount to only read available lines, or throw an error.
      console.warn(`Attempted to read ${lineCount} lines, but only ${this._processedLines.length - startingLine} available.`);
      lineCount = this._processedLines.length - startingLine;
    }

    // Slice the relevant lines from the cache.
    const rawLinesToProcess = this._processedLines.slice(startingLine, endingLine);
    this._currentLineIndex = endingLine; // Update the global line pointer.

    // Process each line to split into tokens and optionally convert to numbers.
    for (let i = 0; i < rawLinesToProcess.length; i++) {
      const lineTokens = rawLinesToProcess[i].split(" ");
      if (returnAsStrings) {
        collectedData.push(lineTokens);
      } else {
        collectedData.push(lineTokens.map((val) => +val));
      }
    }
    return collectedData;
  };

  /**
   * Reads 'lineCount' number of lines, treating each as a single value, and optionally converts them to numbers.
   * @param {number} lineCount - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns lines as strings; otherwise, attempts numeric conversion.
   * @returns {Array<(string|number)>} An array of values, one per line.
   */
  InputSource.prototype.retrieveNumericLines = function (lineCount, returnAsStrings = false) {
    const collectedValues = [];
    const startIdx = this._currentLineIndex;
    const endIdx = startIdx + lineCount;

    // Ensure we don't read past the end of the input.
    if (endIdx > this._processedLines.length) {
      console.warn(`Requested ${lineCount} lines, but only ${this._processedLines.length - startIdx} are available.`);
      lineCount = this._processedLines.length - startIdx;
    }

    // Extract the relevant lines.
    const linesToProcess = this._processedLines.slice(startIdx, startIdx + lineCount);
    this._currentLineIndex = endIdx; // Update the line pointer.

    if (returnAsStrings) {
      return linesToProcess;
    } else {
      // Convert each line to a number.
      return linesToProcess.map((line) => +line);
    }
  };

  return createInputSource;
})();

// --- Main Program Execution ---

// Initialize the input data handler by reading from standard input.
const dataHandler = InputStreamHandler(require("fs").readFileSync("/dev/stdin", "utf8"));
// Define a constant for the modulo operation, commonly used in competitive programming.
const PRIME_MOD = 1000000007; // 1e9 + 7

// Execute the core logic and print the resulting calculated value.
console.log(calculateFinalResult());

/**
 * The primary function containing the problem's solution logic.
 * It calculates the number of ways to arrange elements based on certain conditions.
 * @returns {number} The final calculated count modulo PRIME_MOD.
 */
function calculateFinalResult() {
  // Read the total number of elements (N) from the first line of input.
  const elementCount = dataHandler.extractSingleValue();

  // Read N lines, each containing a single color/value, into an array.
  const colorSequence = dataHandler.retrieveNumericLines(elementCount);

  // Initialize a data structure to store indices where each value appears.
  // We use an array of arrays, pre-allocated for up to 200,000 distinct values.
  // Each inner array will hold the 0-based indices where that value is found.
  const valuePositionMap = Array.from({
    length: 200000
  }, () => []);

  // Populate the valuePositionMap: for each element, record its index.
  for (let i = 0; i < elementCount; i++) {
    const currentValue = colorSequence[i];
    // Values are 1-based in problem, convert to 0-based for array indexing.
    const mapIndex = currentValue - 1;

    // Basic validation for array bounds.
    if (mapIndex < 0 || mapIndex >= valuePositionMap.length) {
      // console.warn(`Value ${currentValue} is out of expected range for mapping.`);
      continue; // Skip invalid values.
    }
    valuePositionMap[mapIndex].push(i);
  }

  // Pre-process the valuePositionMap for DP:
  // For each list of indices, reverse it and remove the last element.
  // This effectively removes the *first* occurrence of each value (after reverse, it's the last).
  // The goal is to easily `pop()` subsequent occurrences from the end.
  for (let i = 0; i < valuePositionMap.length; i++) {
    const indicesList = valuePositionMap[i];
    if (indicesList.length > 0) { // Ensure there are elements before reversing/popping.
      indicesList.reverse();
      // Remove the first occurrence (which is now at the end after reverse).
      indicesList.pop();
    }
  }

  // Initialize the Dynamic Programming array.
  // dp[i] will store the number of ways to reach index 'i' under certain conditions.
  const dpWays = new Array(elementCount).fill(0);
  // Base case: There is 1 way to be at the starting position (index 0).
  dpWays[0] = 1;

  // Determine the next relevant index for the value at position 0.
  const firstElementValue = colorSequence[0];
  const firstValueMapIndex = firstElementValue - 1;

  let nextRelevantIndexForFirstValue = -1; // Default to an invalid index

  // Check if there's a list for this value and if it has elements.
  if (valuePositionMap[firstValueMapIndex] && valuePositionMap[firstValueMapIndex].length > 0) {
    nextRelevantIndexForFirstValue = valuePositionMap[firstValueMapIndex].pop();
  }

  // If the next relevant index is greater than 1 (meaning it's not 0 or 1),
  // then we can potentially reach that index with 1 way from the start.
  // The original code implies t > 1. If t=0 or t=1, dp[t] would be 1 from dp[0]=1.
  // This condition handles cases where the second occurrence of c[0] is later.
  if (nextRelevantIndexForFirstValue > 1 && nextRelevantIndexForFirstValue < elementCount) {
    dpWays[nextRelevantIndexForFirstValue] = 1;
  }

  // Iterate through the elements from the second one (index 1) up to the last.
  for (let currentIndex = 1; currentIndex < elementCount; currentIndex++) {
    // Accumulate ways from the previous index.
    // The number of ways to reach `currentIndex` includes all ways to reach `currentIndex - 1`.
    dpWays[currentIndex] = (dpWays[currentIndex] + dpWays[currentIndex - 1]) % PRIME_MOD;

    // Get the current element's value.
    const currentElementValue = colorSequence[currentIndex];
    const currentMapIndex = currentElementValue - 1;

    let nextOccurrencePosition = -1; // Initialize to an invalid position.

    // Safely attempt to pop the next occurrence index for the current value.
    if (valuePositionMap[currentMapIndex] && valuePositionMap[currentMapIndex].length > 0) {
      nextOccurrencePosition = valuePositionMap[currentMapIndex].pop();
    }

    // If a valid next occurrence position is found and it's beyond the immediate next position,
    // update the DP array.
    // The condition `nextOccurrencePosition > currentIndex + 1` means there's at least one element
    // between `currentIndex` and `nextOccurrencePosition`.
    if (nextOccurrencePosition > currentIndex + 1 && nextOccurrencePosition < elementCount) {
      // The number of ways to reach `nextOccurrencePosition` is currently the total ways
      // to reach `currentIndex`. This implies a "jump" or "skip" operation.
      dpWays[nextOccurrencePosition] = dpWays[currentIndex];
    }
  }

  // The final answer is the number of ways to reach the last element.
  return dpWays[elementCount - 1];
}