function InputProcessor(inputString) {
  // Stores the input string split into individual lines.
  this._sourceLines = inputString.split("\n");
  // Keeps track of the current line being processed.
  this._currentLineIndex = 0;
}

InputProcessor.prototype = {
  // Extracts a single value from the current line.
  extractValue: function(returnAsString) {
    let linesArray = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let extractedVal;

    // If the current line hasn't been processed into an array yet, split it and reverse.
    if (typeof linesArray[lineIdx] === "string") {
      linesArray[lineIdx] = linesArray[lineIdx].split(" ").reverse();
    }

    // Pop the last element from the current line's array.
    extractedVal = linesArray[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!linesArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as string or parsed number.
    return returnAsString ? extractedVal : +extractedVal;
  },

  // Reads an entire line and returns its values.
  readLineValues: function(keepStrings) {
    // Get the current line, split it by space, and advance the line pointer.
    let currentLine = this._sourceLines[this._currentLineIndex++].split(" ");

    // Return array of strings or array of numbers.
    return keepStrings ? currentLine : currentLine.map(numStr => +numStr);
  },

  // Reads multiple lines and returns them as a matrix.
  getMatrix: function(numLines, stringMode) {
    let allLines = this._sourceLines;
    let startIdx = this._currentLineIndex;
    let resultMatrix = [];
    let loopCounter = 0;

    // Populate the matrix based on the stringMode flag.
    if (stringMode) {
      for (; loopCounter < numLines; loopCounter++) {
        resultMatrix[loopCounter] = allLines[startIdx + loopCounter].split(" ");
      }
    } else {
      for (; loopCounter < numLines; loopCounter++) {
        resultMatrix[loopCounter] = allLines[startIdx + loopCounter].split(" ").map(numStr => +numStr);
      }
    }

    // Advance the line pointer by the number of lines read.
    this._currentLineIndex += numLines;

    return resultMatrix;
  },
};

// Initialize the input handler by reading from standard input.
const dataFetcher = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing logic and print its result to console.
console.log(processCoordinates());

function processCoordinates() {
  // Read the number of points from input.
  let numPoints = dataFetcher.extractValue();

  // Read the coordinates for all points.
  let pointData = dataFetcher.getMatrix(numPoints);

  // Calculate the parity of the first point's coordinates sum.
  let initialParity = (pointData[0][0] + pointData[0][1]) & 0b1;

  // Check if all points have the same parity sum.
  for (let idx = 0b1; idx < numPoints; idx++) {
    let currentParity = (pointData[idx][0] + pointData[idx][1]) & 0b1;
    // If parities differ, it's impossible, return -1.
    if (currentParity !== initialParity) {
      return -0b1;
    }
  }

  // Determine the number of directions based on initial parity.
  let numDirections = 32 - initialParity;

  // Initialize an array for step sizes (powers of 2).
  let stepSizes = [1073741824]; // Represents 2^30

  // Populate step sizes by right-shifting.
  for (idx = 0b1; idx < 31; idx++) {
    stepSizes[idx] = stepSizes[idx - 0b1] >> 0b1;
  }

  // If numDirections is even, add 1 as the smallest step.
  if (numDirections % 0b10 === 0x0) {
    stepSizes[31] = 0b1;
  }

  // Array to store the path strings for each point.
  let pathStrings = [];

  // Iterate through each point to determine its path.
  for (idx = 0x0; idx < numPoints; idx++) {
    pathStrings[idx] = "";
    // For each point, iterate through the required number of directions.
    for (let stepIndex = 0x0; stepIndex < numDirections; stepIndex++) {
      // Decide whether to move horizontally or vertically based on absolute coordinate values.
      if (Math.abs(pointData[idx][0]) > Math.abs(pointData[idx][1])) {
        if (pointData[idx][0] > 0x0) {
          pointData[idx][0] -= stepSizes[stepIndex];
          pathStrings[idx] += "R";
        } else {
          pointData[idx][0] += stepSizes[stepIndex];
          pathStrings[idx] += "L";
        }
      } else {
        if (pointData[idx][1] > 0x0) {
          pointData[idx][1] -= stepSizes[stepIndex];
          pathStrings[idx] += "U";
        } else {
          pointData[idx][1] += stepSizes[stepIndex];
          pathStrings[idx] += "D";
        }
      }
    }
  }

  // Construct the final output string.
  return numDirections + "\n" + stepSizes.join(" ") + "\n" + pathStrings.join("\n");
}
