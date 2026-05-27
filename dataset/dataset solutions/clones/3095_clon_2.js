"use strict";

/**
 * A specialized utility class designed for parsing textual input data.
 * It facilitates reading values sequentially from a multi-line string,
 * with an option to apply a type conversion function to each extracted token.
 *
 * @param {string} sourceTextContent - The complete string content to be parsed, typically from a file.
 * @param {Function} valueTransformationFunction - An optional function to convert parsed tokens (e.g., Number, String).
 */
function DataInputParser(sourceTextContent, valueTransformationFunction) {
  // Internally stores the input string, broken down into an array of individual lines.
  this._sourceLinesArray = sourceTextContent.split("\n");
  // Keeps track of the current token's index within the active line.
  this._currentTokenIndex = 0;
  // Maintains the index of the current line being processed.
  this._currentLineNumber = 0;
  // The function used to transform extracted string tokens into their desired data type.
  // Defaults to the global Number constructor if no specific function is provided.
  this._tokenConverter = valueTransformationFunction || Number;
}

/**
 * Extracts and returns the next available token from the input stream.
 * This method automatically advances the internal pointers to prepare for the subsequent read.
 *
 * @returns {*} The next token, after being processed by the configured transformation function,
 *              or `undefined` if there are no more tokens left to parse.
 */
DataInputParser.prototype.fetchNextToken = function() {
  // Retrieve the string content of the current line being examined.
  let currentLineString = this._sourceLinesArray[this._currentLineNumber];

  // If the current line is empty or we've exhausted all lines, there's nothing more to read.
  if (!currentLineString) {
    return;
  }

  // Trim leading/trailing whitespace from the line and split it into an array of tokens using space as a delimiter.
  let lineTokensArray = currentLineString.trim().split(" ");
  // Select the token corresponding to the current token index.
  let extractedTokenString = lineTokensArray[this._currentTokenIndex];

  // Increment the token index to point to the next token for future calls.
  this._currentTokenIndex++;

  // Check if all tokens on the current line have been consumed.
  if (lineTokensArray.length === this._currentTokenIndex) {
    // If so, reset the token index and move to the next line.
    this._currentTokenIndex = 0;
    this._currentLineNumber++;
  }

  // Apply the configured transformation function to the extracted token string and return the result.
  return this._tokenConverter(extractedTokenString);
};

/**
 * Reads all tokens from the current line, applies the transformation function to each,
 * and then advances the parser to the subsequent line.
 *
 * @returns {Array<*>} An array containing all transformed tokens from the current line,
 *                     or `undefined` if there are no more lines to process.
 */
DataInputParser.prototype.readAllLineTokens = function() {
  // Obtain the full string content of the current line.
  let entireLineContent = this._sourceLinesArray[this._currentLineNumber];

  // If the current line is empty or we've run out of lines, return nothing.
  if (!entireLineContent) {
    return;
  }

  // When reading an entire line, the column index is effectively reset.
  this._currentTokenIndex = 0;
  // Advance the line number to move to the next line for subsequent operations.
  this._currentLineNumber++;

  // Split the line by spaces and use the token converter to map each string token to its desired type.
  return entireLineContent.split(" ").map(this._tokenConverter);
};

// Make the DataInputParser class available for import in other modules.
module.exports = DataInputParser;

/**
 * The primary execution function that orchestrates the input processing logic.
 * This function reads a single character and outputs its DNA base complement.
 *
 * @param {string} rawInputData - The raw string data received from the input source.
 */
function executeMainProcessing(rawInputData) {
  // Instantiate the parser, configuring it to treat all extracted tokens as strings.
  const inputReader = new DataInputParser(rawInputData, String);

  // Fetch the very first token (which is expected to be a single DNA base character).
  const dnaBaseChar = inputReader.fetchNextToken();

  // Output the complementary DNA base character to the console.
  // The object acts as a lookup table for base complements.
  console.log({
    A: "T", // Adenine's complement is Thymine.
    C: "G", // Cytosine's complement is Guanine.
    G: "C", // Guanine's complement is Cytosine.
    T: "A"  // Thymine's complement is Adenine.
  }[dnaBaseChar]); // Use the input character as a key to retrieve its complement.
}

// Invoke the main processing function, feeding it data read synchronously from standard input.
executeMainProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
