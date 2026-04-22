"use strict";
var DATA_PARSER = (function () {
  function createParser(sourceText) {
    return new InputParser(sourceText);
  }
  function InputParser(sourceText) {
    this.lineStorage = sourceText.trim().split("\n");
    this.currentLineIdx = 0;
  }
  InputParser.prototype.readSingleElement = function (asStrings) {
    var linesArr = this.lineStorage;
    var currIdx = this.currentLineIdx;
    var extractedElem;
    if (typeof linesArr[currIdx] === "string") {
      linesArr[currIdx] = linesArr[currIdx].split(" ").reverse();
    }
    extractedElem = linesArr[currIdx].pop();
    if (!linesArr[currIdx].length) {
      this.currentLineIdx++;
    }
    return asStrings ? extractedElem : +extractedElem;
  };
  InputParser.prototype.readLineElements = function (asStrings) {
    var currentLineParts = this.lineStorage[this.currentLineIdx++].split(" ");
    return asStrings ? currentLineParts : currentLineParts.map((itemStr) => +itemStr);
  };
  InputParser.prototype.readMatrixElements = function (numLinesToRead, asStrings) {
    var resultLines = this.lineStorage
      .slice(this.currentLineIdx, (this.currentLineIdx += numLinesToRead))
      .map((itemStr) => itemStr.split(" "));
    return asStrings
      ? resultLines
      : resultLines.map((row) => row.map((itemStr) => +itemStr));
  };
  InputParser.prototype.readRawLines = function (numLinesToRead, asStrings) {
    var resultLines = this.lineStorage.slice(
      this.currentLineIdx,
      (this.currentLineIdx += numLinesToRead)
    );
    return asStrings ? resultLines : resultLines.map((itemStr) => +itemStr);
  };
  return createParser;
})();
var parserInstance = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));
function initializeMultiDimArray(initialValue) {
  var argsList = arguments;
  var dimCount = argsList.length;
  var arrayCreationString =
    "Array(argsList[" +
    --dimCount +
    "]).fill(0).map( _ => { return " +
    initialValue +
    ";})";
  while (--dimCount) {
    arrayCreationString =
      "Array(argsList[" + dimCount + "]).fill(0).map( _ => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

console.log(executeMainLogic());
function executeMainLogic() {
  var totalElements = parserInstance.readSingleElement();
  var inputArray = parserInstance.readLineElements();
  var elementCounts = initializeMultiDimArray(0, totalElements);
  for (var idx = 0; idx < totalElements; idx++) {
    elementCounts[inputArray[idx] - 1]++;
  }
  var uniqueCounts = [];
  for (var idx = 0; idx < totalElements; idx++) {
    if (elementCounts[idx]) {
      uniqueCounts.push(elementCounts[idx]);
    }
  }
  uniqueCounts.sort((valA, valB) => valB - valA);
  var finalResults = [totalElements];
  for (var kVal = 2; kVal <= totalElements; kVal++) {
    if (uniqueCounts.length < kVal) {
      finalResults.push(0);
    } else {
      var maxPossible = totalElements / kVal | 0;
      var adjustedTotal = totalElements;
      for (
        var countIdx = 0;
        countIdx < totalElements && maxPossible < uniqueCounts[countIdx];
        countIdx++
      ) {
        adjustedTotal -= uniqueCounts[countIdx] - maxPossible;
      }
      maxPossible = adjustedTotal / kVal | 0;
      finalResults.push(maxPossible);
    }
  }
  return finalResults.join("\n");
}