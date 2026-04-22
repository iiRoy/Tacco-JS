const inputReaderFactory = (function() {
  /**
   * Internal utility function to safely convert a string to a number.
   * If the string cannot be converted to a valid number, it is returned as-is.
   * This prevents `NaN` from propagating unexpectedly.
   * @param {string} valueToParse - The string value to attempt numeric conversion on.
   * @returns {string|number} The numeric representation or the original string.
   */
  const tryParseNumeric = (valueToParse) => {
    const numericForm = Number(valueToParse);
    // Check if the conversion yielded a valid, non-NaN number.
    if (!isNaN(numericForm)) {
      return numericForm;
    }
    return valueToParse;
  };

  /**
   * Factory function to create an instance of the InputProcessor.
   * @param {string} rawInputContent - The complete input as a single string.
   * @returns {InputProcessor} An object capable of parsing the input.
   */
  function createInputReader(rawInputContent) {
    return new InputProcessor(rawInputContent);
  }

  /**
   * @class InputProcessor
   * Manages the state and operations for sequential reading of tokens and lines from input.
   */
  function InputProcessor(rawInputContent) {
    // Stores all input lines, trimmed and split by newline characters.
    // Each element is initially a raw string line.
    this.lineBuffer = rawInputContent.trim().split("\n");
    // Keeps track of the current line being processed.
    this.currentLineIndex = 0;
  }

  /**
   * Extracts the next single token (space-separated value) from the input.
   * It processes the current line from left to right. Once a line is exhausted,
   * it automatically moves to the next line.
   * @param {boolean} [returnAsString=false] - If true, the token is returned as a string.
   *   Otherwise, it attempts to convert the token to a number.
   * @returns {string|number|undefined} The extracted token, or `undefined` if no more input.
   */
  InputProcessor.prototype.readNextToken = function(returnAsString = false) {
    // Guard clause: Check if all lines have been processed.
    if (this.currentLineIndex >= this.lineBuffer.length) {
      return undefined; // Signifies end of input.
    }

    let activeLineTokens = this.lineBuffer[this.currentLineIndex];

    // If the current line is still a string, it means it hasn't been tokenized yet.
    // Split it by spaces and reverse the array so `pop()` effectively extracts tokens
    // from the beginning of the logical line.
    if (typeof activeLineTokens === "string") {
      this.lineBuffer[this.currentLineIndex] = activeLineTokens.split(" ").reverse();
      activeLineTokens = this.lineBuffer[this.currentLineIndex];
    }

    // Extract the next token from the end of the reversed array.
    const extractedToken = activeLineTokens.pop();

    // If the current line (token array) is now empty, advance to the next line.
    if (activeLineTokens.length === 0) {
      this.currentLineIndex++;
    }

    // Return the token, applying numeric conversion if `returnAsString` is false.
    return returnAsString ? extractedToken : tryParseNumeric(extractedToken);
  };

  /**
   * Reads an entire line from the input, splits it into tokens, and advances the line pointer.
   * @param {boolean} [keepAsStrings=false] - If true, tokens are returned as strings.
   *   Otherwise, they are converted to numbers where possible.
   * @returns {Array<string|number>} An array of tokens from the read line. Returns an empty array if no more lines.
   */
  InputProcessor.prototype.readLineTokens = function(keepAsStrings = false) {
    // Guard clause: Ensure there are lines left to read.
    if (this.currentLineIndex >= this.lineBuffer.length) {
      return []; // No more lines, return an empty array.
    }

    // Get the raw line string and immediately increment the line index for the next read.
    const rawLine = this.lineBuffer[this.currentLineIndex++];
    const tokensArray = rawLine.split(" ");

    // Apply numeric conversion to each token if `keepAsStrings` is false.
    return keepAsStrings ? tokensArray : tokensArray.map(tryParseNumeric);
  };

  /**
   * Reads a specified number of consecutive lines, splitting each into tokens.
   * Advances the line pointer by the `numberOfLines` consumed.
   * @param {number} numberOfLines - The count of lines to read. Must be a positive integer.
   * @param {boolean} [outputAsStrings=false] - If true, tokens are returned as strings.
   *   Otherwise, they are converted to numbers where possible.
   * @returns {Array<Array<string|number>>} A 2D array, where each inner array represents a line's tokens.
   *   Returns an empty array if `numberOfLines` is invalid or no lines are available.
   */
  InputProcessor.prototype.readMultipleLinesAsTokens = function(numberOfLines, outputAsStrings = false) {
    // Input validation: Ensure a valid positive integer for line count.
    if (numberOfLines <= 0 || !Number.isInteger(numberOfLines)) {
      console.warn(`Warning: Invalid numberOfLines (${numberOfLines}) provided to readMultipleLinesAsTokens. Must be a positive integer.`);
      return [];
    }

    // Extract the relevant slice of lines from the buffer.
    const linesToProcess = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
    // Update the internal line index after reading.
    this.currentLineIndex += numberOfLines;

    // Map each raw line string to an array of its space-separated tokens.
    const tokenizedLines = linesToProcess.map(line => line.split(" "));

    // If numeric conversion is required, iterate through the 2D array to convert each token.
    if (!outputAsStrings) {
      return tokenizedLines.map(line => line.map(tryParseNumeric));
    }
    return tokenizedLines;
  };

  /**
   * Reads a specified number of raw lines without splitting them into tokens.
   * Advances the line pointer by the `numberOfLines` consumed.
   * @param {number} numberOfLines - The count of raw lines to read. Must be a positive integer.
   * @param {boolean} [returnRawStrings=false] - If true, lines are returned as raw strings.
   *   Otherwise, it attempts to convert each entire line string to a number.
   * @returns {Array<string|number>} An array containing the raw line strings or their numeric equivalents.
   *   Returns an empty array if `numberOfLines` is invalid or no lines are available.
   */
  InputProcessor.prototype.readMultipleRawLines = function(numberOfLines, returnRawStrings = false) {
    // Input validation: Ensure a valid positive integer for line count.
    if (numberOfLines <= 0 || !Number.isInteger(numberOfLines)) {
      console.warn(`Warning: Invalid numberOfLines (${numberOfLines}) provided to readMultipleRawLines. Must be a positive integer.`);
      return [];
    }
    
    // Extract the specified range of lines from the buffer.
    const extractedLines = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
    // Update the line index.
    this.currentLineIndex += numberOfLines;

    // Return raw strings or attempt numeric conversion for each line.
    return returnRawStrings ? extractedLines : extractedLines.map(tryParseNumeric);
  };

  /**
   * Checks if there are any remaining lines to be read in the input buffer.
   * @returns {boolean} True if there are more lines, false otherwise.
   */
  InputProcessor.prototype.hasMoreLines = function() {
    return this.currentLineIndex < this.lineBuffer.length;
  };

  return createInputReader;
})();

// Instantiate the input parser by reading the entire content of standard input.
// This is a common pattern in competitive programming to quickly consume all input.
const standardInputParser = inputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary problem-solving function and output its result.
console.log(checkArrayDivisibilityByFour());

/**
 * Determines if an array of integers can be rearranged such that the product of
 * any two adjacent elements is divisible by 4.
 *
 * The core logic relies on categorizing numbers by their remainder when divided by 4:
 * - Numbers 0 mod 4 (e.g., 4, 8, 12): Can be adjacent to any other number.
 * - Numbers 2 mod 4 (e.g., 2, 6, 10): Can be adjacent to other 2 mod 4 numbers or 0 mod 4 numbers.
 *   (2 * 2 = 4, 2 * 6 = 12, 2 * 4 = 8). They cannot be adjacent to odd numbers.
 * - Odd numbers (1 or 3 mod 4, e.g., 1, 3, 5): Must be adjacent to a 0 mod 4 number.
 *   They cannot be adjacent to other odd numbers (odd * odd = odd), nor to 2 mod 4 numbers (odd * 2 mod 4 = 2 mod 4).
 *
 * @returns {string} "Yes" if such an arrangement is possible, "No" otherwise.
 */
function checkArrayDivisibilityByFour() {
  const POSITIVE_OUTCOME = "Yes";
  const NEGATIVE_OUTCOME = "No";
  const DIVISIBILITY_MODULO = 4;

  // Read the total count of numbers in the array.
  const totalElements = standardInputParser.readNextToken();
  // Read the array of numbers for processing.
  const inputNumbers = standardInputParser.readLineTokens();

  // --- Input Validation (Added for robustness, often implicit in competitive programming) ---
  if (totalElements !== inputNumbers.length) {
      console.error(`Error: Declared element count (${totalElements}) does not match actual array length (${inputNumbers.length}).`);
      return NEGATIVE_OUTCOME;
  }
  if (totalElements < 0) {
      console.error(`Error: Total number of elements (${totalElements}) cannot be negative.`);
      return NEGATIVE_OUTCOME;
  }
  // If the array is empty, it trivially satisfies the condition.
  if (totalElements === 0) {
      return POSITIVE_OUTCOME;
  }
  // --- End Input Validation ---

  // Initialize an array to categorize numbers based on their remainder modulo DIVISIBILITY_MODULO.
  // [0]: Count of numbers (1 mod 4) or (3 mod 4) - effectively, odd numbers.
  // [1]: Count of numbers (2 mod 4).
  // [2]: Count of numbers (0 mod 4) - effectively, multiples of 4.
  const remainderCategoryCounts = [0, 0, 0];

  // Populate the category counts by iterating through the input numbers.
  for (let elementIndex = 0; elementIndex < totalElements; elementIndex++) {
    const currentRemainder = inputNumbers[elementIndex] % DIVISIBILITY_MODULO;
    if (currentRemainder === 0) {
      remainderCategoryCounts[2]++; // Category 0 mod 4
    } else if (currentRemainder === 2) {
      remainderCategoryCounts[1]++; // Category 2 mod 4
    } else {
      remainderCategoryCounts[0]++; // Category 1 or 3 mod 4 (odd)
    }
  }

  // Assign descriptive names to the counts for clarity.
  const countOfOddNumbers = remainderCategoryCounts[0];
  const countOfTwoModFourNumbers = remainderCategoryCounts[1];
  const countOfZeroModFourNumbers = remainderCategoryCounts[2];

  /**
   * Helper function encapsulating the core logic for checking divisibility possibility.
   * This is a direct translation of the original problem's specific conditions.
   */
  const evaluateDivisibilityPossibility = (numTotal, numOdds, numTwos, numFours) => {
    // Condition 1: If all numbers in the array are of the form '2 mod 4'.
    // In this specific scenario, any product of two such numbers (e.g., 2*2=4, 2*6=12)
    // will always be divisible by 4.
    if (numTotal === numTwos) {
      return POSITIVE_OUTCOME;
    }

    // Condition 2: General case for mixed numbers.
    // The problem's solution typically involves ensuring that every odd number
    // can be "buffered" by a multiple of 4.
    // The original code's logic, after analysis, simplifies to:
    // If there are multiples of 4 (numFours > 0) AND the count of odd numbers
    // is less than or equal to the count of multiples of 4 (numOdds <= numFours).
    // This condition implies that there are enough '0 mod 4' numbers to separate
    // all 'odd' numbers, plus potentially one more '0 mod 4' number to act as a buffer.
    if (numFours > 0) {
        if (numOdds <= numFours) {
            return POSITIVE_OUTCOME;
        }
    } else { // Case where there are no multiples of 4 (numFours === 0).
        // If there are no '0 mod 4' numbers, and there are 'odd' numbers,
        // it's impossible to satisfy the condition (as odd numbers need a '0 mod 4' neighbor).
        // The only exception (all '2 mod 4' numbers) is handled by Condition 1.
        if (numOdds > 0) {
            return NEGATIVE_OUTCOME;
        }
        // If numFours === 0 and numOdds === 0, then all numbers must be '2 mod 4'.
        // This case would have already returned POSITIVE_OUTCOME from Condition 1.
        // So, this 'else' branch effectively only leads to NEGATIVE_OUTCOME if numOdds > 0.
    }
    
    // If neither of the above conditions for "Yes" is met, then it's not possible.
    return NEGATIVE_OUTCOME;
  };

  // Execute the core logic with the calculated counts.
  return evaluateDivisibilityPossibility(
    totalElements,
    countOfOddNumbers,
    countOfTwoModFourNumbers,
    countOfZeroModFourNumbers
  );
}