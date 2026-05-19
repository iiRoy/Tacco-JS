"use strict";

/**
 * A utility class for parsing input data line by line and token by token.
 * @param {string} sourceText - The entire input string, typically from a file.
 * @param {function} [parserFunction=Number] - The default function to parse tokens.
 */
function InputProcessor(sourceText, parserFunction) {
  // Store all lines from the input string.
  this._sourceLines = sourceText.split("\n");
  // Current token index within the current line.
  this._currentColumn = 0;
  // Current line index.
  this._currentLine = 0;
  // Default parsing function, defaults to Number if not provided.
  this._valueParser = parserFunction || Number;
}

/**
 * Retrieves the next token from the input stream.
 * Advances the internal pointers.
 * @param {function} [customParser] - An optional parser function for this specific token.
 * @returns {*} The parsed token.
 */
InputProcessor.prototype.getNextToken = function(customParser) {
  // Get the content of the current line.
  var currentLineContent = this._sourceLines[this._currentLine];

  // If the current line exists (not end of input).
  if (currentLineContent) {
    // Split the line into individual tokens.
    var lineTokens = currentLineContent.trim().split(" ");
    // Get the token at the current column.
    var currentToken = lineTokens[this._currentColumn];

    // Move to the next column.
    this._currentColumn++;

    // If we've processed all tokens on the current line, reset column and move to next line.
    if (lineTokens.length === this._currentColumn) {
      this._currentColumn = 0;
      this._currentLine++;
    }

    // Parse the token using the custom parser or the default parser.
    return customParser ? customParser(currentToken) : this._valueParser(currentToken);
  }
};

/**
 * Retrieves all tokens from the current line as an array.
 * Advances the internal line pointer.
 * @param {function} [lineParser] - An optional parser function for each token in the line.
 * @returns {Array<*>} An array of parsed tokens from the line.
 */
InputProcessor.prototype.getLineTokens = function(lineParser) {
  var lineData = this._sourceLines[this._currentLine];
  if (lineData) {
    // Reset column pointer as we're consuming the whole line.
    this._currentColumn = 0;
    // Move to the next line.
    this._currentLine++;
    // Split the line and map each token using the provided parser or the default one.
    return lineData.split(" ").map(lineParser || this._valueParser);
  }
};

// Export the InputProcessor class for use in other modules.
module.exports = InputProcessor;

/**
 * Main function to process the input data and perform calculations.
 * @param {string} rawData - The raw input string.
 */
function processData(rawData) {
  // Initialize the input processor with the raw data.
  var dataStream = new InputProcessor(rawData);

  // Read the total number of operations to perform.
  var operationCount = dataStream.getNextToken();

  // Initialize a running total for offsets.
  var totalOffset = 0;
  // Initialize an array to store values that need to be sorted.
  var valueCollection = [];

  // Loop through each operation.
  for (var opIndex = 0; opIndex < operationCount; opIndex++) {
    // Read the type of the current operation.
    var operationType = dataStream.getNextToken();

    // If operation type is 1, it's an insertion.
    if (operationType === 1) {
      // Read the new value to insert.
      var newValue = dataStream.getNextToken();
      // Read the offset value to add to the total.
      var offsetValue = dataStream.getNextToken();

      // Accumulate the offset.
      totalOffset += offsetValue;

      // Add the new value to the collection.
      valueCollection.push(newValue);
    } else {
      // If operation type is not 1, it's a query.
      // Sort the collection of values in ascending order.
      valueCollection = valueCollection.sort((valA, valB) => valA - valB);

      // Calculate the median value from the sorted collection.
      // For even length, it takes the lower of the two middle elements.
      var medianValue = valueCollection[Math.floor((valueCollection.length - 1) / 2)];

      // Calculate the sum of absolute differences from the median,
      // then add the accumulated total offset.
      var finalResult = valueCollection
        .map(element => Math.abs(element - medianValue)) // Calculate absolute difference for each element.
        .reduce((accumulator, currentElement) => accumulator + currentElement) // Sum all differences.
        + totalOffset; // Add the total offset.

      // Output the median value and the final calculated result.
      console.log(medianValue, finalResult);
    }
  }
}

// Read input from standard input and pass it to the main processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
