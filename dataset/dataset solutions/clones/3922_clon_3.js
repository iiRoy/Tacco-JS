"use strict";

/**
 * Utility class for parsing input data from a string.
 * It provides methods to sequentially read integers and strings.
 */
class DataParser {
  /**
   * Initializes the parser with raw input content.
   * @param {string} sourceData - The raw string data to be parsed, typically from standard input.
   * @throws {Error} If the sourceData is undefined or null.
   */
  constructor(sourceData) {
    // Validate input source data.
    if (typeof sourceData === 'undefined' || sourceData === null) {
      throw new Error('Input source data must not be undefined or null!');
    }

    // Split the entire input string by any whitespace (newlines, spaces, tabs)
    // and filter out any empty strings that might result from multiple delimiters.
    this.parsedItems = String(sourceData).trim().split(/\s+/).filter(Boolean);
    this.currentIndex = 0; // Tracks the current position in the parsed items array.
  }

  /**
   * Reads the next available item from the parsed input as an integer.
   * @returns {number} The integer value of the next item.
   * @throws {Error} If attempting to read beyond the available data.
   */
  readInteger() {
    // Check if there are more items to read.
    if (!this.hasMoreItems()) {
      throw new Error('Attempted to read past the end of available input data.');
    }

    // Retrieve the next item and advance the index.
    const currentItemString = this.parsedItems[this.currentIndex++];
    // Parse the string to an integer with base 10.
    const parsedNumericValue = parseInt(currentItemString, 10);

    // Basic validation for the parsed integer.
    if (isNaN(parsedNumericValue)) {
      // Log a warning or throw an error depending on strictness requirements.
      console.warn(`Warning: Could not convert "${currentItemString}" to an integer. Returning 0.`);
      return 0; // Default or error value.
    }

    return parsedNumericValue;
  }

  /**
   * Reads a specified number of items as integers and returns them in an array.
   * @param {number} count - The number of integers to read. Must be a positive number.
   * @returns {number[]} An array containing the parsed integers.
   * @throws {Error} If count is not a positive number.
   */
  readIntegerArray(count) {
    if (typeof count !== 'number' || count <= 0) {
      throw new Error('The count for reading an integer array must be a positive number!');
    }
    const integerCollection = [];
    for (let i = 0; i < count; i++) {
      integerCollection.push(this.readInteger());
    }
    return integerCollection;
  }

  /**
   * Reads the next available item from the parsed input as a string.
   * @returns {string} The string value of the next item.
   * @throws {Error} If attempting to read beyond the available data.
   */
  readString() {
    if (!this.hasMoreItems()) {
      throw new Error('Attempted to read past the end of available input data.');
    }
    return this.parsedItems[this.currentIndex++];
  }

  /**
   * Reads a specified number of items as strings and returns them in an array.
   * @param {number} count - The number of strings to read. Must be a positive number.
   * @returns {string[]} An array containing the parsed strings.
   * @throws {Error} If count is not a positive number.
   */
  readStringArray(count) {
    if (typeof count !== 'number' || count <= 0) {
      throw new Error('The count for reading a string array must be a positive number!');
    }
    const stringCollection = [];
    for (let i = 0; i < count; i++) {
      stringCollection.push(this.readString());
    }
    return stringCollection;
  }

  /**
   * Checks if there are more items remaining to be read from the input.
   * @returns {boolean} True if more items are available, false otherwise.
   */
  hasMoreItems() {
    return this.currentIndex < this.parsedItems.length;
  }
}

/**
 * Calculates a specific value based on two input integers, following a defined set of rules.
 * This function encapsulates the core problem-solving logic.
 *
 * @param {number} primaryValue - The first integer for calculation.
 * @param {number} secondaryValue - The second integer for calculation.
 * @returns {number} The computed result according to the problem rules.
 */
function deriveSpecificValue(primaryValue, secondaryValue) {
    // Basic guard clause: Ensure both inputs are valid numbers.
    if (typeof primaryValue !== 'number' || typeof secondaryValue !== 'number' || isNaN(primaryValue) || isNaN(secondaryValue)) {
        // In a real-world application, one might throw an error or handle this more robustly.
        console.error("Invalid numeric input provided to deriveSpecificValue. Expected numbers.");
        return -1; // Return an error indicator or default value.
    }

    let calculatedResult; // Variable to store the final outcome of the computation.

    // Case 1: Both input values are strictly identical.
    if (primaryValue === secondaryValue) {
        // The result is two times one less than the value.
        calculatedResult = (primaryValue - 1) * 2;
    }
    // Case 2: The input values are consecutive (differ by exactly 1).
    else if (primaryValue + 1 === secondaryValue || secondaryValue + 1 === primaryValue) {
        // Determine the smaller of the two values using a ternary operator.
        const minimumOfPair = (primaryValue < secondaryValue) ? primaryValue : secondaryValue;
        // The result is two times one less than the minimum value.
        calculatedResult = (minimumOfPair - 1) * 2;
    }
    // Case 3: General scenario where values are distinct and not consecutive.
    else {
        const productOfInputs = primaryValue * secondaryValue; // Calculate the product of the two values.
        // Find the integer part of the square root of the product.
        // Math.trunc is used as an alternative to Math.floor for positive numbers.
        let baseFactor = Math.trunc(Math.sqrt(productOfInputs));
        
        // If the product is a perfect square of 'baseFactor', decrement 'baseFactor'.
        // This adjustment aligns with the problem's specific logic.
        if ((baseFactor * baseFactor) === productOfInputs) {
            baseFactor--;
        }

        // Apply one of two final calculations based on a comparison involving 'baseFactor'.
        if (baseFactor * (baseFactor + 1) >= productOfInputs) {
            calculatedResult = (baseFactor - 1) * 2;
        } else {
            calculatedResult = (baseFactor * 2) - 1; // Rephrased calculation.
        }
    }
    return calculatedResult;
}

/**
 * Main entry point function for processing a series of queries from the input data.
 * This function orchestrates reading input, performing calculations, and outputting results.
 *
 * @param {string} rawInputData - The entire string content read from the input source (e.g., stdin).
 */
function ProcessQueries(rawInputData) {
    // Instantiate a parser to handle sequential reading of input values.
    const inputHandler = new DataParser(rawInputData);

    // The first integer in the input typically indicates the total number of test cases.
    const numberOfTestCases = inputHandler.readInteger();

    // Iterate through each test case as specified by numberOfTestCases.
    for (let caseIterator = 0; caseIterator < numberOfTestCases; caseIterator++) {
        // For each test case, read the two primary integer values.
        const inputValA = inputHandler.readInteger();
        const inputValB = inputHandler.readInteger();

        // Call the helper function to compute the specific value for the current pair.
        const outputForCurrentCase = deriveSpecificValue(inputValA, inputValB);
        
        // Output the computed result to the console for the current test case.
        console.log(outputForCurrentCase);
    }
}

// Environment-specific execution block.
// This ensures the code runs correctly whether in a browser (where 'window' is defined)
// or in a Node.js-like environment (where 'window' is undefined).
if (typeof window === "undefined") {
    // If 'window' is undefined, we assume a Node.js environment.
    // In Node.js, input is typically read from standard input (/dev/stdin).
    
    // Import the 'fs' (file system) module, which is standard in Node.js.
    const fileSystemModule = require("fs");
    // Define the path to the standard input file.
    const standardInputFilePath = "/dev/stdin";

    // Read the entire content of the standard input file synchronously.
    // The content is read as a UTF-8 encoded string.
    const fullInputContent = fileSystemModule.readFileSync(standardInputFilePath, "utf8");

    // Execute the main query processing function with the obtained input data.
    ProcessQueries(fullInputContent);
}