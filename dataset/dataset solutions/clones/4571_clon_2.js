// This initial block sets up the environment for reading input and handling output.
var lineReaderModule = require('readline');
var inputOutputInterface = lineReaderModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

var parsedInputData; // Holds processed input data.
var collectedInputLines = []; // Stores raw lines read from input.

// Event listener for each line of input received.
inputOutputInterface.on('line', function(currentLine) {
  collectedInputLines.push(currentLine);
});

// Event listener triggered when all input has been received.
inputOutputInterface.on('close', function() {
  parsedInputData = inputProcessor(collectedInputLines);
  console.error("\n"); // Prints a blank line to standard error for visual separation.

  var executionStartTime = Date.now();
  mainApplicationLogic(); // Executes the primary computational logic.
  var totalElapsedTime = Date.now() - executionStartTime;

  logDebugInfo("Execution time: " + (totalElapsedTime) + "ms");
  logDebugInfo("Memory usage (heap): " + Math.round(process.memoryUsage().heapUsed / 1024) + "KB");
});

// Creates a deep copy of any given object.
function createObjectCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

// Fetches the next input item and converts it to an integer.
function getNextInteger() {
  return applyConversion(fetchNextEntry(), 1);
}

// Fetches the next input item and converts it to an array of strings.
function getStringArray() {
  return applyConversion(fetchNextEntry(), 2);
}

// Fetches the next input item and converts it to an array of integers.
function getIntegerArray() {
  return applyConversion(fetchNextEntry(), 4);
}

// Fetches the next input item and converts it to an array of characters.
function getCharacterArray() {
  return applyConversion(fetchNextEntry(), 6);
}

// Retrieves the subsequent item from the processed input.
function fetchNextEntry() {
  return parsedInputData.fetchNextEntry();
}

// Checks if there are more items available in the input stream.
function haveMoreEntries() {
  return parsedInputData.haveMoreEntries();
}

// Initializes the input parsing mechanism.
function inputProcessor(rawInputContent) {
  return {
    inputList: rawInputContent,
    currentIndex: 0,
    maximumIndex: rawInputContent.length,

    // Method to check if more input is present.
    haveMoreEntries: function() {
      return (this.currentIndex < this.maximumIndex);
    },

    // Method to retrieve the next input entry.
    fetchNextEntry: function() {
      if (this.haveMoreEntries()) {
        return this.inputList[this.currentIndex++];
      } else {
        throw new Error("Input stream exhausted; no further entries available.");
      }
    }
  };
}

// Outputs the final computed result to the console.
function displayResult(finalResult) {
  console.log(finalResult);
}

// Logs debug information to the standard error stream.
function logDebugInfo(debugMessage) {
  console.error("DEBUG: " + require("util").inspect(debugMessage, false, null));
}

// Utility function for converting input based on a specified type.
// Conversion type codes:
// 1: String to integer.
// 2: String to string array (space-separated).
// 4: String to integer array (space-separated).
// 6: String to character array.
// 7: String to integer array (character-by-character).
// 8: Array to space-separated string.
// 9: Array to newline-separated string.
// 0: Array to concatenated string.
function applyConversion(sourceValue, conversionCode) {
  try {
    switch (conversionCode) {
      case 1:
        return parseInt(sourceValue);
      case 2:
        return sourceValue.split(" ");
      case 4:
        return sourceValue.split(" ").map(Number);
      case 6:
        return sourceValue.split("");
      case 7:
        return sourceValue.split("").map(Number);
      case 8:
        return sourceValue.join(" ");
      case 9:
        return sourceValue.join("\n");
      case 0:
        return sourceValue.join("");
      default:
        return sourceValue; // Returns original value if no specific conversion.
    }
  } catch (errorDetail) {
    return sourceValue; // Fallback to original value on error.
  }
}


// Main function containing the problem's solution logic.
function mainApplicationLogic() {
  var initialDimensions = getIntegerArray();
  var currentHeight = initialDimensions[0];
  var currentWidth = initialDimensions[1];

  var minimalDifference = 100000000000; // Initialize with a very large value.

  // First set of partitioning strategies: iterating through vertical cuts.
  for (var iterIndex = 1; iterIndex <= currentHeight - 2; iterIndex++) {
    var segmentHeightA = iterIndex;
    var segmentHeightB = Math.floor((currentHeight - iterIndex) / 2);
    var segmentHeightC = Math.ceil((currentHeight - iterIndex) / 2);

    var maximumHeightSegment = Math.max.apply(null, [segmentHeightA, segmentHeightB, segmentHeightC]);
    var minimumHeightSegment = Math.min.apply(null, [segmentHeightA, segmentHeightB, segmentHeightC]);

    minimalDifference = Math.min(minimalDifference, (maximumHeightSegment - minimumHeightSegment) * currentWidth);

    // Consider horizontal cuts for the remaining area.
    var splitWidthA = Math.floor(currentWidth / 2);
    var splitWidthB = Math.ceil(currentWidth / 2);

    var areaPart1 = iterIndex * currentWidth;
    var areaPart2 = (currentHeight - iterIndex) * splitWidthA;
    var areaPart3 = (currentHeight - iterIndex) * splitWidthB;

    var maxAreaHorizontal = Math.max.apply(null, [areaPart1, areaPart2, areaPart3]);
    var minAreaHorizontal = Math.min.apply(null, [areaPart1, areaPart2, areaPart3]);

    minimalDifference = Math.min(minimalDifference, maxAreaHorizontal - minAreaHorizontal);
  }

  // Swap height and width, then repeat the partitioning process.
  var temporaryDimension = currentHeight;
  currentHeight = currentWidth;
  currentWidth = temporaryDimension;

  // Second set of partitioning strategies with swapped dimensions.
  for (var iterIndex = 1; iterIndex <= currentHeight - 2; iterIndex++) {
    var segmentHeightX = iterIndex;
    var segmentHeightY = Math.floor((currentHeight - iterIndex) / 2);
    var segmentHeightZ = Math.ceil((currentHeight - iterIndex) / 2);

    var maximumHeightSegment = Math.max.apply(null, [segmentHeightX, segmentHeightY, segmentHeightZ]);
    var minimumHeightSegment = Math.min.apply(null, [segmentHeightX, segmentHeightY, segmentHeightZ]);

    minimalDifference = Math.min(minimalDifference, (maximumHeightSegment - minimumHeightSegment) * currentWidth);

    var splitWidthX = Math.floor(currentWidth / 2);
    var splitWidthY = Math.ceil(currentWidth / 2);

    var areaPartX = iterIndex * currentWidth;
    var areaPartY = (currentHeight - iterIndex) * splitWidthX;
    var areaPartZ = (currentHeight - iterIndex) * splitWidthY;

    var maxAreaHorizontal = Math.max.apply(null, [areaPartX, areaPartY, areaPartZ]);
    var minAreaHorizontal = Math.min.apply(null, [areaPartX, areaPartY, areaPartZ]);

    minimalDifference = Math.min(minimalDifference, maxAreaHorizontal - minAreaHorizontal);
  }

  displayResult(minimalDifference);
}