var INPUT_PARSER_GEN = (function() {
  // This inner function acts as the factory for the content processor
  function buildProcessor(inputString) {
    return new ContentProcessor(inputString);
  }

  // The main data handling class
  function ContentProcessor(sourceText) {
    // Internal array to hold processed line segments
    this.lineSegments = sourceText
      .trim()
      .split("\n"); // Split input by newlines and remove leading/trailing whitespace
    this.currentLineIndex = 0; // Pointer to the current line being processed
  }

  // Method to extract a single item from the current line
  ContentProcessor.prototype.extractNextItem = function(returnAsString) {
    var currentSegments = this.lineSegments,
      linePointer = this.currentLineIndex,
      extractedValue;

    // If the current line hasn't been split into tokens yet, do so and reverse
    if (typeof currentSegments[linePointer] === "string") {
      currentSegments[linePointer] = currentSegments[linePointer]
        .split(" ")
        .reverse();
    }
    extractedValue = currentSegments[linePointer].pop(); // Get the last token (first in original order)

    // Advance to the next line if the current one is exhausted
    if (!currentSegments[linePointer].length) {
      this.currentLineIndex++;
    }
    // Return the value as a string or convert to a number
    return returnAsString ? extractedValue : +extractedValue;
  };

  // Method to extract all items from the current line
  ContentProcessor.prototype.extractLineValues = function(asStrings) {
    var parsedItems = this.lineSegments[this.currentLineIndex++]
      .split(" "); // Get current line, split by space, then advance line pointer
    // Return items as strings or map them to numbers
    return asStrings ? parsedItems : parsedItems.map(itemString => +itemString);
  };

  // Method to extract a block of data (matrix) over multiple lines
  ContentProcessor.prototype.extractGridData = function(numRows, keepStrings) {
    var resultMatrix = this.lineSegments
      .slice(this.currentLineIndex, (this.currentLineIndex += numRows)) // Get 'numRows' lines and advance pointer
      .map(rowString => rowString.split(" ")); // Split each line into cells
    // Return the matrix as strings or convert all cells to numbers
    return keepStrings ?
      resultMatrix :
      resultMatrix.map(row => row.map(cellString => +cellString));
  };

  // Method to extract raw lines without further splitting
  ContentProcessor.prototype.extractRawLines = function(lineCount, stringOutput) {
    var rawContent = this.lineSegments
      .slice(this.currentLineIndex, (this.currentLineIndex += lineCount)); // Get 'lineCount' lines and advance pointer
    // Return lines as strings or convert them to numbers
    return stringOutput ? rawContent : rawContent.map(lineContent => +lineContent);
  };

  return buildProcessor; // Return the factory function
})();


var streamHandler = INPUT_PARSER_GEN(require("fs").readFileSync("/dev/stdin", "utf8"));


// Function to create multi-dimensional arrays with an initial element
function constructDeepArray(initialElement) {
  var argumentList = arguments,
    dimensionCount = argumentList.length,
    generatedCodeString = "Array(argumentList[" + --dimensionCount + "]).fill(null).map(_ignored=>{return " + initialElement + ";})";
  while (--dimensionCount) generatedCodeString = "Array(argumentList[" + dimensionCount + "]).fill(null).map(_ignored=>" + generatedCodeString + ")";
  return eval(generatedCodeString); // Evaluate the generated string to create the array
}


var boundaryTracker = constructDeepArray("[]", 6); // Global array to store coordinate boundaries
var potentialSolutions = new Set([0]); // Global set to store candidate offset values


console.log(performCalculation()); // Execute the main logic and print the result


function performCalculation() {
  var iterationCount = streamHandler.extractNextItem(); // Read the number of operations
  for (var loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
    var coordX = streamHandler.extractNextItem();
    var coordY = streamHandler.extractNextItem();
    var directionChar = streamHandler.extractNextItem(true); // Read direction as a string

    // Adjust boundaries based on direction and coordinates
    if (directionChar === "U") {
      adjustDimensionBounds(0, coordY); // Upward movement affects Y-max (0)
      adjustDimensionBounds(5, coordX); // X-min (5)
    } else if (directionChar === "R") {
      adjustDimensionBounds(1, coordX); // Rightward movement affects X-max (1)
      adjustDimensionBounds(4, coordY); // Y-min (4)
    } else if (directionChar === "D") {
      adjustDimensionBounds(2, coordY); // Downward movement affects Y-min (2)
      adjustDimensionBounds(5, coordX); // X-min (5)
    } else { // Assuming 'L' for Left
      adjustDimensionBounds(3, coordX); // Leftward movement affects X-min (3)
      adjustDimensionBounds(4, coordY); // Y-min (4)
    }
  }

  // Evaluate and add candidate points to the set based on current boundaries
  evaluateCandidatePoints(boundaryTracker[0][1], boundaryTracker[4][1], boundaryTracker[2][1]);
  evaluateCandidatePoints(-boundaryTracker[2][0], -boundaryTracker[4][0], -boundaryTracker[0][0]);
  evaluateCandidatePoints(boundaryTracker[1][1], boundaryTracker[5][1], boundaryTracker[3][1]);
  evaluateCandidatePoints(-boundaryTracker[3][0], -boundaryTracker[5][0], -boundaryTracker[1][0]);

  var finalAnswer = Infinity; // Initialize with a very large number

  // Iterate through all potential offset values
  for (var offsetValue of potentialSolutions) {
    // Calculate effective bounds for the current offset
    var maxUp = determineMaximum(boundaryTracker[0][1] + offsetValue, boundaryTracker[2][1] - offsetValue, boundaryTracker[4][1]);
    var minDown = determineMinimum(boundaryTracker[0][0] + offsetValue, boundaryTracker[2][0] - offsetValue, boundaryTracker[4][0]);
    var maxRight = determineMaximum(boundaryTracker[1][1] + offsetValue, boundaryTracker[3][1] - offsetValue, boundaryTracker[5][1]);
    var minLeft = determineMinimum(boundaryTracker[1][0] + offsetValue, boundaryTracker[3][0] - offsetValue, boundaryTracker[5][0]);

    var currentArea = (maxUp - minDown) * (maxRight - minLeft); // Calculate the area

    if (currentArea < finalAnswer) {
      finalAnswer = currentArea; // Update the minimum area found
    }
  }
  return finalAnswer;
}


// Function to adjust the min/max bounds for a given dimension
function adjustDimensionBounds(dimensionIndex, coordinateValue) {
  if (boundaryTracker[dimensionIndex].length) { // Check if the boundary range is already established
    if (boundaryTracker[dimensionIndex][0] > coordinateValue) {
      boundaryTracker[dimensionIndex][0] = coordinateValue; // Update minimum if a smaller value is found
    } else if (boundaryTracker[dimensionIndex][1] < coordinateValue) {
      boundaryTracker[dimensionIndex][1] = coordinateValue; // Update maximum if a larger value is found
    }
  } else { // If the range is not yet established, initialize it
    boundaryTracker[dimensionIndex][0] = boundaryTracker[dimensionIndex][1] = coordinateValue;
  }
}


// Function to evaluate and add potential candidate points to the global set
function evaluateCandidatePoints(valA, valB, valC) {
  potentialSolutions.add(Math.max(0, (valC - valB) || 0, ((valC - valA) / 2) || 0));
  potentialSolutions.add(Math.max(0, (valB - valA) || 0, ((valC - valA) / 2) || 0));
}


// Custom function to find the maximum value among arguments, ignoring NaN
function determineMaximum() {
  var valueArguments = arguments;
  var resultValue = valueArguments[0];
  for (var argIndex = 1; argIndex < valueArguments.length; argIndex++) {
    if (isNaN(valueArguments[argIndex])) continue; // Skip NaN entries
    if (resultValue > valueArguments[argIndex]) continue; // If current result is already greater, no update needed
    resultValue = valueArguments[argIndex]; // Update result if a larger value is found
  }
  return resultValue;
}


// Custom function to find the minimum value among arguments, ignoring NaN
function determineMinimum() {
  var valueArguments = arguments;
  var resultValue = valueArguments[0];
  for (var argIndex = 1; argIndex < valueArguments.length; argIndex++) {
    if (isNaN(valueArguments[argIndex])) continue; // Skip NaN entries
    if (resultValue < valueArguments[argIndex]) continue; // If current result is already smaller, no update needed
    resultValue = valueArguments[argIndex]; // Update result if a smaller value is found
  }
  return resultValue;
}