"use strict";

// This class assists in parsing structured textual input by lines and tokens.
function InputProcessor(initialContent, tokenParserFunction) {
  this._sourceLines = initialContent.split("\n"); // Storage for input data, split by newline characters.
  this._tokenIndex = 0; // Current index within the tokens of the current line.
  this._lineIndex = 0; // Current line number being processed.
  this._parserFunc = tokenParserFunction || parseInt; // Function to convert string tokens to desired data types (e.g., Number, parseInt).
}

InputProcessor.prototype.obtainNextVal = function () {
  var currentLineStr = this._sourceLines[this._lineIndex]; // Retrieve the current line from the source.
  if (!currentLineStr) {
    return; // If no more lines, return undefined.
  }

  var lineParts = currentLineStr.trim().split(" "); // Trim whitespace and split the line into individual tokens.
  var currentToken = lineParts[this._tokenIndex]; // Get the token at the current token index.
  this._tokenIndex++; // Advance to the next token.

  if (lineParts.length === this._tokenIndex) {
    // If all tokens on the current line have been consumed:
    this._tokenIndex = 0; // Reset token index for the next line.
    this._lineIndex++; // Move to the subsequent line.
  }

  return this._parserFunc(currentToken); // Parse the token and return its value.
};

InputProcessor.prototype.acquireLineTokens = function () {
  var currentLine = this._sourceLines[this._lineIndex]; // Fetch the entire current line.
  if (!currentLine) {
    return; // If no line is available, return undefined.
  }

  this._tokenIndex = 0; // Reset token index as this method consumes the whole line.
  this._lineIndex++; // Advance to the next line.

  return currentLine.split(" ").map(this._parserFunc); // Split the line into tokens, parse each, and return as an array.
};

// A comment about a potentially useful function, though not directly used in this script.
// function generate2DArray(rows, columns, defaultValue) { var matrix = []; for (var r = 0; r < rows; r++) { var row = []; for (var c = 0; c < columns; c++) row.push(defaultValue); matrix.push(row); } return matrix; }

const PRIME_MOD = 998244353; // Defines a large prime modulus for arithmetic operations.

function processInputData(rawDataStr) {
  var inputHandler = new InputProcessor(rawDataStr); // Instantiate an input handler for the raw data.

  var itemCount = inputHandler.obtainNextVal(); // Read the first value, which indicates the number of following data items.
  var dataValues = []; // An array to hold the sequence of data items.
  for (var k = 0; k < itemCount; k++) {
    dataValues.push(inputHandler.obtainNextVal()); // Populate the array by reading subsequent values.
  }

  var aggregateSum = dataValues.reduce((accumulator, currentVal) => accumulator + currentVal, 0); // Compute the total sum of all data values.

  var totalCombinations = 1; // Initialize a counter for total possibilities.
  for (var k = 0; k < itemCount; k++) {
    totalCombinations = (totalCombinations * 3) % PRIME_MOD; // Calculate (3^itemCount) modulo PRIME_MOD.
  }

  var resultPartOne = 0; // Placeholder for the first part of the final result.

  var currentDPState = [1]; // Initialize the dynamic programming array for the first set of calculations.

  // Loop through each data value to update the DP states.
  for (var k = 1; k <= itemCount; k++) {
    var nextDPState = Array(currentDPState.length + dataValues[k - 1]).fill(0); // Create a new DP array, sized dynamically.
    for (var m = 0; m < currentDPState.length; m++) {
      nextDPState[m] = (nextDPState[m] + currentDPState[m] * 2) % PRIME_MOD; // Apply DP transition rule 1.

      var targetSum = m + dataValues[k - 1]; // Calculate a potential new sum.
      if (targetSum <= aggregateSum) {
        nextDPState[targetSum] = (nextDPState[targetSum] + currentDPState[m]) % PRIME_MOD; // Apply DP transition rule 2.
      }
    }
    currentDPState = nextDPState; // Update the current DP state for the next iteration.
  }

  // Sum up relevant values from the final currentDPState array for resultPartOne.
  for (var m = Math.ceil(aggregateSum / 2); m <= aggregateSum; m++) {
    resultPartOne = (resultPartOne + currentDPState[m]) % PRIME_MOD;
  }

  var resultPartTwo = 0; // Placeholder for the second part of the final result.

  // Perform a second set of DP calculations if the aggregate sum is an even number.
  if (aggregateSum % 2 === 0) {
    var oddEvenDPState = [1]; // Initialize DP array for the even sum scenario.
    oddEvenDPState[0] = 1; // Explicitly set the base case.

    // Iterate through data values to build up the second DP state.
    for (var k = 1; k <= itemCount; k++) {
      var nextOddEvenDPState = Array(oddEvenDPState.length + 1).fill(0); // Create a new DP array for this stage.
      for (var m = 0; m < oddEvenDPState.length; m++) {
        nextOddEvenDPState[m] = (nextOddEvenDPState[m] + oddEvenDPState[m]) % PRIME_MOD; // Apply DP transition rule 1.

        var targetSum = m + dataValues[k - 1]; // Calculate a potential new sum.
        if (targetSum <= aggregateSum) {
          nextOddEvenDPState[targetSum] = (nextOddEvenDPState[targetSum] + oddEvenDPState[m]) % PRIME_MOD; // Apply DP transition rule 2.
        }
      }
      oddEvenDPState = nextOddEvenDPState; // Update the DP state.
    }

    resultPartTwo = oddEvenDPState[aggregateSum / 2]; // Extract the specific value for resultPartTwo.
  }

  // Calculate the final answer using all derived components, ensuring positivity.
  let finalResult = (totalCombinations - resultPartOne * 3 + resultPartTwo * 3) % PRIME_MOD;
  finalResult = (finalResult + PRIME_MOD) % PRIME_MOD;

  console.log(finalResult); // Output the computed final result.
}

// Read input from standard I/O (e.g., from a file via redirection) and initiate processing.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));