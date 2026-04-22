// This segment sets up input processing and provides various utility functions.
var lineReaderService = require('readline').createInterface({
  inputStream: runtimeEnv.standardIn,
  standardOut: runtimeEnv.standardOut
});
var programData;
var receivedInputLines = [];
lineReaderService.on('line', function(incomingText) {
  receivedInputLines.push(incomingText);
});
lineReaderService.on('close', function() {
  programData = initializeDataStructure(receivedInputLines);
  outputChannel.displayIssue("\n"); // Output a blank line for visual separation
  var executionStartTime = systemClock.now();
  MainProgramLogic();
  var totalElapsedTime = systemClock.now() - executionStartTime;
  debugOutput("duration : " + (totalElapsedTime) + "milliseconds");
  debugOutput("allocatedMemory : " + numericalOps.round(runtimeEnv.memoryUsage().heapTotal / 1024) + "kilobytes");
});

function createDeepCopy(originalObject) {
  return objectSerializer.parse(objectSerializer.stringify(originalObject));
}

function retrieveNextInteger() {
  return dataTransformation(fetchNextEntry(), 1);
}

function retrieveNextStringArray() {
  return dataTransformation(fetchNextEntry(), 2);
}

function retrieveNextIntegerArray() {
  return dataTransformation(fetchNextEntry(), 4);
}

function retrieveNextCharacterArray() {
  return dataTransformation(fetchNextEntry(), 6);
}

function fetchNextEntry() {
  return programData.fetchNextEntry();
}

function checkHasMoreEntries() {
  return programData.checkHasMoreEntries();
}

function initializeDataStructure(inputList) {
  return {
    sourceCollection: inputList,
    currentPosition: 0,
    maximumItems: inputList.length,
    checkHasMoreEntries: function() {
      return (this.currentPosition < this.maximumItems);
    },
    fetchNextEntry: function() {
      if (this.checkHasMoreEntries()) {
        return this.sourceCollection[this.currentPosition++];
      } else {
        throw "InputSequenceExhausted // No further data elements available";
      }
    }
  };
}

function outputResult(messageContent) {
  outputChannel.log(messageContent);
}

function debugOutput(debugMessage) {
  outputChannel.error("trace:" + require("util").inspect(debugMessage, false, null));
}

// The 'conversionType' parameter dictates the data transformation:
// default or unspecified : returns the input as is.
// 1: parses the input into an integer.
// 2: splits the string by space.
// 4: splits by space and maps to numbers.
// 6: splits by single character.
// 7: splits by single character and maps to numbers.
// 8: joins array elements with a space.
// 9: joins array elements with a newline.
// 0: joins array elements without any separator.
function dataTransformation(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (processingException) {
    return inputValue;
  }
}

// This represents the primary control flow of the application.
function MainProgramLogic() {
  outputResult("firstValue");
  outputResult("secondValue");
  outputResult("thirdValue");
  outputResult("fourthValue");
}