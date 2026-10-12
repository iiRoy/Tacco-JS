"use strict";

// This utility class is designed to parse input strings,
// treating them as a sequence of lines and tokens.
function InputParser(sourceText, defaultConverter) {
  // The input string is split into an array of individual lines.
  this._sourceLines = sourceText.split("\n");
  // Tracks the current token's position within the active line.
  this._columnIndex = 0;
  // Tracks the current line being processed.
  this._lineIndex = 0;
  // The default function used to convert token strings to their desired type (e.g., Number).
  this._valueConverter = defaultConverter || Number;
}

// Method to retrieve the next available token from the input stream.
InputParser.prototype.getNextToken = function(customConverter) {
  // Fetch the content of the current line.
  var currentLineContent = this._sourceLines[this._lineIndex];

  // Proceed only if the current line exists.
  if (currentLineContent) {
    // Clean leading/trailing whitespace and split the line into an array of tokens.
    var lineTokens = currentLineContent.trim().split(" ");
    // Extract the token at the current column index.
    var tokenValue = lineTokens[this._columnIndex];

    // Advance the column index for the next token read.
    this._columnIndex++;

    // If all tokens on the current line have been consumed,
    // reset the column index and move to the subsequent line.
    if (lineTokens.length === this._columnIndex) {
      this._columnIndex = 0;
      this._lineIndex++;
    }

    // Convert the token value using either a provided custom converter or the instance's default converter.
    return customConverter ? customConverter(tokenValue) : this._valueConverter(tokenValue);
  }
};

// Method to read all tokens from the current line and advance to the next line.
InputParser.prototype.readCurrentLine = function(lineTokenMapper) {
  // Retrieve the full content of the current line.
  var lineData = this._sourceLines[this._lineIndex];

  // Proceed only if the current line exists.
  if (lineData) {
    // Reset the column index as a new line is being read entirely.
    this._columnIndex = 0;
    // Advance to the next line.
    this._lineIndex++;
    // Split the line into tokens and apply a mapping function (either custom or default converter) to each.
    return lineData.split(" ").map(lineTokenMapper || this._valueConverter);
  }
};

// Make the InputParser class available for other modules.
module.exports = InputParser;

// The primary function orchestrating the problem's solution.
function executeSolution(inputString) {
  // Instantiate the parser with the raw input string.
  var parserInstance = new InputParser(inputString);

  // Read the first numerical value from the input.
  var firstInputNumber = parserInstance.getNextToken();
  // Read the second numerical value from the input.
  var secondInputNumber = parserInstance.getNextToken();

  // Conditional logic based on the second input number.
  if (secondInputNumber === 0) {
    // Initialize an array to store the resulting sequence.
    var outputArray = [];
    // Calculate the upper limit for the sequence generation, which is 2 raised to the power of the first input number.
    var upperBound = Math.pow(2, firstInputNumber);

    // Populate the array with numbers from 0 up to (upperBound - 1).
    for (var loopCounter = 0; loopCounter < upperBound; loopCounter++) {
      outputArray.push(loopCounter);
    }

    // Append numbers to the array in reverse order, from (upperBound - 1) down to 0.
    for (var loopCounter = upperBound - 1; loopCounter >= 0; loopCounter--) {
      outputArray.push(loopCounter);
    }

    // Output the generated sequence, with elements joined by spaces.
    console.log(outputArray.join(" "));
  } else {
    // If the second input number is not 0, print "-1" as per problem specification.
    console.log("-1");
  }
}

// Execute the solution by reading input from the standard input stream.
executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
