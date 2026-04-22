var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var capturedLines = [];

inputReader.on('line', function(currentLine) {
  capturedLines.push(currentLine);
});

inputReader.on('close', function() {
  dataHandler = initializeDataProcessor(capturedLines);
  logDebugMessage("--- Process initiated ---");

  var startTime = new Date();
  executePrimaryProcess();
  var elapsedTime = new Date() - startTime;

  logDebugMessage("--- Process completed ---");
  logDebugMessage("Execution time: " + elapsedTime + "ms");
  logDebugMessage("Memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function retrieveInteger() {
  return transformValue(getNextItem(), 1);
}

function retrieveStringArray() {
  return transformValue(getNextItem(), 2);
}

function retrieveIntegerArray() {
  return transformValue(getNextItem(), 4);
}

function retrieveCharacterArray() {
  return transformValue(getNextItem(), 6);
}

function getNextItem() {
  return dataHandler.next();
}

function hasMoreItems() {
  return dataHandler.hasNext();
}

function initializeDataProcessor(inputData) {
  var processorInstance = {
    sourceData: inputData,
    currentIndex: 0,
    maximumItems: inputData.length,
    hasMoreItems: function() {
      return (this.currentIndex < this.maximumItems);
    },
    next: function() {
      if (!this.hasMoreItems()) {
        throw "InputOutOfBoundsException: No further items available.";
      } else {
        var retrievedItem = this.sourceData[this.currentIndex];
        this.currentIndex++;
        return retrievedItem;
      }
    }
  };
  return processorInstance;
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(debugInfo) {
  console.error("DEBUG_INFO: " + require("util").inspect(debugInfo, false, null));
}

// This utility function handles various data transformations.
// 'conversionType' determines the specific operation:
//   1: Convert to an integer.
//   2: Split string by spaces into an array of strings.
//   4: Split string by spaces into an array of numbers.
//   6: Split string into an array of individual characters.
//   7: Split string into character array, then convert each to a number.
//   8: Join array elements with a single space.
//   9: Join array elements with a newline character.
//   0: Join array elements without any separator.
// Any other 'conversionType' or an error results in the original value being returned.
function transformValue(valueToConvert, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(valueToConvert);
      case 2:
        return valueToConvert.split(" ");
      case 4:
        return valueToConvert.split(" ").map(Number);
      case 6:
        return valueToConvert.split("");
      case 7:
        return valueToConvert.split("").map(Number);
      case 8:
        return valueToConvert.join(" ");
      case 9:
        return valueToConvert.join("\n");
      case 0:
        return valueToConvert.join("");
      default:
        return valueToConvert;
    }
  } catch (operationError) {
    return valueToConvert;
  }
}

function executePrimaryProcess() {
  var sourceString = getNextItem();
  var targetString = getNextItem();

  var charIndexMapping = {};
  var alphabetChars = "abcdefghijklmnopqrstuvwxyz";

  // Initialize character mapping with empty sets for each alphabet character.
  for (var charPos = 0; charPos < alphabetChars.length; charPos++) {
    charIndexMapping[alphabetChars[charPos]] = new Set();
  }

  // Populate the mapping with indices from the source string.
  for (var charPos = 0; charPos < sourceString.length; charPos++) {
    charIndexMapping[sourceString[charPos]].add(charPos);
  }

  // Apply character set swaps based on target string discrepancies.
  for (var charPos = 0; charPos < sourceString.length; charPos++) {
    for (var alphaPos = 0; alphaPos < alphabetChars.length; alphaPos++) {
      if (charIndexMapping[alphabetChars[alphaPos]].has(charPos) && alphabetChars[alphaPos] !== targetString[charPos]) {
        var temporarySet = charIndexMapping[alphabetChars[alphaPos]];
        charIndexMapping[alphabetChars[alphaPos]] = charIndexMapping[targetString[charPos]];
        charIndexMapping[targetString[charPos]] = temporarySet;
      }
    }
  }

  // Reconstruct the output string from the modified character index mapping.
  var resultArray = new Array(sourceString.length);
  var mappedKeys = Object.keys(charIndexMapping);

  for (var keyPos = 0; keyPos < mappedKeys.length; keyPos++) {
    var positionSet = Array.from(charIndexMapping[mappedKeys[keyPos]]);
    for (var posIdx = 0; posIdx < positionSet.length; posIdx++) {
      resultArray[positionSet[posIdx]] = mappedKeys[keyPos];
    }
  }

  var finalOutputString = transformValue(resultArray, 0);

  logDebugMessage(targetString);
  logDebugMessage(finalOutputString);

  if (finalOutputString === targetString) {
    displayOutput("Yes");
  } else {
    displayOutput("No");
  }
}