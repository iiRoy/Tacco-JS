var INPUT_PARSER_FACTORY = (function () {
  // This function serves as the primary entry point for creating an input reader.
  function createInputReader(sourceString) {
    return new InputDataProcessor(sourceString);
  }

  // The InputDataProcessor class handles parsing the raw input string.
  function InputDataProcessor(rawInput) {
    this._sourceLines = rawInput.trim().split("\n"); // Stores each line of input.
    this._lineIndex = 0; // Keeps track of the current line being processed.
  }

  // Prototype method to extract the next token from the current line.
  // It can return the token as a string or a number.
  InputDataProcessor.prototype.getNextValue = function (asString) {
    var lines = this._sourceLines;
    var currentIdx = this._lineIndex;
    var extractedToken;

    // If the current line is still a single string, split it into tokens and reverse.
    if (typeof lines[currentIdx] === "string") {
      lines[currentIdx] = lines[currentIdx].split(" ").reverse();
    }

    extractedToken = lines[currentIdx].pop(); // Retrieve the last token (from the reversed array).

    // If the current line is now empty, advance to the next line.
    if (!lines[currentIdx].length) {
      this._lineIndex++;
    }

    // Return the token, converting to a number if 'asString' is not true.
    return asString ? extractedToken : +extractedToken;
  };

  // Prototype method to read all tokens from the current line.
  // Returns an array of strings or numbers based on 'asString'.
  InputDataProcessor.prototype.getLineValues = function (asString) {
    var tokensOnLine = this._sourceLines[this._lineIndex++].split(" ");
    return asString ? tokensOnLine : tokensOnLine.map(item => +item);
  };

  // Prototype method to read a specified number of rows as a matrix.
  // Each row is split into tokens. Returns a 2D array.
  InputDataProcessor.prototype.getMatrixValues = function (numRows, asString) {
    var matrixData = this._sourceLines.slice(this._lineIndex, this._lineIndex += numRows).map(lineStr => lineStr.split(" "));
    return asString ? matrixData : matrixData.map(row => row.map(cell => +cell));
  };

  // Prototype method to read a specified number of raw lines without splitting.
  // Returns an array of strings or numbers.
  InputDataProcessor.prototype.getRawLines = function (numLines, asString) {
    var rawLineData = this._sourceLines.slice(this._lineIndex, this._lineIndex += numLines);
    return asString ? rawLineData : rawLineData.map(line => +line);
  };

  return createInputReader; // Expose the factory function.
})();

// Initialize the input reader by reading the entire content of standard input.
var inputReader = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

// This function dynamically creates multi-dimensional arrays.
// It uses 'eval' for dynamic array construction, which is generally not recommended
// but preserved here to maintain Type II clone characteristics.
function createMultiDimensionalArray(defaultValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayDefinition = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + defaultValue + ";})";

  while (--dimCount) {
    arrayDefinition = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayDefinition + ")";
  }

  return eval(arrayDefinition);
}

// Global variables to store problem parameters and current state.
var maxStepLength, targetCoordX, targetCoordY, currentCoordX = 0, currentCoordY = 0;

// Execute the main program logic and print the final result to console.
console.log(runProgram());

// The core function that orchestrates the solution to the problem.
function runProgram() {
  // Read the problem's initial parameters from input.
  maxStepLength = inputReader.getNextValue();
  targetCoordX = inputReader.getNextValue();
  targetCoordY = inputReader.getNextValue();

  // Handle specific initial conditions.
  if (targetCoordX === 0 && targetCoordY === 0) {
    return 0; // Already at the target.
  }
  // Check for parity impossibility: even step length cannot reach odd total distance.
  if (maxStepLength % 2 === 0 && (targetCoordX + targetCoordY) % 2 !== 0) {
    return -1; // Target is unreachable.
  }

  var pathSteps = []; // Stores the sequence of coordinates visited.
  var currentDistance = computeManhattanDistance(0, 0); // Calculate initial distance from origin.

  // If the initial distance is not perfectly divisible by the maximum step length,
  // an initial adjustment phase is required.
  if (currentDistance % maxStepLength !== 0) {
    // If the remainder of the distance divided by maxStepLength is odd, perform a full step.
    if ((currentDistance % maxStepLength) % 2 === 1) {
      pathSteps.push(performStep());
    }

    // Calculate a specific sub-step length for the adjustment.
    var subStepLength = computeManhattanDistance(currentCoordX, currentCoordY) % maxStepLength / 2;
    if (maxStepLength % 2 === 0) {
      subStepLength = maxStepLength - subStepLength;
    }

    // Apply the sub-step movement based on current and target coordinates.
    if (Math.abs(currentCoordX - targetCoordX) >= subStepLength) {
      // Prioritize X-axis movement.
      if (currentCoordX < targetCoordX) {
        currentCoordX += subStepLength;
      } else {
        currentCoordX -= subStepLength;
      }
      if (currentCoordY < targetCoordY) {
        currentCoordY -= (maxStepLength - subStepLength);
      } else {
        currentCoordY += (maxStepLength - subStepLength);
      }
    } else {
      // Prioritize Y-axis movement.
      if (currentCoordY < targetCoordY) {
        currentCoordY += subStepLength;
      } else {
        currentCoordY -= subStepLength;
      }
      if (currentCoordX < targetCoordX) {
        currentCoordX -= (maxStepLength - subStepLength);
      } else {
        currentCoordX += (maxStepLength - subStepLength);
      }
    }
    pathSteps.push(currentCoordX + " " + currentCoordY); // Record the new position.
  }

  // Continue taking full steps until the current position matches the target.
  while (computeManhattanDistance(currentCoordX, currentCoordY) !== 0) {
    pathSteps.push(performStep());
  }

  // Output the total number of steps taken and the path as a newline-separated string.
  console.log(pathSteps.length);
  return pathSteps.join("\n");
}

// Computes the Manhattan distance between (pointAX, pointBY) and (targetCoordX, targetCoordY).
function computeManhattanDistance(pointAX, pointBY) {
  return Math.abs(pointAX - targetCoordX) + Math.abs(pointBY - targetCoordY);
}

// Determines the directional sign (1, -1, or 0) from startPoint to endPoint.
function getCoordinateDirection(startPoint, endPoint) {
  var coordDifference = startPoint - endPoint;
  return coordDifference > 0 ? 1 : coordDifference < 0 ? -1 : 0;
}

// Executes a single movement step of 'maxStepLength' towards the target.
// Updates global 'currentCoordX' and 'currentCoordY'.
function performStep() {
  var remainingMoveBudget = maxStepLength; // The total distance that can be covered in this step.

  // Attempt to move along the X-axis first if not already at target X.
  if (targetCoordX !== currentCoordX) {
    if (targetCoordX < currentCoordX) { // Target X is to the left.
      if (remainingMoveBudget >= currentCoordX - targetCoordX) {
        remainingMoveBudget -= (currentCoordX - targetCoordX);
        currentCoordX = targetCoordX; // Reached target X, update budget.
      } else {
        currentCoordX -= remainingMoveBudget; // Move partially towards target X.
        remainingMoveBudget = 0; // Budget exhausted.
      }
    } else { // Target X is to the right.
      if (remainingMoveBudget >= targetCoordX - currentCoordX) {
        remainingMoveBudget -= (targetCoordX - currentCoordX);
        currentCoordX = targetCoordX; // Reached target X, update budget.
      } else {
        currentCoordX += remainingMoveBudget; // Move partially towards target X.
        remainingMoveBudget = 0; // Budget exhausted.
      }
    }
  }

  // If there's still movement budget remaining, apply it to the Y-axis.
  if (remainingMoveBudget > 0) {
    if (targetCoordY < currentCoordY) { // Target Y is below.
      currentCoordY -= remainingMoveBudget;
    } else { // Target Y is above or at the same level.
      currentCoordY += remainingMoveBudget;
    }
  }

  // Return the new current coordinates as a space-separated string.
  return currentCoordX + " " + currentCoordY;
}
