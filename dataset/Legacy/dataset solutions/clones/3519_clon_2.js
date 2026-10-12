function InputReader(inputString) {
  // Store the input string, split by newlines, for sequential access.
  this._lines = inputString.split("\n");
  // Initialize the current line index to the beginning.
  this._currentLineIndex = 0;
}

InputReader.prototype = {
  /**
   * Reads a single token from the current line.
   * If the line is exhausted, it moves to the next line.
   * @param {boolean} asString - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The read token.
   */
  readToken: function(asString) {
    let lineData = this._lines;
    let lineIdx = this._currentLineIndex;
    let resultVal;

    // If the current line hasn't been split into tokens yet, do so and reverse it
    // so that `pop()` reads tokens in their original order.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Pop the last token (which is the next token in original order).
    resultVal = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, converting to number if 'asString' is false or undefined.
    return asString ? resultVal : +resultVal;
  },

  /**
   * Reads an entire line of tokens.
   * @param {boolean} asString - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of tokens from the line.
   */
  readLine: function(asString) {
    // Get the current line, split it by spaces, and then increment the line index.
    let tokens = this._lines[this._currentLineIndex++].split(" ");
    // Return tokens as strings or map them to numbers.
    return asString ? tokens : tokens.map(item => +item);
  },

  /**
   * Reads 'count' number of lines, each split into tokens.
   * @param {number} count - The number of lines to read.
   * @param {boolean} asString - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} A 2D array of tokens.
   */
  readMatrix: function(count, asString) {
    let lineData = this._lines;
    let lineIdx = this._currentLineIndex;
    let resultVal = [];
    let lineCounter = 0;

    // Loop 'count' times to read each line.
    if (asString) {
      for (; lineCounter < count; lineCounter++) {
        resultVal[lineCounter] = lineData[lineIdx + lineCounter].split(" ");
      }
    } else {
      for (; lineCounter < count; lineCounter++) {
        resultVal[lineCounter] = lineData[lineIdx + lineCounter].split(" ").map(item => +item);
      }
    }

    // Advance the line index by the number of lines read.
    this._currentLineIndex += count;
    return resultVal;
  },
};

// Create an instance of InputReader, reading from standard input.
var inputSource = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main processing function and print its result to console.
console.log(processCoordinates());

/**
 * Main function to process coordinate data and generate paths.
 * @returns {string} The formatted output string or -1 if parity mismatch.
 */
function processCoordinates() {
  // Read the number of coordinate pairs (N).
  var numCoordinates = inputSource.readToken();
  // Read N lines, each containing a coordinate pair (x, y).
  var coordinatePairs = inputSource.readMatrix(numCoordinates);

  // Calculate the parity of the sum of the first coordinate pair's components.
  // (x + y) & 1 gives 0 for even sum, 1 for odd sum.
  var initialParity = (coordinatePairs[0][0] + coordinatePairs[0][1]) & 1;

  // Check if all subsequent coordinate pairs have the same parity sum.
  for (var coordIndex = 1; coordIndex < numCoordinates; coordIndex++) {
    var currentParity = (coordinatePairs[coordIndex][0] + coordinatePairs[coordIndex][1]) & 1;
    // If any pair has a different parity, it's impossible to solve with this method.
    if (currentParity !== initialParity) {
      return -1;
    }
  }

  // Determine the number of steps 'm' based on the initial parity.
  // This ensures that all coordinates can be reached using a set of odd/even steps.
  var numSteps = 20 - initialParity;
  // Create an array 'd' of 'm' weights, all initialized to 1.
  var stepWeights = Array(numSteps).fill(1);
  // Initialize an array to store the generated path strings for each coordinate.
  var pathStrings = [];

  // Iterate through each coordinate pair to generate its path.
  for (coordIndex = 0; coordIndex < numCoordinates; coordIndex++) {
    pathStrings[coordIndex] = ""; // Initialize path string for the current coordinate.
    // For each step, move the coordinate closer to (0,0) and record the direction.
    for (var stepIndex = 0; stepIndex < numSteps; stepIndex++) {
      if (coordinatePairs[coordIndex][0] > 0) {
        coordinatePairs[coordIndex][0]--;
        pathStrings[coordIndex] += "R"; // Move Right
      } else if (coordinatePairs[coordIndex][0] < 0) {
        coordinatePairs[coordIndex][0]++;
        pathStrings[coordIndex] += "L"; // Move Left
      } else if (coordinatePairs[coordIndex][1] > 0) {
        coordinatePairs[coordIndex][1]--;
        pathStrings[coordIndex] += "U"; // Move Up
      } else {
        coordinatePairs[coordIndex][1]++;
        pathStrings[coordIndex] += "D"; // Move Down
      }
    }
  }

  // Format and return the final output string:
  // numSteps \n stepWeights (space-separated) \n pathStrings (newline-separated)
  return numSteps + "\n" + stepWeights.join(" ") + "\n" + pathStrings.join("\n");
}
