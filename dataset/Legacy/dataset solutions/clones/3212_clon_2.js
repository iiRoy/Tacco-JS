var INPUT_PARSER = (function() {
  /**
   * Factory function to create an input parser instance.
   * @param {string} rawInputString The complete raw input as a single string.
   * @returns {InputReader} A new InputReader object initialized with the provided input.
   */
  function createParser(rawInputString) {
    return new InputReader(rawInputString);
  }

  /**
   * InputReader class for sequential parsing of lines and values from a string.
   * @class
   * @param {string} inputContent The raw string content to be parsed.
   */
  function InputReader(inputContent) {
    // Stores the input content split into an array of lines.
    // Each line is initially a string, but can be converted to an array of values.
    this._lineData = inputContent.trim().split("\n");
    // Keeps track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and returns the next single value from the current line.
   * If the current line is exhausted, it automatically advances to the next line.
   * @param {boolean} [returnAsString=false] If true, returns the value as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The parsed value.
   */
  InputReader.prototype.readNextValue = function(returnAsString) {
    const currentLineArray = this._lineData;
    const linePosition = this._currentLineIndex;
    let extractedItem;

    // If the current line is still a single string, split it into individual space-separated values.
    // Values are reversed so that `pop()` can efficiently retrieve them in their original order.
    if (typeof currentLineArray[linePosition] === "string") {
      currentLineArray[linePosition] = currentLineArray[linePosition].split(" ").reverse();
    }

    // Retrieve the last element (which is the next value in original order) from the current line's array.
    extractedItem = currentLineArray[linePosition].pop();

    // If the current line's array is now empty, increment the line index to move to the next line.
    if (!currentLineArray[linePosition].length) {
      this._currentLineIndex++;
    }

    // Return the item, either as a string or converted to a number.
    return returnAsString ? extractedItem : +extractedItem;
  };

  /**
   * Reads all values from the current line and advances to the next line.
   * @param {boolean} [returnAsStrings=false] If true, returns values as strings; otherwise, attempts to convert each to a number.
   * @returns {Array<string|number>} An array containing all parsed values from the line.
   */
  InputReader.prototype.readLineValues = function(returnAsStrings) {
    // Get the current line, split it by spaces, and then increment the line index.
    const lineItems = this._lineData[this._currentLineIndex++].split(" ");
    // Return the items, either as strings or mapped to numbers.
    return returnAsStrings ? lineItems : lineItems.map(item => +item);
  };

  /**
   * Reads a specified number of rows, parsing each into an array of values.
   * Advances the line index by `numberOfRows`.
   * @param {number} numberOfRows The count of rows to read.
   * @param {boolean} [returnAsStrings=false] If true, returns values as strings; otherwise, attempts to convert each to a number.
   * @returns {Array<Array<string|number>>} A 2D array where each inner array represents a row of parsed values.
   */
  InputReader.prototype.readMatrixValues = function(numberOfRows, returnAsStrings) {
    // Extract the specified number of lines, then increment the line index.
    const matrixRows = this._lineData.slice(this._currentLineIndex, this._currentLineIndex += numberOfRows).map(line => line.split(" "));
    // Return the matrix, either with string values or with all inner values mapped to numbers.
    return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  /**
   * Reads a specified number of raw lines without splitting them into individual values.
   * Advances the line index by `lineCount`.
   * @param {number} lineCount The number of raw lines to read.
   * @param {boolean} [returnAsStrings=false] If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw lines.
   */
  InputReader.prototype.readRawLines = function(lineCount, returnAsStrings) {
    // Extract the specified number of lines, then increment the line index.
    const rawLineArray = this._lineData.slice(this._currentLineIndex, this._currentLineIndex += lineCount);
    // Return the lines, either as strings or mapped to numbers.
    return returnAsStrings ? rawLineArray : rawLineArray.map(line => +line);
  };

  return createParser;
})();

// Initialize the input parsing utility by reading the entire content of /dev/stdin.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary data processing function and output its result to the console.
console.log(processData());

/**
 * The main function that implements the core algorithm.
 * It reads input, performs dynamic programming calculations, and returns a final result.
 * @returns {number} The minimum calculated cost based on the input data.
 */
function processData() {
  // Read the first value from input, which specifies the total number of data elements.
  var totalDataElements = inputData.readNextValue();
  // Read the subsequent 'totalDataElements' lines as an array of numbers.
  var numericInputArray = inputData.readRawLines(totalDataElements);

  // Initialize the dynamic programming array, which will store minimum costs for each state.
  var dynamicProgrammingState = [];

  // Initialize the DP array for the first element of the input.
  // Calculate the cost for each of the 5 possible states (0 to 4) for the first input value.
  for (var stateTypeIndex = 0; stateTypeIndex < 5; stateTypeIndex++) {
    dynamicProgrammingState[stateTypeIndex] = calculateCost(numericInputArray[0], stateTypeIndex);
  }

  // Iterate through the rest of the input array, starting from the second element.
  for (var currentElementIndex = 1; currentElementIndex < totalDataElements; currentElementIndex++) {
    // Create a temporary array to hold the DP state for the current element.
    // Initialize all values to a very large number (effectively infinity) to find minimums.
    var temporaryDPState = Array(5).fill(9e+99);

    // Calculate the cost for state type 0 for the current element.
    // This is simply the previous state's cost for type 0 plus the current element's value.
    temporaryDPState[0] = dynamicProgrammingState[0] + numericInputArray[currentElementIndex];

    // Iterate through the remaining state types (from 1 to 4).
    for (stateTypeIndex = 1; stateTypeIndex < 5; stateTypeIndex++) {
      // For each current state type, consider all possible previous state types that could lead to it.
      // The previous state type can be any from 0 up to the current state type.
      for (var previousStateTypeIndex = 0; previousStateTypeIndex <= stateTypeIndex; previousStateTypeIndex++) {
        // Calculate a potential new minimum cost:
        // Previous DP state's cost for 'previousStateTypeIndex'
        // plus the cost of the current element 'numericInputArray[currentElementIndex]' for 'stateTypeIndex'.
        var potentialMinimumCost = dynamicProgrammingState[previousStateTypeIndex] + calculateCost(numericInputArray[currentElementIndex], stateTypeIndex);

        // If this potential cost is less than the current minimum stored for 'stateTypeIndex', update it.
        if (temporaryDPState[stateTypeIndex] > potentialMinimumCost) {
          temporaryDPState[stateTypeIndex] = potentialMinimumCost;
        }
      }
    }
    // After processing all state types for the current element, update the main DP array.
    dynamicProgrammingState = temporaryDPState;
  }

  // After iterating through all input elements, the minimum value in the final DP array is the overall minimum cost.
  return Math.min(...dynamicProgrammingState);

  /**
   * Helper function to calculate a specific cost based on an input value and a state type.
   * @param {number} inputValue The numeric value from the input array.
   * @param {number} stateType The type (an integer from 0 to 4) determining the cost calculation logic.
   * @returns {number} The calculated cost.
   */
  function calculateCost(inputValue, stateType) {
    // For state types 0 and 4, the cost is simply the input value itself.
    if (stateType === 0 || stateType === 4) {
      return inputValue;
    }
    // For state type 2, the cost is (inputValue + 1) modulo 2.
    // This effectively transforms 0 to 1 and 1 to 0.
    if (stateType === 2) {
      return (inputValue + 1) % 2;
    }
    // For state types 1 and 3:
    // If the input value is 0, the cost is 2.
    // Otherwise (if inputValue is 1), the cost is inputValue modulo 2, which is 1.
    return inputValue === 0 ? 2 : inputValue % 2;
  }
}
