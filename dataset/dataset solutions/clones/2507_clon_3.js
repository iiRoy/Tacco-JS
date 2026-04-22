"use strict";

// This module provides a flexible input processing utility for competitive programming.
// It allows reading various data formats (single tokens, lists, matrices, raw lines)
// from a multi-line string source, typically standard input.
const InputProcessor = (() => {
  /**
   * Factory function to create a new input reader instance.
   * @param {string} rawInputContent - The entire input data as a single string.
   * @returns {DataStreamReader} An initialized instance of the data stream reader.
   */
  function createInputReader(rawInputContent) {
    return new DataStreamReader(rawInputContent);
  }

  /**
   * Represents a reader for processing a stream of input data, line by line.
   * @class
   * @param {string} initialInput - The raw string content to be parsed.
   */
  function DataStreamReader(initialInput) {
    // The buffer holding all input lines, trimmed and split.
    this._bufferedLines = initialInput.trim().split("\n");
    // The current line number being processed (0-indexed).
    this._linePointer = 0;
    // A cache for tokens of the current line when reading individual tokens.
    // Tokens are reversed to allow efficient popping from the end.
    this._lineTokenCache = [];
  }

  /**
   * Internal helper to ensure the current line's tokens are loaded into cache
   * if the cache is empty and there are more lines to read.
   * This logic mimics the original's behavior of splitting and reversing a line *once*
   * when its tokens are first requested, and then popping from the end.
   */
  DataStreamReader.prototype._loadLineTokensIntoCache = function() {
    if (this._lineTokenCache.length === 0 && this._linePointer < this._bufferedLines.length) {
      const currentLineContent = this._bufferedLines[this._linePointer];
      // Only process as a string if it hasn't been processed into an array before.
      // This is a subtle point from the original code where `s[y]` could be mutated from string to array.
      if (typeof currentLineContent === "string") {
        this._lineTokenCache = currentLineContent.split(" ").reverse();
      } else {
        // If it's not a string, it implies it might have been previously processed or is an invalid state.
        // For robustness, we'll treat it as an empty line for token reading.
        this._lineTokenCache = [];
      }
    }
  };

  /**
   * Reads and returns a single token from the current line.
   * Tokens are read from right-to-left on a line (due to internal `reverse` behavior).
   * Advances the line pointer only when the current line's tokens are fully consumed.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to parse as an integer.
   * @returns {string|number} The extracted token.
   */
  DataStreamReader.prototype.readSingleToken = function(returnAsString = false) {
    this._loadLineTokensIntoCache(); // Ensure current line's tokens are ready.

    let extractedToken;
    if (this._lineTokenCache.length > 0) {
      extractedToken = this._lineTokenCache.pop(); // Pop from the end (original's right-most token).
    } else {
      // If the cache is empty, it means the current line was empty or fully consumed.
      // In this case, try to read the entire line as a single token if it exists.
      // This path handles lines that contain no spaces and are treated as one token.
      extractedToken = (this._bufferedLines[this._linePointer] || "").trim();
      this._lineTokenCache = []; // Mark line as fully consumed for token reading.
    }

    // If the token cache is now empty, it means the current line has been fully processed,
    // so advance to the next line.
    if (this._lineTokenCache.length === 0) {
      this._linePointer++;
    }

    return returnAsString ? extractedToken : parseInt(extractedToken, 10);
  };

  /**
   * Reads an entire line, splits it by space, and returns values as a list.
   * The line pointer is advanced after reading.
   * @param {boolean} [returnAsStringList=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the read line.
   */
  DataStreamReader.prototype.readSpaceSeparatedList = function(returnAsStringList = false) {
    // Directly access and increment the line pointer.
    const currentLine = this._bufferedLines[this._linePointer++];
    if (!currentLine) {
      // Handle cases where we try to read past the end of the buffer.
      return returnAsStringList ? [] : [];
    }
    const tokens = currentLine.split(" ");
    return returnAsStringList ? tokens : tokens.map(str => parseInt(str, 10));
  };

  /**
   * Reads a specified number of lines, treating each as a space-separated list,
   * forming a 2D array (matrix).
   * The line pointer is advanced by 'lineCount'.
   * @param {number} lineCount - The number of lines to read for the matrix.
   * @param {boolean} [returnAsStringMatrix=false] - If true, returns string arrays; otherwise, number arrays.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  DataStreamReader.prototype.readMatrix = function(lineCount, returnAsStringMatrix = false) {
    const startLine = this._linePointer;
    const endLine = this._linePointer + lineCount;
    // Extract the block of lines.
    const blockOfLines = this._bufferedLines.slice(startLine, endLine);
    this._linePointer = endLine; // Update the line pointer.

    if (returnAsStringMatrix) {
      return blockOfLines.map(line => line.split(" "));
    } else {
      return blockOfLines.map(line => line.split(" ").map(str => parseInt(str, 10)));
    }
  };

  /**
   * Reads a specified number of lines without splitting them by spaces.
   * Each line is returned as a single item in an array.
   * The line pointer is advanced by 'lineCount'.
   * @param {number} lineCount - The number of raw lines to read.
   * @param {boolean} [returnAsStringLines=false] - If true, returns lines as strings; otherwise, attempts to parse each line as a single number.
   * @returns {Array<string|number>} An array of raw lines or parsed numbers.
   */
  DataStreamReader.prototype.readBlockOfRawLines = function(lineCount, returnAsStringLines = false) {
    const startLine = this._linePointer;
    const endLine = this._linePointer + lineCount;
    const blockOfRawLines = this._bufferedLines.slice(startLine, endLine);
    this._linePointer = endLine; // Update the line pointer.
    return returnAsStringLines ? blockOfRawLines : blockOfRawLines.map(str => parseInt(str, 10));
  };

  return createInputReader;
})();

// Initialize the input stream processor by reading from standard input.
const dataReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This function provides a safe alternative to using `eval` for array creation.
 * @param {*} initialFillValue - The value to initialize all array elements with.
 * @param {...number} dimensions - A variable number of arguments representing the size of each dimension.
 * @returns {Array} The newly created and initialized multi-dimensional array.
 */
const createMultiDimensionalArray = (initialFillValue, ...dimensions) => {
  // Base case: if no more dimensions, return the initial value.
  if (dimensions.length === 0) {
    return initialFillValue;
  }

  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);

  // Input validation: ensure dimension size is a non-negative integer.
  if (!Number.isInteger(currentDimensionSize) || currentDimensionSize < 0) {
    console.error(`Error: Invalid dimension size provided: ${currentDimensionSize}. Must be a non-negative integer.`);
    // Return an empty array or throw an error based on desired error handling strategy.
    return [];
  }

  // Recursively build the array.
  const multiArray = new Array(currentDimensionSize);
  for (let index = 0; index < currentDimensionSize; index++) {
    multiArray[index] = createMultiDimensionalArray(initialFillValue, ...remainingDimensions);
  }
  return multiArray;
};

// A constant representing a very large number, often used as an initial "infinity"
// value in algorithms for minimum/maximum tracking.
const LARGE_NUMBER_THRESHOLD = 1_000_000_000_000_000; // Equivalent to 1e15

/**
 * The main function encapsulating the problem-solving logic.
 * Reads input, performs calculations, and returns the formatted output.
 * @returns {string} The final result, formatted as a newline-separated string.
 */
const solveProblem = () => {
  // Read the total count of elements from the first line.
  const totalElementCount = dataReader.readSingleToken();
  // Read the list of all input values from the second line.
  const valuesList = dataReader.readSpaceSeparatedList();

  // Basic input validation: check if the count matches the list length.
  if (totalElementCount <= 0 || valuesList.length !== totalElementCount) {
    console.error("Input data mismatch: declared element count does not match actual list length.");
    return "Error: Invalid input data.";
  }

  // Create a frequency map to count occurrences of each number.
  // Values are 1-based, so map is 0-indexed up to totalElementCount - 1.
  const valueFrequencyMap = createMultiDimensionalArray(0, totalElementCount);
  for (let i = 0; i < totalElementCount; i++) {
    const currentVal = valuesList[i];
    // Ensure value is within expected bounds [1, totalElementCount].
    if (currentVal >= 1 && currentVal <= totalElementCount) {
      valueFrequencyMap[currentVal - 1]++;
    } else {
      // Log a warning for values outside the expected range, but continue processing.
      console.warn(`Encountered value ${currentVal} out of expected range [1, ${totalElementCount}].`);
    }
  }

  // Extract all non-zero frequencies into a new array.
  const actualFrequencies = [];
  for (let i = 0; i < totalElementCount; i++) {
    if (valueFrequencyMap[i] > 0) {
      actualFrequencies.push(valueFrequencyMap[i]);
    }
  }

  // Sort the extracted frequencies in ascending order.
  actualFrequencies.sort((a, b) => a - b);

  // Compute prefix sums of the sorted frequencies.
  // `prefixSums[k]` will store the sum of the first `k` smallest frequencies.
  const prefixSumsOfFrequencies = new Array(actualFrequencies.length + 1).fill(0);
  for (let i = 0; i < actualFrequencies.length; i++) {
    prefixSumsOfFrequencies[i + 1] = prefixSumsOfFrequencies[i] + actualFrequencies[i];
  }

  // Initialize the array to store the final answers for each 'k'.
  // The problem asks for results for k from 1 to N.
  const finalAnswerArray = new Array(totalElementCount).fill(0);

  // The result for k=1 (meaning groups of size 1) is always N (total elements).
  finalAnswerArray[0] = totalElementCount;

  // Iterate for group sizes 'k' from 2 up to totalElementCount.
  for (let groupSize = 2; groupSize <= totalElementCount; groupSize++) {
    // If the number of distinct frequencies is less than the current groupSize,
    // it's impossible to form 'groupSize' distinct groups, so the answer is 0.
    if (actualFrequencies.length < groupSize) {
      finalAnswerArray[groupSize - 1] = 0;
      continue;
    }

    // Calculate the maximum possible "multiplier" (number of items per group)
    // for the current `groupSize`. This multiplier `m` must satisfy two conditions:
    // 1. `m * groupSize` must not exceed `totalElementCount`.
    // 2. `m` must not exceed the sum of the `groupSize` smallest frequencies.
    //    (This ensures we have enough "items" to distribute among `groupSize` groups,
    //     considering the smallest possible frequencies to maximize `m`).
    const sumOfSmallestFrequenciesForGroups = prefixSumsOfFrequencies[groupSize];

    const maxValidMultiplier = Math.min(
      Math.floor(totalElementCount / groupSize), // Max `m` such that `m * groupSize <= totalElementCount`
      sumOfSmallestFrequenciesForGroups        // Max `m` such that `m` can be formed from `groupSize` smallest frequencies
    );

    finalAnswerArray[groupSize - 1] = maxValidMultiplier;
  }

  // Join the results with newline characters and return.
  return finalAnswerArray.join("\n");
};

// Execute the main problem-solving function and print its output to the console.
console.log(solveProblem());