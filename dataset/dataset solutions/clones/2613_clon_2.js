var lineReader = require('readline').createInterface(
  { input: process.stdin, output: process.stdout }
);

var parserInstance;
var capturedLines = [];

lineReader.on('line', function (entryString) {
  capturedLines.push(entryString);
});

lineReader.on('close', function () {
  parserInstance = setupDataProcessor(capturedLines);
  console.error('\n^ Input v Output');
  performCalculation();
});

function replicateValue(originalItem) {
  return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

function obtainNumeric() { return convertDataType(retrieveNext(), 1); }
function obtainTextList() { return convertDataType(retrieveNext(), 2); }
function obtainNumericList() { return convertDataType(retrieveNext(), 4); }
function obtainCharList() { return convertDataType(retrieveNext(), 6); }

function retrieveNext() { return parserInstance.advanceToken(); }
function moreAvailable() { return parserInstance.hasMoreTokens(); }

function setupDataProcessor(rawInputs) {
  return {
    dataEntries: rawInputs,
    currentPosition: 0,
    entryLimit: rawInputs.length,

    hasMoreTokens: function () {
      return (this.currentPosition < this.entryLimit);
    },

    advanceToken: function () {
      if (this.hasMoreTokens()) {
        return this.dataEntries[this.currentPosition++];
      } else {
        throw 'EndOfInputException :: No further input available for processing';
      }
    }
  };
}

function emitValue(resultData) {
  console.log(resultData);
}

function debugPrint(debugInfo) {
  console.error('debug-log:' + require('util').inspect(debugInfo, false, null));
}

function convertDataType(inputElement, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(inputElement);
      case 2:
        return inputElement.split(' ');
      case 4:
        return inputElement.split(' ').map(Number);
      case 6:
        return inputElement.split('');
      case 7:
        return inputElement.split('').map(Number);
      case 8:
        return inputElement.join(' ');
      case 9:
        return inputElement.join('\n');
      case 0:
        return inputElement.join('');
      default:
        return inputElement;
    }
  } catch (conversionError) {
    return inputElement;
  }
}

function performCalculation() {
  var initialParams = obtainNumericList();
  var monthLimit = initialParams[0];
  var dayLimit = initialParams[1];
  var accumulatedCount = 0;

  for (
    var monthCounter = 1;
    monthCounter <= monthLimit;
    monthCounter++
  ) {
    for (
      var dayCounter = 22;
      dayCounter <= dayLimit;
      dayCounter++
    ) {
      var tensPlace = Math.floor(dayCounter / 10);
      var unitsPlace = dayCounter % 10;

      if (
        tensPlace >= 2 &&
        unitsPlace >= 2 &&
        tensPlace * unitsPlace === monthCounter
      ) {
        accumulatedCount++;
      }
    }
  }

  emitValue(accumulatedCount);
}