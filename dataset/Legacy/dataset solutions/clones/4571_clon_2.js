var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

// Collect all input lines
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Process input and run the main logic when input ends
inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Print a newline to stderr for formatting
  var startTime = Date.now();
  calculateMinDifference(); // Execute the core algorithm
  var endTime = Date.now() - startTime;
  logDebug("execution time : " + (endTime) + "ms");
  logDebug("memory usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Function to create a deep copy of an object (not used in this specific problem)
function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

// Helper functions to read different types of input
function readInteger() {
  return convertInput(getNextLine(), 1);
}

function readStringArray() {
  return convertInput(getNextLine(), 2);
}

function readIntegerArray() {
  return convertInput(getNextLine(), 4);
}

function readCharacterArray() {
  return convertInput(getNextLine(), 6);
}

function getNextLine() {
  return dataProcessor.getNextLine();
}

function hasMoreLines() {
  return dataProcessor.hasMoreLines();
}

// Initializes the input handler object
function initializeInputHandler(rawLines) {
  return {
    lineStorage: rawLines,
    currentIdx: 0,
    maxLines: rawLines.length,
    hasMoreLines: function() {
      return (this.currentIdx < this.maxLines);
    },
    getNextLine: function() {
      if (this.hasMoreLines()) {
        return this.lineStorage[this.currentIdx++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

// Prints the final result to standard output
function printResult(outputValue) {
  console.log(outputValue);
}

// Prints debug information to standard error
function logDebug(debugMessage) {
  console.error("debug:" + require("util").inspect(debugMessage, false, null));
}

// Utility function for converting input strings based on a type code
// conversionType:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and map to numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and map to numbers.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return input as is.
function convertInput(inputValue, conversionType) {
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
  } catch (conversionError) {
    return inputValue; // Return original value on error
  }
}

// Main function containing the problem's core logic
function calculateMinDifference() {
  var dimensions = readIntegerArray();
  var heightVal = dimensions[0];
  var widthVal = dimensions[1];

  // Initialize minimum area difference with a very large number
  var minAreaDifference = 100000000000;

  // First set of calculations: splitting along the height
  for (var splitPoint = 1; splitPoint <= heightVal - 2; splitPoint++) {
    // Case 1: Split into three vertical segments
    var verticalSegment1 = splitPoint;
    var verticalSegment2 = Math.floor((heightVal - splitPoint) / 2);
    var verticalSegment3 = Math.ceil((heightVal - splitPoint) / 2);

    var maxVerticalSegment = Math.max.apply(null, [verticalSegment1, verticalSegment2, verticalSegment3]);
    var minVerticalSegment = Math.min.apply(null, [verticalSegment1, verticalSegment2, verticalSegment3]);

    // Update minimum difference based on vertical splits
    minAreaDifference = Math.min(minAreaDifference, (maxVerticalSegment - minVerticalSegment) * widthVal);

    // Case 2: Split into one horizontal segment and two vertical segments
    var horizontalSplit1 = Math.floor(widthVal / 2);
    var horizontalSplit2 = Math.ceil(widthVal / 2);

    var area1 = splitPoint * widthVal;
    var area2 = (heightVal - splitPoint) * horizontalSplit1;
    var area3 = (heightVal - splitPoint) * horizontalSplit2;

    var maxArea = Math.max.apply(null, [area1, area2, area3]);
    var minArea = Math.min.apply(null, [area1, area2, area3]);

    // Update minimum difference based on mixed splits
    minAreaDifference = Math.min(minAreaDifference, maxArea - minArea);
  }

  // Swap height and width to perform calculations for splitting along the width
  var tempDimension = heightVal;
  heightVal = widthVal;
  widthVal = tempDimension;

  // Second set of calculations: splitting along the new height (original width)
  for (var splitPoint = 1; splitPoint <= heightVal - 2; splitPoint++) {
    // Case 1: Split into three vertical segments (relative to new orientation)
    var verticalSegment1 = splitPoint;
    var verticalSegment2 = Math.floor((heightVal - splitPoint) / 2);
    var verticalSegment3 = Math.ceil((heightVal - splitPoint) / 2);

    var maxVerticalSegment = Math.max.apply(null, [verticalSegment1, verticalSegment2, verticalSegment3]);
    var minVerticalSegment = Math.min.apply(null, [verticalSegment1, verticalSegment2, verticalSegment3]);

    // Update minimum difference based on vertical splits
    minAreaDifference = Math.min(minAreaDifference, (maxVerticalSegment - minVerticalSegment) * widthVal);

    // Case 2: Split into one horizontal segment and two vertical segments (relative to new orientation)
    var horizontalSplit1 = Math.floor(widthVal / 2);
    var horizontalSplit2 = Math.ceil(widthVal / 2);

    var area1 = splitPoint * widthVal;
    var area2 = (heightVal - splitPoint) * horizontalSplit1;
    var area3 = (heightVal - splitPoint) * horizontalSplit2;

    var maxArea = Math.max.apply(null, [area1, area2, area3]);
    var minArea = Math.min.apply(null, [area1, area2, area3]);

    // Update minimum difference based on mixed splits
    minAreaDifference = Math.min(minAreaDifference, maxArea - minArea);
  }

  // Output the final minimum area difference
  printResult(minAreaDifference);
}
