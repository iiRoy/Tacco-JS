var consoleInputHandler = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

var dataProcessor;

var collectedInputLines = [];

consoleInputHandler.on('line', function(singleLineEntry) {
  collectedInputLines.push(singleLineEntry);
});

consoleInputHandler.on('close', function() {
  dataProcessor = initializeInputData(collectedInputLines);

  console.error("\n");

  var operationStartTime = Date.now();

  ExecuteMainLogic();

  var elapsedDuration = Date.now() - operationStartTime;

  logDebugMessage("time duration : " + (elapsedDuration) + " ms");
  logDebugMessage("allocated memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB");
});

function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function fetchNextInteger() {
  return transformData(retrieveNextElement(), 1);
}

function fetchNextStringArray() {
  return transformData(retrieveNextElement(), 2);
}

function fetchNextIntegerArray() {
  return transformData(retrieveNextElement(), 4);
}

function fetchNextCharacterArray() {
  return transformData(retrieveNextElement(), 6);
}

function retrieveNextElement() {
  return dataProcessor.getNextEntry();
}

function hasMoreInput() {
  return dataProcessor.checkAvailability();
}

function initializeInputData(rawEntries) {
  var dataStructure = {
    entryCollection: rawEntries,
    currentReadIndex: 0,
    maximumEntries: rawEntries.length,

    checkAvailability: function() {
      return (this.currentReadIndex < this.maximumEntries);
    },

    getNextEntry: function() {
      if (!this.checkAvailability()) {
        throw new Error("InputBufferExhausted No more entries available");
      } else {
        var currentEntry = this.entryCollection[this.currentReadIndex];
        this.currentReadIndex++;
        return currentEntry;
      }
    }
  };

  return dataStructure;
}

function outputToConsole(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(debugInfo) {
  console.error("debug output: " + require("util").inspect(debugInfo, false, null));
}

// Data transformation modes for the utility function.
// Default: return input as is.
// Mode 1: Parse to integer.
// Mode 2: Split by single space into string array.
// Mode 4: Split by single space and map to number array.
// Mode 6: Split into character array.
// Mode 7: Split into character array and map to number array.
// Mode 8: Join array elements with single space.
// Mode 9: Join array elements with newline.
// Mode 0: Join array elements without separator.
function transformData(inputValue, conversionMode) {
  try {
    switch (conversionMode) {
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
  } catch (err) {
    return inputValue;
  }
}

function ExecuteMainLogic() {
  var totalItems = fetchNextInteger();
  var sortedNumericList = [];

  for (var iterationCounter = 0; iterationCounter < totalItems; iterationCounter++) {
    var currentValue = fetchNextInteger();

    if (iterationCounter === 0) {
      sortedNumericList.push(currentValue);
      continue;
    }

    var insertionPosition = findAppropriateIndex(sortedNumericList, currentValue);

    if (insertionPosition === sortedNumericList.length) {
      sortedNumericList.push(currentValue);
    } else {
      sortedNumericList[insertionPosition] = currentValue;
    }
    // logDebugMessage(sortedNumericList);
  }

  outputToConsole(sortedNumericList.length);
}

function findAppropriateIndex(orderedCollection, targetElement) {
  // The 'orderedCollection' is presumed to be sorted in ascending order.
  // We use a binary search approach where 'goodIdx' represents a valid (too small)
  // position and 'badIdx' represents an invalid (too large) position.
  // The goal is to find the smallest index where targetElement could be inserted
  // to maintain sorted order, replacing an existing element if targetElement is smaller.

  var badIdx = -1; // Represents the largest index confirmed to be 'too small'
  var goodIdx = orderedCollection.length; // Represents the smallest index confirmed to be 'large enough'

  var midPoint;

  while (Math.abs(goodIdx - badIdx) > 1) {
    midPoint = Math.floor((goodIdx + badIdx) / 2);

    if (orderedCollection[midPoint] < targetElement) {
      // If the element at midPoint is smaller than our target,
      // then targetElement must be at or after midPoint.
      // So, midPoint becomes our new 'badIdx' (elements before it are too small).
      badIdx = midPoint;
    } else {
      // If the element at midPoint is greater than or equal to our target,
      // then targetElement could be at midPoint or before it.
      // So, midPoint becomes our new 'goodIdx' (elements at or after it are large enough).
      goodIdx = midPoint;
    }
  }
  return goodIdx;
  // Alternatively, to return the index where the target *would* be if it were strictly greater:
  // return badIdx;
}