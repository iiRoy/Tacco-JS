var INPUT_PARSER = (function () {
  // This function acts as a factory to create an instance of the InputReader.
  function createParser(sourceContent) {
    return new InputReader(sourceContent);
  }

  // The InputReader class is responsible for processing and providing input data.
  function InputReader(rawInputString) {
    // Stores the input content, split into individual lines after trimming whitespace.
    this.lineBuffer = rawInputString.trim().split("\n");
    // Keeps track of the current line being processed.
    this.currentLineIndex = 0;
  }

  // Prototype method to extract a single value from the current line.
  // The 'asString' parameter determines if the value should be returned as a string or a number.
  InputReader.prototype.readSingleValue = function (asString) {
    var lineData = this.lineBuffer, // Reference to the array of input lines.
      lineIdx = this.currentLineIndex, // Current line number.
      extractedValue; // Variable to hold the extracted data.

    // If the current line is still a single string, split it by spaces and reverse it.
    // Reversing allows efficient extraction using 'pop()' from the end.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Retrieve the last element from the (reversed) array of values on the current line.
    extractedValue = lineData[lineIdx].pop();

    // If all values on the current line have been read, advance to the next line.
    if (!lineData[lineIdx].length) {
      this.currentLineIndex++;
    }

    // Return the extracted value, converting it to a number if 'asString' is false.
    return asString ? extractedValue : +extractedValue;
  };

  // Prototype method to read an entire line and split it into an array of values.
  // 'asString' controls whether the array elements are strings or numbers.
  InputReader.prototype.readLineValues = function (asString) {
    // Get the current line, split it by spaces, and then increment the line index.
    var valuesOnLine = this.lineBuffer[this.currentLineIndex++].split(" ");
    // Return the array, mapping each element to a number if 'asString' is not true.
    return asString ? valuesOnLine : valuesOnLine.map((val) => +val);
  };

  // Prototype method to read a specified number of lines ('numLines') as a 2D array.
  // Each line is split into values. 'asString' determines the data type of elements.
  InputReader.prototype.readMatrix = function (numLines, asString) {
    // Extract a segment of lines from the buffer and process each line.
    var matrixRows = this.lineBuffer
      .slice(this.currentLineIndex, (this.currentLineIndex += numLines)) // Slice and advance index.
      .map((rowStr) => rowStr.split(" ")); // Split each row string into an array of values.

    // Return the 2D array, converting inner array elements to numbers if 'asString' is false.
    return asString
      ? matrixRows
      : matrixRows.map((row) => row.map((val) => +val));
  };

  // Prototype method to read a specified number of lines ('numLines') as raw strings.
  // 'asString' controls whether the array elements are strings or numbers.
  InputReader.prototype.readRawLines = function (numLines, asString) {
    // Extract a segment of lines from the buffer.
    var rawLineData = this.lineBuffer.slice(
      this.currentLineIndex,
      (this.currentLineIndex += numLines)
    ); // Slice and advance index.

    // Return the array, converting elements to numbers if 'asString' is false.
    return asString ? rawLineData : rawLineData.map((val) => +val);
  };

  // The IIFE returns the factory function 'createParser'.
  return createParser;
})();

// Initialize the input source by reading content from standard input.
var inputSource = INPUT_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// A utility function to create multi-dimensional arrays.
// This function is not utilized in the primary logic of this script.
function multiDimArray(fillValue) {
  var dimensionArgs = arguments, // All arguments passed to the function.
    argCount = dimensionArgs.length, // Number of dimensions.
    arrayCreationString =
      "Array(dimensionArgs[" +
      --argCount +
      "]).fill(0).map(x=>{return " +
      fillValue +
      ";})"; // Innermost array creation string.

  // Construct the string for nested array creation.
  while (--argCount) {
    arrayCreationString =
      "Array(dimensionArgs[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }

  // Evaluate the constructed string to create the multi-dimensional array.
  return eval(arrayCreationString);
}

// Execute the main calculation function and print its result to the console.
console.log(calculateMaxSum());

// The primary function that implements the core algorithm.
function calculateMaxSum() {
  // Read the first input value, which represents the size of the array.
  var arraySize = inputSource.readSingleValue();
  // Read the second line of input, which contains the data values for the array.
  var dataValues = inputSource.readLineValues();

  // Initialize the variable to store the highest sum found.
  var maximumSum = 0;
  // Calculate half of the array size using a bitwise right shift (integer division).
  var halfSize = arraySize >> 0b1; // 0b1 is binary for 1.

  // Outer loop: Iterates through possible step increments.
  // 'stepIncrement' starts from 1 and goes up to (but not including) 'halfSize'.
  for (var stepIncrement = 0b1; stepIncrement < halfSize; stepIncrement++) {
    // For each 'stepIncrement', a new Set is created to keep track of indices already processed
    // within this specific iteration of the outer loop.
    var processedIndices = new Set();
    // 'currentPairSum' accumulates the sum for the current 'stepIncrement'.
    var currentPairSum = 0;

    // Inner loop: Iterates through indices based on the 'stepIncrement'.
    // 'currentIndex' starts at 'stepIncrement' and increases by 'stepIncrement' in each step.
    // It continues as long as 'currentIndex' is less than 'arraySize - 1'.
    for (
      var currentIndex = stepIncrement;
      currentIndex < arraySize - 0b1;
      currentIndex += stepIncrement
    ) {
      // Calculate the symmetric index relative to 'currentIndex'.
      var symmetricIndex = arraySize - currentIndex - 0b1;

      // Check for conditions that require breaking the inner loop:
      // 1. If 'currentIndex' has already been added to 'processedIndices'.
      // 2. If 'symmetricIndex' has already been added to 'processedIndices'.
      // 3. If 'currentIndex' and 'symmetricIndex' refer to the same element (e.g., the middle element in an odd-sized array).
      if (
        processedIndices.has(currentIndex) ||
        processedIndices.has(symmetricIndex) ||
        currentIndex === symmetricIndex
      ) {
        break; // Exit the inner loop if any of these conditions are met.
      }

      // Add the values at 'currentIndex' and its 'symmetricIndex' to 'currentPairSum'.
      currentPairSum += dataValues[currentIndex] + dataValues[symmetricIndex];

      // If the 'currentPairSum' is greater than the 'maximumSum' found so far, update 'maximumSum'.
      if (maximumSum < currentPairSum) {
        maximumSum = currentPairSum;
      }

      // Add both 'currentIndex' and 'symmetricIndex' to the set of processed indices
      // to prevent reprocessing them in subsequent iterations of this inner loop.
      processedIndices.add(currentIndex);
      processedIndices.add(symmetricIndex);
    }
  }

  // Return the final maximum sum calculated.
  return maximumSum;
}
