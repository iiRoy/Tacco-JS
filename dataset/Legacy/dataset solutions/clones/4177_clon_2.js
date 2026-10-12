var INPUT_PARSER = (function() {
  // This function serves as the public interface for creating a data stream parser.
  function createParser(sourceText) {
    return new DataStream(sourceText);
  }

  // The DataStream class manages the input lines and current reading position.
  function DataStream(sourceText) {
    // Store processed input lines, splitting by newline and trimming whitespace.
    this._sourceLines = sourceText.trim().split("\n");
    // Initialize the current line index to the beginning of the input.
    this._currentLineIndex = 0;
  }

  // Method to read a single atomic value (number or string) from the current line.
  DataStream.prototype.readAtom = function(asString) {
    var linesArray = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultVal;

    // If the current line hasn't been split into tokens yet, do so and reverse for easy popping.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    // Pop the last token from the current line.
    resultVal = linesArray[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value as a string or a number based on the 'asString' flag.
    return asString ? resultVal : +resultVal;
  };

  // Method to read an entire line, splitting it into tokens.
  DataStream.prototype.readLine = function(asString) {
    // Get the current line, split by space, and then advance the line index.
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return tokens as strings or numbers.
    return asString ? lineContent : lineContent.map(item => +item);
  };

  // Method to read a matrix (multiple lines, each split into tokens).
  DataStream.prototype.readMatrix = function(count, asString) {
    // Slice 'count' lines from the source, then advance the line index.
    // Map each line to an array of its tokens.
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count).map(item => item.split(" "));
    // Return matrix as strings or numbers.
    return asString ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  // Method to read 'count' raw lines without splitting them into tokens.
  DataStream.prototype.readRawLines = function(count, asString) {
    // Slice 'count' lines from the source, then advance the line index.
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Return lines as strings or numbers.
    return asString ? rawLines : rawLines.map(item => +item);
  };

  // Return the public interface function.
  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the result of the main problem-solving function.
console.log(solveProblem());

// The primary function that contains the problem's logic.
function solveProblem() {
  // Read the array length from input.
  var arrayLength = inputReader.readAtom();
  // Read the array of numbers from input.
  var numberArray = inputReader.readLine();
  // Initialize variables to track the maximum absolute value and its 1-based index.
  var maxAbsValue = 0;
  var maxAbsIndex;

  // Iterate through the array to find the element with the largest absolute value.
  for (var loopCounter = 0; loopCounter < arrayLength; loopCounter++) {
    if (Math.abs(maxAbsValue) < Math.abs(numberArray[loopCounter])) {
      maxAbsValue = numberArray[loopCounter];
      maxAbsIndex = loopCounter + 1; // Store 1-based index.
    }
  }

  // If all numbers are zero, no operations are needed.
  if (maxAbsValue === 0) {
    return 0;
  }

  // Array to store the sequence of operations.
  var operationList = [];

  // Branch based on whether the maximum absolute value is negative or positive.
  if (maxAbsValue < 0) {
    // If the largest absolute value is negative, the goal is to make all numbers negative
    // and then sort them in non-decreasing order.
    // The strategy involves making the first element (index 1) very negative using the maxAbsValue element.
    operationList.push(maxAbsIndex + " 1");
    operationList.push(maxAbsIndex + " 1");
    // Then, iterate from the second element to the end.
    for (loopCounter = 1; loopCounter < arrayLength; loopCounter++) {
      if (numberArray[loopCounter] < 0) {
        // If the current element is negative, add the first element to it, then add first to first.
        operationList.push("1 " + (loopCounter + 1));
        operationList.push("1 1");
      } else {
        // If the current element is positive, add the first element to itself, then add first to current.
        operationList.push("1 1");
        operationList.push("1 " + (loopCounter + 1));
      }
    }
  } else {
    // If the largest absolute value is positive, the goal is to make all numbers positive
    // and then sort them in non-decreasing order.
    // The strategy involves making the last element (index 'arrayLength') very positive using the maxAbsValue element.
    operationList.push(maxAbsIndex + " " + arrayLength);
    operationList.push(maxAbsIndex + " " + arrayLength);
    // Then, iterate from the first element to the second-to-last.
    for (loopCounter = 0; loopCounter < arrayLength - 1; loopCounter++) {
      if (numberArray[loopCounter] < 0) {
        // If the current element is negative, add the last element to itself, then add last to current.
        operationList.push(arrayLength + " " + arrayLength);
        operationList.push(arrayLength + " " + (loopCounter + 1));
      } else {
        // If the current element is positive, add the last element to current, then add last to last.
        operationList.push(arrayLength + " " + (loopCounter + 1));
        operationList.push(arrayLength + " " + arrayLength);
      }
    }
  }

  // Output the total number of operations performed.
  console.log(2 * arrayLength);
  // Return the list of operations, joined by newlines.
  return operationList.join("\n");
}
