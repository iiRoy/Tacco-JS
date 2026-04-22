const inputInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let parsedInputData;
const rawInputLines = [];

inputInterface.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

inputInterface.on('close', () => {
  parsedInputData = createInputProcessor(rawInputLines);
  executeProcessingAlgorithm();
});

/**
 * Creates a deep copy of a JSON-serializable object.
 * @param {object} originalObject - The object to duplicate.
 * @returns {object} A new object, deeply copied.
 */
function duplicateObject(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

/**
 * Enumeration-like object for data conversion modes.
 * @readonly
 * @enum {number}
 */
const DataConversionModes = {
  TO_INTEGER: 1,
  SPLIT_STRING: 2,
  SPLIT_TO_NUMBERS: 4,
  SPLIT_CHARS: 6,
  SPLIT_CHARS_TO_NUMBERS: 7,
  JOIN_SPACE: 8,
  JOIN_NEWLINE: 9,
  JOIN_NONE: 0,
  NO_CONVERSION: -1
};

/**
 * A utility class to process input lines sequentially.
 */
class InputProcessor {
  #lineBuffer; // Private field to store input lines.
  #currentLineIndex;
  #totalLines;

  /**
   * Constructs an InputProcessor instance.
   * @param {string[]} inputLines - An array of strings, each representing a line of input.
   * @throws {Error} If inputLines is not an array.
   */
  constructor(inputLines) {
    if (!Array.isArray(inputLines)) {
      throw new Error("InputProcessor constructor expects an array of lines.");
    }
    this.#lineBuffer = inputLines;
    this.#currentLineIndex = 0;
    this.#totalLines = inputLines.length;
  }

  /**
   * Checks if there are more lines available to process.
   * @returns {boolean} True if more elements exist, false otherwise.
   */
  hasMoreElements() {
    return this.#currentLineIndex < this.#totalLines;
  }

  /**
   * Retrieves the next line from the input buffer and advances the internal pointer.
   * @returns {string} The next input line.
   * @throws {Error} If no more input elements are available.
   */
  fetchNextElement() {
    if (!this.hasMoreElements()) {
      throw new Error("No more input elements available. Attempted to read past end of input.");
    }
    const currentElement = this.#lineBuffer[this.#currentLineIndex];
    this.#currentLineIndex++;
    return currentElement;
  }
}

/**
 * Factory function to create an InputProcessor instance.
 * @param {string[]} inputData - The raw input lines.
 * @returns {InputProcessor} A new InputProcessor instance.
 */
function createInputProcessor(inputData) {
  return new InputProcessor(inputData);
}

/**
 * Converts a value based on the specified conversion mode.
 * Provides various parsing and joining functionalities.
 * @param {any} value - The input value to convert.
 * @param {DataConversionModes} mode - The conversion mode to apply.
 * @returns {any} The converted value, or the original value if conversion fails or mode is unknown.
 */
function dataConverter(value, mode) {
  try {
    switch (mode) {
      case DataConversionModes.TO_INTEGER:
        const parsedInt = parseInt(value, 10);
        if (isNaN(parsedInt)) {
          throw new Error(`Failed to parse value "${value}" as an integer.`);
        }
        return parsedInt;
      case DataConversionModes.SPLIT_STRING:
        return String(value).split(" ");
      case DataConversionModes.SPLIT_TO_NUMBERS:
        return String(value).split(" ").map(Number);
      case DataConversionModes.SPLIT_CHARS:
        return String(value).split("");
      case DataConversionModes.SPLIT_CHARS_TO_NUMBERS:
        return String(value).split("").map(Number);
      case DataConversionModes.JOIN_SPACE:
        if (!Array.isArray(value)) throw new Error("Join operation requires an array input.");
        return value.join(" ");
      case DataConversionModes.JOIN_NEWLINE:
        if (!Array.isArray(value)) throw new Error("Join operation requires an array input.");
        return value.join("\n");
      case DataConversionModes.JOIN_NONE:
        if (!Array.isArray(value)) throw new Error("Join operation requires an array input.");
        return value.join("");
      case DataConversionModes.NO_CONVERSION:
      default:
        return value;
    }
  } catch (conversionError) {
    // Log the error but return the original value for robustness, similar to original behavior.
    logDiagnostic(`Conversion error encountered for value "${value}" with mode ${mode}: ${conversionError.message}`);
    return value;
  }
}

/**
 * Retrieves and converts the next input element to an integer.
 * @returns {number} The next integer from input.
 */
function getNextInteger() {
  return dataConverter(parsedInputData.fetchNextElement(), DataConversionModes.TO_INTEGER);
}

/**
 * Retrieves and converts the next input element to an array of strings (split by space).
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return dataConverter(parsedInputData.fetchNextElement(), DataConversionModes.SPLIT_STRING);
}

/**
 * Retrieves and converts the next input element to an array of numbers (split by space).
 * @returns {number[]} An array of numbers.
 */
function getNextIntegerArray() {
  return dataConverter(parsedInputData.fetchNextElement(), DataConversionModes.SPLIT_TO_NUMBERS);
}

/**
 * Retrieves and converts the next input element to an array of characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return dataConverter(parsedInputData.fetchNextElement(), DataConversionModes.SPLIT_CHARS);
}

/**
 * Retrieves the next raw input element without conversion.
 * @returns {string} The next raw input line.
 */
function getNextRawElement() {
  return parsedInputData.fetchNextElement();
}

/**
 * Checks if there are more input elements available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasMoreInput() {
  return parsedInputData.hasMoreElements();
}

/**
 * Displays content to standard output.
 * @param {any} content - The content to display.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * Logs diagnostic messages to standard error.
 * @param {string} message - The diagnostic message.
 */
function logDiagnostic(message) {
  console.error(`DIAG: ${message}`);
}

/**
 * Performs a binary search on a sorted array to find the appropriate insertion point.
 * This function finds the smallest index `idx` such that `targetCollection[idx] >= lookupValue`.
 * If `lookupValue` is greater than all elements in `targetCollection`, it returns `targetCollection.length`.
 *
 * @param {number[]} targetCollection - The sorted array to search within. Assumed to be sorted in ascending order.
 * @param {number} lookupValue - The value for which to find the insertion point.
 * @returns {number} The index where `lookupValue` should be inserted or replaced.
 */
function locatePositionInSortedArray(targetCollection, lookupValue) {
  // `lowBound` represents an index where the element is definitely LESS than `lookupValue`.
  // It's initialized to -1, indicating no such element has been found yet or the value is smaller than all.
  let lowBound = -1;
  // `highBound` represents an index where the element is potentially GREATER THAN OR EQUAL TO `lookupValue`.
  // It's initialized to `targetCollection.length`, indicating the value might be inserted at the end.
  let highBound = targetCollection.length;

  // Continue the search as long as there's a gap between `lowBound` and `highBound`.
  // The loop invariant is that `targetCollection[lowBound] < lookupValue` (if `lowBound >= 0`)
  // and `targetCollection[highBound] >= lookupValue` (if `highBound < targetCollection.length`).
  while (highBound - lowBound > 1) {
    // Calculate the middle index. `Math.floor` ensures an integer index.
    const midIndex = Math.floor((lowBound + highBound) / 2);

    // If the element at `midIndex` is less than `lookupValue`,
    // then `lookupValue` must be located at an index greater than `midIndex`.
    // So, `midIndex` becomes the new `lowBound`.
    if (targetCollection[midIndex] < lookupValue) {
      lowBound = midIndex;
    } else {
      // Otherwise, the element at `midIndex` is greater than or equal to `lookupValue`.
      // This means `midIndex` is a possible candidate for our insertion point,
      // or `lookupValue` is at an earlier index.
      // So, `midIndex` becomes the new `highBound`.
      highBound = midIndex;
    }
  }

  // When the loop terminates, `highBound` will be the smallest index `i` such that `targetCollection[i] >= lookupValue`.
  // If no such element exists (i.e., `lookupValue` is greater than all elements), `highBound` will be `targetCollection.length`.
  return highBound;
}

/**
 * The main algorithm execution function.
 * This function processes a sequence of numbers, maintaining a dynamically
 * updated sorted collection such that its length represents the length of
 * the Longest Increasing Subsequence (LIS) found so far.
 */
function executeProcessingAlgorithm() {
  // Guard clause: Ensure there's at least one line for the sequence length.
  if (!hasMoreInput()) {
    logDiagnostic("Error: No input provided for the sequence length. Terminating.");
    return;
  }

  const totalElementsToProcess = getNextInteger();

  // Guard clause: Validate the sequence length.
  if (isNaN(totalElementsToProcess) || totalElementsToProcess < 0) {
    logDiagnostic(`Error: Invalid sequence length provided: "${totalElementsToProcess}". Must be a non-negative integer. Terminating.`);
    return;
  }

  // This collection (`processedElements`) will store the smallest ending element
  // of an increasing subsequence of a given length. Its final length will be the LIS length.
  const processedElements = [];

  // Iterate through the specified number of elements from the input.
  for (let processingIndex = 0; processingIndex < totalElementsToProcess; processingIndex++) {
    // Guard clause: Check if input lines run out prematurely.
    if (!hasMoreInput()) {
      logDiagnostic(`Warning: Expected ${totalElementsToProcess} elements but only found ${processingIndex} valid entries. Stopping processing early.`);
      break;
    }

    const currentNumericalValue = getNextInteger();

    // Guard clause: Skip invalid numerical inputs.
    if (isNaN(currentNumericalValue)) {
      logDiagnostic(`Warning: Skipping invalid numerical input at position ${processingIndex + 1}: "${currentNumericalValue}".`);
      continue;
    }

    // Special handling for the first element: it always starts a new subsequence.
    // This optimization avoids calling binary search on an empty array.
    if (processedElements.length === 0) {
      processedElements.push(currentNumericalValue);
      continue; // Proceed to the next input element.
    }

    // Find the correct position for the `currentNumericalValue` within `processedElements`.
    // The `locatePositionInSortedArray` function returns the index of the first element
    // that is greater than or equal to `currentNumericalValue`.
    const insertionPosition = locatePositionInSortedArray(processedElements, currentNumericalValue);

    // If `insertionPosition` equals the current length of `processedElements`,
    // it means `currentNumericalValue` is strictly greater than all elements
    // currently in the collection. Thus, it extends the longest subsequence.
    if (insertionPosition === processedElements.length) {
      processedElements.push(currentNumericalValue); // Append the new largest element.
    } else {
      // Otherwise, `currentNumericalValue` is less than or equal to the element
      // at `insertionPosition`. By replacing `processedElements[insertionPosition]`
      // with `currentNumericalValue`, we potentially find a shorter or equal-length
      // increasing subsequence ending with a smaller number, which is beneficial
      // for extending future subsequences.
      processedElements[insertionPosition] = currentNumericalValue;
    }
  }

  // The final length of `processedElements` represents the length of the Longest Increasing Subsequence.
  displayOutput(processedElements.length);
}