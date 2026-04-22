// This module provides a utility for parsing input data streams.
var INPUT_PROCESSOR = (function() {
  // Factory function to create a new stream handler instance.
  function createStreamHandler(sourceString) {
    return new StreamDataHandler(sourceString);
  }

  // Class responsible for handling and parsing input lines.
  function StreamDataHandler(inputString) {
    // Stores the input lines, trimmed and split.
    this._lineBuffer = inputString.trim().split("\n");
    // Pointer to the current line being processed.
    this._linePointer = 0;
  }

  // Method to extract a single token (number or string) from the current line.
  // It reads tokens from right to left on a space-separated line.
  // The 'returnAsString' flag determines if the output is a string or a number.
  StreamDataHandler.prototype.fetchToken = function(returnAsString) {
    var lineContents = this._lineBuffer,
      currentIdx = this._linePointer,
      extractedToken;

    // If the current line hasn't been processed into a reversed array yet, do it.
    if (typeof lineContents[currentIdx] === "string") {
      lineContents[currentIdx] = lineContents[currentIdx].split(" ").reverse();
    }
    // Pop the last (originally first) token.
    extractedToken = lineContents[currentIdx].pop();

    // If the current line is now empty, advance the line pointer.
    if (!lineContents[currentIdx].length) {
      this._linePointer++;
    }

    // Return the token, optionally parsed as a number.
    return returnAsString ? extractedToken : +extractedToken;
  };

  // Method to extract all tokens from the current line.
  // The 'returnAsString' flag determines if the output is an array of strings or numbers.
  StreamDataHandler.prototype.fetchLineTokens = function(returnAsString) {
    var tokens = this._lineBuffer[this._linePointer++].split(" ");
    // Return tokens as strings or convert them to numbers.
    return returnAsString ? tokens : tokens.map(val => +val);
  };

  // Method to extract a matrix of 'numRows' rows.
  // Each row is split by spaces.
  // The 'returnAsString' flag determines if the output elements are strings or numbers.
  StreamDataHandler.prototype.fetchGridData = function(numRows, returnAsString) {
    // Slice the relevant rows and split each into tokens.
    var gridRows = this._lineBuffer.slice(
      this._linePointer,
      (this._linePointer += numRows)
    ).map(line => line.split(" "));
    // Return grid elements as strings or convert them to numbers.
    return returnAsString ? gridRows : gridRows.map(row => row.map(val => +val));
  };

  // Method to extract a block of 'numLines' lines as a simple array.
  // The 'returnAsString' flag determines if the output elements are strings or numbers.
  StreamDataHandler.prototype.fetchLineBlock = function(numLines, returnAsString) {
    // Slice the relevant lines.
    var blockData = this._lineBuffer.slice(
      this._linePointer,
      (this._linePointer += numLines)
    );
    // Return block elements as strings or convert them to numbers.
    return returnAsString ? blockData : blockData.map(val => +val);
  };

  return createStreamHandler;
})();

// Initialize the input processor with data from standard input.
var dataHandlerInstance = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

// Function to create multi-dimensional arrays dynamically.
function createMultiDimArray(initialValue) {
  var allArguments = arguments,
    argCount = allArguments.length,
    arrayBuilderCode =
    "Array(allArguments[" +
    --argCount +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";
  while (--argCount)
    arrayBuilderCode =
    "Array(allArguments[" + argCount + "]).fill(0).map(x=>" + arrayBuilderCode + ")";
  return eval(arrayBuilderCode);
}

// Global variables for problem state.
var moveMagnitude, targetCoordX, targetCoordY, currentCoordX = 0,
  currentCoordY = 0;

// Output the result of the main execution function.
console.log(runProblemSolver());

// Main function to solve the problem.
function runProblemSolver() {
  // Read initial parameters from input.
  moveMagnitude = dataHandlerInstance.fetchToken();
  targetCoordX = dataHandlerInstance.fetchToken();
  targetCoordY = dataHandlerInstance.fetchToken();

  // Handle edge cases:
  // If already at the target.
  if (targetCoordX === 0 && targetCoordY === 0) return 0;
  // If impossible to reach with given constraints.
  if (moveMagnitude % 2 === 0 && (targetCoordX + targetCoordY) % 2) return -1;

  var solutionSteps = []; // Stores the sequence of coordinates.
  var initialDist = calculateManhattanDistance(0, 0); // Distance from origin to target.

  // If the initial distance is not perfectly divisible by moveMagnitude.
  if (initialDist % moveMagnitude !== 0) {
    // Special handling for odd remainder.
    if (initialDist % moveMagnitude % 2 === 1) {
      solutionSteps.push(advancePosition());
    }

    // Recalculate a modified distance for the next step.
    initialDist =
      (calculateManhattanDistance(currentCoordX, currentCoordY) % moveMagnitude) / 2;

    // Adjust 'initialDist' if specific conditions are met.
    if (
      moveMagnitude % 2 === 0 &&
      Math.abs(currentCoordX - targetCoordX) === Math.abs(currentCoordY - targetCoordY)
    )
      initialDist = moveMagnitude - initialDist;

    // Apply movement logic based on current and target coordinates.
    if (Math.abs(currentCoordX - targetCoordX) >= initialDist) {
      if (currentCoordX < targetCoordX) {
        currentCoordX += initialDist;
      } else {
        currentCoordX -= initialDist;
      }

      if (currentCoordY < targetCoordY) {
        currentCoordY -= moveMagnitude - initialDist;
      } else {
        currentCoordY += moveMagnitude - initialDist;
      }
    } else {
      if (currentCoordY < targetCoordY) {
        currentCoordY += initialDist;
      } else {
        currentCoordY -= initialDist;
      }

      if (currentCoordX < targetCoordX) {
        currentCoordX -= moveMagnitude - initialDist;
      } else {
        currentCoordX += moveMagnitude - initialDist;
      }
    }
    // Record the new position after this initial adjustment.
    solutionSteps.push(currentCoordX + " " + currentCoordY);
  }

  // Continue taking steps until the target is reached (Manhattan distance is zero).
  while (calculateManhattanDistance(currentCoordX, currentCoordY)) {
    solutionSteps.push(advancePosition());
  }

  // Log the total number of steps taken.
  console.log(solutionSteps.length);
  // Return the path as a newline-separated string.
  return solutionSteps.join("\n");
}

// Calculates the Manhattan (Taxicab) distance between a given point and the target.
function calculateManhattanDistance(pointX, pointY) {
  return Math.abs(pointX - targetCoordX) + Math.abs(pointY - targetCoordY);
}

// Determines the sign of the difference between two values.
// Returns 1 if startVal > endVal, -1 if startVal < endVal, 0 if equal.
function getSignOfDifference(startVal, endVal) {
  var diff = startVal - endVal;
  return diff > 0 ? 1 : diff < 0 ? -1 : 0;
}

// Advances the current position (currentCoordX, currentCoordY) towards the target.
// It uses 'moveMagnitude' as the total budget for movement in a single step.
function advancePosition() {
  var moveBudget = moveMagnitude; // Total movement allowed for this step.

  // Try to move along the X-axis first.
  if (targetCoordX !== currentCoordX) {
    if (targetCoordX < currentCoordX) {
      // Target is to the left, move left.
      if (moveBudget >= currentCoordX - targetCoordX) {
        moveBudget -= currentCoordX - targetCoordX;
        currentCoordX = targetCoordX;
      } else {
        currentCoordX -= moveBudget;
        moveBudget = 0;
      }
    } else {
      // Target is to the right, move right.
      if (moveBudget >= targetCoordX - currentCoordX) {
        moveBudget -= targetCoordX - currentCoordX;
        currentCoordX = targetCoordX;
      } else {
        currentCoordX += moveBudget;
        moveBudget = 0;
      }
    }
  }

  // If there's still movement budget remaining, move along the Y-axis.
  if (moveBudget) {
    if (targetCoordY < currentCoordY) {
      // Target is below, move down.
      currentCoordY -= moveBudget;
    } else {
      // Target is above, move up.
      currentCoordY += moveBudget;
    }
  }

  // Return the new current position as a string.
  return currentCoordX + " " + currentCoordY;
}