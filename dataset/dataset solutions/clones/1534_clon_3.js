// --- Input/Output Handling Utilities ---
// This section manages reading input lines and processing them.

const LINE_READER_INSTANCE = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataProcessor = null; // Will hold an instance of InputLineParser
const collectedInputLines = []; // Stores all lines read from stdin

// Event listener for each line of input
LINE_READER_INSTANCE.on('line', (incomingLine) => {
  collectedInputLines.push(incomingLine);
});

// Event listener for when the input stream closes
LINE_READER_INSTANCE.on('close', () => {
  // Initialize the input data handler once all lines are collected
  inputDataProcessor = new InputLineParser(collectedInputLines);
  console.error('\n--- Input Processing Complete, Executing Solution ---');
  executeSolution(); // Start the main program logic
});

/**
 * A utility class to manage and parse input lines.
 * Provides methods to check for available input and retrieve tokens.
 */
class InputLineParser {
  constructor(rawLines) {
    if (!Array.isArray(rawLines) || rawLines.length === 0) {
      console.warn("Warning: No input lines provided to InputLineParser.");
      this.sourceLines = [];
      this.totalLinesCount = 0;
    } else {
      this.sourceLines = rawLines;
      this.totalLinesCount = rawLines.length;
    }
    this.currentLineIndex = 0; // Pointer to the current line being processed
  }

  /**
   * Checks if there are more lines available for processing.
   * @returns {boolean} True if more lines exist, false otherwise.
   */
  hasMoreTokens() {
    return this.currentLineIndex < this.totalLinesCount;
  }

  /**
   * Retrieves the next available input line and advances the pointer.
   * Throws an error if no more input is available.
   * @returns {string} The next input line.
   */
  getNextToken() {
    if (this.hasMoreTokens()) {
      return this.sourceLines[this.currentLineIndex++];
    } else {
      // Custom error for out-of-bounds access
      throw new Error('InputBufferEmptyException: No more input lines available.');
    }
  }
}

/**
 * Retrieves the next input token and attempts to parse it as an integer.
 * @returns {number} The parsed integer value.
 */
function readInteger() {
  const nextRawToken = getNextToken();
  return parseInputString(nextRawToken, 1); // 1 for integer parsing
}

/**
 * Retrieves the next raw input token from the input processor.
 * @returns {string} The next raw input string.
 */
function getNextToken() {
  // Ensure the input processor is initialized before use
  if (!inputDataProcessor) {
    throw new Error("Input processor not initialized. Cannot read tokens.");
  }
  return inputDataProcessor.getNextToken();
}

/**
 * Displays a value to standard output, followed by a newline.
 * @param {*} outputValue The value to be displayed.
 */
function displayOutput(outputValue) {
  console.log(outputValue);
}

/**
 * Converts an input string based on the specified conversion type.
 * @param {string|Array} inputToken The string or array to convert/process.
 * @param {number} conversionType The type of conversion to apply:
 *   1: Parse as integer (parseInt).
 *   2: Split string by spaces into a string array.
 *   4: Split string by spaces and map to numbers (integer array).
 *   6: Split string into individual characters (character array).
 *   7: Split string into individual characters and map to numbers (integer array from digits).
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements with no separator.
 * @returns {*} The converted value.
 */
function parseInputString(inputToken, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputToken, 10); // Always specify radix for parseInt
      case 2:
        return inputToken.split(' ');
      case 4:
        return inputToken.split(' ').map(Number);
      case 6:
        return inputToken.split('');
      case 7:
        return inputToken.split('').map(Number);
      case 8:
        // This case assumes inputToken is an array
        return Array.isArray(inputToken) ? inputToken.join(' ') : String(inputToken);
      case 9:
        // This case assumes inputToken is an array
        return Array.isArray(inputToken) ? inputToken.join('\n') : String(inputToken);
      case 0:
        // This case assumes inputToken is an array
        return Array.isArray(inputToken) ? inputToken.join('') : String(inputToken);
      default:
        return inputToken; // Return input as is if conversion type is unknown
    }
  } catch (conversionError) {
    console.error(`Error during input token conversion (type ${conversionType}, token: "${inputToken}"): ${conversionError.message}`);
    return inputToken; // Fallback to returning original token on error
  }
}

// --- Main Program Logic ---

const MAX_SUM_CONSTRAINT = 2001; // Defines the maximum sum value for array sizing.

/**
 * Executes the core solution logic for the problem.
 * This function calculates the number of ways to form a sum 'desiredSumValue'
 * using only integers 3 or greater.
 */
function executeSolution() {
  const desiredSumValue = readInteger(); // Read the target sum from input

  // Pre-check for invalid or trivial input sums
  if (desiredSumValue < 3) {
    displayOutput(0); // Cannot form a sum less than 3 using numbers >= 3
    return;
  }
  if (desiredSumValue > MAX_SUM_CONSTRAINT) {
    console.warn(`Warning: Desired sum (${desiredSumValue}) exceeds maximum supported constraint (${MAX_SUM_CONSTRAINT}). Results may be inaccurate.`);
    // For this problem, usually MAX_SUM_CONSTRAINT is a hard limit for array size.
    // If the problem implies larger sums, the array size would need to be dynamic.
    // We'll proceed with the fixed size array.
  }

  // Initialize dynamic programming table.
  // waysToAchieveSum[k] will store the number of ways to form sum 'k'.
  // We add 1 to MAX_SUM_CONSTRAINT to handle 0-based indexing up to MAX_SUM_CONSTRAINT.
  const waysToAchieveSum = new Array(MAX_SUM_CONSTRAINT + 1).fill(0);

  const MODULUS_CONSTANT = 1000000007; // Constant for modulo operations

  // The problem is to find the number of ways to compose a sum N
  // using integers >= 3.
  // Let dp[i] be the number of ways to form sum i.
  // Base cases:
  // dp[0], dp[1], dp[2] are 0 as we can only use numbers >= 3.
  // dp[3] = 1 (using [3])

  // Iterate through all possible sums from 3 up to the desired sum
  for (let currentIterationSum = 3; currentIterationSum <= desiredSumValue; currentIterationSum++) {
    // One way to form `currentIterationSum` is by taking `currentIterationSum` itself as a single segment.
    // (e.g., for sum 3, one way is [3])
    waysToAchieveSum[currentIterationSum]++;

    // Now, consider forming `currentIterationSum` by appending a segment of length >= 3
    // to a previously formed sum `innerLoopSum`.
    // If `innerLoopSum` is a sum that can be formed, and `currentIterationSum - innerLoopSum` is
    // a valid segment (i.e., >= 3), then we add `waysToAchieveSum[innerLoopSum]` to `waysToAchieveSum[currentIterationSum]`.
    // This means `innerLoopSum` must be at least 3, and `currentIterationSum - innerLoopSum` must be at least 3.
    // So, `innerLoopSum <= currentIterationSum - 3`.
    for (let innerLoopSum = 3; innerLoopSum <= currentIterationSum - 3; innerLoopSum++) {
      // Add the ways to form `innerLoopSum` to the current sum's total.
      // This represents forming `currentIterationSum` by taking a sum `innerLoopSum`
      // and appending another segment of length `(currentIterationSum - innerLoopSum)`.
      waysToAchieveSum[currentIterationSum] += waysToAchieveSum[innerLoopSum];

      // Apply modulo to prevent integer overflow, keeping the result within the required range.
      const intermediateResult = waysToAchieveSum[currentIterationSum] % MODULUS_CONSTANT;
      waysToAchieveSum[currentIterationSum] = intermediateResult;
    }
  }

  // Output the final calculated number of ways for the desired sum
  displayOutput(waysToAchieveSum[desiredSumValue]);
}