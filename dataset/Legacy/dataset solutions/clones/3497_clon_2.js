function InputReader(inputString) {
  // Store the input string, splitting it into an array of lines.
  this._sourceLines = inputString.split("\n");
  // Initialize the index for the current line being processed.
  this._currentLineIndex = 0x0;
}

// Attach methods to the InputReader's prototype for efficient input handling.
InputReader.prototype = {
  /**
   * Reads the next token from the current line.
   * @param {boolean} keepStrings - If true, returns the token as a string; otherwise, converts it to a number.
   * @returns {string|number} The extracted token.
   */
  readNextToken: function(keepStrings) {
    let lineData = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let extractedToken;

    // If the current line hasn't been tokenized yet, split it by spaces and reverse for easy popping.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Extract the last token from the current line's array.
    extractedToken = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, either in its original string form or as a numeric value.
    return keepStrings ? extractedToken : +extractedToken;
  },

  /**
   * Reads all tokens from the current line.
   * @param {boolean} keepStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  readLineTokens: function(keepStrings) {
    // Get the current line, split it by spaces, and then increment the line index.
    let tokens = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return the array of tokens, applying numeric conversion if specified.
    return keepStrings ? tokens : tokens.map(val => +val);
  },

  /**
   * Reads a specified number of lines, splitting each into tokens.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} keepStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
   * @returns {Array<Array<string|number>>} An array of arrays, where each inner array represents a line's tokens.
   */
  readMultipleLines: function(numLines, keepStrings) {
    let lineData = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let parsedData = new Array(); // Initialize an empty array to store results.
    let loopCounter = 0x0;

    // Iterate through the specified number of lines.
    if (keepStrings) {
      for (; loopCounter < numLines; loopCounter++) {
        parsedData[loopCounter] = lineData[lineIdx + loopCounter].split(" ");
      }
    } else {
      for (; loopCounter < numLines; loopCounter++) {
        parsedData[loopCounter] = lineData[lineIdx + loopCounter].split(" ").map(val => +val);
      }
    }

    // Advance the current line index by the number of lines processed.
    this._currentLineIndex += numLines;
    return parsedData;
  },
};

// Create an instance of the InputReader, reading data from standard input.
let inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving function and output its return value to the console.
console.log(solveProblem());

/**
 * Contains the core logic to solve the problem.
 * @returns {number} The final calculated result.
 */
function solveProblem() {
  // Read the two input numbers.
  let firstNum = inputProcessor.readNextToken();
  let secondNum = inputProcessor.readNextToken();

  // Create an object to store divisors and their corresponding quotients.
  let divisorMap = new Object();

  // Find all divisors of 'secondNum' up to its square root.
  // If 'idx' is a divisor, then 'secondNum / idx' is also a divisor.
  for (let idx = 0x1; idx * idx <= secondNum; idx++) {
    if (secondNum % idx === 0x0) {
      divisorMap[idx] = secondNum / idx;
    }
  }

  // Initialize the variable to store the largest qualifying divisor.
  let finalResult = 0x1;

  // Iterate through the keys (divisors) in the map.
  for (let key in divisorMap) {
    // Check if the complement divisor (value) is greater than or equal to 'firstNum'.
    // Also, check if the current divisor (key) is larger than the current 'finalResult'.
    if (divisorMap[key] >= firstNum) {
      if (finalResult < +key) { // Convert key to number for comparison.
        finalResult = +key;
      }
    }
  }
  // Return the largest divisor found that satisfies the conditions.
  return finalResult;
}
