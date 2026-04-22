// This module provides a utility for parsing multi-line string input.
var INPUT_READER = (function() {
  /**
   * Factory function to create a new data stream processor.
   * @param {string} inputContent - The raw string data to be processed.
   * @returns {DataStreamProcessor} A new instance of the processor.
   */
  function createReader(inputContent) {
    return new DataStreamProcessor(inputContent);
  }

  /**
   * Constructor for the DataStreamProcessor.
   * Manages the state of parsing lines from an input string.
   * @param {string} contentString - The string containing all input data.
   */
  function DataStreamProcessor(contentString) {
    // Store lines after trimming whitespace and splitting by newline.
    this._linesOfData = contentString.trim().split("\n");
    // Initialize the pointer for the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Extracts a single token (value) from the current line.
   * If the line has not been tokenized yet, it splits it by spaces and reverses it
   * to allow efficient popping from the end.
   * Advances to the next line if the current line becomes empty after extraction.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to convert it to a number.
   * @returns {string|number} The extracted token.
   */
  DataStreamProcessor.prototype.extractValue = function(returnAsString) {
    var currentLine = this._linesOfData,
      lineIdx = this._currentLineIndex,
      extractedToken;

    // Check if the current line is still a single string; if so, tokenize it.
    if (typeof currentLine[lineIdx] === "string") {
      currentLine[lineIdx] = currentLine[lineIdx].split(" ").reverse();
    }

    // Pop the last token from the (reversed) array of tokens on the current line.
    extractedToken = currentLine[lineIdx].pop();

    // If the current line is now empty, advance the line pointer.
    if (!currentLine[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, either as a string or a number.
    return returnAsString ? extractedToken : +extractedToken;
  };

  /**
   * Reads an entire line from the input and tokenizes it.
   * Advances the line pointer after reading.
   * @param {boolean} [keepAsStrings=false] - If true, returns tokens as strings; otherwise, converts them to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  DataStreamProcessor.prototype.fetchLine = function(keepAsStrings) {
    // Get the current line, split it by spaces, and then increment the line index.
    var tokensOnLine = this._linesOfData[this._currentLineIndex++].split(" ");
    // Return either the raw string tokens or their numeric conversions.
    return keepAsStrings ? tokensOnLine : tokensOnLine.map(parsedToken => +parsedToken);
  };

  /**
   * Reads a specified number of lines and processes them as a matrix.
   * Each line is split into tokens.
   * @param {number} numRows - The number of rows (lines) to read.
   * @param {boolean} [retainStrings=false] - If true, keeps all elements as strings; otherwise, converts them to numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  DataStreamProcessor.prototype.getMatrix = function(numRows, retainStrings) {
    // Slice 'numRows' lines starting from the current index and advance the index.
    var matrixData = this._linesOfData.slice(this._currentLineIndex, this._currentLineIndex += numRows)
      .map(rowText => rowText.split(" ")); // Split each line into an array of strings.

    // Return the matrix, either with string elements or numeric elements.
    return retainStrings ? matrixData : matrixData.map(rowArray => rowArray.map(cellText => +cellText));
  };

  /**
   * Reads a specified number of lines and returns them as a flat array.
   * Each line is treated as a single value.
   * @param {number} quantity - The number of lines to read.
   * @param {boolean} [asStringArray=false] - If true, returns lines as strings; otherwise, converts them to numbers.
   * @returns {Array<string|number>} An array of values from the lines.
   */
  DataStreamProcessor.prototype.getNumericArray = function(quantity, asStringArray) {
    // Slice 'quantity' lines and advance the line index.
    var lineCollection = this._linesOfData.slice(this._currentLineIndex, this._currentLineIndex += quantity);
    // Return the collection, either as strings or numbers.
    return asStringArray ? lineCollection : lineCollection.map(lineContent => +lineContent);
  };

  return createReader; // Export the factory function.
})();


// Initialize the input parsing system.
// Reads data from standard input, assuming UTF-8 encoding.
var parserInstance = INPUT_READER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary calculation logic and output its result to the console.
console.log(calculateMinimumCost());

/**
 * Main function to compute the minimum cost based on input values using dynamic programming.
 * This function encapsulates the core algorithm.
 * @returns {number} The calculated minimum cost.
 */
function calculateMinimumCost() {
  // Read the total number of elements for processing.
  var dataLength = parserInstance.extractValue();

  // Read the 'dataLength' number of input values as an array of numbers.
  var inputValues = parserInstance.getNumericArray(dataLength);

  // Initialize the dynamic programming table.
  // This table will store minimum costs to reach a certain state for the current element.
  var dynamicProgrammingTable = [];

  // Initialize the DP table for the first element.
  // The cost for each of the 5 states is calculated based on the first input value.
  for (var stateIndex = 0; stateIndex < 5; stateIndex++) {
    dynamicProgrammingTable[stateIndex] = transitionCost(inputValues[0], stateIndex);
  }

  // Iterate through the remaining input elements, starting from the second one.
  for (var elementIndex = 1; elementIndex < dataLength; elementIndex++) {
    // Create a temporary array to store costs for the current element's iteration.
    // Initialize with a very large number to represent infinity for minimization.
    var currentIterationCosts = Array(5).fill(9e99);

    // Calculate the cost for the first state (state 0) directly.
    // This often represents a base or default transition.
    currentIterationCosts[0] = dynamicProgrammingTable[0] + inputValues[elementIndex];

    // Iterate through the possible target states (from 1 to 4).
    for (stateIndex = 1; stateIndex < 5; stateIndex++) {
      // For each target state, iterate through all possible previous states (from 0 up to the current target state).
      for (var previousStateIndex = 0; previousStateIndex <= stateIndex; previousStateIndex++) {
        // Calculate the temporary cost:
        // sum of the minimum cost to reach the 'previousStateIndex' for the prior element,
        // plus the cost to transition from the current element's value to the 'stateIndex'.
        var temporaryCost = dynamicProgrammingTable[previousStateIndex] + transitionCost(inputValues[elementIndex], stateIndex);

        // If this newly calculated 'temporaryCost' is less than the currently stored minimum
        // for the 'stateIndex', update it.
        if (currentIterationCosts[stateIndex] > temporaryCost) {
          currentIterationCosts[stateIndex] = temporaryCost;
        }
      }
    }
    // After processing all states for the current element, update the main DP table.
    dynamicProgrammingTable = currentIterationCosts;
  }

  // After iterating through all elements, the minimum cost to reach any of the final states
  // will be the overall minimum cost.
  return Math.min(...dynamicProgrammingTable);


  /**
   * Helper function to determine the cost associated with a specific state transition.
   * The cost depends on the current value and the type of state.
   * @param {number} currentValue - The numeric value from the input array.
   * @param {number} stateType - The index representing the type of state (0-4).
   * @returns {number} The calculated transition cost.
   */
  function transitionCost(currentValue, stateType) {
    // States 0 and 4 have a direct cost equal to the current value.
    if (stateType === 0 || stateType === 4) {
      return currentValue;
    }
    // State 2 has a cost based on (value + 1) modulo 2.
    if (stateType === 2) {
      return (currentValue + 1) % 2;
    }
    // For other states (1 and 3), the cost is 2 if the value is 0, otherwise value modulo 2.
    return currentValue === 0 ? 2 : currentValue % 2;
  }
}