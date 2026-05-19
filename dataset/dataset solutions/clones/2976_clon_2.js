"use strict";

// This constructor function initializes an input processing utility.
// It takes raw text data and an optional parsing function.
function InputProcessor(textData, parserFunction) {
  // Stores the input text, split into individual lines.
  this.sourceLines = textData.split("\n");
  // Keeps track of the current token's position within the current line.
  this.currentColumn = 0;
  // Keeps track of the current line being processed.
  this.currentLine = 0;
  // The default function used to parse tokens if no custom one is provided.
  this.defaultParser = parserFunction || Number;
}

// Prototype method to read and return the next available token from the input.
InputProcessor.prototype.readNextToken = function(customParser) {
  // Get the content of the current line.
  var lineContent = this.sourceLines[this.currentLine];

  // Proceed only if the current line exists.
  if (lineContent) {
    // Trim whitespace and split the line into an array of tokens.
    var tokensOnLine = lineContent.trim().split(" ");
    // Retrieve the token at the current column index.
    var currentToken = tokensOnLine[this.currentColumn];

    // Advance the column pointer to the next token.
    this.currentColumn++;

    // If all tokens on the current line have been read, reset column and move to the next line.
    if (tokensOnLine.length === this.currentColumn) {
      this.currentColumn = 0;
      this.currentLine++;
    }

    // Parse the token using the provided custom parser or the default parser.
    return customParser ? customParser(currentToken) : this.defaultParser(currentToken);
  }
};

// Prototype method to read and parse all tokens from the entire next line.
InputProcessor.prototype.readNextLine = function(lineParser) {
  // Get the raw text of the current line.
  var currentLineText = this.sourceLines[this.currentLine];

  // Proceed only if the current line exists.
  if (currentLineText) {
    // Reset the column pointer as we are reading a full line.
    this.currentColumn = 0;
    // Advance the line pointer to the next line.
    this.currentLine++;

    // Split the line into tokens and apply the provided line parser or the default parser to each.
    return currentLineText.split(" ").map(lineParser || this.defaultParser);
  }
};

// Export the InputProcessor class for use in other modules.
module.exports = InputProcessor;

// The primary function that orchestrates the input processing and calculation.
function processInput(rawData) {
  // Create a new instance of the input handler with the provided raw data.
  var dataHandler = new InputProcessor(rawData);

  // Read the first numerical value from the input stream.
  var firstNumber = dataHandler.readNextToken();
  // Read the second numerical value from the input stream.
  var secondNumber = dataHandler.readNextToken();

  // Perform a calculation and output the result to the console.
  console.log(firstNumber - secondNumber + 1);
}

// Read the input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
