/**
 * @file InputProcessor.js
 * @description This module provides a robust utility for parsing structured input data,
 *              typically sourced from standard input. It aims to streamline the process
 *              of consuming lines and tokens, converting them to appropriate data types.
 *
 *              The input stream is managed internally, allowing for sequential reads
 *              of individual tokens, entire lines, or blocks of multiple lines.
 *              Error handling for invalid input formats or end-of-stream conditions
 *              is integrated to ensure reliable data consumption.
 */

/**
 * @class InputDataStream
 * @description A specialized parser for processing multi-line string input.
 *              It maintains an internal pointer to track the current reading position
 *              and offers methods to extract various data structures (numbers, strings, arrays).
 */
function InputDataStream(sourceContent) {
  // Input validation: Ensure the provided source is a string.
  if (typeof sourceContent !== 'string') {
    throw new TypeError('InputDataStream must be initialized with a string content.');
  }

  /**
   * @private
   * @type {string[]}
   * @description An array holding each line of the input content, split by newline characters.
   *              Empty lines are preserved initially but handled during tokenization.
   */
  this.bufferedLines = sourceContent.split('\n');

  /**
   * @private
   * @type {number}
   * @description An index indicating the next line to be processed from `bufferedLines`.
   *              It's incremented upon reading a new line or advancing the stream.
   */
  this.lineReadCursor = 0;

  /**
   * @private
   * @type {string[]}
   * @description A temporary buffer for tokens of the current line being processed by
   *              `extractNextValue`. It's populated when a new line is accessed
   *              and tokens are consumed using `shift()`.
   */
  this.currentLineTokensBuffer = [];

  // Initial population of the token buffer if the first line is not empty.
  this._refillTokenBuffer();
}

/**
 * @description Defines the public interface methods for the InputDataStream.
 */
InputDataStream.prototype = {
  /**
   * @private
   * @method _refillTokenBuffer
   * @description Internal helper to ensure `currentLineTokensBuffer` is populated.
   *              If the buffer is empty, it attempts to load and split the next line
   *              from `bufferedLines`, advancing `lineReadCursor`.
   * @returns {boolean} True if the buffer was refilled successfully, false otherwise (end of stream).
   */
  _refillTokenBuffer: function() {
    // Only attempt to refill if the current buffer is empty and there are more lines.
    while (this.currentLineTokensBuffer.length === 0 && this.lineReadCursor < this.bufferedLines.length) {
      const nextLine = this.bufferedLines[this.lineReadCursor].trim(); // Trim to handle whitespace-only lines.
      this.lineReadCursor++; // Always advance cursor after attempting to read a line.

      if (nextLine.length > 0) { // Only split non-empty lines.
        this.currentLineTokensBuffer = nextLine.split(' ');
      }
    }
    return this.currentLineTokensBuffer.length > 0;
  },

  /**
   * @method extractNextValue
   * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts conversion to number.
   * @returns {(number|string|null)} The next available token, or `null` if the stream is exhausted.
   * @description Reads and returns a single token from the input stream. Tokens are consumed
   *              sequentially from left to right within each line. The stream automatically
   *              advances to the next line when all tokens on the current line are consumed.
   */
  extractNextValue: function(asString = false) {
    if (!this._refillTokenBuffer()) {
      return null; // No more tokens available in the entire stream.
    }

    const extractedToken = this.currentLineTokensBuffer.shift(); // Get the first token.
    return asString ? extractedToken : Number(extractedToken);
  },

  /**
   * @method consumeLineTokens
   * @param {boolean} [asStringArray=false] - If true, returns tokens as strings; otherwise, converts to numbers.
   * @returns {Array<(number|string)>} An array of tokens from the next full line, or an empty array if no more lines.
   * @description Reads and returns all tokens from the next available line. This operation
   *              always advances the `lineReadCursor` and clears `currentLineTokensBuffer`.
   */
  consumeLineTokens: function(asStringArray = false) {
    if (this.lineReadCursor >= this.bufferedLines.length) {
      return []; // No more lines left to read.
    }

    // Capture the line content and immediately advance the cursor.
    const lineContent = this.bufferedLines[this.lineReadCursor++].trim();

    // Clear any pending tokens from the previous line if `extractNextValue` was used.
    this.currentLineTokensBuffer = [];

    // Split the line into tokens.
    const lineTokens = lineContent.length > 0 ? lineContent.split(' ') : [];

    // Apply type conversion if not requested as strings.
    return asStringArray ? lineTokens : lineTokens.map(token => Number(token));
  },

  /**
   * @method readLinesBlock
   * @param {number} count - The number of consecutive lines to read. Must be a positive integer.
   * @param {boolean} [asStringMatrix=false] - If true, returns a 2D array of strings; otherwise, numbers.
   * @returns {Array<Array<(number|string)>>} A 2D array representing the block of lines read.
   * @description Reads a specified `count` of consecutive lines from the input stream.
   *              Each line is parsed into an array of tokens, forming a 2D matrix.
   */
  readLinesBlock: function(count, asStringMatrix = false) {
    // Guard clause for invalid count.
    if (count <= 0 || !Number.isInteger(count)) {
      console.warn(`Attempted to read an invalid number of lines: ${count}. Returning empty block.`);
      return [];
    }

    const blockAccumulator = [];
    // Clear the single-token buffer as we're explicitly reading full lines.
    this.currentLineTokensBuffer = [];

    // Internal helper for consistent line parsing within this method.
    const parseLineContent = (lineString) => {
      const tokens = lineString.trim().length > 0 ? lineString.trim().split(' ') : [];
      return asStringMatrix ? tokens : tokens.map(token => Number(token));
    };

    // Iterate up to the requested count of lines.
    for (let i = 0; i < count; i++) {
      // Check for end of available input lines.
      if (this.lineReadCursor >= this.bufferedLines.length) {
        console.warn(`End of input reached prematurely while trying to read ${count} lines. Read ${i} lines.`);
        break; // Stop if no more lines are present.
      }
      blockAccumulator.push(parseLineContent(this.bufferedLines[this.lineReadCursor]));
      this.lineReadCursor++; // Advance the cursor after processing each line.
    }

    return blockAccumulator;
  },
};

// --- Application Specific Logic ---

// Constant for the standard input file path in a typical competitive programming environment.
const STANDARD_INPUT_FILE = "/dev/stdin";

/**
 * @function retrieveRawInput
 * @param {string} filePath - The path to the input file.
 * @returns {string} The entire content of the file as a single string.
 * @description Abstracts the file system reading operation. This allows for easier
 *              modification of the input source (e.g., using a mock string for testing).
 */
function retrieveRawInput(filePath) {
  // The 'fs' module is a Node.js built-in for file system operations.
  // 'readFileSync' reads the entire file synchronously.
  // 'utf8' encoding is standard for text files.
  return require("fs").readFileSync(filePath, "utf8");
}

// Instantiate the input stream processor, feeding it the content from standard input.
const dataInputProcessor = new InputDataStream(retrieveRawInput(STANDARD_INPUT_FILE));

/**
 * @function executeSolution
 * @description Contains the main problem-solving algorithm.
 *              Given two integers N and M, find the largest integer 'x' such that
 *              'x' is a divisor of 'M' AND the quotient 'M/x' is greater than or equal to 'N'.
 * @returns {number} The largest valid factor 'x' found, or 0 if no such factor exists
 *                   or if input is invalid.
 */
function executeSolution() {
  // Read the two primary numerical inputs for the problem.
  const requiredN = dataInputProcessor.extractNextValue(); // Represents 'N'
  const targetM = dataInputProcessor.extractNextValue();   // Represents 'M'

  // Robust input validation: Check for non-numeric or missing inputs.
  if (requiredN === null || targetM === null || isNaN(requiredN) || isNaN(targetM) ||
      !Number.isInteger(requiredN) || !Number.isInteger(targetM)) {
      console.error("Error: Invalid or missing integer input for N or M. Please provide valid numbers.");
      return 0; // Indicate an error state, or could throw an exception.
  }
  // Problem constraints often imply positive integers. Handle non-positive inputs.
  if (requiredN <= 0 || targetM <= 0) {
      console.warn(`Warning: Inputs N=${requiredN} or M=${targetM} are not positive. Returning 0.`);
      return 0;
  }

  // A Set is used to efficiently store all unique factors of M.
  // Using a Set avoids storing duplicate factors (e.g., for M=36, sqrt(M)=6, 6*6=36).
  const uniqueFactorsOfM = new Set();
  
  // Optimized loop to find all divisors of targetM.
  // We only need to iterate up to the square root of targetM.
  // If 'i' divides targetM, then 'targetM / i' also divides targetM.
  for (let candidateDivisor = 1; candidateDivisor * candidateDivisor <= targetM; candidateDivisor++) {
    // Check if 'candidateDivisor' is a perfect divisor of 'targetM'.
    if (targetM % candidateDivisor === 0) {
      // Add the current candidate divisor.
      uniqueFactorsOfM.add(candidateDivisor);
      // Add its complementary divisor (M / candidateDivisor).
      uniqueFactorsOfM.add(targetM / candidateDivisor);
    }
  }

  let largestSatisfyingFactor = 0; // Initialize the result. 1 is always a factor, so 0 is a safe initial low value.

  // Iterate through all identified factors of M to find the one that meets the criteria.
  // Convert Set to Array for easier iteration if needed, but Set is iterable directly.
  for (const currentFactor of uniqueFactorsOfM) {
    // The problem condition is: currentFactor divides targetM (which is guaranteed by how uniqueFactorsOfM is built)
    // AND (targetM / currentFactor) must be greater than or equal to requiredN.
    const calculatedQuotient = targetM / currentFactor;

    if (calculatedQuotient >= requiredN) {
      // If this factor satisfies the condition, check if it's the largest one found so far.
      if (currentFactor > largestSatisfyingFactor) {
        largestSatisfyingFactor = currentFactor;
      }
    }
  }

  // The final answer is the largest factor that met both conditions.
  return largestSatisfyingFactor;
}

// Execute the main problem-solving function and output its result to the console.
console.log(executeSolution());