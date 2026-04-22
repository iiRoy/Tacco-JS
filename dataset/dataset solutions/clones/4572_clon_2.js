var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputSource;
var rawInputLines = [];

/* Event handler for each line received */
inputReader.on('line', function(incomingLine) {
  rawInputLines.push(incomingLine);
});

/* Event handler upon input stream closure */
inputReader.on('close', function() {
  inputSource = initializeInputProcessor(rawInputLines);
  console.error("\n"); // Output a newline for cleaner debug logs
  var executionStartTime = Date.now();
  executeSolution();
  var totalExecutionTime = Date.now() - executionStartTime;
  logDebug("Execution duration: " + (totalExecutionTime) + "ms");
  logDebug("Memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/* Creates a deep copy of a given object. */
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

/* Retrieves the next integer from the input. */
function getInteger() {
  return convertInputToken(getNextToken(), 1);
}

/* Retrieves the next string array from the input. */
function getStringArray() {
  return convertInputToken(getNextToken(), 2);
}

/* Retrieves the next integer array from the input. */
function getIntegerArray() {
  return convertInputToken(getNextToken(), 4);
}

/* Retrieves the next character array from the input. */
function getCharacterArray() {
  return convertInputToken(getNextToken(), 6);
}

/* Advances the input stream and returns the next token. */
function getNextToken() {
  return inputSource.getNextToken();
}

/* Checks if there are more tokens in the input stream. */
function hasMoreTokens() {
  return inputSource.hasMoreTokens();
}

/* Sets up the input processing object. */
function initializeInputProcessor(dataInput) {
  return {
    dataLines: dataInput,
    currentPosition: 0,
    totalLines: dataInput.length,
    hasMoreTokens: function() {
      return (this.currentPosition < this.totalLines);
    },
    getNextToken: function() {
      if (this.hasMoreTokens()) {
        return this.dataLines[this.currentPosition++];
      } else {
        throw "InputBoundaryExceededException - No further input available";
      }
    }
  };
}

/* Prints the final computed result to standard output. */
function printResult(dataToOutput) {
  console.log(dataToOutput);
}

/* Logs debug information to standard error. */
function logDebug(debugMessage) {
  console.error("debug output: " + require("util").inspect(debugMessage, false, null));
}

/*
 * This function handles various input type conversions.
 * conversionType parameter:
 * - default: returns input as-is.
 * - 1: parses input as an integer.
 * - 2: splits input by spaces into a string array.
 * - 4: splits input by spaces and converts to an integer array.
 * - 6: splits input into a character array.
 * - 7: splits input into a character array and converts to integer array.
 * - 8: joins array elements with spaces.
 * - 9: joins array elements with newlines.
 * - 0: joins array elements without a separator.
 */
function convertInputToken(inputValue, conversionType) {
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
  } catch (err) {
    return inputValue;
  }
}

/* Main processing logic for the problem */
function executeSolution() {
  var dimensionsData = getIntegerArray();
  var heightVal = dimensionsData[0];
  var widthVal = dimensionsData[1];

  var minimumDifference = 100000000000; // Initialize with a very large value

  // First pass: Iterate through possible vertical splits of heightVal
  for (var splitIndex = 1; splitIndex <= heightVal - 2; splitIndex++) {
    var vertSegment1 = splitIndex;
    var vertSegment2 = Math.floor((heightVal - splitIndex) / 2);
    var vertSegment3 = Math.ceil((heightVal - splitIndex) / 2);

    var maxVerticalSegment = Math.max.apply(null, [vertSegment1, vertSegment2, vertSegment3]);
    var minVerticalSegment = Math.min.apply(null, [vertSegment1, vertSegment2, vertSegment3]);

    // Update minimum difference based on vertical splits and full width
    minimumDifference = Math.min(minimumDifference, (maxVerticalSegment - minVerticalSegment) * widthVal);

    var horizSplit1 = Math.floor(widthVal / 2);
    var horizSplit2 = widthVal - horizSplit1;

    var areaPiece1 = splitIndex * widthVal;
    var areaPiece2 = (heightVal - splitIndex) * horizSplit1;
    var areaPiece3 = (heightVal - splitIndex) * horizSplit2;

    var maxHorizontalArea = Math.max.apply(null, [areaPiece1, areaPiece2, areaPiece3]);
    var minHorizontalArea = Math.min.apply(null, [areaPiece1, areaPiece2, areaPiece3]);

    // Update minimum difference based on areas from mixed splits
    minimumDifference = Math.min(minimumDifference, maxHorizontalArea - minHorizontalArea);
  }

  // Swap heightVal and widthVal to consider the other orientation
  var tempDim = heightVal;
  heightVal = widthVal;
  widthVal = tempDim;

  // Second pass: Repeat the process with swapped dimensions
  for (var splitIndex = 1; splitIndex <= heightVal - 2; splitIndex++) {
    var vertSegment1 = splitIndex;
    var vertSegment2 = Math.floor((heightVal - splitIndex) / 2);
    var vertSegment3 = Math.ceil((heightVal - splitIndex) / 2);

    var maxVerticalSegment = Math.max.apply(null, [vertSegment1, vertSegment2, vertSegment3]);
    var minVerticalSegment = Math.min.apply(null, [vertSegment1, vertSegment2, vertSegment3]);

    // Update minimum difference based on vertical splits and full width
    minimumDifference = Math.min(minimumDifference, (maxVerticalSegment - minVerticalSegment) * widthVal);

    var horizSplit1 = Math.floor(widthVal / 2);
    var horizSplit2 = widthVal - horizSplit1;

    var areaPiece1 = splitIndex * widthVal;
    var areaPiece2 = (heightVal - splitIndex) * horizSplit1;
    var areaPiece3 = (heightVal - splitIndex) * horizSplit2;

    var maxHorizontalArea = Math.max.apply(null, [areaPiece1, areaPiece2, areaPiece3]);
    var minHorizontalArea = Math.min.apply(null, [areaPiece1, areaPiece2, areaPiece3]);

    // Update minimum difference based on areas from mixed splits
    minimumDifference = Math.min(minimumDifference, maxHorizontalArea - minHorizontalArea);
  }

  // Output the smallest difference found
  printResult(minimumDifference);
}