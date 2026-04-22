// This module provides utilities for reading standard input and processing data.

// Imports the Node.js file system module for reading input.
const fileSystem = require("fs");

// Defines the default path for standard input.
const standardInputPath = "/dev/stdin";

/**
 * Reads and preprocesses input data from a specified path.
 * @param {string} filePath - The path to the input file. Defaults to standardInputPath.
 * @returns {string[]} An array of strings, where each string is a line from the input.
 */
function acquireSourceData(filePath = standardInputPath) {
  try {
    const rawInput = fileSystem.readFileSync(filePath, "utf8");
    // Ensure no leading/trailing whitespace and split by newline.
    const processedLines = rawInput.trim().split("\n");
    if (processedLines.length === 0 || (processedLines.length === 1 && processedLines[0] === '')) {
      // Handle cases where the input is entirely empty or just whitespace.
      return [];
    }
    return processedLines;
  } catch (error) {
    // Log the error and return an empty array or rethrow.
    console.error("Failed to read input data:", error.message);
    return []; // Or throw new Error("Input data acquisition failed.");
  }
}

/**
 * Creates an iterator-like object to navigate through an array of data lines.
 * @param {string[]} linesArray - An array of strings, typically lines from an input file.
 * @returns {object} An object with methods to consume the data.
 */
function createInputNavigator(linesArray) {
  let currentPosition = 0;
  const dataStore = linesArray;
  const totalEntries = linesArray.length;

  return {
    /**
     * Checks if there are more entries available to read.
     * @returns {boolean} True if more entries exist, false otherwise.
     */
    hasMoreEntries: function() {
      return currentPosition < totalEntries;
    },

    /**
     * Retrieves the next entry from the data store.
     * Throws an error if no more entries are available.
     * @returns {string} The next entry.
     */
    retrieveNextEntry: function() {
      if (!this.hasMoreEntries()) {
        throw new Error("DataDepletionException: No further data elements are available.");
      }
      const itemToReturn = dataStore[currentPosition];
      currentPosition++; // Advance the pointer.
      return itemToReturn;
    },

    /**
     * Peeks at the next entry without advancing the position.
     * @returns {string|null} The next entry or null if none.
     */
    peekNextEntry: function() {
      if (!this.hasMoreEntries()) {
        return null;
      }
      return dataStore[currentPosition];
    }
  };
}

// Initialize the data source and the navigator.
const sourceData = acquireSourceData();
const dataNavigator = createInputNavigator(sourceData);

// Guard clause for empty input.
if (sourceData.length === 0) {
    console.error("No input data provided. Exiting.");
    process.exit(1); // Exit with an error code
}

// Global utility functions for data retrieval and transformation.

/**
 * Fetches the next available line of input.
 * @returns {string} The next line.
 */
function fetchNextLine() {
  return dataNavigator.retrieveNextEntry();
}

/**
 * Converts a string to an integer.
 * @param {string} inputString - The string to convert.
 * @returns {number} The parsed integer.
 */
function parseStringToInt(inputString) {
  const parsed = parseInt(inputString, 10);
  if (isNaN(parsed)) {
    // Optionally handle error or return a default/throw.
    console.warn(`Warning: Could not parse "${inputString}" as an integer. Returning 0.`);
    return 0;
  }
  return parsed;
}

/**
 * Splits a string by space into an array of strings.
 * @param {string} inputString - The string to split.
 * @returns {string[]} An array of substrings.
 */
function splitByWhitespace(inputString) {
  return inputString.split(" ");
}

/**
 * Splits a string by space and converts each part to a number.
 * @param {string} inputString - The string to split and convert.
 * @returns {number[]} An array of numbers.
 */
function splitAndParseInts(inputString) {
  return inputString.split(" ").map(Number);
}

/**
 * Splits a string into an array of individual characters.
 * @param {string} inputString - The string to split.
 * @returns {string[]} An array of characters.
 */
function splitIntoChars(inputString) {
  return inputString.split("");
}

/**
 * Splits a string into characters and converts each to a number.
 * @param {string} inputString - The string to split and convert.
 * @returns {number[]} An array of numbers.
 */
function splitCharsAndParseInts(inputString) {
  return inputString.split("").map(Number);
}

/**
 * Joins an array of elements with a space.
 * @param {Array} elements - The array to join.
 * @returns {string} The joined string.
 */
function joinWithSpaces(elements) {
  return elements.join(" ");
}

/**
 * Joins an array of elements with a newline character.
 * @param {Array} elements - The array to join.
 * @returns {string} The joined string.
 */
function joinWithNewlines(elements) {
  return elements.join("\n");
}

/**
 * Joins an array of elements without any separator.
 * @param {Array} elements - The array to join.
 * @returns {string} The joined string.
 */
function joinWithoutSeparator(elements) {
  return elements.join("");
}

/**
 * Central dispatcher for various data transformations based on a numerical type code.
 * @param {*} dataInput - The data to be transformed.
 * @param {number} transformationType - An integer code specifying the type of transformation.
 * @returns {*} The transformed data.
 */
function performDataTransformation(dataInput, transformationType) {
  try {
    switch (transformationType) {
      case 1: // Convert to integer
        return parseStringToInt(dataInput);
      case 2: // Split by space (string array)
        return splitByWhitespace(dataInput);
      case 4: // Split by space and convert to integer array
        return splitAndParseInts(dataInput);
      case 6: // Split into character array
        return splitIntoChars(dataInput);
      case 7: // Split into character array and convert to integer array
        return splitCharsAndParseInts(dataInput);
      case 8: // Join array with spaces
        return joinWithSpaces(dataInput);
      case 9: // Join array with newlines
        return joinWithNewlines(dataInput);
      case 0: // Join array without separator
        return joinWithoutSeparator(dataInput);
      default: // No specific transformation, return as is
        return dataInput;
    }
  } catch (error) {
    // If transformation fails, log and return original input as a fallback.
    console.error(`Error during data transformation (type ${transformationType}): ${error.message}`);
    return dataInput;
  }
}

// Aliases for common input operations using the navigator and transformer.
function retrieveInteger() { return performDataTransformation(fetchNextLine(), 1); }
function retrieveStringArray() { return performDataTransformation(fetchNextLine(), 2); }
function retrieveIntegerArray() { return performDataTransformation(fetchNextLine(), 4); }
function retrieveCharacterArray() { return performDataTransformation(fetchNextLine(), 6); }
function hasMoreInput() { return dataNavigator.hasMoreEntries(); }

/**
 * Prints a message to the standard output.
 * @param {*} content - The content to be logged.
 */
function emitOutput(content) {
  console.log(String(content)); // Ensure content is stringified for consistent output.
}

/**
 * Prints an error message to the standard error stream.
 * @param {*} errorMessage - The error message to be logged.
 */
function emitError(errorMessage) {
  console.error(`[ERROR] ${errorMessage}`); // Added a prefix for error messages.
}

/**
 * Executes the primary logic of the application.
 * This function processes two arrays of numbers and determines a specific condition.
 */
function processApplication() {
  // Read the size of the arrays from input.
  const datasetSize = retrieveInteger();

  // Basic validation for dataset size.
  if (datasetSize <= 0) {
    emitError("Invalid dataset size. Must be a positive integer.");
    // Early exit or throw error for invalid input.
    return;
  }

  // Retrieve the two arrays of integers.
  const collectionA = retrieveIntegerArray();
  const collectionB = retrieveIntegerArray();

  // Validate array lengths match the declared size.
  if (collectionA.length !== datasetSize || collectionB.length !== datasetSize) {
      emitError("Array length mismatch with declared dataset size. Exiting.");
      return;
  }

  // This accumulator tracks the balance of required adjustments.
  let adjustmentBalance = 0;

  // First pass: Process elements where A is less than B.
  // These elements require 'filling', which adds to the balance.
  for (let currentIdx = 0; currentIdx < datasetSize; currentIdx++) {
    const valueA = collectionA[currentIdx];
    const valueB = collectionB[currentIdx];

    if (valueA < valueB) {
      // The original calculation was `Math.floor(bList[i] - aList[i] / 2)`.
      // This means `Math.floor(valueB - (valueA / 2))`.
      // We maintain this specific operator precedence.
      const calculatedAddition = Math.floor(valueB - (valueA / 2));
      adjustmentBalance += calculatedAddition;
    }
  }

  // Second pass: Process elements where A is greater than B.
  // These elements represent an 'excess' that needs to be reduced from the balance.
  for (let currentIdx = 0; currentIdx < datasetSize; currentIdx++) {
    const valueA = collectionA[currentIdx];
    const valueB = collectionB[currentIdx];

    if (valueA > valueB) {
      const excess = valueA - valueB;
      adjustmentBalance -= excess;
    }
  }

  // Final determination based on the accumulated balance.
  // If the balance is non-negative, the condition is met.
  const outcomeMessage = (adjustmentBalance >= 0) ? "Yes" : "No";
  emitOutput(outcomeMessage);
}

// Initiate the application's main execution flow.
processApplication();