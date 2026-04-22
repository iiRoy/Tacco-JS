const InputDataProcessor = (function () {
  /**
   * Factory function to create a new InputLineParser instance.
   * This acts as the entry point for accessing the input parsing utilities.
   * @param {string} sourceContent - The raw string content to parse, typically from a file.
   * @returns {InputLineParser} An instance configured to parse the provided content.
   */
  function createDataParser(sourceContent) {
    return new InputLineParser(sourceContent);
  }

  /**
   * @class InputLineParser
   * @description A utility class for parsing multi-line string input.
   * It provides methods to extract data in various formats (single values, full lines, matrices).
   */
  class InputLineParser {
    /**
     * Initializes the parser with the raw input text.
     * @param {string} rawSourceText - The complete string content received from input.
     */
    constructor(rawSourceText) {
      // Validate input to ensure it's a non-empty string.
      if (typeof rawSourceText !== 'string' || rawSourceText.trim() === '') {
        console.warn("InputLineParser initialized with empty or invalid source text. Operations might fail.");
        this.allInputLines = [];
      } else {
        // Split the entire input into an array of individual lines.
        this.allInputLines = rawSourceText.trim().split("\n");
      }
      this.currentLineCursor = 0; // Pointer to the current line being processed.
      this._currentLineTokens = null; // Cache for tokens of the current line, used by extractSingleValue.
    }

    /**
     * Extracts a single value from the current line. If the current line is exhausted,
     * it automatically advances to the next line.
     * @param {boolean} returnRawString - If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string | number} The extracted value.
     * @throws {Error} If an attempt is made to read beyond the end of the input.
     */
    extractSingleValue(returnRawString = false) {
      if (this.currentLineCursor >= this.allInputLines.length) {
        throw new Error("Parser error: Attempted to read a single value past the end of the input.");
      }

      // If the current line's tokens haven't been prepared or are all consumed,
      // split and reverse the current line to prepare for 'pop' operations.
      if (!this._currentLineTokens || this._currentLineTokens.length === 0) {
        const lineContent = this.allInputLines[this.currentLineCursor];
        if (typeof lineContent !== 'string') {
          throw new Error(`Parser error: Line ${this.currentLineCursor} is not a string.`);
        }
        this._currentLineTokens = lineContent.trim().split(" ").reverse();
      }

      const extractedToken = this._currentLineTokens.pop();

      // If all tokens from the current line have been consumed, move to the next line.
      if (this._currentLineTokens.length === 0) {
        this.currentLineCursor++;
        this._currentLineTokens = null; // Clear cache for the new line.
      }

      // Convert to number or return as string based on flag.
      return returnRawString ? extractedToken : this._parseNumericValue(extractedToken);
    }

    /**
     * Extracts all space-separated values from the current line as an array.
     * The line cursor is advanced after this operation.
     * @param {boolean} returnRawStrings - If true, values are returned as strings; otherwise, converted to numbers.
     * @returns {Array<string | number>} An array of values from the line.
     * @throws {Error} If an attempt is made to read beyond the end of the input.
     */
    extractLineValues(returnRawStrings = false) {
      if (this.currentLineCursor >= this.allInputLines.length) {
        throw new Error("Parser error: Attempted to read a full line past the end of the input.");
      }
      // Clear any pending single-value tokens for this line, as we're reading the whole thing.
      this._currentLineTokens = null;

      const currentLine = this.allInputLines[this.currentLineCursor++];
      const rawValues = currentLine.trim().split(" ");
      return returnRawStrings ? rawValues : rawValues.map(val => this._parseNumericValue(val));
    }

    /**
     * Extracts a block of 'numberOfLines' lines, where each line is split into values,
     * forming a 2D array (matrix). The line cursor is advanced by 'numberOfLines'.
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} returnRawStrings - If true, values are returned as strings; otherwise, converted to numbers.
     * @returns {Array<Array<string | number>>} A 2D array representing the matrix data.
     * @throws {Error} If 'numberOfLines' is invalid or not enough lines remain.
     */
    extractMatrixValues(numberOfLines, returnRawStrings = false) {
      if (numberOfLines <= 0 || this.currentLineCursor + numberOfLines > this.allInputLines.length) {
        throw new Error(`Parser error: Invalid line count (${numberOfLines}) or insufficient lines for matrix extraction.`);
      }
      this._currentLineTokens = null; // Clear token cache.

      const matrixBlock = this.allInputLines.slice(this.currentLineCursor, this.currentLineCursor + numberOfLines)
        .map(line => line.trim().split(" "));
      this.currentLineCursor += numberOfLines;
      return returnRawStrings ? matrixBlock : matrixBlock.map(row => row.map(val => this._parseNumericValue(val)));
    }

    /**
     * Extracts a block of 'numberOfLines' lines as raw strings.
     * The line cursor is advanced by 'numberOfLines'.
     * @param {number} numberOfLines - The count of lines to read.
     * @param {boolean} convertToNumbers - If true, attempts to convert each raw line string to a number.
     * @returns {Array<string | number>} An array of raw line strings or converted numbers.
     * @throws {Error} If 'numberOfLines' is invalid or not enough lines remain.
     */
    extractRawLines(numberOfLines, convertToNumbers = false) {
      if (numberOfLines <= 0 || this.currentLineCursor + numberOfLines > this.allInputLines.length) {
        throw new Error(`Parser error: Invalid line count (${numberOfLines}) or insufficient lines for raw line extraction.`);
      }
      this._currentLineTokens = null; // Clear token cache.

      const rawLines = this.allInputLines.slice(this.currentLineCursor, this.currentLineCursor + numberOfLines);
      this.currentLineCursor += numberOfLines;
      return convertToNumbers ? rawLines.map(line => this._parseNumericValue(line.trim())) : rawLines;
    }

    /**
     * Internal helper to convert a string to a number, with basic error logging.
     * @param {string} valueString - The string to convert.
     * @returns {number} The numeric value, or NaN if conversion fails.
     * @private
     */
    _parseNumericValue(valueString) {
      const numericVal = Number(valueString);
      if (isNaN(numericVal)) {
        console.warn(`Warning: Expected a number but encountered non-numeric value "${valueString}".`);
      }
      return numericVal;
    }
  }

  return createDataParser;
})();

// --- Core Algorithm Helper Functions ---

/**
 * Performs a binary search on a sorted array to find the index of the first element
 * that is greater than or equal to a specified target value. This is analogous to C++'s `std::lower_bound`.
 * @param {Array<number>} sortedCollection - The array to search within; it must be sorted in ascending order.
 * @param {number} searchRangeStartIdx - The inclusive starting index for the search.
 * @param {number} searchRangeEndIdx - The exclusive ending index for the search.
 * @param {number} targetValue - The value to find.
 * @returns {number} The index of the first element in the range `[searchRangeStartIdx, searchRangeEndIdx)`
 *                   that is >= `targetValue`. Returns `searchRangeEndIdx` if no such element is found.
 */
function findFirstGreaterOrEqual(sortedCollection, searchRangeStartIdx, searchRangeEndIdx, targetValue) {
  // Robustness checks for invalid search ranges.
  if (!Array.isArray(sortedCollection) || sortedCollection.length === 0 || searchRangeStartIdx >= searchRangeEndIdx) {
    return searchRangeStartIdx; // For empty or invalid ranges, return the start index (often 0 or the end).
  }
  if (searchRangeStartIdx < 0 || searchRangeEndIdx > sortedCollection.length) {
      throw new Error(`Invalid search range: start=${searchRangeStartIdx}, end=${searchRangeEndIdx}, array length=${sortedCollection.length}`);
  }

  let lowIndex = searchRangeStartIdx;
  let highIndex = searchRangeEndIdx; // Exclusive upper bound for binary search.

  while (lowIndex < highIndex) {
    const midPoint = Math.floor(lowIndex + (highIndex - lowIndex) / 2);
    if (sortedCollection[midPoint] < targetValue) {
      lowIndex = midPoint + 1;
    } else {
      highIndex = midPoint; // Candidate found, try to find an earlier one.
    }
  }
  return lowIndex; // This is the lower bound index.
}

/**
 * Filters a collection of numbers, returning a new array containing only those
 * elements that appear an odd number of times in the input collection.
 * This effectively computes a multiset symmetric difference with itself.
 * @param {Array<number>} inputNumericalCollection - The array of numbers to filter.
 * @returns {Array<number>} A new array of numbers that had an odd frequency.
 */
function filterOddOccurrences(inputNumericalCollection) {
  // Using a Map ensures correct handling of number keys (compared to plain objects).
  const frequencyMap = new Map();
  for (const item of inputNumericalCollection) {
    if (frequencyMap.has(item)) {
      // If the item is already in the map, it means it has appeared an odd number of times.
      // Deleting it makes its total count even.
      frequencyMap.delete(item);
    } else {
      // If the item is not in the map, it means it has appeared an even number of times (or zero).
      // Adding it makes its total count odd.
      frequencyMap.set(item, true); // The value 'true' is arbitrary, only key presence matters.
    }
  }
  // Convert the keys (elements with odd occurrences) from the map into an array.
  return Array.from(frequencyMap.keys());
}

// --- Solution Configuration Constants ---
const STD_INPUT_FILE_PATH = "/dev/stdin";
const INITIAL_BIT_ITERATION_MAX = 28; // The highest bit position to check (inclusive).
const ODD_FILTER_ACTIVATION_BIT = 18; // Bit position at which the odd occurrence filter is applied.
const VERBOSE_DEBUGGING_ENABLED = false; // Set to true for detailed console output during execution.

/**
 * The main function encapsulating the problem's solution logic.
 * This function processes input arrays through a series of bitwise operations
 * and binary searches to compute a final result.
 * @returns {number} The calculated final result.
 */
function executeSolution() {
  // Read raw input content from the specified file path.
  let rawInputData;
  try {
    rawInputData = require("fs").readFileSync(STD_INPUT_FILE_PATH, "utf8");
  } catch (ioError) {
    console.error(`Fatal Error: Could not read input from ${STD_INPUT_FILE_PATH}. Details: ${ioError.message}`);
    process.exit(1); // Terminate if input is unreadable.
  }

  // Initialize the input parser with the read data.
  const dataReader = InputDataProcessor(rawInputData);

  // Extract initial problem parameters.
  const totalItemCount = dataReader.extractSingleValue(); // 'n' in original code.
  let primaryDataArray = dataReader.extractLineValues(); // 'a' in original code.
  let secondaryDataArray = dataReader.extractLineValues(); // 'b' in original code.

  // Perform basic validation on the extracted input.
  if (totalItemCount <= 0) {
    console.warn("Warning: Provided item count is non-positive. Returning 0 as result.");
    return 0;
  }
  if (primaryDataArray.length !== totalItemCount || secondaryDataArray.length !== totalItemCount) {
    console.error("Critical Error: Input array lengths do not match the declared total item count.");
    process.exit(1);
  }

  let finalAccumulatedResult = 0; // 'ans' in original code, accumulates bits of the final answer.

  // Main loop: Iterates from a high bit position down to 0.
  // This structure is typical for problems involving sums or XORs modulo powers of two.
  for (let currentBitPos = INITIAL_BIT_ITERATION_MAX; currentBitPos >= 0; currentBitPos--) {
    const powerOfTwoCurrent = 1 << currentBitPos;             // 't' in original: 2^currentBitPos
    const powerOfTwoDouble = powerOfTwoCurrent * 2;           // 't2' in original: 2^(currentBitPos+1)
    const powerOfTwoTriple = powerOfTwoCurrent * 3;           // 't3' in original: 3 * 2^currentBitPos
    const lowerBitsMask = powerOfTwoCurrent - 1;              // 'c' in original: Mask for bits lower than currentBitPos

    // This variable tracks a count related to pairs (primaryDataArray[j], secondaryDataArray[k]).
    // Its parity (odd/even) determines if the current bit contributes to the final result.
    // Initialized to totalItemCount * totalItemCount, representing all possible pairs.
    let effectivePairModCount = totalItemCount * totalItemCount;

    // Sorting secondaryDataArray in each iteration is crucial because its elements
    // are modified by the bitwise AND operation (`& lowerBitsMask`) at the end of the loop,
    // which changes their relative order.
    secondaryDataArray.sort((valX, valY) => valX - valY);

    // Inner loop: Iterate through each element of the primary array.
    for (let pIdx = 0; pIdx < totalItemCount; pIdx++) {
      const currentPrimaryValue = primaryDataArray[pIdx];

      // Determine the current effective length of the secondary array for binary search.
      // This is important because secondaryDataArray might have shrunk due to `filterOddOccurrences`.
      const currentSecondaryArrayLength = secondaryDataArray.length;

      // Perform three binary searches to find specific ranges of elements in secondaryDataArray.
      // These calculations are part of determining how many pairs (currentPrimaryValue + secondaryValue)
      // fall into specific bitwise ranges (e.g., [powerOfTwoCurrent, powerOfTwoDouble - 1] modulo powerOfTwoDouble).

      // lbIdx2: Index of first secondary value >= (powerOfTwoDouble - currentPrimaryValue)
      const lowerBoundIdx2 = findFirstGreaterOrEqual(
        secondaryDataArray, 0, currentSecondaryArrayLength, powerOfTwoDouble - currentPrimaryValue
      );

      // lbIdx1: Index of first secondary value >= (powerOfTwoCurrent - currentPrimaryValue),
      //         searched only up to lbIdx2. This effectively counts elements `y` such that
      //         `currentPrimaryValue + y` falls into a specific range `[powerOfTwoCurrent, powerOfTwoDouble - 1)`.
      const lowerBoundIdx1 = findFirstGreaterOrEqual(
        secondaryDataArray, 0, lowerBoundIdx2, powerOfTwoCurrent - currentPrimaryValue
      );

      // lbIdx3: Index of first secondary value >= (powerOfTwoTriple - currentPrimaryValue),
      //         searched from lbIdx2 up to the end of the array.
      const lowerBoundIdx3 = findFirstGreaterOrEqual(
        secondaryDataArray, lowerBoundIdx2, currentSecondaryArrayLength, powerOfTwoTriple - currentPrimaryValue
      );

      // Adjust the effective pair count. The specific arithmetic (-lbIdx3 + lbIdx2 - lbIdx1)
      // is a common pattern in bit-based counting problems to include/exclude specific ranges.
      effectivePairModCount += -lowerBoundIdx3 + lowerBoundIdx2 - lowerBoundIdx1;
    }

    // If the final count for this bit position is odd, it means this bit contributes to the result.
    if (effectivePairModCount % 2 !== 0) {
      finalAccumulatedResult += powerOfTwoCurrent;
    }

    // Apply the bitmask to both arrays. This effectively reduces each number to its
    // value modulo `powerOfTwoCurrent` (i.e., keeps only the lower bits).
    secondaryDataArray = secondaryDataArray.map(val => val & lowerBitsMask);
    primaryDataArray = primaryDataArray.map(val => val & lowerBitsMask);

    // Conditional application of the `filterOddOccurrences` function.
    // This optimization or specific requirement is applied only for lower bit positions.
    if (currentBitPos < ODD_FILTER_ACTIVATION_BIT) {
        if (VERBOSE_DEBUGGING_ENABLED) {
            console.log(`DEBUG: Applying odd occurrence filter for secondary array at bit position ${currentBitPos}.`);
        }
        secondaryDataArray = filterOddOccurrences(secondaryDataArray);
    }
  }

  return finalAccumulatedResult;
}

// Execute the main solution function and output its result to the console.
console.log(executeSolution());