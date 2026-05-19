var INPUT_PARSER = (function() {
  // This factory function creates and returns a new parser instance.
  function createParser(sourceText) {
    return new InputBuffer(sourceText);
  }

  // The InputBuffer class manages the input data, line by line.
  function InputBuffer(sourceText) {
    // Split the input string into an array of lines, after trimming whitespace.
    this._lines = sourceText.trim().split("\n");
    // Initialize the current line index to the beginning of the input.
    this._currentLineIndex = 0;
  }

  // Prototype method to read a single value from the current line.
  // If 'returnRaw' is true, the value is returned as a string; otherwise, it's converted to a number.
  InputBuffer.prototype.readNextValue = function(returnRaw) {
    var lineData = this._lines;
    var lineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line is still a string, it means it hasn't been split into individual values yet.
    if (typeof lineData[lineIdx] === "string") {
      // Split the line by spaces and reverse the array.
      // Reversing allows efficient extraction of values using `pop()` from the end.
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Extract the last value from the (reversed) array of the current line.
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the extracted value, either raw or as a number.
    return returnRaw ? extractedValue : +extractedValue;
  };

  // Prototype method to read all values from the current line.
  // Advances the line index after reading.
  InputBuffer.prototype.readLineValues = function(returnRaw) {
    // Get the current line, split it by spaces, and then increment the line index.
    var lineContent = this._lines[this._currentLineIndex++].split(" ");
    // Return the array of values, either raw strings or converted to numbers.
    return returnRaw ? lineContent : lineContent.map(element => +element);
  };

  // Prototype method to read a matrix of 'numRows' rows.
  // Each row is split into an array of values.
  InputBuffer.prototype.readMatrix = function(numRows, returnRaw) {
    // Extract a slice of 'numRows' lines, then increment the line index.
    // Map each line to an array of its split values.
    var matrixRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(element => element.split(" "));
    // Return the matrix, either as arrays of strings or arrays of numbers.
    return returnRaw ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  // Prototype method to read 'numRows' lines as a simple array.
  // Each line is treated as a single value.
  InputBuffer.prototype.readLinesAsArray = function(numRows, returnRaw) {
    // Extract a slice of 'numRows' lines, then increment the line index.
    var lineArray = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
    // Return the array, either as strings or converted to numbers.
    return returnRaw ? lineArray : lineArray.map(element => +element);
  };

  // The factory function is returned, allowing creation of parser instances.
  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));
// Define a modulo constant for calculations.
var moduloConstant = 1000000007; // Equivalent to 1e9 + 7

// Output the result of the main calculation function.
console.log(calculateResult());

// The primary function containing the problem's logic.
function calculateResult() {
  // Read the total number of elements (N).
  var totalElements = inputReader.readNextValue();
  // Read the array of colors (C) for all N elements.
  var colorArray = inputReader.readLinesAsArray(totalElements);

  // Initialize an array of arrays to store the indices where each color appears.
  // The size 200000 (2e5) is a common upper bound for color values in competitive programming.
  var indicesByColor = Array(200000).fill(0).map(element => []);

  // Populate 'indicesByColor': for each element, add its index to the list for its color.
  for (var idx = 0; idx < totalElements; idx++) {
    // Adjust color value to be 0-indexed for array access.
    indicesByColor[colorArray[idx] - 1].push(idx);
  }

  // Pre-process 'indicesByColor': reverse each list and remove its first element.
  // This prepares the lists so that subsequent `pop()` calls yield the *next* occurrence.
  for (var idx = 0; idx < totalElements; idx++) {
    indicesByColor[idx].reverse(); // Reverse to make the first occurrence the last element.
    indicesByColor[idx].pop(); // Remove the original first occurrence.
  }

  // Initialize the dynamic programming table.
  // dp[i] will store the number of ways to reach index 'i'.
  var dynamicProgrammingTable = Array(totalElements).fill(0);
  dynamicProgrammingTable[0] = 1; // Base case: there's one way to be at index 0.

  // Determine the index of the next occurrence of the color at index 0.
  var nextOccurrenceIndex = indicesByColor[colorArray[0] - 1].pop();
  // If this next occurrence is beyond index 1, it means we can jump directly to it from index 0.
  if (nextOccurrenceIndex > 1) {
    dynamicProgrammingTable[nextOccurrenceIndex] = 1; // Mark this as reachable in one way.
  }

  // Iterate through the elements from index 1 to N-1 to fill the DP table.
  for (idx = 1; idx < totalElements; idx++) {
    // The number of ways to reach the current index 'idx' includes all ways to reach 'idx-1'.
    dynamicProgrammingTable[idx] += dynamicProgrammingTable[idx - 1];
    // Apply modulo to keep the number within bounds.
    dynamicProgrammingTable[idx] %= moduloConstant;

    // Get the index of the next occurrence of the color at the current index 'idx'.
    nextOccurrenceIndex = indicesByColor[colorArray[idx] - 1].pop();

    // If there is a next occurrence and it's beyond the immediate next position (idx + 1).
    if (nextOccurrenceIndex > idx + 1) {
      // The number of ways to reach 'nextOccurrenceIndex' is updated by adding the ways to reach 'idx'.
      // This represents a "jump" from 'idx' to 'nextOccurrenceIndex'.
      dynamicProgrammingTable[nextOccurrenceIndex] = dynamicProgrammingTable[idx];
    }
  }

  // The final result is the number of ways to reach the last element (index N-1).
  return dynamicProgrammingTable[totalElements - 1];
}
