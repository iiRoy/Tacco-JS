// This module manages core system interactions, including input/output operations.
// It's designed to be a self-contained utility layer, separate from the primary algorithm logic.
let inputDataProvider; // Global instance for processing input lines.
const rawInputBuffer = []; // Accumulates all lines read from standard input.
const standardIOHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input received.
standardIOHandler.on('line', (currentInputLine) => {
  rawInputBuffer.push(currentInputLine);
});

// Event listener for when the input stream is closed.
standardIOHandler.on('close', () => {
  // Validate if any input was provided before proceeding.
  if (rawInputBuffer.length === 0) {
    console.error("No data received from input stream. Terminating application.");
    process.exit(1); // Exit with an error code.
  }
  inputDataProvider = createSequentialInputReader(rawInputBuffer);
  console.error("\n--- Application Logic Execution Commencing ---\n");
  const executionStartTimestamp = Date.now();
  executeMainAlgorithm();
  const executionDuration = Date.now() - executionStartTimestamp;
  outputDiagnosticInfo(`Total Execution Time : ${executionDuration}ms`);
  outputDiagnosticInfo(`Peak Memory Usage : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
  console.error("\n--- Application Logic Execution Concluded ---\n");
});

/**
 * Provides a simple mechanism for deep cloning JSON-serializable objects.
 * This is a utility function not directly used by the main algorithm in this context.
 * @param {object} objectToDuplicate - The object instance to create a deep copy of.
 * @returns {object} A new, independent deep copy of the input object.
 */
function createDeepCopy(objectToDuplicate) {
  // Primitives and null are returned directly as they don't require cloning.
  if (objectToDuplicate === null || typeof objectToDuplicate !== 'object') {
    return objectToDuplicate;
  }
  // For objects, perform a JSON serialization/deserialization for deep copy.
  return JSON.parse(JSON.stringify(objectToDuplicate));
}

// Enumeration of predefined modes for input string parsing and transformation.
const ParsingModes = Object.freeze({
  PARSE_AS_INT: 1,
  SPLIT_BY_SPACE_TO_STRINGS: 2,
  SPLIT_BY_SPACE_TO_NUMBERS: 4,
  SPLIT_BY_CHAR_TO_STRINGS: 6,
  SPLIT_BY_CHAR_TO_NUMBERS: 7,
  JOIN_WITH_SPACE: 8,
  JOIN_WITH_NEWLINE: 9,
  JOIN_WITHOUT_DELIMITER: 0,
  RETURN_AS_IS: -1 // Default mode if no specific transformation is requested.
});

/**
 * Transforms an input value (string or array) according to a specified parsing mode.
 * @param {string|Array} inputVal - The value to be processed.
 * @param {ParsingModes} modeType - An identifier from `ParsingModes` indicating the desired transformation.
 * @returns {*} The transformed value, or the original value if transformation fails or mode is unknown.
 */
function performInputTransformation(inputVal, modeType) {
  try {
    switch (modeType) {
      case ParsingModes.PARSE_AS_INT:
        return Number.parseInt(inputVal, 10); // Ensure base-10 parsing.
      case ParsingModes.SPLIT_BY_SPACE_TO_STRINGS:
        return inputVal.split(/\s+/).filter(s => s !== ''); // Robust split and remove empty strings.
      case ParsingModes.SPLIT_BY_SPACE_TO_NUMBERS:
        return inputVal.split(/\s+/).filter(s => s !== '').map(str => Number.parseInt(str, 10));
      case ParsingModes.SPLIT_BY_CHAR_TO_STRINGS:
        return inputVal.split('');
      case ParsingModes.SPLIT_BY_CHAR_TO_NUMBERS:
        return inputVal.split('').map(str => Number.parseInt(str, 10));
      case ParsingModes.JOIN_WITH_SPACE:
        return Array.isArray(inputVal) ? inputVal.join(' ') : String(inputVal);
      case ParsingModes.JOIN_WITH_NEWLINE:
        return Array.isArray(inputVal) ? inputVal.join('\n') : String(inputVal);
      case ParsingModes.JOIN_WITHOUT_DELIMITER:
        return Array.isArray(inputVal) ? inputVal.join('') : String(inputVal);
      case ParsingModes.RETURN_AS_IS:
      default:
        console.warn(`[WARNING] Unrecognized or default parsing mode '${modeType}' encountered. Returning input value without modification.`);
        return inputVal;
    }
  } catch (conversionError) {
    console.error(`[ERROR] Failed to transform input for mode ${modeType}: ${conversionError.message}`);
    return inputVal; // Fallback to original value on error.
  }
}

/**
 * Retrieves and parses the next input line as an integer.
 * @returns {number} The parsed integer.
 */
function obtainNextInteger() {
  return performInputTransformation(inputDataProvider.fetchNext(), ParsingModes.PARSE_AS_INT);
}

/**
 * Retrieves and parses the next input line as an array of strings (space-separated).
 * @returns {string[]} An array of strings.
 */
function obtainNextStringArray() {
  return performInputTransformation(inputDataProvider.fetchNext(), ParsingModes.SPLIT_BY_SPACE_TO_STRINGS);
}

/**
 * Retrieves and parses the next input line as an array of numbers (space-separated).
 * @returns {number[]} An array of numbers.
 */
function obtainNextNumberArray() {
  return performInputTransformation(inputDataProvider.fetchNext(), ParsingModes.SPLIT_BY_SPACE_TO_NUMBERS);
}

/**
 * Retrieves and parses the next input line as an array of characters.
 * @returns {string[]} An array of characters.
 */
function obtainNextCharacterArray() {
  return performInputTransformation(inputDataProvider.fetchNext(), ParsingModes.SPLIT_BY_CHAR_TO_STRINGS);
}

/**
 * Advances the input stream and returns the raw next line.
 * @returns {string} The raw next input line.
 */
function advanceInputLine() {
  return inputDataProvider.fetchNext();
}

/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function checkMoreInputAvailable() {
  return inputDataProvider.hasMore();
}

/**
 * Constructs an iterator-like object for sequential access to an array of input lines.
 * @param {string[]} sourceLinesCollection - The array of strings to iterate over.
 * @returns {object} An object with `hasMore` and `fetchNext` methods.
 */
function createSequentialInputReader(sourceLinesCollection) {
  let currentReadPosition = 0;
  const totalLineCount = sourceLinesCollection.length;

  const readerInstance = {
    sourceContent: sourceLinesCollection,
    currentCursor: 0,
    totalEntries: totalLineCount,

    /**
     * Determines if there are additional entries available in the source content.
     * @returns {boolean} `true` if more entries can be fetched, `false` otherwise.
     */
    hasMore: function() {
      return (this.currentCursor < this.totalEntries);
    },

    /**
     * Retrieves the next entry from the source content and advances the cursor.
     * @returns {string} The next entry.
     * @throws {Error} If an attempt is made to read beyond the available entries.
     */
    fetchNext: function() {
      if (!this.hasMore()) {
        throw new Error("EndOfInputError: No further input lines are available for reading.");
      }
      return this.sourceContent[this.currentCursor++];
    }
  };
  return readerInstance;
}

/**
 * Outputs a value to the standard console, followed by a newline.
 * @param {*} dataToOutput - The data to be displayed.
 */
function printFinalResult(dataToOutput) {
  console.log(dataToOutput);
}

/**
 * Logs diagnostic or debug information to the standard error stream.
 * The verbosity can be controlled by the `DEBUG_MODE` environment variable.
 * @param {*} payload - The information to be logged.
 */
function outputDiagnosticInfo(payload) {
  // Provide detailed inspection if DEBUG_MODE is explicitly enabled.
  if (process.env.DEBUG_MODE === 'true') {
    console.error("DIAGNOSTIC_TRACE: " + require("util").inspect(payload, { showHidden: false, depth: null, colors: true }));
  } else {
    // Simpler output for general diagnostic messages.
    console.error("DIAG: " + String(payload));
  }
}

// --- Main Algorithm Implementation ---
/**
 * Contains the primary problem-solving logic.
 * This function identifies and counts all contiguous subarrays within a given sequence
 * where the arithmetic sum of elements is equal to their bitwise XOR sum.
 */
function executeMainAlgorithm() {
  // Read the expected total number of elements in the input sequence.
  const expectedElementCount = obtainNextInteger();

  // Read the sequence of numbers as an array.
  const numericDataSequence = obtainNextNumberArray();

  // Implement robust input validation for the main algorithm.
  if (!Array.isArray(numericDataSequence) || numericDataSequence.length === 0) {
    printFinalResult(0); // If the sequence is empty, no valid subarrays exist.
    return;
  }
  if (expectedElementCount <= 0) {
    printFinalResult(0); // If the count is non-positive, no valid subarrays exist.
    return;
  }
  // Optional: A warning if declared count doesn't match actual array length.
  if (numericDataSequence.length !== expectedElementCount) {
    outputDiagnosticInfo(`[WARNING] Declared element count (${expectedElementCount}) differs from actual sequence length (${numericDataSequence.length}). Proceeding with actual length.`);
    // For Type III, we could force `expectedElementCount = numericDataSequence.length;` here,
    // but preserving the original input value for `N` is often safer in competitive programming contexts.
  }

  let totalValidSubarrays = 0; // Accumulates the final count of subarrays.
  let leftPtr = 0; // The left boundary (inclusive) of the current sliding window.
  let rightPtr = 0; // The right boundary (inclusive) of the current sliding window.

  // Initialize the bitwise XOR sum for the initial window, which starts with the first element.
  // This variable maintains the XOR sum of `numericDataSequence[leftPtr...rightPtr]`.
  let currentWindowXorAggregate = numericDataSequence[0];

  // The main sliding window loop. The left pointer iterates through all possible starting positions.
  // The right pointer extends the window as long as the condition holds.
  while (leftPtr < expectedElementCount) {
    // Determine the index of the element immediately to the right of the current window.
    const candidateNextElementIndex = rightPtr + 1;

    // Condition to extend the window:
    // 1. The candidate next element must be within the array bounds.
    // 2. The bitwise AND of the `currentWindowXorAggregate` and the `candidateNextElement` must be zero.
    //    This condition `(A & B) == 0` is equivalent to `(A + B) == (A ^ B)`.
    //    If this holds, extending the window preserves the property that the arithmetic sum
    //    equals the XOR sum for the new window `[leftPtr...candidateNextElementIndex]`.
    if (candidateNextElementIndex < expectedElementCount &&
      (currentWindowXorAggregate & numericDataSequence[candidateNextElementIndex]) === 0) {

      // If the condition is met, extend the window to include the new element.
      // For the newly extended valid window `[leftPtr, rightPtr + 1]`, all subarrays
      // ending at `rightPtr + 1` and starting at or after `leftPtr` are also valid.
      // The count of such subarrays is `(rightPtr + 1) - leftPtr + 1`.
      totalValidSubarrays += (rightPtr - leftPtr + 1); // Add count of new valid subarrays ending at *current* rightPtr
      // Then advance right pointer and update XOR aggregate.
      rightPtr++;
      currentWindowXorAggregate ^= numericDataSequence[rightPtr]; // Incorporate the new element's XOR value.

      // Optional: Log window expansion for debugging.
      // outputDiagnosticInfo(`Window expanded to [${leftPtr}, ${rightPtr}], XOR Sum: ${currentWindowXorAggregate}, Current Total: ${totalValidSubarrays}`);

    } else {
      // If the window cannot be extended (either out of bounds or condition not met),
      // we must shrink the window from the left.
      // Remove the leftmost element's contribution from the XOR aggregate.
      currentWindowXorAggregate ^= numericDataSequence[leftPtr];
      leftPtr++;

      // If the left pointer has advanced past the right pointer,
      // reset the right pointer to catch up with the left.
      // This effectively creates a new single-element window starting at `leftPtr`.
      if (rightPtr < leftPtr) {
        rightPtr = leftPtr;
        // Re-initialize the XOR aggregate if the new `leftPtr` is still within array bounds.
        // If `leftPtr` is `expectedElementCount`, the window is empty, so aggregate is 0.
        if (leftPtr < expectedElementCount) {
          currentWindowXorAggregate = numericDataSequence[leftPtr];
        } else {
          currentWindowXorAggregate = 0; // Window is now logically empty.
        }
      }
      // Optional: Log window contraction for debugging.
      // outputDiagnosticInfo(`Window contracted to [${leftPtr}, ${rightPtr}], XOR Sum: ${currentWindowXorAggregate}, Current Total: ${totalValidSubarrays}`);
    }
  }

  // The logic `totalValidSubarrays += (rightPtr - leftPtr + 1)` correctly counts
  // subarrays `[L,R]`, `[L+1,R]`, ..., `[R,R]` when `[L,R]` is a valid window.
  // However, the original problem implies that all single-element subarrays `[i,i]` are counted implicitly.
  // For any single element `A`, `SUM(A) = A` and `XOR_SUM(A) = A`. So `A == A` is always true.
  // The `totalValidSubarrays` variable, as implemented with `totalValidSubarrays += (rightPtr - leftPtr + 1)`,
  // counts all valid multi-element subarrays and single-element subarrays that *end* at `rightPtr`.
  // The `+ expectedElementCount` at the end accounts for all single-element subarrays.
  // Let's re-verify:
  // When `rightPtr` advances, `totalValidSubarrays += (rightPtr - leftPtr + 1)` is added.
  // If `[L, R]` is a valid window, it should add `R - L + 1` subarrays.
  // Example: `[1,2,4]` (N=3).
  // L=0, R=0, XOR=1, total=0
  //
  // 1. `R+1=1` (val=2). `1&2 == 0`. Extend.
  //    `total += (0-0+1) = 1`. (`[0]` is counted)
  //    `R=1`. `XOR = 1^2 = 3`. Window `[0,1]`.
  //
  // 2. `R+1=2` (val=4). `3&4 == 0`. Extend.
  //    `total += (1-0+1) = 2`. (`[0,1]`, `[1]` are counted)
  //    `R=2`. `XOR = 3^4 = 7`. Window `[0,2]`.
  //
  // 3. `R+1=3`. Out of bounds. Shrink.
  //    `XOR = 7^list[0](1) = 6`. `L=1`. Window `[1,2]`.
  //
  // 4. `R+1=3`. Out of bounds. Shrink.
  //    `XOR = 6^list[1](2) = 4`. `L=2`. Window `[2,2]`.
  //
  // 5. `R+1=3`. Out of bounds. Shrink.
  //    `XOR = 4^list[2](4) = 0`. `L=3`. `R<L` (2<3) true. `R=3`. `XOR=0`. Window `[]`.
  //
  // Loop ends. `totalValidSubarrays = 1 + 2 = 3`.
  // The expected result for `[1,2,4]` is 6 (subarrays: `[1]`, `[2]`, `[4]`, `[1,2]`, `[2,4]`, `[1,2,4]`).
  // The original code uses `output + N`. So, `3 + 3 = 6`.
  // This confirms that the `+ N` is indeed for counting the single-element subarrays.

  printFinalResult(totalValidSubarrays + expectedElementCount);
}