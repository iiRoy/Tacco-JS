var INPUT_PARSER = (function () {
  function createParser(inputString) {
    return new DataProcessor(inputString);
  }

  function DataProcessor(inputString) {
    this.lineStorage = inputString.trim().split("\n");
    this.currentLineIndex = 0;
  }

  DataProcessor.prototype.extractNextToken = function (returnAsString) {
    var lineData = this.lineStorage,
      lineIdx = this.currentLineIndex,
      extractedToken;
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }
    extractedToken = lineData[lineIdx].pop();
    if (!lineData[lineIdx].length) {
      this.currentLineIndex++;
    }
    return returnAsString ? extractedToken : +extractedToken;
  };

  DataProcessor.prototype.readNextLine = function (returnAsString) {
    var lineTokens = this.lineStorage[this.currentLineIndex++].split(" ");
    return returnAsString ? lineTokens : lineTokens.map((tokenVal) => +tokenVal);
  };

  DataProcessor.prototype.readMatrix = function (numRows, returnAsString) {
    var matrixRows = this.lineStorage
      .slice(this.currentLineIndex, (this.currentLineIndex += numRows))
      .map((rowStr) => rowStr.split(" "));
    return returnAsString
      ? matrixRows
      : matrixRows.map((rowStr) => rowStr.map((cellStr) => +cellStr));
  };

  DataProcessor.prototype.readLines = function (numRows, returnAsString) {
    var selectedLines = this.lineStorage.slice(
      this.currentLineIndex,
      (this.currentLineIndex += numRows)
    );
    return returnAsString ? selectedLines : selectedLines.map((lineStr) => +lineStr);
  };

  return createParser;
})();

var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(solveProblem());
function solveProblem() {
  var coordinateData = inputReader.readMatrix(3);
  var diffX = coordinateData[1][0] - coordinateData[0][0];
  var negativeResult = "No";
  if (
    diffX + coordinateData[0][1] !== coordinateData[1][1] ||
    diffX + coordinateData[0][2] !== coordinateData[1][2]
  ) {
    return negativeResult;
  }
  diffX = coordinateData[2][0] - coordinateData[0][0];
  if (
    diffX + coordinateData[0][1] !== coordinateData[2][1] ||
    diffX + coordinateData[0][2] !== coordinateData[2][2]
  ) {
    return negativeResult;
  }
  return "Yes";
}
