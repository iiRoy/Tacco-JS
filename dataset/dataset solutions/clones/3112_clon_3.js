const DataExtractor = (() => {
  /**
   * Factory function to create a new input processor instance.
   * This function acts as the public interface for the DataExtractor module.
   * @param {string} rawContent - The raw string content to be parsed, typically from a file.
   * @returns {InputProcessor} A new instance of the InputProcessor.
   */
  function createInputProcessor(rawContent) {
    return new InputProcessor(rawContent);
  }

  /**
   * Internal class responsible for processing and extracting data from a multi-line string input.
   * It manages the current read position and provides various methods to parse different data structures.
   */
  class InputProcessor {
    /**
     * @private
     * @type {Array<string>} Stores the original raw lines of the input. Used by methods like `getRawLines`.
     */
    #rawLines;
    /**
     * @private
     * @type {Array<Array<string>>} Stores each line as an array of words (tokens), with each array reversed.
     * Reversing allows efficient `pop()` operations from the logical "front" of the line.
     */
    #processedTokens;
    /**
     * @private
     * @type {number} An index pointing to the current line being processed within `#rawLines` and `#processedTokens`.
     */
    #currentLineIndex;

    /**
     * Constructs an InputProcessor instance.
     * @param {string} sourceText - The raw, multi-line string content from which to extract data.
     * @throws {Error} If the sourceText is not a valid non-empty string.
     */
    constructor(sourceText) {
      if (typeof sourceText !== 'string' || sourceText.trim() === '') {
        throw new Error("Input source must be a non-empty string for DataExtractor.");
      }
      this.#rawLines = sourceText.trim().split("\n");
      // Pre-process all lines: split into words and reverse each word array for `pop` efficiency.
      this.#processedTokens = this.#rawLines.map(line => line.split(" ").reverse());
      this.#currentLineIndex = 0; // Initialize pointer to the first line.
    }

    /**
     * Extracts a single scalar value (token) from the current line.
     * If the current line is exhausted, it automatically advances to the next line.
     * @param {boolean} [asString=false] - If `true`, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number|null} The extracted value, or `null` if there are no more items to read.
     */
    fetchScalar(asString = false) {
      // Guard against reading beyond the available lines.
      if (this.#currentLineIndex >= this.#processedTokens.length) {
        return null;
      }

      let tokensOnCurrentLine = this.#processedTokens[this.#currentLineIndex];

      // If the current line is empty or fully consumed, advance and try again.
      // This handles cases of empty lines or multiple `fetchScalar` calls on a single line.
      if (!tokensOnCurrentLine || tokensOnCurrentLine.length === 0) {
        this.#currentLineIndex++;
        return this.fetchScalar(asString); // Recursive call to attempt reading from the new line.
      }

      const extractedValue = tokensOnCurrentLine.pop(); // Retrieve the last token (which was the first due to reversal).

      // If the line is now empty after popping, increment the line pointer for subsequent reads.
      if (tokensOnCurrentLine.length === 0) {
        this.#currentLineIndex++;
      }

      return asString ? extractedValue : Number(extractedValue);
    }

    /**
     * Reads the entire current line as an array of values.
     * The line pointer is automatically advanced to the next line after this operation.
     * @param {boolean} [keepAsStrings=false] - If `true`, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>|null} An array containing all values from the line, or `null` if no more lines.
     */
    getLineAsArray(keepAsStrings = false) {
      if (this.#currentLineIndex >= this.#processedTokens.length) {
        return null; // No more lines available to read.
      }

      // Create a copy of the tokens, then reverse it to restore original order before mapping.
      const lineValues = [...this.#processedTokens[this.#currentLineIndex]].reverse();
      this.#currentLineIndex++; // Advance the line pointer immediately after consuming the line.

      return keepAsStrings ? lineValues : lineValues.map(item => Number(item));
    }

    /**
     * Reads a specified number of consecutive lines, returning them as a 2D array (matrix).
     * The line pointer is advanced by the number of lines read.
     * @param {number} numRows - The count of lines (rows) to read for the matrix.
     * @param {boolean} [stringOutput=false] - If `true`, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>|null} A matrix (array of arrays), or `null` if not enough lines are available.
     */
    getGrid(numRows, stringOutput = false) {
      // Validate that there are enough lines remaining to form the requested grid.
      if (this.#currentLineIndex + numRows > this.#processedTokens.length) {
        console.error(`DataExtractor Error: Requested ${numRows} rows for grid, but only ${this.#processedTokens.length - this.#currentLineIndex} lines remain.`);
        return null;
      }

      const gridData = [];
      for (let i = 0; i < numRows; i++) {
        // Re-use `getLineAsArray` to ensure consistent line consumption and type conversion.
        const row = this.getLineAsArray(stringOutput);
        if (row === null) {
            // This should ideally not be reached if the initial bounds check is correct,
            // but acts as a defensive programming measure.
            console.error("DataExtractor Internal Error: Unexpected null row during grid construction.");
            return null;
        }
        gridData.push(row);
      }
      return gridData;
    }

    /**
     * Reads a specified number of raw lines from the input. Each line is treated as a single item.
     * This method accesses `#rawLines` directly to preserve the original line string content.
     * The line pointer is advanced by the number of lines read.
     * @param {number} numLines - The count of lines to read.
     * @param {boolean} [returnStrings=false] - If `true`, returns raw line strings; otherwise, attempts conversion to number.
     * @returns {Array<string|number>|null} An array of line data, or `null` if not enough lines are available.
     */
    getRawLines(numLines, returnStrings = false) {
      // Validate that there are enough raw lines remaining.
      if (this.#currentLineIndex + numLines > this.#rawLines.length) {
        console.error(`DataExtractor Error: Requested ${numLines} raw lines, but only ${this.#rawLines.length - this.#currentLineIndex} lines remain.`);
        return null;
      }

      // Extract the specified slice of raw lines.
      const rawSlice = this.#rawLines.slice(this.#currentLineIndex, this.#currentLineIndex + numLines);
      this.#currentLineIndex += numLines; // Advance the line pointer.

      // Return raw strings or attempt conversion to numbers (which will result in NaN if a line contains spaces).
      return returnStrings ? rawSlice : rawSlice.map(line => Number(line));
    }
  }

  return createInputProcessor; // Export the factory function as the module's public interface.
})();

// --- Main application execution context ---

let dataParser; // Declare the input parser instance.

try {
  // Attempt to read input from standard input using the 'fs' module.
  const fileSystem = require("fs");
  const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
  // Initialize the data parser with the read content.
  dataParser = DataExtractor(inputContent);
} catch (error) {
  // Handle any errors that occur during file reading or parser initialization.
  console.error("Application Error: Failed to read input from /dev/stdin. Details:", error.message);
  process.exit(1); // Exit the process with a non-zero status code to indicate failure.
}

// Call the main algorithm function and print its result to standard output.
console.log(processMainAlgorithm());

/**
 * Encapsulates the primary problem-solving algorithm.
 * This function reads necessary input, performs the core logic, and formats the output.
 * @returns {string|number} The formatted result string or -1 if no solution is found or input is invalid.
 */
function processMainAlgorithm() {
  // Read the first scalar value, which represents the expected size of the array.
  const arraySize = dataParser.fetchScalar();
  // Basic validation for the array size.
  if (arraySize === null || isNaN(arraySize) || arraySize < 0) {
    console.error("Input Validation Error: Invalid or missing array size N.");
    return -1;
  }

  // Read the next line as an array of numbers, which is the target sequence.
  const targetSequence = dataParser.getLineAsArray();
  // Basic validation for the target sequence.
  if (targetSequence === null || targetSequence.some(isNaN)) {
    console.error("Input Validation Error: Invalid or missing target sequence B.");
    return -1;
  }

  // Ensure the length of the read sequence matches the declared array size.
  if (targetSequence.length !== arraySize) {
    console.error(`Input Validation Error: Sequence length mismatch. Expected ${arraySize} elements, but received ${targetSequence.length}.`);
    return -1;
  }

  // `resultStack` will store the elements in the order they are "removed" from the sequence,
  // which is effectively the reverse of the desired output order.
  const resultStack = [];

  /**
   * Recursively attempts to find a valid sequence of removals from `currentElements`.
   * An element can be removed if its value equals its 1-based index within the *current* sub-array.
   * Elements are considered from right to left.
   * @param {Array<number>} currentElements - The current subset of elements being processed.
   * @param {Array<number>} stackForResults - The stack where successfully removed elements are pushed.
   * @returns {boolean} `true` if a valid removal sequence is found for the given elements, `false` otherwise.
   */
  function findValidRemovalSequence(currentElements, stackForResults) {
    // Base case: If no elements remain, a valid sequence has been successfully constructed.
    if (currentElements.length === 0) {
      return true;
    }

    // Iterate through the `currentElements` array from right to left.
    // This order is crucial for the problem's logic.
    for (let currentIdx = currentElements.length - 1; currentIdx >= 0; currentIdx--) {
      // Check the core condition: element value must match its 1-based index in the *current* array.
      if (currentElements[currentIdx] === currentIdx + 1) {
        // If a match is found, push the element onto the result stack.
        // This element is "removed" from the sequence.
        stackForResults.push(currentElements[currentIdx]);

        // Create a new array by removing the matched element.
        // `slice()` is used to create shallow copies, avoiding mutation of `currentElements`.
        const remainingSubset = currentElements.slice(0, currentIdx).concat(currentElements.slice(currentIdx + 1));

        // Recursively call the function with the smaller subset.
        if (findValidRemovalSequence(remainingSubset, stackForResults)) {
          // If the recursive call returns `true`, it means a full valid sequence was found.
          return true; // Propagate success upwards.
        } else {
          // If the recursive call failed (meaning this path didn't lead to a solution),
          // backtrack by removing the last element pushed to the stack.
          stackForResults.pop();
        }
      }
    }
    // If the loop completes without finding any valid element to remove,
    // then no valid sequence can be formed from this `currentElements` state.
    return false;
  }

  // Initiate the recursive search for a valid removal sequence.
  const sequenceFound = findValidRemovalSequence(targetSequence, resultStack);

  // If `sequenceFound` is `false`, it means no solution exists for the given input.
  if (!sequenceFound) {
    return -1;
  }

  // If a sequence was found, `resultStack` contains the elements in reverse order of removal.
  // Reverse the stack to get the correct output order, then join elements with newlines.
  return resultStack.reverse().join("\n");
}