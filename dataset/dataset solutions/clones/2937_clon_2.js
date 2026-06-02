var INPUT_PARSER = (function () {
  // This function serves as the entry point for creating an input reader instance.
  function createParser(inputString) {
    return new InputReader(inputString);
  }

  // The main constructor for our input reading utility.
  function InputReader(rawInput) {
    this._sourceLines = rawInput.trim().split("\n"); // Store input as an array of lines.
    this._currentLineIndex = 0; // Keep track of the current line being processed.
  }

  // Prototype method to extract a single value from the current line.
  InputReader.prototype.readSingleValue = function (asStrings) {
    var currentLines = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been split into parts yet, do so and reverse for easy popping.
    if (typeof currentLines[lineIdx] === "string") {
      currentLines[lineIdx] = currentLines[lineIdx].split(" ").reverse();
    }

    extractedValue = currentLines[lineIdx].pop(); // Get the last item from the current line's parts.

    // If the current line is now empty, advance to the next line.
    if (!currentLines[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value as a string or a number based on the 'asStrings' flag.
    return asStrings ? extractedValue : +extractedValue;
  };

  // Prototype method to read an entire line of values.
  InputReader.prototype.readLineValues = function (asStrings) {
    // Get the current line, split it by spaces, and then advance the line index.
    var lineParts = this._sourceLines[this._currentLineIndex++].split(" ");

    // Return the parts as strings or convert them to numbers.
    return asStrings ? lineParts : lineParts.map((item) => +item);
  };

  // Prototype method to read a matrix (2D array) of values.
  InputReader.prototype.readMatrix = function (numLines, asStrings) {
    // Extract 'numLines' lines, split each by space, and advance the line index.
    var resultData = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((line) => line.split(" "));

    // Return the matrix as strings or convert all elements to numbers.
    return asStrings
      ? resultData
      : resultData.map((row) => row.map((item) => +item));
  };

  // Prototype method to read a specified number of lines as a flat array.
  InputReader.prototype.readLinesAsArray = function (numLines, asStrings) {
    // Extract 'numLines' lines and advance the line index.
    var resultData = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );

    // Return the array as strings or convert all elements to numbers.
    return asStrings ? resultData : resultData.map((item) => +item);
  };

  return createParser; // Expose the factory function.
})();

// Initialize the input reader by reading from standard input.
var inputReaderInstance = INPUT_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Helper function to generate multi-dimensional arrays (not used in main logic, but cloned).
function generateMultiDimArray(initialValue) {
  var dimensions = arguments,
    dimCount = dimensions.length,
    arrayCreationString =
      "Array(dimensions[" +
      --dimCount +
      "]).fill(0).map(x=>{return " +
      initialValue +
      ";})";
  while (--dimCount)
    arrayCreationString =
      "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  return eval(arrayCreationString);
}

// Output the result of the main processing function.
console.log(processData());

// The core logic of the program.
function processData() {
  var numElements = inputReaderInstance.readSingleValue(); // Read the first integer.
  var numOperations = inputReaderInstance.readSingleValue(); // Read the second integer.
  var dataArray = inputReaderInstance
    .readLineValues()
    .sort((valA, valB) => valA - valB); // Read an array, then sort it ascending.
  var operationList = inputReaderInstance.readMatrix(numOperations); // Read a matrix of operations.

  // Sort the operations in descending order based on their second element.
  operationList.sort((valA, valB) => valB[1] - valA[1]);

  var dataArrayIndex = 0; // Initialize an index for the data array.

  // Iterate through each operation.
  for (var opIndex = 0; opIndex < numOperations; opIndex++) {
    // For each operation, apply it 'count' times or until 'numElements' are processed.
    for (
      var countIndex = 0;
      countIndex < operationList[opIndex][0] && dataArrayIndex < numElements;
      dataArrayIndex++, countIndex++
    ) {
      // If the current data element is less than the operation's value, update it.
      if (dataArray[dataArrayIndex] < operationList[opIndex][1]) {
        dataArray[dataArrayIndex] = operationList[opIndex][1];
      } else {
        // If the data element is already greater or equal, no further operations will improve the sum,
        // so calculate and return the current sum.
        return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
      }
    }
  }

  // If all operations are processed without an early exit, calculate and return the final sum.
  return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
}
