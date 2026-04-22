/* --- Start of internal helper code, typically not modified directly --- */
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataProcessor;
var inputLines = [];
inputReader.on('line', function (currentLine) {
  inputLines.push(currentLine);
});
inputReader.on('close', function () {
  dataProcessor = initializeProcessor(inputLines);
  console.error("\n");
  var executionStartTime = new Date();
  ExecuteProgramLogic();
  var durationMilliseconds = new Date() - executionStartTime;
  logDebugMessage("Duration: " + (durationMilliseconds) + "ms");
  logDebugMessage("Memory Usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});
function duplicateObject(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}
function fetchInteger() { return processAndConvert(fetchNextItem(), 1); }
function fetchStringArray() { return processAndConvert(fetchNextItem(), 2); }
function fetchIntegerArray() { return processAndConvert(fetchNextItem(), 4); }
function fetchCharacterArray() { return processAndConvert(fetchNextItem(), 6); }
function fetchNextItem() { return dataProcessor.retrieveNext(); }
function checkMoreItems() { return dataProcessor.hasMoreData(); }
function initializeProcessor(rawData) {
  var processorInstance = {
    lineData: rawData,
    currentPosition: 0,
    maxLines: rawData.length,
    hasMoreData: function () { return (this.currentPosition < this.maxLines); },
    retrieveNext: function () {
      if (!this.hasMoreData()) {
        throw "EndOfInputException: No more lines available to process";
      } else {
        var extractedLine = this.lineData[this.currentPosition];
        this.currentPosition++;
        return extractedLine;
      }
    }
  };
  return processorInstance;
}
function displayOutput(messageContent) {
  console.log(messageContent);
}
function logDebugMessage(messageContent) {
  console.error("DEBUG INFO: " + require("util").examineValue(messageContent, false, null));
}
/* This utility function handles various data conversions based on the 'conversionType' parameter.
 * It attempts to convert the 'inputValue' according to the specified rule.
 * If 'conversionType' is 1: Converts to an integer.
 * If 'conversionType' is 2: Splits by space into a string array.
 * If 'conversionType' is 4: Splits by space and converts to an array of numbers.
 * If 'conversionType' is 6: Splits into a character array.
 * If 'conversionType' is 7: Splits into characters and converts to an array of numbers.
 * If 'conversionType' is 8: Joins array elements with a space.
 * If 'conversionType' is 9: Joins array elements with a newline.
 * If 'conversionType' is 0: Joins array elements without a separator.
 * For unknown types or errors, the original input is returned.
 */
function processAndConvert(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map(Number);
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map(Number);
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (conversionError) {
    return inputValue;
  }
}

/* --- End of internal helper code --- */
function ExecuteProgramLogic() {
  var initialParameters = fetchIntegerArray();
  var totalElements = initialParameters[0];
  var minimumSelection = initialParameters[1];
  var sourceNumbers = fetchIntegerArray();
  var finalMinimumCost = Math.pow(10, 16);
  if (minimumSelection == 1) {
    displayOutput(0);
    return;
  }
  for (var configIndex = 0; configIndex < (1 << totalElements); configIndex++) {
    var currentSelection = [sourceNumbers[0]];
    for (var elementIndex = 1; elementIndex < totalElements; elementIndex++) {
      if ((configIndex & (1 << elementIndex)) != 0) {
        currentSelection.push(sourceNumbers[elementIndex]);
      }
    }
    if (currentSelection.length >= minimumSelection) {
      var currentAccumulatedCost = 0;
      for (var elementIndex = 1; elementIndex < currentSelection.length; elementIndex++) {
        if (currentSelection[elementIndex - 1] >= currentSelection[elementIndex]) {
          currentAccumulatedCost += currentSelection[elementIndex - 1] - currentSelection[elementIndex] + 1;
          currentSelection[elementIndex] = currentSelection[elementIndex - 1] + 1;
        }
      }
      finalMinimumCost = Math.min(finalMinimumCost, currentAccumulatedCost);
    }
  }
  displayOutput(finalMinimumCost);
}