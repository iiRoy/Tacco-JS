"use strict";

// Defines a utility class for parsing input data line by line and token by token.
function InputProcessor(sourceContent, valueConverter) {
  // Stores the input string split into an array of lines.
  this._sourceLines = sourceContent.split("\n");
  // Tracks the current token index within the current line.
  this._currentColumnIndex = 0;
  // Tracks the current line index in the _sourceLines array.
  this._currentLineIndex = 0;
  // The function used to convert parsed tokens (e.g., String, Number).
  this._conversionFunction = valueConverter || Number;
}

// Prototype method to read the next token from the input stream.
InputProcessor.prototype.readNextToken = function() {
  // Get the current line from the source lines array.
  let currentLineText = this._sourceLines[this._currentLineIndex];

  // If there's no more content on this line or no more lines, return undefined.
  if (!currentLineText) {
    return;
  }

  // Trim whitespace and split the line into individual tokens.
  let lineTokens = currentLineText.trim().split(" ");
  // Get the token at the current column index.
  let extractedToken = lineTokens[this._currentColumnIndex];

  // Move to the next token for the subsequent read.
  this._currentColumnIndex++;

  // If all tokens on the current line have been read, reset column index and advance to the next line.
  if (lineTokens.length === this._currentColumnIndex) {
    this._currentColumnIndex = 0;
    this._currentLineIndex++;
  }

  // Convert and return the extracted token using the specified conversion function.
  return this._conversionFunction(extractedToken);
};

// Prototype method to read all tokens on the current line as an array.
InputProcessor.prototype.readAllTokensOnLine = function() {
  // Get the current line's content.
  let activeLineContent = this._sourceLines[this._currentLineIndex];

  // If the line is empty or undefined, return.
  if (!activeLineContent) {
    return;
  }

  // Reset the column index as we're consuming the whole line.
  this._currentColumnIndex = 0;
  // Advance to the next line.
  this._currentLineIndex++;

  // Split the line by spaces, then map each token using the conversion function.
  return activeLineContent.split(" ").map(this._conversionFunction);
};

/**
 * Main function to solve the problem.
 * It calculates the minimum number of changes required to make a sequence of '#' and '.' characters
 * into a sequence where all '#' come before all '.'.
 *
 * @param {string} problemData - The raw input string containing problem data.
 */
function executeSolution(problemData) {
  // Initialize an input data handler with the raw problem data, expecting string tokens.
  const dataHandler = new InputProcessor(problemData, String);

  // Read the first number (N, though not explicitly used in this specific problem logic, it's common).
  const totalElements = Number(dataHandler.readNextToken());
  // Read the character sequence string.
  const characterSequence = dataHandler.readNextToken();

  // Initialize counters for white ('.') and black ('#') characters.
  let whiteCharCount = 0;
  let blackCharCount = 0;

  // First pass: Count initial white characters.
  // This represents the cost if we convert all '#' to '.' (i.e., no '#' at all).
  for (let charPosition = 0; charPosition < characterSequence.length; charPosition++) {
    if (characterSequence[charPosition] === ".") {
      whiteCharCount += 1;
    }
  }

  // Initialize the minimum cost with the initial white character count.
  // This is the cost if we make all characters '.' (no '#'s).
  let minimumCost = whiteCharCount;

  // Second pass: Iterate through the sequence, simulating the "split point" between '#' and '.'.
  // For each position, we assume all characters to the left are '#' and all to the right are '.'.
  for (let currentPosition = 0; currentPosition < characterSequence.length; currentPosition++) {
    // If the current character is '#', it means it's on the "left" side (should be '#').
    // So, we increment blackCharCount (cost to keep it '#').
    if (characterSequence[currentPosition] === "#") {
      blackCharCount += 1;
    }
    // If the current character is '.', it means it's on the "left" side (should be '#').
    // So, we decrement whiteCharCount (cost to convert it to '#').
    else {
      whiteCharCount -= 1;
    }

    // The current cost is the sum of:
    // - blackCharCount: number of '#'s encountered so far (which should be '#'s).
    // - whiteCharCount: number of '.'s remaining to the right (which should be '.'s).
    // We want to minimize (blackCharCount + whiteCharCount).
    if (blackCharCount + whiteCharCount < minimumCost) {
      minimumCost = blackCharCount + whiteCharCount;
    }
  }

  // Output the calculated minimum number of changes.
  console.log(minimumCost);
}

// Read input from standard input and pass it to the main solution function.
executeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
