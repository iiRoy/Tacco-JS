"use strict";

/**
 * @class TextParser
 * @description A utility class to facilitate reading data (tokens and lines)
 *              from a multi-line string input source. It maintains internal
 *              pointers to track the current position within the text.
 * @param {string} sourceText The complete raw input string, typically containing multiple lines.
 * @param {function} parseFn The function used to convert string tokens into a specific data type.
 *                           Defaults to `parseInt` if not provided, suitable for integer inputs.
 */
function TextParser(sourceText, parseFn) {
  // Store the input string, split into an array where each element is a line.
  this.textLines = sourceText.split("\n");
  // Initialize the index for the current token (column) within the active line.
  this.currentTokenIndex = 0;
  // Initialize the index for the current line being processed.
  this.currentLineIndex = 0;
  // Assign the provided parsing function, or default to parseInt for numerical conversion.
  this.valueParser = parseFn || parseInt;
}

/**
 * @method readNextToken
 * @memberof TextParser.prototype
 * @description Retrieves the next single token from the input stream.
 *              It advances the internal token pointer and, if necessary, the line pointer.
 * @returns {any|undefined} The parsed value of the token, or `undefined` if no more tokens are left.
 */
TextParser.prototype.readNextToken = function() {
  // Fetch the content of the current line based on the line index.
  let currentLineContent = this.textLines[this.currentLineIndex];

  // If there's no content for the current line (end of input), return nothing.
  if (!currentLineContent) {
    return;
  }

  // Trim leading/trailing whitespace from the line and then split it into an array of string tokens.
  let lineParts = currentLineContent.trim().split(" ");
  // Extract the specific token at the current token index.
  let extractedToken = lineParts[this.currentTokenIndex];

  // Increment the token index to prepare for the subsequent read operation.
  this.currentTokenIndex++;

  // Check if all tokens on the current line have been processed.
  if (lineParts.length === this.currentTokenIndex) {
    // If so, reset the token index and move to the next line.
    this.currentTokenIndex = 0;
    this.currentLineIndex++;
  }

  // Parse the extracted string token using the configured parser function and return the result.
  return this.valueParser(extractedToken);
};

/**
 * @method readLineTokens
 * @memberof TextParser.prototype
 * @description Reads and parses all tokens from the current line, returning them as an array.
 *              This method then automatically advances to the next line.
 * @returns {Array<any>|undefined} An array of parsed tokens from the current line, or `undefined` if no more lines.
 */
TextParser.prototype.readLineTokens = function() {
  // Obtain the full string content of the current line.
  let activeLineString = this.textLines[this.currentLineIndex];

  // If the line content is undefined, it means we've reached the end of the input.
  if (!activeLineString) {
    return;
  }

  // Reset the token index for the current line, as the entire line is being consumed.
  this.currentTokenIndex = 0;
  // Advance the line index to point to the next line, as the current one is fully processed.
  this.currentLineIndex++;

  // Split the line into string tokens and then use the `valueParser` to convert each token
  // into its desired data type, returning the array of parsed values.
  return activeLineString.split(" ").map(this.valueParser);
};

// Export the TextParser class so it can be utilized by other modules.
module.exports = TextParser;


/**
 * @function processChallenge
 * @description The primary function responsible for executing the problem-solving logic.
 *              It reads two numbers (a limit and a target), computes all divisors
 *              of the target number, and then identifies the largest divisor
 *              that satisfies a specific condition related to the limit.
 * @param {string} challengeInput The raw string data provided for the challenge.
 */
function processChallenge(challengeInput) {
  // Instantiate the TextParser to manage reading numerical values from the input.
  const parserInstance = new TextParser(challengeInput);

  // Read the first two integer values from the parsed input.
  // `limitValue` typically represents a constraint or an upper bound.
  const limitValue = parserInstance.readNextToken();
  // `targetNumber` is the integer for which divisors need to be found.
  const targetNumber = parserInstance.readNextToken();

  // Initialize an array to store the factors (divisors) of the `targetNumber`.
  const factorList = [];

  // Efficiently find divisors up to the square root of `targetNumber`.
  // For every `idx` that divides `targetNumber`, `idx` is a factor.
  for (let idx = 1; idx <= Math.sqrt(targetNumber); idx++) {
    if (targetNumber % idx === 0) {
      factorList.push(idx);
    }
  }

  // Iterate backwards through the already found factors to identify their complementary factors.
  // If `d` is a factor of `M`, then `M/d` is also a factor. This loop adds the larger
  // complementary factors that were not caught in the first loop (e.g., if `M = 36`, `idx = 2`, `M/idx = 18`).
  for (let idx = factorList.length - 1; idx >= 0; idx--) {
    const complementaryFactor = targetNumber / factorList[idx];
    // Add the complementary factor only if it is distinct and larger than
    // the largest factor currently in the list. This prevents duplicates (for perfect squares)
    // and ensures the list remains somewhat ordered for the final check.
    if (complementaryFactor > factorList[factorList.length - 1]) {
      factorList.push(complementaryFactor);
    }
  }

  // Initialize a variable to hold the largest factor that meets the defined criteria.
  let largestFactor = 1;

  // Traverse the complete list of factors to find the one satisfying the condition.
  for (let idx = 0; idx < factorList.length; idx++) {
    // The condition is: `targetNumber / currentFactor >= limitValue`.
    // This is equivalent to finding the largest `currentFactor` such that `currentFactor <= targetNumber / limitValue`.
    if (targetNumber / factorList[idx] >= limitValue) {
      // If the current factor satisfies the condition, update `largestFactor`.
      // Due to the way factors are added (smaller ones first, then larger complementary ones),
      // this loop will correctly identify the largest qualifying factor.
      largestFactor = factorList[idx];
    }
  }

  // Output the final computed largest factor to the standard console.
  console.log(largestFactor);
}


// Invoke the main challenge processing function.
// It reads the input from the standard input stream (`/dev/stdin`) using Node.js's
// file system module, ensuring the content is interpreted as UTF-8 text.
processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));