var InputParserFactory = (function () {
  // This function creates a new parser instance.
  function createParser(sourceString) {
    return new InputReader(sourceString);
  }

  // The main reader class for processing input lines.
  function InputReader(sourceString) {
    // Store the input string as an array of trimmed lines.
    this._sourceLines = sourceString.trim().split("\n");
    // Initialize the current line index.
    this._currentLineIndex = 0;
  }

  // Method to read a single token from the current line.
  // If 'asString' is true, returns the token as a string; otherwise, as a number.
  InputReader.prototype.readNextToken = function (asString) {
    let currentLineArray = this._sourceLines;
    let linePointer = this._currentLineIndex;
    let resultToken;

    // If the current line hasn't been split into tokens yet, do it.
    if (typeof currentLineArray[linePointer] === "string") {
      currentLineArray[linePointer] = currentLineArray[linePointer].split(" ").reverse();
    }

    // Pop the last token (which is the first in original order due to reverse).
    resultToken = currentLineArray[linePointer].pop();

    // If the line is now empty, advance to the next line.
    if (!currentLineArray[linePointer].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the 'asString' flag.
    return asString ? resultToken : +resultToken;
  };

  // Method to read all tokens from the current line.
  // If 'asString' is true, returns tokens as strings; otherwise, as numbers.
  InputReader.prototype.readLineTokens = function (asString) {
    let lineContent = this._sourceLines[this._currentLineIndex++];
    let tokens = lineContent.split(" ");
    // Map to numbers if not requested as strings.
    return asString ? tokens : tokens.map(token => +token);
  };

  // Method to read a matrix of 'numRows' rows.
  // If 'asString' is true, returns string matrix; otherwise, number matrix.
  InputReader.prototype.readMatrix = function (numRows, asString) {
    let matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    let parsedMatrix = matrixRows.map(row => row.split(" "));
    // Map inner arrays to numbers if not requested as strings.
    return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
  };

  // Method to read 'numRows' raw lines.
  // If 'asString' is true, returns raw strings; otherwise, numbers.
  InputReader.prototype.readRawLines = function (numRows, asString) {
    let rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    // Map to numbers if not requested as strings.
    return asString ? rawLines : rawLines.map(line => +line);
  };

  return createParser;
})();

// Initialize the input data parser by reading from standard input.
var inputData = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays.
function multiDimArray(defaultValue) {
  var args = arguments,
    argCount = args.length,
    resultString = "Array(args[" + --argCount + "]).fill(defaultValue)";
  while (--argCount) {
    resultString = "Array(args[" + argCount + "]).fill(0).map(x=>" + resultString + ")";
  }
  return eval(resultString);
}

// Define a prime divisor for modular arithmetic operations.
var primeDivisor = 1e9 + 7;

// Function for modular multiplication of multiple arguments.
function multiplyModulo() {
  var operands = arguments,
    currentResult = operands[0],
    idx = 1;
  while (idx < operands.length) {
    // Optimized modular multiplication to prevent overflow before modulo.
    currentResult = ((currentResult >> 16) * operands[idx] % primeDivisor * 65536 + (currentResult & 65535) * operands[idx++]) % primeDivisor;
  }
  return currentResult;
}

// Output the result of the main computation.
console.log(computeResult());

// Main function containing the core logic.
function computeResult() {
  // Read the number of items.
  var itemCount = inputData.readNextToken();
  // Read the initial value.
  var initialValue = inputData.readNextToken();
  // Read the list of divisors and sort them in descending order.
  var sortedDivisors = inputData.readLineTokens().sort((valA, valB) => valB - valA);

  // Initialize a dictionary (hash map) to store current states and their counts.
  // The key is the current value, and the value is its count.
  var currentStates = {};
  currentStates[initialValue] = 1; // Start with the initial value having a count of 1.

  // Iterate through each divisor.
  for (var itemIdx = 0; itemIdx < itemCount; itemIdx++) {
    // Create a new dictionary for the next set of states.
    var nextStates = {};

    // Iterate over the current states.
    for (var stateKey in currentStates) {
      // Convert the string key back to a number.
      stateKey = +stateKey;

      // Calculate the count for not using the current divisor.
      // This state remains the same, but its count is multiplied by (itemCount - itemIdx - 1)
      // because there are that many remaining items that could be chosen instead.
      if (nextStates[stateKey]) {
        nextStates[stateKey] += currentStates[stateKey] * (itemCount - itemIdx - 1);
        nextStates[stateKey] %= primeDivisor;
      } else {
        nextStates[stateKey] = currentStates[stateKey] * (itemCount - itemIdx - 1) % primeDivisor;
      }

      // Calculate the remainder when the current stateKey is divided by the current divisor.
      var remainderVal = stateKey % sortedDivisors[itemIdx];

      // Add the count of the current state to the remainder state.
      // This represents using the current divisor.
      if (nextStates[remainderVal]) {
        nextStates[remainderVal] += currentStates[stateKey];
        nextStates[remainderVal] %= primeDivisor;
      } else {
        nextStates[remainderVal] = currentStates[stateKey];
      }
    }
    // Update the current states for the next iteration.
    currentStates = nextStates;
  }

  // Calculate the final answer by summing up (value * count) for all final states.
  var finalSum = 0;
  for (itemIdx in currentStates) { // Reusing itemIdx as a loop variable.
    itemIdx = +itemIdx; // Convert key to number.
    finalSum += multiplyModulo(itemIdx, currentStates[itemIdx]);
  }

  // Return the final sum modulo primeDivisor.
  return finalSum % primeDivisor;
}
