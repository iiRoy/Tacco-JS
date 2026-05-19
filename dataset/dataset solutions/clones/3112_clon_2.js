var INPUT_PARSER = (function () {
  // This function serves as the entry point to create an InputReader instance.
  function createInputReader(sourceText) {
    return new InputReader(sourceText);
  }

  // The InputReader constructor initializes the source data and current line pointer.
  function InputReader(sourceText) {
    this._sourceLines = sourceText.trim().split("\n");
    this._currentLineIndex = 0;
  }

  // Reads a single item from the current line, treating it as space-separated and reversed.
  // If 'asStrings' is true, the item is returned as a string; otherwise, it's converted to a number.
  InputReader.prototype.readReversedItem = function (asStrings) {
    var lineData = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }
    resultValue = lineData[lineIdx].pop();

    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }
    return asStrings ? resultValue : +resultValue;
  };

  // Reads an entire line of space-separated values.
  // If 'asStrings' is true, an array of strings is returned; otherwise, an array of numbers.
  InputReader.prototype.readLineOfNumbers = function (asStrings) {
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? lineContent : lineContent.map((element) => +element);
  };

  // Reads 'numLines' lines as a matrix of space-separated values.
  // If 'asStrings' is true, a matrix of strings is returned; otherwise, a matrix of numbers.
  InputReader.prototype.readMatrix = function (numLines, asStrings) {
    var resultMatrix = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((line) => line.split(" "));
    return asStrings
      ? resultMatrix
      : resultMatrix.map((row) => row.map((element) => +element));
  };

  // Reads 'numLines' raw lines without splitting them.
  // If 'asStrings' is true, an array of strings is returned; otherwise, an array of numbers.
  InputReader.prototype.readRawLines = function (numLines, asStrings) {
    var rawLines = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    return asStrings ? rawLines : rawLines.map((element) => +element);
  };

  return createInputReader;
})();

var inputDataProcessor = INPUT_PARSER(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

console.log(processInput());

function processInput() {
  var numberOfElements = inputDataProcessor.readReversedItem();
  var inputSequence = inputDataProcessor.readLineOfNumbers();
  var outputSequence = [];

  // Attempt to find and remove elements according to the problem's logic.
  if (findAndRemove(inputSequence) === false) {
    return -1; // If the sequence cannot be fully reduced, return -1.
  }
  // Otherwise, reverse the collected elements and join them with newlines for output.
  return outputSequence.reverse().join("\n");

  // Recursive helper function to find and remove elements from the array.
  function findAndRemove(currentArray) {
    if (currentArray.length === 0) {
      return true; // Base case: The array is empty, all elements have been successfully removed.
    }

    // Iterate through the array from the last element to the first.
    for (var loopIndex = currentArray.length - 1; loopIndex >= 0; loopIndex--) {
      // Check if the element's value matches its 1-based index in the current array.
      if (currentArray[loopIndex] === loopIndex + 1) {
        outputSequence.push(currentArray[loopIndex]); // Add the matching element to the result sequence.
        // Recursively call the function with the current element removed from the array.
        return findAndRemove(
          currentArray.slice(0, loopIndex).concat(currentArray.slice(loopIndex + 1))
        );
      }
    }
    return false; // No element was found that satisfies the removal condition in this iteration.
  }
}
