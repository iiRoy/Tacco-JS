var InputParser = (function() {
  /**
   * Creates a new parser instance.
   * @param {string} inputString - The raw input string.
   * @returns {ParserInstance} A new parser object.
   */
  function createParser(inputString) {
    return new ParserInstance(inputString);
  }

  /**
   * Represents an instance of the input parser.
   * @param {string} rawInput - The raw input string.
   */
  function ParserInstance(rawInput) {
    this.sourceLines = rawInput.trim().split("\n");
    this.currentLineIndex = 0;
  }

  /**
   * Reads a single value from the current line.
   * If the line is exhausted, moves to the next.
   * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The parsed value.
   */
  ParserInstance.prototype.readSingleValue = function(asString) {
    var lineData = this.sourceLines,
      lineIdx = this.currentLineIndex,
      resultVal;

    // If the current line hasn't been split into tokens yet, do so.
    // Tokens are stored in reverse order for efficient popping.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    resultVal = lineData[lineIdx].pop(); // Get the last token

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this.currentLineIndex++;
    }

    return asString ? resultVal : +resultVal; // Convert to number if not requested as string
  };

  /**
   * Reads all values from the current line.
   * Advances to the next line.
   * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed values.
   */
  ParserInstance.prototype.readLineValues = function(asString) {
    var values = this.sourceLines[this.currentLineIndex++].split(" ");
    return asString ? values : values.map(item => +item);
  };

  /**
   * Reads a matrix (2D array) of values.
   * Advances the line index by 'count'.
   * @param {number} count - The number of lines to read for the matrix.
   * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  ParserInstance.prototype.readMatrix = function(count, asString) {
    var matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += count).map(item => item.split(" "));
    return asString ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  /**
   * Reads a specified number of raw lines.
   * Advances the line index by 'count'.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, attempts to convert to number.
   * @returns {Array<string|number>} An array of raw lines.
   */
  ParserInstance.prototype.readRawLines = function(count, asString) {
    var rawLines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += count);
    return asString ? rawLines : rawLines.map(item => +item);
  };

  return createParser;
})();

// Initialize the input reader with content from stdin
var inputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` and should be used with caution.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., 2, 3 for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argCount = argsList.length,
    arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

  while (--argCount) {
    arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Global variables for problem state
var stepSize, targetX, targetY, currentX = 0,
  currentY = 0;

// Output the result of the main problem-solving function
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * Reads input, calculates path, and returns the result.
 * @returns {string} The sequence of moves or an error code.
 */
function solveProblem() {
  stepSize = inputReader.readSingleValue();
  targetX = inputReader.readSingleValue();
  targetY = inputReader.readSingleValue();

  // Edge case: already at target
  if (targetX === 0 && targetY === 0) {
    return 0;
  }

  // Impossible case: parity mismatch
  // If stepSize is even, (targetX + targetY) must also be even for a solution to exist.
  // If (targetX + targetY) is odd, it's impossible.
  if (stepSize % 2 === 0 && (targetX + targetY) % 2 !== 0) {
    return -1;
  }

  var pathSteps = [],
    doubleStepSize = stepSize * 2;
  var manhattanDistance = calculateManhattanDistance();

  // Keep moving towards the target until the Manhattan distance is within `doubleStepSize`
  // and has the correct parity.
  while (manhattanDistance > doubleStepSize || manhattanDistance % 2 !== 0) {
    pathSteps.push(moveTowardsTarget()); // Make a move
    manhattanDistance = calculateManhattanDistance(); // Recalculate distance
  }

  // After the loop, `manhattanDistance` is <= `doubleStepSize` and has even parity.
  // Now, handle the final steps.
  if (manhattanDistance % stepSize === 0) {
    // If the remaining distance is a multiple of `stepSize`,
    // we can directly reach the target by repeatedly moving `stepSize`
    // until the distance is zero.
    while (calculateManhattanDistance()) {
      pathSteps.push(moveTowardsTarget());
    }
  } else {
    // If the remaining distance is not a multiple of `stepSize`,
    // we need a two-step maneuver.
    // This involves moving past the target and then back.

    var originalTargetX = targetX,
      originalTargetY = targetY;
    var remainingDistance = (doubleStepSize - Math.abs(currentX - targetX) - Math.abs(currentY - targetY)) / 2;

    // Adjust targetX and targetY for the first move to overshoot or undershoot
    // such that the second move can land exactly on the original target.
    if (Math.abs(currentX - targetX) >= Math.abs(currentY - targetY)) {
      // Prioritize moving along X-axis
      if (currentY < targetY) {
        targetY = currentY - remainingDistance;
      } else {
        targetY = currentY + remainingDistance;
      }

      if (currentX < targetX) {
        targetX = currentX + stepSize - remainingDistance;
      } else {
        targetX = currentX - stepSize + remainingDistance;
      }
    } else {
      // Prioritize moving along Y-axis
      if (currentX < targetX) {
        targetX = currentX - remainingDistance;
      } else {
        targetX = currentX + remainingDistance;
      }

      if (currentY < targetY) {
        targetY = currentY + stepSize - remainingDistance;
      } else {
        targetY = currentY - stepSize + remainingDistance;
      }
    }

    pathSteps.push(moveTowardsTarget()); // First maneuver move
    targetX = originalTargetX; // Restore original target
    targetY = originalTargetY;
    pathSteps.push(moveTowardsTarget()); // Second maneuver move to original target
  }

  // Output the total number of steps and the path
  console.log(pathSteps.length);
  return pathSteps.join("\n");
}

/**
 * Calculates the Manhattan distance between the current position (currentX, currentY)
 * and the target position (targetX, targetY).
 * @returns {number} The Manhattan distance.
 */
function calculateManhattanDistance() {
  return Math.abs(currentX - targetX) + Math.abs(currentY - targetY);
}

/**
 * Moves the current position (currentX, currentY) by `stepSize` towards the target (targetX, targetY).
 * Prioritizes moving along the X-axis first, then Y-axis if `stepSize` remains.
 * Updates `currentX` and `currentY` and returns the new coordinates as a string.
 * @returns {string} The new coordinates in "X Y" format.
 */
function moveTowardsTarget() {
  var remainingMove = stepSize; // Amount of movement left for this step

  // Move along X-axis
  if (targetX < currentX) {
    // Target is to the left
    if (remainingMove >= currentX - targetX) {
      // Can reach or pass targetX
      remainingMove -= currentX - targetX;
      currentX = targetX;
    } else {
      // Move partially towards targetX
      currentX -= remainingMove;
      remainingMove = 0;
    }
  } else if (targetX > currentX) {
    // Target is to the right
    if (remainingMove >= targetX - currentX) {
      // Can reach or pass targetX
      remainingMove -= targetX - currentX;
      currentX = targetX;
    } else {
      // Move partially towards targetX
      currentX += remainingMove;
      remainingMove = 0;
    }
  }

  // If there's still movement remaining, move along Y-axis
  if (remainingMove > 0) {
    if (targetY < currentY) {
      // Target is below
      currentY -= remainingMove;
    } else {
      // Target is above or at the same Y
      currentY += remainingMove;
    }
  }

  return currentX + " " + currentY;
}
