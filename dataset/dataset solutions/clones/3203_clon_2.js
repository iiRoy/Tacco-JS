"use strict";

// This class helps in parsing input strings line by line and token by token.
function InputProcessor(sourceText, parserFn) {
  this._srcTxt = sourceText; // The complete input string.
  this._colIdx = 0; // Current token index within the current line.
  this._lineIdx = 0; // Current line index.
  this._parseFunc = parserFn || Number; // Function to parse tokens (defaults to Number).
}

InputProcessor.prototype.getNextValue = function () {
  let currentLine = this._srcTxt.split("\n")[this._lineIdx];
  if (!currentLine) {
    return; // No more lines to process.
  }

  let tokenParts = currentLine.trim().split(" ");
  let currentTok = tokenParts[this._colIdx];
  this._colIdx++;

  // If all tokens on the current line are consumed, reset column index and move to the next line.
  if (tokenParts.length === this._colIdx) {
    this._colIdx = 0;
    this._lineIdx++;
  }

  return this._parseFunc(currentTok);
};

InputProcessor.prototype.getLineValues = function () {
  let activeLine = this._srcTxt.split("\n")[this._lineIdx];
  this._colIdx = 0; // Reset token index for the new line.
  this._lineIdx++; // Move to the next line.
  return activeLine.split(" ").map(this._parseFunc);
};

// Main processing function for the problem.
function processInputData(rawData) {
  const dataStream = new InputProcessor(rawData);

  const countArray = Array(4).fill(0); // Initialize an array of four zeros.

  // Loop three times to read pairs of values.
  for (let idx = 0; idx < 3; idx++) {
    let valA = dataStream.getNextValue();
    let valB = dataStream.getNextValue();
    countArray[valA - 1]++; // Increment count for the first value.
    countArray[valB - 1]++; // Increment count for the second value.
  }

  // Sort the counts and check if they match the expected pattern.
  if (countArray.sort((first, second) => first - second).join(" ") === "1 1 2 2") {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
