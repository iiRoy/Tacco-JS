var INPUT_PARSER = (function () {
  // This function serves as the entry point for creating an InputReader instance.
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // The InputReader class handles parsing input text line by line.
  function InputReader(rawInputString) {
    // Store the input string, split into an array of lines, after trimming whitespace.
    this._sourceLines = rawInputString.trim().split('\n');
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  // Prototype method to read a single token from the current line.
  InputReader.prototype.readToken = function (returnAsString) {
    var lineArray = this._sourceLines;
    var linePosition = this._currentLineIndex;
    var extractedToken;

    // If the current line hasn't been processed into tokens yet, do so.
    if (typeof lineArray[linePosition] === 'string') {
      lineArray[linePosition] = lineArray[linePosition].split(' ').reverse();
    }

    // Pop the last token from the (reversed) array.
    extractedToken = lineArray[linePosition].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineArray[linePosition].length) {
      this._currentLineIndex++;
    }

    // Return the token as a string or a number based on the 'returnAsString' flag.
    return returnAsString ? extractedToken : +extractedToken;
  };

  // Prototype method to read an entire line and split it into tokens.
  InputReader.prototype.readLineTokens = function (returnAsString) {
    // Get the current line, then advance the line index.
    var tokensOnLine = this._sourceLines[this._currentLineIndex++].split(' ');

    // Return tokens as strings or convert them to numbers.
    return returnAsString ? tokensOnLine : tokensOnLine.map(item => +item);
  };

  // Prototype method to read 'numLines' lines as a matrix (array of arrays of tokens).
  InputReader.prototype.readMatrix = function (numLines, returnAsString) {
    // Extract the specified number of lines and split each into tokens.
    var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(item => item.split(' '));

    // Return the matrix as strings or convert all elements to numbers.
    return returnAsString ? matrixData : matrixData.map(row => row.map(element => +element));
  };

  // Prototype method to read 'numLines' raw lines without splitting them.
  InputReader.prototype.readRawLines = function (numLines, returnAsString) {
    // Extract the specified number of lines.
    var rawLineData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);

    // Return lines as strings or convert them to numbers.
    return returnAsString ? rawLineData : rawLineData.map(item => +item);
  };

  return createParser;
})();

// Initialize the input parser with data read from standard input.
var inputData = INPUT_PARSER(require('fs').readFileSync('/dev/stdin', 'utf8'));

// Helper function to create multi-dimensional arrays.
function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    evalString = `Array(args[--argCount]).fill(0).map(_ignored => { return ${initialValue}; })`;

  while (--argCount) {
    evalString = `Array(args[argCount]).fill(0).map(_ignored => ${evalString})`;
  }
  return eval(evalString);
}

// Output the result of the main processing function.
console.log(processInput());

// Main function to solve the problem.
function processInput() {
  // Read the total number of elements.
  var totalElements = inputData.readToken();
  // Read the array of elements.
  var elementArray = inputData.readLineTokens();

  // Sort the array in ascending numerical order.
  elementArray.sort((valA, valB) => valA - valB);

  // Initialize the output lines array. The first element is the negation of the smallest number.
  var outputLines = [-elementArray[0]];

  // Sum the absolute values of all elements (except the first) into the first output line.
  for (var idx = 1; idx < totalElements; idx++) {
    outputLines[0] += Math.abs(elementArray[idx]);
  }

  // Initialize a running sum variable with the smallest element.
  var currentSum = elementArray[0];

  // Iterate through the array, excluding the first and last elements.
  for (var loopCounter = 1; loopCounter < totalElements - 1; loopCounter++) {
    // Skip negative numbers in this phase.
    if (elementArray[loopCounter] < 0) {
      continue;
    }

    var currentOutputLength = outputLines.length;

    // If this is the first operation after the initial sum.
    if (currentOutputLength === 1) {
      // Add a new line representing the subtraction of the current element from the smallest.
      outputLines.push(elementArray[0] + ' ' + elementArray[loopCounter]);
      // Update the running sum.
      currentSum = elementArray[0] - elementArray[loopCounter];
    } else {
      // For subsequent operations, subtract the current element from the running sum.
      outputLines.push(currentSum + ' ' + elementArray[loopCounter]);
      // Update the running sum.
      currentSum -= elementArray[loopCounter];
    }
  }

  // Add the last element's operation to the output.
  outputLines.push(elementArray[totalElements - 1] + ' ' + currentSum);
  // Update the running sum with the last element.
  currentSum = elementArray[totalElements - 1] - currentSum;

  // Continue adding operations until the output lines count matches the total elements.
  for (var loopCounter = 1; outputLines.length !== totalElements; loopCounter++) {
    var currentOutputLength = outputLines.length; // This variable is not strictly needed here but matches original structure.
    // Add a new line representing the subtraction of the current element from the running sum.
    outputLines.push(currentSum + ' ' + elementArray[loopCounter]);
    // Update the running sum.
    currentSum -= elementArray[loopCounter];
  }

  // Join all output lines with newline characters and return the result.
  return outputLines.join('\n');
}
