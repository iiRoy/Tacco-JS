var NO_SUCH_ELEMENT_EXCEPTION_MESSAGE = "NoSuchElementException:次に要素は無いよ";
var ASCENDING_SORT_COMPARATOR = function(a, b) { return a - b; };
var DESCENDING_SORT_COMPARATOR = function(a, b) { return b - a; };

function readAllInputLines() {
  var fileSystem = require("fs");
  var rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
  return rawInput.trim().split("\n");
}

var inputProcessor = {
  lineBuffer: readAllInputLines(),
  currentIndex: 0,
  totalLinesCount: 0,
  
  initialize: function() {
    this.totalLinesCount = this.lineBuffer.length;
  },

  hasMoreInput: function() {
    return this.currentIndex < this.totalLinesCount;
  },

  retrieveNextLine: function() {
    if (!this.hasMoreInput()) {
      throw NO_SUCH_ELEMENT_EXCEPTION_MESSAGE;
    }
    var currentLineValue = this.lineBuffer[this.currentIndex];
    this.currentIndex++;
    return currentLineValue;
  }
};

inputProcessor.initialize();

function getNextInputLine() { return inputProcessor.retrieveNextLine(); }
function getNextInteger() { return processInputData(getNextInputLine(), 1); }
function getNextStringArray() { return processInputData(getNextInputLine(), 2); }
function getNextIntegerArray() { return processInputData(getNextInputLine(), 4); }
function getNextCharacterArray() { return processInputData(getNextInputLine(), 6); }
function hasPendingInput() { return inputProcessor.hasMoreInput(); }

function printOutput(content) { console.log(content); }
function printError(content) { console.error(content); }

var splitAndMapToNumbers = function(str, separator) { return str.split(separator).map(Number); };
var splitAndMapToChars = function(str) { return str.split(""); };
var splitAndMapToCharNumbers = function(str) { return str.split("").map(Number); };

function processInputData(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return splitAndMapToNumbers(inputValue, " ");
      case 6: return splitAndMapToChars(inputValue);
      case 7: return splitAndMapToCharNumbers(inputValue);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

executeMainProgram();

function executeMainProgram() {
  var inputNumber = getNextInteger();
  
  var allDivisors = calculateDivisors(inputNumber);
  var sortedDivisorsDescending = allDivisors.sort(DESCENDING_SORT_COMPARATOR);
  
  var finalSum = 0;
  var iterationLimit = Math.floor(sortedDivisorsDescending.length / 2);
  
  for (var i = 0; i < iterationLimit; i++) {
    finalSum += sortedDivisorsDescending[i] - 1;
  }
  
  printOutput(finalSum);
}

function calculateDivisors(targetValue) {
  var divisorList = [];
  for (var candidate = 1; candidate * candidate <= targetValue; candidate++) {
    if (targetValue % candidate === 0) {
      divisorList.push(candidate);
      var squareOfCandidate = candidate * candidate;
      if (squareOfCandidate !== targetValue) {
        var complementaryDivisor = targetValue / candidate;
        divisorList.push(complementaryDivisor);
      }
    }
  }
  divisorList.sort(ASCENDING_SORT_COMPARATOR);
  return divisorList;
}
