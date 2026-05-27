var INPUT_PARSER = (function() {
  // This factory function creates an instance of the DataProcessor.
  function createParser(inputString) {
    return new DataProcessor(inputString);
  }

  // The DataProcessor constructor initializes the input source and line pointer.
  function DataProcessor(inputString) {
    this._sourceLines = inputString.trim().split("\n"); // Stores the input as an array of lines.
    this._currentLineIndex = 0; // Points to the current line being processed.
  }

  // Reads a single value from the current line. Values are treated as a stack (LIFO).
  // If the current line is exhausted, it advances to the next line.
  DataProcessor.prototype.readNextValue = function(returnAsString) {
    var linesArray = this._sourceLines;
    var linePointer = this._currentLineIndex;
    var extractedItem;

    // If the current line hasn't been processed (split and reversed) yet, do it.
    if (typeof linesArray[linePointer] === "string") {
      linesArray[linePointer] = linesArray[linePointer].split(" ").reverse();
    }

    extractedItem = linesArray[linePointer].pop(); // Get the last element (which was the first in original order).

    // If the current line is now empty, move to the subsequent line.
    if (!linesArray[linePointer].length) {
      this._currentLineIndex++;
    }

    // Return the item as a string or convert it to a number.
    return returnAsString ? extractedItem : +extractedItem;
  };

  // Reads an entire line of space-separated values.
  DataProcessor.prototype.readLineValues = function(returnAsString) {
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or convert all elements to numbers.
    return returnAsString ? lineContent : lineContent.map(element => +element);
  };

  // Reads 'numRows' lines, treating each as a row of space-separated values, forming a matrix.
  DataProcessor.prototype.readMatrix = function(numRows, returnAsString) {
    var matrixData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
    // Return as string arrays or convert all elements in the matrix to numbers.
    return returnAsString ? matrixData : matrixData.map(row => row.map(element => +element));
  };

  // Reads 'numRows' lines as individual, non-space-separated values.
  DataProcessor.prototype.readRows = function(numRows, returnAsString) {
    var rowData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    // Return as strings or convert all elements to numbers.
    return returnAsString ? rowData : rowData.map(element => +element);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// This utility function dynamically creates a multi-dimensional array.
// The dimensions are passed as subsequent arguments after the initial value.
function createMultiDimArray(initialValue) {
  var args = arguments;
  var dimensionCount = args.length;
  // Start building the array creation code from the innermost dimension.
  var arrayCreationCode = "Array(args[" + --dimensionCount + "]).fill(0).map(_ => { return " + initialValue + "; })";

  // Wrap the code for each preceding dimension.
  while (--dimensionCount) {
    arrayCreationCode = "Array(args[" + dimensionCount + "]).fill(0).map(_ => " + arrayCreationCode + ")";
  }
  // Execute the generated code to create the array.
  return eval(arrayCreationCode);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

// The primary function containing the problem's logic.
function solveProblem() {
  var arraySize = inputReader.readNextValue(); // Read the integer N.
  var dataSequence = inputReader.readLineValues(); // Read the sequence S of N integers.
  var maxSum = 0; // Variable to store the maximum sum found.
  var halfSize = arraySize >> 1; // Calculate N/2 using bit shift for efficiency.

  // Outer loop iterates through possible step values (i) from 1 up to N/2 - 1.
  for (var stepValue = 1; stepValue < halfSize; stepValue++) {
    var visitedIndices = new Set(); // A set to track indices already used in the current 'stepValue' iteration.
    var currentSum = 0; // Accumulator for the sum in the current 'stepValue' iteration.

    // Inner loop iterates through indices 'j' starting from 'stepValue',
    // incrementing by 'stepValue', and stopping before 'N - stepValue'.
    for (var currentIndex = stepValue; currentIndex < arraySize - stepValue; currentIndex += stepValue) {
      var complementaryIndex = arraySize - currentIndex - 1; // Calculate the symmetric index.

      // Check for conditions to break the inner loop:
      // 1. If either 'currentIndex' or 'complementaryIndex' has already been processed in this 'stepValue' iteration.
      // 2. If 'currentIndex' and 'complementaryIndex' are the same (implies it's the middle element, which shouldn't be paired with itself in this context).
      if (visitedIndices.has(currentIndex) || visitedIndices.has(complementaryIndex) || currentIndex === complementaryIndex) {
        break;
      }

      // Add the values from the data sequence at the current and complementary indices to 'currentSum'.
      currentSum += dataSequence[currentIndex] + dataSequence[complementaryIndex];

      // Update 'maxSum' if the 'currentSum' is greater.
      if (maxSum < currentSum) {
        maxSum = currentSum;
      }

      // Mark both indices as visited for the current 'stepValue' iteration.
      visitedIndices.add(currentIndex);
      visitedIndices.add(complementaryIndex);
    }
  }
  return maxSum; // Return the final maximum sum found.
}
