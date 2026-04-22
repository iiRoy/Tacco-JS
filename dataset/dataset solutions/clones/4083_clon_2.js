var INPUT_READER_FACTORY = (function() {
  /**
   * Initializes a text data processing utility.
   * This is the main entry point for creating a data handler.
   * @param {string} incomingText - The entire input text as a single string.
   * @returns {TextDataHandler} A new TextDataHandler instance.
   */
  function createTextDataProcessor(incomingText) {
    return new TextDataHandler(incomingText);
  }

  /**
   * Constructor for the TextDataHandler class.
   * Manages the raw text input, splitting it into lines and tracking the current position.
   * @param {string} initialText - The input text provided.
   */
  function TextDataHandler(initialText) {
    // Store processed lines as an array, after trimming whitespace and splitting by newline.
    this._lineCollection = initialText.trim().split("\n");
    // Keep track of the current line index being processed.
    this._linePointer = 0;
  }

  /**
   * Extracts a single token from the current line.
   * If the current line hasn't been split into tokens yet, it will be.
   * The token is popped from the end of the line's token array.
   * @param {boolean} asString - If true, return the token as a string; otherwise, convert to number.
   * @returns {string|number} The extracted token.
   */
  TextDataHandler.prototype.popNextToken = function(asString) {
    const currentLines = this._lineCollection;
    const currentIdx = this._linePointer;
    let fetchedToken;

    // Check if the current line is still a single string; if so, split it into tokens.
    // The tokens are reversed so 'pop()' can act like 'shift()' for reading left-to-right.
    if (typeof currentLines[currentIdx] === "string") {
      currentLines[currentIdx] = currentLines[currentIdx].split(" ").reverse();
    }

    // Retrieve the last token from the current line's array.
    fetchedToken = currentLines[currentIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLines[currentIdx].length) {
      this._linePointer++;
    }

    // Return the token, optionally converting it to a number.
    return asString ? fetchedToken : +fetchedToken;
  };

  /**
   * Reads and processes an entire line of tokens.
   * The line pointer is advanced after reading.
   * @param {boolean} asStringArray - If true, return tokens as strings; otherwise, convert all to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  TextDataHandler.prototype.getLineTokens = function(asStringArray) {
    // Get the current line, split it by spaces, and then advance the line pointer.
    const tokens = this._lineCollection[this._linePointer++].split(" ");

    // Return tokens as strings or as numbers.
    return asStringArray ? tokens : tokens.map(tokenItem => +tokenItem);
  };

  /**
   * Reads a block of 'count' lines, processing each into an array of tokens.
   * Useful for reading matrices or multi-line datasets.
   * @param {number} count - The number of lines to read.
   * @param {boolean} asStringMatrix - If true, return tokens as strings; otherwise, convert all to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the block.
   */
  TextDataHandler.prototype.readMultiLineBlock = function(count, asStringMatrix) {
    // Extract a slice of lines starting from the current pointer, then advance the pointer.
    // Each line in the slice is then split into tokens.
    const blockData = this._lineCollection.slice(this._linePointer, this._linePointer += count)
      .map(lineContent => lineContent.split(" "));

    // Return the block, optionally converting all elements to numbers.
    return asStringMatrix ? blockData : blockData.map(row => row.map(item => +item));
  };

  /**
   * Reads a block of 'count' lines, treating each line as a single value.
   * @param {number} count - The number of lines to read.
   * @param {boolean} asStringVector - If true, return values as strings; otherwise, convert all to numbers.
   * @returns {Array<string|number>} A 1D array of values.
   */
  TextDataHandler.prototype.readSingleColumnBlock = function(count, asStringVector) {
    // Extract a slice of lines starting from the current pointer, then advance the pointer.
    const values = this._lineCollection.slice(this._linePointer, this._linePointer += count);

    // Return the values, optionally converting them to numbers.
    return asStringVector ? values : values.map(valueItem => +valueItem);
  };

  // The factory function is returned, allowing external code to create handlers.
  return createTextDataProcessor;
})();

// Instantiate the input reader by providing the content from standard input.
var inputSource = INPUT_READER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving function and print its result to the console.
console.log(analyzePathFeasibility());

/**
 * Main function to solve the problem: determining if a path through given points is feasible.
 * A path is feasible if each point can be reached from the previous one within the given time,
 * and the parity of the distance matches the parity of the time difference.
 * @returns {string} "Yes" if the path is feasible, "No" otherwise.
 */
function analyzePathFeasibility() {
  // Read the total number of locations to visit.
  var totalLocations = inputSource.popNextToken();
  // Read all location data (time, x, y coordinates) as a matrix.
  var locationCoordinates = inputSource.readMultiLineBlock(totalLocations);

  // Initialize current time and coordinates at the starting point (0,0) at time 0.
  var currentTravelTime = 0,
    currentXPosition = 0,
    currentYPosition = 0;

  // Iterate through each target location.
  for (var locationIndex = 0; locationIndex < totalLocations; locationIndex++) {
    // Calculate the Manhattan distance required to reach the next point.
    var requiredDistance = Math.abs(currentXPosition - locationCoordinates[locationIndex][1]);
    requiredDistance += Math.abs(currentYPosition - locationCoordinates[locationIndex][2]);

    // Calculate the time available to reach the next point.
    var availableTime = locationCoordinates[locationIndex][0] - currentTravelTime;

    // Check two conditions for feasibility:
    // 1. Is there enough time to cover the distance? (distance <= time)
    // 2. Does the parity of distance match the parity of time? (distance % 2 === time % 2)
    // If either condition fails, the path is not feasible.
    if (requiredDistance > availableTime || requiredDistance % 2 !== availableTime % 2) {
      return "No";
    }

    // Update current position and time to the current target location's values.
    currentXPosition = locationCoordinates[locationIndex][1];
    currentYPosition = locationCoordinates[locationIndex][2];
    currentTravelTime = locationCoordinates[locationIndex][0];
  }

  // If all locations are reachable, the path is feasible.
  return "Yes";
}