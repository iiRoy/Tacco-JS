var fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
var lineProcessor = {
  "lines" : fileContent,
  "currentPosition" : 0,
  "totalCount" : fileContent.length,
  "hasMoreLines" : function() {
    return (this.currentPosition < this.totalCount);
  },
  "getNextLine" : function() {
    if (!this.hasMoreLines()) {
      throw new Error("EndOfStreamError: No more lines to process.");
    }
    var currentLine = this.lines[this.currentPosition];
    this.currentPosition++;
    return currentLine;
  }
};
primaryExecution();
function fetchLine() { return lineProcessor.getNextLine(); }
function retrieveInteger() { return processInputData(fetchLine(), 1); }
function retrieveStringArray() { return processInputData(fetchLine(), 2); } // Splits string by space character
function retrieveNumericArray() { return processInputData(fetchLine(), 4); } // Splits by space, converts elements to numbers
function retrieveCharacterArray() { return processInputData(fetchLine(), 6); } // Splits string into individual characters
function checkMoreLines() { return lineProcessor.hasMoreLines(); }
function outputToConsole(message) { console.log(message); } // Writes message to standard output
function outputToError(errorMessage) { console.error(errorMessage); } // Writes message to standard error stream
/*
  Function for processing various input types.
  Option codes:
  - Default: Returns input as is (for unknown/invalid options).
  - 1: Converts input to an integer.
  - 2: Splits input string by a single space character.
  - 4: Splits by space, then maps each part to a numeric value.
  - 6: Splits input string into an array of individual characters.
  - 7: Splits by character, then maps each to a numeric value.
  - 8: Joins array elements with a space.
  - 9: Joins array elements with a newline.
  - 0: Joins array elements without any separator.
*/
function processInputData(inputItem, processOption) {
  try {
    switch (processOption) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(" ");
      case 4:
        return inputItem.split(" ").map((val) => Number(val));
      case 6:
        return inputItem.split("");
      case 7:
        return inputItem.split("").map((val) => Number(val));
      case 8:
        return inputItem.join(" ");
      case 9:
        return inputItem.join("\n");
      case 0:
        return inputItem.join("");
      default:
        return inputItem;
    }
  } catch (err) {
    return inputItem;
  }
}
function primaryExecution() {
  var targetValue = retrieveInteger();
  //outputToError(findFactors(targetValue));
  var factorCollection = findFactors(targetValue).sort(function(first, second) {
    return second - first;
  });
  var totalSum = 0;
  for (var idx = 0; idx < Math.floor(factorCollection.length / 2); idx++) {
    totalSum += factorCollection[idx] - 1;
    //outputToError(totalSum);
  }
  outputToConsole(totalSum);
}
function findFactors(numberToFactor) {
  var factorArray = [];
  for (var currentDivisor = 1; currentDivisor * currentDivisor <= numberToFactor; currentDivisor++) {
    if (numberToFactor % currentDivisor == 0) {
      factorArray.push(currentDivisor);
      if (currentDivisor * currentDivisor != numberToFactor) {
        factorArray.push(numberToFactor / currentDivisor);
      }
    }
  }
  factorArray.sort(function(valA, valB) { return valA - valB; });
  return factorArray;
}