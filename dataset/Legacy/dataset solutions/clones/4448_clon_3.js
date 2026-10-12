var createInputReader = (function(){
  function inputFactory(sourceString){
    return new InputParser(sourceString);
  }

  function InputParser(sourceString){
    this.sourceLines = sourceString.trim().split("\n");
    this.currentLineIndex = 0;
  }

  InputParser.prototype.readNextValue = function(asString){
    var linesArray = this.sourceLines;
    var lineIdx = this.currentLineIndex;
    var tokenValue;

    if(typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    tokenValue = linesArray[lineIdx].pop();

    if(!linesArray[lineIdx].length) {
      this.currentLineIndex++;
    }
    return asString ? tokenValue : +tokenValue;
  };

  InputParser.prototype.readCurrentLine = function(asStrings){
    var lineContent = this.sourceLines[this.currentLineIndex++];
    var tokens = lineContent.split(" ");
    return asStrings ? tokens : tokens.map(val => +val);
  };

  InputParser.prototype.readMatrixData = function(numLines, asStrings){
    var matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
    this.currentLineIndex += numLines;
    var processedMatrix = matrixRows.map(row => row.split(" "));
    return asStrings ? processedMatrix : processedMatrix.map(row => row.map(val => +val));
  };

  InputParser.prototype.readRawData = function(numLines, asStrings){
    var rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
    this.currentLineIndex += numLines;
    return asStrings ? rawLines : rawLines.map(val => +val);
  };

  return inputFactory;
})();

var inputReaderInstance = createInputReader(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(processMainLogic());

function processMainLogic(){
  var yesResult = "Yes";
  var noResult = "No";

  var totalNumbersCount = inputReaderInstance.readNextValue();
  var inputNumbersArray = inputReaderInstance.readCurrentLine();

  // remainderCounts[0]: count of numbers % 4 === 1 or 3 (odd numbers)
  // remainderCounts[1]: count of numbers % 4 === 2 (even numbers not divisible by 4)
  // remainderCounts[2]: count of numbers % 4 === 0 (multiples of 4)
  var remainderCounts = [0, 0, 0];

  function categorizeAndIncrement(numberValue, countsArray) {
    var currentRemainder = numberValue % 4;
    if (currentRemainder === 0) {
      countsArray[2]++;
    } else if (currentRemainder === 2) {
      countsArray[1]++;
    } else { // currentRemainder is 1 or 3
      countsArray[0]++;
    }
  }

  for(var i = 0; i < totalNumbersCount; i++){
    categorizeAndIncrement(inputNumbersArray[i], remainderCounts);
  }

  var countOfOddNumbers = remainderCounts[0];
  var countOfTwoModFour = remainderCounts[1];
  var countOfZeroModFour = remainderCounts[2];

  // First condition check: if all numbers are 2 (mod 4)
  var allNumbersAreTwoModFour = (totalNumbersCount === countOfTwoModFour);
  if(allNumbersAreTwoModFour) {
    return yesResult;
  }

  // Adjust the count of odd numbers for the second condition
  var adjustedOddCount = countOfOddNumbers + 1;

  // Second condition check: if there are multiples of 4 AND
  // the adjusted odd count is within a specific threshold
  var hasZeroModFourNumbers = (countOfZeroModFour > 0);
  var oddCountMeetsThreshold = (adjustedOddCount <= countOfZeroModFour + 1);

  if(hasZeroModFourNumbers && oddCountMeetsThreshold) {
    return yesResult;
  }

  return noResult;
}
