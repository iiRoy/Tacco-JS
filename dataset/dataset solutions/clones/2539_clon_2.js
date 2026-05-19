var INPUT_PARSER = (function () {
  // Factory function to create an input reader instance.
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // Constructor for the input reader object.
  function InputReader(rawInput) {
    this._sourceLines = rawInput.trim().split("\n");
    this._currentLineIndex = 0;
  }

  // Reads a single value from the current line, consuming it.
  // If `asString` is true, returns string; otherwise, converts to number.
  InputReader.prototype.readSingleValue = function (asString) {
    var lineData = this._sourceLines,
      lineIdx = this._currentLineIndex,
      resultVal;

    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    resultVal = lineData[lineIdx].pop();

    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? resultVal : +resultVal;
  };

  // Reads an entire line as an array of values.
  // If `asString` is true, returns strings; otherwise, converts to numbers.
  InputReader.prototype.readLineValues = function (asString) {
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    return asString ? lineContent : lineContent.map((item) => +item);
  };

  // Reads 'numLines' lines as a 2D array (matrix).
  // If `asString` is true, returns strings; otherwise, converts to numbers.
  InputReader.prototype.readMatrix = function (numLines, asString) {
    var resultVal = this._sourceLines
      .slice(this._currentLineIndex, (this._currentLineIndex += numLines))
      .map((item) => item.split(" "));
    return asString ? resultVal : resultVal.map((item) => item.map((item) => +item));
  };

  // Reads 'numLines' lines as a 1D array.
  // If `asString` is true, returns strings; otherwise, converts to numbers.
  InputReader.prototype.readRows = function (numLines, asString) {
    var resultVal = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numLines)
    );
    return asString ? resultVal : resultVal.map((item) => +item);
  };

  return createParser;
})();

// Initialize the input handler by reading from standard input.
var inputHandler = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function
