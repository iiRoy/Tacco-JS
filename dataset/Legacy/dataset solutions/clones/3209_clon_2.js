"use strict";

/**
 * Custom input parser class.
 * Reads data from a string, line by line, token by token.
 */
function InputParser(sourceString, parseFunc) {
  this._sourceLines = sourceString.split("\n"); // Stores all lines from the input string
  this._currentColumn = 0; // Current token index within the current line
  this._currentLine = 0; // Current line index
  this._parseFunction = parseFunc || Number; // Function to parse tokens (defaults to Number)
}

/**
 * Reads and parses the next single value from the input stream.
 * Advances the internal pointers.
 */
InputParser.prototype.readNextValue = function() {
  // Get the content of the current line
  let currentLineContent = this._sourceLines[this._currentLine];
  if (!currentLineContent) {
    return; // No more lines to read
  }

  // Split the current line into tokens and retrieve the token at the current column
  let tokensOnLine = currentLineContent.trim().split(" ");
  let valueToken = tokensOnLine[this._currentColumn];
  this._currentColumn++; // Move to the next column

  // If all tokens on the current line have been consumed, reset column and advance to the next line
  if (tokensOnLine.length === this._currentColumn) {
    this._currentColumn = 0;
    this._currentLine++;
  }
  // Parse the token using the specified parse function and return it
  return this._parseFunction(valueToken);
};

/**
 * Reads and parses all values from the current line.
 * Advances the internal line pointer.
 */
InputParser.prototype.readLineValues = function() {
  // Get the content of the current line
  let currentLineContent = this._sourceLines[this._currentLine];
  if (!currentLineContent) {
    return; // No more lines to read
  }
  // Reset column pointer as we're moving to a new line, and advance the line pointer
  this._currentColumn = 0;
  this._currentLine++;
  // Split the line into tokens, parse each token, and return the array of parsed values
  return currentLineContent.split(" ").map(this._parseFunction);
};

// Export the InputParser class for use in other modules
module.exports = InputParser;

/**
 * Main function to process the input data and compute the result.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInputData(rawData) {
  // Create an instance of the custom input parser
  const parserInstance = new InputParser(rawData);
  
  // Read the first value, which represents the length of the sequence
  const dataLength = parserInstance.readNextValue();

  // Initialize an array to store the sequence of numbers
  const inputArray = [];
  // Loop to read 'dataLength' number of values into the array
  for (let loopCounter = 0; loopCounter < dataLength; loopCounter++) {
    inputArray.push(parserInstance.readNextValue());
  }

  // Initialize a 2D array for dynamic programming.
  // `dynamicProgrammingTable[i][j]` will store the minimum cost for the first `i` elements
  // ending in state `j`. There are 5 states (0 to 4).
  const dynamicProgrammingTable = Array(dataLength + 1).fill().map(() => Array(5).fill());
  // Base case: For 0 elements, the cost is 0 for all states.
  dynamicProgrammingTable[0] = [0, 0, 0, 0, 0];

  // Iterate through the input array from the first element up to 'dataLength'
  for (let idx = 1; idx <= dataLength; idx++) {
    let currentValue = inputArray[idx - 1]; // Get the current number from the input array
    
    // Calculate costs based on parity of the current value.
    // If currentValue is 0, it's treated specially for 'evenCost' (cost 2). Otherwise, it's currentValue % 2.
    let evenCost = currentValue === 0 ? 2 : currentValue % 2;
    // 'oddCost' is (currentValue + 1) % 2. This correctly gives 1 for even, 0 for odd.
    let oddCost = (currentValue + 1) % 2;

    // Fill the DP table for the current index 'idx' based on previous states
    // State 0: Accumulative sum of all numbers.
    dynamicProgrammingTable[idx][0] = dynamicProgrammingTable[idx - 1][0] + currentValue;
    // State 1: Minimum cost to reach this state, considering previous state 0 or 1, plus 'evenCost'.
    dynamicProgrammingTable[idx][1] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1]) + evenCost;
    // State 2: Minimum cost to reach this state, considering previous state 0, 1, or 2, plus 'oddCost'.
    dynamicProgrammingTable[idx][2] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1], dynamicProgrammingTable[idx - 1][2]) + oddCost;
    // State 3: Minimum cost to reach this state, considering previous state 2 or 3, plus 'evenCost'.
    dynamicProgrammingTable[idx][3] = Math.min(dynamicProgrammingTable[idx - 1][2], dynamicProgrammingTable[idx - 1][3]) + evenCost;
    // State 4: Minimum cost to reach this state, considering all previous states, plus 'currentValue'.
    dynamicProgrammingTable[idx][4] = Math.min(dynamicProgrammingTable[idx - 1][0], dynamicProgrammingTable[idx - 1][1], dynamicProgrammingTable[idx - 1][2], dynamicProgrammingTable[idx - 1][3], dynamicProgrammingTable[idx - 1][4]) + currentValue;
  }

  // After filling the entire DP table, the final answer is the minimum value
  // among all states for the last element (dataLength).
  console.log(Math.min(...dynamicProgrammingTable[dataLength]));
}

// Read the entire content of stdin as a UTF-8 string and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
