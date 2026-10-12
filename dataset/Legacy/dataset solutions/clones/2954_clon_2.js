"use strict";

// Defines a utility class for parsing input strings line by line and token by token.
function InputProcessor(sourceText, parserFunc) {
  // Stores the input string split into an array of lines.
  this._sourceLines = sourceText.split("\n");
  // Tracks the current token index within the current line.
  this._currentColumn = 0;
  // Tracks the current line index.
  this._currentLine = 0;
  // The default function to parse tokens, defaults to Number.
  this._valueParser = parserFunc || Number;
}

// Prototype method to read the next single value from the input.
InputProcessor.prototype.readNextValue = function(customParser) {
  // Get the current line.
  var currentLineContent = this._sourceLines[this._currentLine];
  // Check if the line exists.
  if (currentLineContent) {
    // Trim whitespace and split the line into tokens.
    var tokensOnLine = currentLineContent.trim().split(" ");
    // Get the token at the current column.
    var nextToken = tokensOnLine[this._currentColumn];
    // Increment the column index.
    this._currentColumn++;
    // If all tokens on the current line have been read, reset column and advance to the next line.
    if (tokensOnLine.length === this._currentColumn) {
      this._currentColumn = 0;
      this._currentLine++;
    }
    // Parse the token using the provided custom parser or the default parser.
    return customParser ? customParser(nextToken) : this._valueParser(nextToken);
  }
};

// Prototype method to read all values from the current line.
InputProcessor.prototype.readLineValues = function(lineParser) {
  // Get the current line.
  var currentLineContent = this._sourceLines[this._currentLine];
  // Check if the line exists.
  if (currentLineContent) {
    // Reset the column index for the new line.
    this._currentColumn = 0;
    // Advance to the next line.
    this._currentLine++;
    // Split the line into tokens and map them using the provided parser or the default parser.
    return currentLineContent.split(" ").map(lineParser || this._valueParser);
  }
};

// Export the InputProcessor class for use in other modules.
module.exports = InputProcessor;

// Main function to process the input data.
function processInputData(rawData) {
  // Create a new instance of the input processor.
  var dataHandler = new InputProcessor(rawData);

  // Read the single numeric value from the input.
  var numericValue = dataHandler.readNextValue();
  // Calculate the first two digits (representing a year or month).
  var firstPart = Math.floor(numericValue / 100);
  // Calculate the last two digits (representing a year or month).
  var secondPart = numericValue % 100;

  // Check if the first part could be a month (1-12).
  if (firstPart <= 12 && firstPart >= 1) {
    // If the first part is a valid month, check the second part.
    if (secondPart <= 12 && secondPart >= 1) {
      // Both parts are valid months, so it's ambiguous.
      console.log("AMBIGUOUS");
    } else {
      // Only the first part is a valid month, second part is not, so MMYY.
      console.log("MMYY");
    }
  }
  // If the first part is not a valid month, check if the second part could be.
  else if (secondPart <= 12 && secondPart >= 1) {
    // Only the second part is a valid month, so YYMM.
    console.log("YYMM");
  }
  // If neither part is a valid month.
  else {
    // Not applicable.
    console.log("NA");
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
