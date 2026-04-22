// This module provides utilities for reading parsed input data from a multi-line string.
// It's implemented as an Immediately Invoked Function Expression (IIFE) to encapsulate its scope.
const DataStreamProcessor = (() => {
  /**
   * Factory function to create a new data stream reader instance.
   * @param {string} rawInputString - The complete input as a single string, typically read from a file or stdin.
   * @returns {DataStreamReader} An instance of the DataStreamReader.
   */
  function createDataStreamReader(rawInputString) {
    return new DataStreamReader(rawInputString);
  }

  /**
   * Represents a reader for processing a multi-line input string.
   * It tracks the current line being processed and provides methods to extract various data types.
   * @class
   */
  function DataStreamReader(rawInputString) {
    // Store all input lines, trimmed and split by newline.
    // Ensures robust handling of input, even with leading/trailing whitespace or empty lines.
    this._sourceLines = rawInputString.trim().split("\n");
    // _currentLineIndex tracks the index of the next line to be processed.
    this._currentLineIndex = 0;
    // _lineTokenCache stores partially consumed lines as arrays of tokens,
    // reversed for efficient `pop()` operations (right-to-left consumption).
    this._lineTokenCache = {};
  }

  // Extend the DataStreamReader prototype with data extraction methods.
  Object.assign(DataStreamReader.prototype, {
    /**
     * Reads and returns a single value from the current line. Values are consumed
     * from right-to-left on the line. If the current line is exhausted, it advances
     * to the next line.
     * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number|null} The parsed value, or null if no more values can be read.
     */
    retrieveNextValue(returnAsString = false) {
      const currentLineData = this._sourceLines;
      const lineIndex = this._currentLineIndex;
      let extractedToken;

      // Guard clause: Check if we've read past the end of the input or if the current line is undefined.
      if (lineIndex >= currentLineData.length || currentLineData[lineIndex] === undefined) {
        console.warn("Input stream exhausted or invalid line index accessed.");
        return null; // Indicate no more values can be read.
      }

      // If the current line hasn't been split into tokens yet, do so and cache it.
      if (!this._lineTokenCache[lineIndex]) {
        const cleanedLine = currentLineData[lineIndex].trim();
        // Split by one or more spaces, ensuring empty strings don't become tokens.
        this._lineTokenCache[lineIndex] = cleanedLine.length > 0 ? cleanedLine.split(/\s+/).reverse() : [];
      }

      const lineTokens = this._lineTokenCache[lineIndex];

      // If there are tokens left on the current line, pop one.
      if (lineTokens.length > 0) {
        extractedToken = lineTokens.pop();
      } else {
        // If the current line is exhausted, advance to the next line.
        this._currentLineIndex++;
        // As no token was found on the previous line, return null.
        return null;
      }

      // If the line became empty after popping a token, advance to the next line for future reads.
      if (lineTokens.length === 0) {
        this._currentLineIndex++;
        delete this._lineTokenCache[lineIndex]; // Clear cache for the now-empty line.
      }

      // Return the token, converting to a number unless a string is explicitly requested.
      return returnAsString ? extractedToken : Number(extractedToken);
    },

    /**
     * Reads all values from the current line, then advances the line index.
     * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    readAllLineValues(returnAsStrings = false) {
      const currentLine = this._sourceLines[this._currentLineIndex++];
      if (currentLine === undefined) { // Guard for end of input.
        return [];
      }
      const tokens = currentLine.trim().split(/\s+/);
      return returnAsStrings ? tokens : tokens.map(val => Number(val));
    },

    /**
     * Reads 'count' number of lines, parsing each into an array of values.
     * Advances the line index by 'count'.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the parsed matrix.
     */
    readMultiLineMatrix(count, returnAsStrings = false) {
      const startIdx = this._currentLineIndex;
      const endIdx = startIdx + count;
      this._currentLineIndex = endIdx; // Advance index immediately.

      const rawLines = this._sourceLines.slice(startIdx, endIdx);
      const parsedMatrix = rawLines.map(line => {
        if (line === undefined) return []; // Handle potentially undefined lines if slice goes out of bounds.
        const tokens = line.trim().split(/\s+/);
        return returnAsStrings ? tokens : tokens.map(val => Number(val));
      });
      return parsedMatrix;
    },

    /**
     * Reads 'count' number of raw lines without splitting values within each line.
     * Advances the line index by 'count'.
     * @param {number} count - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, returns raw lines as strings; otherwise, attempts to parse each line as a single number.
     * @returns {Array<string|number>} An array of raw line strings or numbers.
     */
    readRawLines(count, returnAsStrings = false) {
      const startIdx = this._currentLineIndex;
      const endIdx = startIdx + count;
      this._currentLineIndex = endIdx; // Advance index immediately.

      const rawLines = this._sourceLines.slice(startIdx, endIdx);
      return returnAsStrings ? rawLines : rawLines.map(line => Number(line));
    },

    /**
     * Checks if there are more lines available to be read in the input stream.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    hasMoreLines() {
      return this._currentLineIndex < this._sourceLines.length;
    },

    /**
     * Resets the reader's internal state, allowing it to re-read the input from the beginning.
     */
    resetReader() {
      this._currentLineIndex = 0;
      this._lineTokenCache = {}; // Clear any cached line tokens.
    }
  });

  return createDataStreamReader;
})();

// For Node.js environments, use the 'fs' module to read input from standard input.
const fileSystem = require("fs");
const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");

// Instantiate our custom data processor with the content read from stdin.
const problemInputReader = DataStreamProcessor(inputContent);

// The original 'xArray' utility was an unused, 'eval'-based function.
// It has been removed in this clone as a Type III modification for security and simplification.
// If multi-dimensional array initialization is needed, a safer, explicit approach is preferred.

// Global variables to store problem parameters and the current position of the moving object.
// Using 'let' for variables whose values will change during execution.
let currentStepMagnitude; // Corresponds to 'k' in the original code. Represents the fixed distance of each move.
let targetCoordX;         // Corresponds to 'x'. The target X-coordinate.
let targetCoordY;         // Corresponds to 'y'. The target Y-coordinate.
let currentPos_X = 0;     // Corresponds to 'xx'. The object's current X-position, initialized at origin.
let currentPos_Y = 0;     // Corresponds to 'yy'. The object's current Y-position, initialized at origin.

// Execute the primary problem-solving routine and print its final output to standard output.
console.log(processProblemSolution());

/**
 * Main function that orchestrates the problem-solving logic.
 * It reads the initial parameters, applies movement rules, and calculates the path.
 * @returns {string} The final solution, formatted as the number of steps followed by the coordinates of each step.
 */
function processProblemSolution() {
  // Read initial problem parameters using our custom input reader.
  // Explicit `Number()` conversion ensures type safety, although `retrieveNextValue` already handles it.
  currentStepMagnitude = Number(problemInputReader.retrieveNextValue());
  targetCoordX = Number(problemInputReader.retrieveNextValue());
  targetCoordY = Number(problemInputReader.retrieveNextValue());

  // Early exit conditions and initial validation checks:

  // 1. Trivial case: If the target is already the origin (0,0).
  if (targetCoordX === 0 && targetCoordY === 0) {
    return "0\n"; // Return 0 steps.
  }

  // 2. Impossibility check based on parity:
  // If the step magnitude is even, the sum of coordinates (Manhattan distance from origin)
  // must always maintain the same parity. If the target's sum of coordinates is odd,
  // it's impossible to reach with only even steps from an even-sum origin (0,0).
  const sumOfTargetCoords = targetCoordX + targetCoordY;
  if (currentStepMagnitude % 2 === 0 && sumOfTargetCoords % 2 !== 0) {
    return "-1\n"; // Indicate an impossible scenario.
  }

  // An array to store the sequence of coordinates visited during the trajectory.
  const trajectoryPoints = [];

  // Calculate the initial Manhattan distance from the origin (0,0) to the target.
  let initialTargetDistance = calculateManhattanDistance(0, 0, targetCoordX, targetCoordY);

  // Logic for the first move, specifically if the initial distance is not a direct multiple of K.
  if (initialTargetDistance % currentStepMagnitude !== 0) {
    const remainderDistance = initialTargetDistance % currentStepMagnitude;

    // If the remainder distance has an odd parity, perform an initial adjustment step.
    // This condition implicitly handles cases where 'currentStepMagnitude' is odd.
    // (If 'currentStepMagnitude' is even, 'initialTargetDistance' must be even due to earlier checks,
    // so 'remainderDistance' would also be even, making this condition false.)
    if (remainderDistance % 2 === 1) {
      trajectoryPoints.push(adjustCoordinatesForStep());
    }

    // Recalculate the segment length for the first composite move.
    // This `segmentLength` is distinct from `initialTargetDistance`.
    let segmentLength = (calculateManhattanDistance(currentPos_X, currentPos_Y, targetCoordX, targetCoordY) % currentStepMagnitude) / 2;

    // Special adjustment for `segmentLength` if `currentStepMagnitude` is even and the current
    // position is on a diagonal relative to the target.
    if (currentStepMagnitude % 2 === 0 && Math.abs(currentPos_X - targetCoordX) === Math.abs(currentPos_Y - targetCoordY)) {
      segmentLength = currentStepMagnitude - segmentLength;
    }

    // Calculate differences to determine movement direction.
    const deltaX = targetCoordX - currentPos_X;
    const deltaY = targetCoordY - currentPos_Y;
    const absoluteDeltaX = Math.abs(deltaX);
    const absoluteDeltaY = Math.abs(deltaY);

    // Apply the first composite move based on which coordinate has a larger or equal
    // absolute difference compared to `segmentLength`.
    if (absoluteDeltaX >= segmentLength) {
      // Move along X-axis by `segmentLength`, and along Y-axis by `currentStepMagnitude - segmentLength`.
      currentPos_X += (deltaX > 0 ? 1 : -1) * segmentLength;
      currentPos_Y += (deltaY > 0 ? -1 : 1) * (currentStepMagnitude - segmentLength); // Y-direction is inverted here.
    } else {
      // Move along Y-axis by `segmentLength`, and along X-axis by `currentStepMagnitude - segmentLength`.
      currentPos_Y += (deltaY > 0 ? 1 : -1) * segmentLength;
      currentPos_X += (deltaX > 0 ? -1 : 1) * (currentStepMagnitude - segmentLength); // X-direction is inverted here.
    }
    // Add the new adjusted coordinates to the path.
    trajectoryPoints.push(`${currentPos_X} ${currentPos_Y}`);
  }

  // Continue taking full steps until the current position reaches the target.
  // The loop continues as long as the Manhattan distance to the target is greater than zero.
  while (calculateManhattanDistance(currentPos_X, currentPos_Y, targetCoordX, targetCoordY) > 0) {
    trajectoryPoints.push(adjustCoordinatesForStep());
  }

  // Format the final output: first line is the total number of steps,
  // subsequent lines are the coordinates of each step.
  const finalOutput = `${trajectoryPoints.length}\n${trajectoryPoints.join("\n")}`;
  return finalOutput;
}

/**
 * Calculates the Manhattan distance (L1 distance) between a current point and a target point.
 * @param {number} currentX - The X-coordinate of the current position.
 * @param {number} currentY - The Y-coordinate of the current position.
 * @param {number} targetX - The X-coordinate of the target position.
 * @param {number} targetY - The Y-coordinate of the target position.
 * @returns {number} The Manhattan distance between the two points.
 */
function calculateManhattanDistance(currentX, currentY, targetX, targetY) {
  const deltaX = Math.abs(currentX - targetX);
  const deltaY = Math.abs(currentY - targetY);
  return deltaX + deltaY;
}

// The original 'vec' function was not utilized in the main logic
// and is therefore removed in this Type III clone for code simplification.

/**
 * Performs a single movement step, adjusting the current coordinates towards the target.
 * The total distance moved in this step is `currentStepMagnitude`.
 * It prioritizes movement along the X-axis first, then the Y-axis, to reach the target.
 * @returns {string} The updated current coordinates formatted as "X Y".
 */
function adjustCoordinatesForStep() {
  let remainingStepBudget = currentStepMagnitude; // The distance that can still be covered in this step.

  const horizontalDistanceToTarget = targetCoordX - currentPos_X;
  const verticalDistanceToTarget = targetCoordY - currentPos_Y;

  // Prioritize moving along the X-axis if the current X is not yet at the target X.
  if (horizontalDistanceToTarget !== 0) {
    const absoluteHorizontalDistance = Math.abs(horizontalDistanceToTarget);
    const directionX = Math.sign(horizontalDistanceToTarget); // Determines if we move left (-1) or right (1).

    if (remainingStepBudget >= absoluteHorizontalDistance) {
      // If we have enough budget to reach target X, consume that budget and set X to target.
      remainingStepBudget -= absoluteHorizontalDistance;
      currentPos_X = targetCoordX;
    } else {
      // If budget is insufficient, move as much as possible towards target X.
      currentPos_X += directionX * remainingStepBudget;
      remainingStepBudget = 0; // All step budget is consumed.
    }
  }

  // If there's still step budget remaining after X-axis movement, use it for Y-axis movement.
  if (remainingStepBudget > 0) {
    const directionY = Math.sign(verticalDistanceToTarget); // Determines if we move down (-1) or up (1).
    currentPos_Y += directionY * remainingStepBudget;
    // No need to update `remainingStepBudget` further as this is the last movement.
  }

  // Return the updated current coordinates as a space-separated string.
  return `${currentPos_X} ${currentPos_Y}`;
}