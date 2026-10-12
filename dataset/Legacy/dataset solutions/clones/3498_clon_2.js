"use strict";

/**
 * A utility class for parsing input data from a string.
 * It allows reading tokens one by one or entire lines of tokens.
 */
function InputProcessor(sourceString, parsingFunction) {
  // Store the input string, split into individual lines.
  this._sourceLines = sourceString.split("\n");
  // Initialize the current column index within the current line.
  this._currentColumn = 0;
  // Initialize the current line index.
  this._currentLine = 0;
  // Set the function to use for parsing each token, defaults to Number.
  this._parseFunction = parsingFunction || Number;
}

/**
 * Reads and returns the next token from the input.
 * Tokens are separated by spaces within a line.
 * It advances the internal pointers to the next token.
 * @returns {any} The parsed value of the next token.
 */
InputProcessor.prototype.readNextToken = function () {
  // Get the content of the current line.
  let currentLineContent = this._sourceLines[this._currentLine];

  // If the line is empty or undefined, there's nothing to read.
  if (!currentLineContent) {
    return;
  }

  // Trim whitespace and split the line into individual tokens.
  let lineTokens = currentLineContent.trim().split(" ");
  // Get the token at the current column index.
  let currentTokenValue = lineTokens[this._currentColumn];

  // Advance the column pointer.
  this._currentColumn++;

  // If all tokens on the current line have been read,
  // reset the column pointer and advance to the next line.
  if (lineTokens.length === this._currentColumn) {
    this._currentColumn = 0;
    this._currentLine++;
  }

  // Parse and return the token value using the specified parsing function.
  return this._parseFunction(currentTokenValue);
};

/**
 * Reads and returns all tokens from the current line as an array.
 * It advances the internal pointer to the next line.
 * @returns {Array<any>} An array of parsed token values from the current line.
 */
InputProcessor.prototype.readLineTokens = function () {
  // Get the content of the current line.
  let currentLineContent = this._sourceLines[this._currentLine];

  // If the line is empty or undefined, there's nothing to read.
  if (!currentLineContent) {
    return;
  }

  // Reset the column pointer as we're consuming the whole line.
  this._currentColumn = 0;
  // Advance to the next line.
  this._currentLine++;

  // Split the line by spaces, parse each token, and return the array.
  return currentLineContent.split(" ").map(this._parseFunction);
};

// Export the InputProcessor class for use in other modules.
module.exports = InputProcessor;

/**
 * The main function that processes the input data to find a specific divisor.
 * @param {string} rawData The raw input string containing N and M.
 */
function processInputData(rawData) {
  // Create a new parser instance for the input data.
  const dataParser = new InputProcessor(rawData);

  // Read the first two numbers from the input.
  // N represents the target quotient minimum.
  const targetValue = dataParser.readNextToken();
  // M represents the number for which we need to find divisors.
  const limitNumber = dataParser.readNextToken();

  // Initialize an array to store the divisors of M.
  const factorList = [];

  // Find divisors up to the square root of M.
  // This efficiently finds one half of the divisor pairs.
  for (let idx = 1; idx <= Math.sqrt(limitNumber); idx++) {
    // If 'idx' divides 'limitNumber' evenly, it's a divisor.
    if (limitNumber % idx === 0) {
      factorList.push(idx);
    }
  }

  // Iterate through the already found divisors in reverse order
  // to find their complementary divisors (M / divisor).
  // This ensures that the factorList remains sorted if M is not a perfect square.
  for (let idx = factorList.length - 1; idx >= 0; idx--) {
    const complementaryFactor = limitNumber / factorList[idx];
    // Add the complementary factor only if it's greater than the last factor already in the list.
    // This prevents adding duplicates when M is a perfect square (e.g., for M=36, sqrt=6, 6*6=36, 6 is added once).
    if (complementaryFactor > factorList[factorList.length - 1]) {
      factorList.push(complementaryFactor);
    }
  }

  // Initialize a variable to store the greatest factor that satisfies the condition.
  let greatestFactor = 1;

  // Iterate through the complete list of divisors.
  // Find the largest divisor 'd' such that M / d is greater than or equal to N.
  for (let idx = 0; idx < factorList.length; idx++) {
    // Check the condition: M divided by the current divisor must be at least N.
    if (limitNumber / factorList[idx] >= targetValue) {
      // If the condition is met, update 'greatestFactor' to the current divisor.
      // Since the factorList is sorted, this will eventually find the largest such divisor.
      greatestFactor = factorList[idx];
    }
  }

  // Output the final greatest factor found.
  console.log(greatestFactor);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
