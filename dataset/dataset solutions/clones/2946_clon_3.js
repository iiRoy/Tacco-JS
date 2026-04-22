"use strict";

// This class is responsible for parsing input data from a multi-line string.
// It allows reading tokens one by one or an entire line at once.
class InputProcessor {
  // Initializes the input processor.
  // @param {string} rawSourceData - The complete input string, typically from a file.
  // @param {function} [initialParser=Number] - An optional function to parse tokens. Defaults to Number.
  constructor(rawSourceData, initialParser) {
    // Validate input data to prevent errors later.
    if (typeof rawSourceData !== 'string' || rawSourceData.length === 0) {
      throw new Error("InputProcessor: Raw source data must be a non-empty string.");
    }

    this.lineSegments = rawSourceData.split("\n"); // Stores each line of input as a string.
    this.tokenPosition = 0;                        // Index of the current token within the active line.
    this.lineCursor = 0;                           // Index of the current line being processed.
    this.defaultParseFunction = initialParser || Number; // Function used to convert string tokens.
  }

  // Internal helper to advance the token and line pointers.
  // @param {string[]} currentLineTokens - An array of tokens from the current line.
  // @returns {boolean} True if the line cursor advanced, false if only the token position advanced.
  _advanceStreamPointers(currentLineTokens) {
    this.tokenPosition++;
    // If all tokens on the current line have been consumed, reset token position and move to the next line.
    if (this.tokenPosition >= currentLineTokens.length) {
      this.tokenPosition = 0;
      this.lineCursor++;
      return true; // Indicates a line advance
    }
    return false; // Indicates only token advance
  }

  // Reads and parses the next individual token from the input stream.
  // @param {function} [tokenConversionFn] - An optional custom function to parse this specific token.
  // @returns {any|undefined} The parsed token value, or undefined if no more input lines.
  getNextToken(tokenConversionFn) {
    const activeLineContent = this.lineSegments[this.lineCursor];

    // If there are no more lines, return undefined.
    if (activeLineContent === undefined) {
      return undefined;
    }

    // Split the current line into individual tokens. `trim()` handles leading/trailing whitespace.
    // Note: `"".trim().split(" ")` results in `[""]`. `Number("")` is `0`. This behavior is preserved.
    const tokensFromCurrentLine = activeLineContent.trim().split(" ");

    // Get the string value of the current token.
    const rawTokenValue = tokensFromCurrentLine[this.tokenPosition];
    const parserToApply = tokenConversionFn || this.defaultParseFunction;

    // Advance the internal pointers immediately after retrieving the token.
    this._advanceStreamPointers(tokensFromCurrentLine);

    // Parse and return the token.
    return parserToApply(rawTokenValue);
  }

  // Reads and parses all tokens from the current line, then advances to the next line.
  // @param {function} [lineTokenConversionFn] - An optional custom function to parse each token on the line.
  // @returns {Array<any>} An array of parsed token values, or an empty array if no more input lines.
  getLineTokens(lineTokenConversionFn) {
    const currentLineStringData = this.lineSegments[this.lineCursor];

    // If no more lines, return an empty array.
    if (currentLineStringData === undefined) {
      return [];
    }

    // Reset token position and advance the line cursor.
    this.tokenPosition = 0;
    this.lineCursor++;

    const parserForLine = lineTokenConversionFn || this.defaultParseFunction;
    const allTokensOnLine = currentLineStringData.trim().split(" ");

    // Map each token string to its parsed value.
    // `[""]` for an empty line will be mapped to `[0]` if Number is the parser.
    return allTokensOnLine.map(parserForLine);
  }
}

// Main function to execute the problem logic.
// @param {string} dataSource - The raw input string containing all operations.
function processOperations(dataSource) {
  // Initialize the input data processor.
  const dataReader = new InputProcessor(dataSource);

  // Read the total number of operations to be performed.
  const totalOperationCount = dataReader.getNextToken();

  // An accumulator for certain values encountered during Type 1 operations.
  let cumulativeSumValue = 0;
  // An array to store values that will be sorted and used for median calculations.
  let storedValuesRegister = [];

  // Iterate through each operation as specified by the input.
  for (let operationIteration = 0; operationIteration < totalOperationCount; operationIteration++) {
    // Determine the type of the current operation.
    const currentOperationIdentifier = dataReader.getNextToken();

    if (currentOperationIdentifier === 1) {
      // Operation Type 1: Add values to the register and update the cumulative sum.
      const firstOperand = dataReader.getNextToken();  // Value to be stored.
      const secondOperand = dataReader.getNextToken(); // Value to add to the cumulative sum.

      cumulativeSumValue += secondOperand;        // Update the running total.
      storedValuesRegister.push(firstOperand);    // Add the operand to the collection.
    } else {
      // Operation Type 2 (or any other identifier): Perform calculations and output results.

      // Guard clause: If the register is empty, we cannot calculate a median or differences.
      if (storedValuesRegister.length === 0) {
          // Output a default median (0) and the current cumulative sum.
          console.log(0, cumulativeSumValue);
          continue; // Skip further calculations for this empty state.
      }

      // Sort the array of stored values in ascending order. This modifies the array in place.
      storedValuesRegister.sort((valA, valB) => valA - valB);

      // Determine the median element from the sorted values.
      const currentRegisterSize = storedValuesRegister.length;
      const medianElementIndex = Math.floor((currentRegisterSize - 1) / 2);
      const computedMedian = storedValuesRegister[medianElementIndex];

      // Calculate the sum of absolute differences between each stored value and the median.
      let absoluteDifferenceSum = 0;
      for (const dataElement of storedValuesRegister) {
          absoluteDifferenceSum += Math.abs(dataElement - computedMedian);
      }

      // The final result is the sum of differences plus the cumulative sum.
      const finalComputedOutcome = absoluteDifferenceSum + cumulativeSumValue;

      // Output the computed median and the final calculated outcome.
      console.log(computedMedian, finalComputedOutcome);
    }
  }
}

// Standard boilerplate for reading input from stdin in Node.js.
// Using explicit variable names for clarity and Type III transformation.
const fileSystemModuleReference = require("fs");
const standardInputFileLocation = "/dev/stdin";
const textEncodingFormat = "utf8";

// Read the entire content of the standard input file synchronously.
const rawInputContentString = fileSystemModuleReference.readFileSync(standardInputFileLocation, textEncodingFormat);

// Invoke the primary processing logic with the raw input.
processOperations(rawInputContentString);