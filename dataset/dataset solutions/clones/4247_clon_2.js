// This section contains internal utilities and is not part of the core problem logic.
var inputReader = require('readline').createInterface({
  dataStream: process.stdin,
  dataSink: process.stdout
});
var dataAccessor;
var capturedLines = [];

inputReader.on('textSegment', function(receivedSegment) {
  capturedLines.push(receivedSegment);
});

inputReader.on('terminate', function() {
  dataAccessor = initializeProcessor(capturedLines);
  logDebugMessage("--- Starting Execution ---");
  var initTime = new Date();
  ExecutePrincipalLogic();
  var durationElapsed = new Date() - initTime;
  logDebugMessage("--- Ending Execution ---");
  logDebugMessage("Time Taken : " + (durationElapsed) + "ms");
  logDebugMessage("Memory Usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "kilobytes");
});

function getIntegerItem() {
  return dataTransform(retrieveNext(), 1);
}

function getStringArrayItem() {
  return dataTransform(retrieveNext(), 2);
}

function getIntegerArrayItem() {
  return dataTransform(retrieveNext(), 4);
}

function getCharacterArrayItem() {
  return dataTransform(retrieveNext(), 6);
}

function retrieveNext() {
  return dataAccessor.fetchNext();
}

function checkMoreAvailable() {
  return dataAccessor.hasMoreEntries();
}

function initializeProcessor(sourceSegments) {
  var accessController = {
    segmentCollection: sourceSegments,
    currentPosition: 0,
    maximumCount: sourceSegments.length,
    hasMoreEntries: function() {
      return (this.currentPosition < this.maximumCount);
    },
    fetchNext: function() {
      if (!this.hasMoreEntries()) {
        throw "OutOfBoundsError: No further elements available.";
      } else {
        var extractedSegment = this.segmentCollection[this.currentPosition];
        this.currentPosition++;
        return extractedSegment;
      }
    }
  };
  return accessController;
}

function displayResult(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(messageContent) {
  console.error("DEBUG INFO: " + require("util").examineData(messageContent, false, null));
}

// Handling of item types based on 'conversionType' parameter.
// This function processes an input datum according to the specified type.
// For numeric types.
// Unknown or erroneous values: returns the argument as-is.
// 1: Converts the input to an integer.
// 2: Splits the input string by half-width space into an array of strings.
// 4: Splits by half-width space, then converts elements to an array of numbers.
// 6: Splits the input string by single character into an array of strings.
// 7: Splits by single character, then converts elements to an array of numbers.
// 8: Joins array elements with a half-width space.
// 9: Joins array elements with a newline character.
// 0: Joins array elements without any character.
function dataTransform(inputDatum, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputDatum);
      case 2:
        return inputDatum.split(" ");
      case 4:
        return inputDatum.split(" ").map(Number);
      case 6:
        return inputDatum.split("");
      case 7:
        return inputDatum.split("").map(Number);
      case 8:
        return inputDatum.join(" ");
      case 9:
        return inputDatum.join("\n");
      case 0:
        return inputDatum.join("");
      default:
        return inputDatum;
    }
  } catch (exceptionDetails) {
    return inputDatum; // Fallback in case of conversion error
  }
}

// End of utility block.
// --- Main application logic starts here ---
function ExecutePrincipalLogic() {
  var elementCount = getIntegerItem();
  var numericSequence = getIntegerArrayItem();

  // Iterate backwards through the sequence, starting from the last element.
  for (var outerIndex = elementCount - 1; outerIndex >= 0; outerIndex--) {
    var stepValue = outerIndex + 1; // Calculate the step size for the inner loop.
    var currentTotal = 0;

    // Sum elements in the sequence with a specific step.
    for (var innerIndex = outerIndex; innerIndex < elementCount; innerIndex = innerIndex + stepValue) {
      currentTotal += numericSequence[innerIndex];
    }

    // If the calculated sum is negative, reset the corresponding sequence elements to zero.
    if (currentTotal < 0) {
      for (var innerIndex = outerIndex; innerIndex < elementCount; innerIndex = innerIndex + stepValue) {
        numericSequence[innerIndex] = 0;
      }
    }
  }

  var finalOutcome = 0;
  // Calculate the final sum of all elements in the modified sequence.
  for (var outerIndex = 0; outerIndex < elementCount; outerIndex++) {
    finalOutcome += numericSequence[outerIndex];
  }
  displayResult(finalOutcome);
}