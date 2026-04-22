// This script processes a numerical input to calculate a specific result.
// It leverages a custom data stream iterator for sequential access to input lines.

// --- Core Input Handling ---
// Obtain raw input from standard input, decode it, clean whitespace, and split into individual lines.
const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// --- Data Stream Iterator Definition ---
// Defines an object to manage reading from the processed input lines.
const lineIterator = {
  // The array holding all input lines.
  entries: sourceLines,
  // The current position of the read pointer within the entries array.
  currentPosition: 0,
  // The total count of available entries.
  totalEntries: sourceLines.length,

  /**
   * Retrieves the next available entry from the stream and advances the pointer.
   * @throws {Error} If there are no more elements to retrieve.
   * @returns {string} The next entry.
   */
  advanceAndRetrieve: function() {
    // Before attempting retrieval, verify that more data exists.
    if (!this.canAdvance()) {
      // If the stream is exhausted, signal an error to the caller.
      throw new Error("DataStreamExhausted: No further elements are available for consumption.");
    }
    // Fetch the current entry using the read pointer.
    const retrievedEntry = this.entries[this.currentPosition];
    // Increment the pointer to prepare for the next read operation.
    this.currentPosition++;
    // Return the successfully retrieved entry.
    return retrievedEntry;
  },

  /**
   * Checks if there are more entries available in the stream.
   * @returns {boolean} True if more entries exist, false otherwise.
   */
  canAdvance: function() {
    // The stream has more data if the current pointer is within the bounds of the total entries.
    return (this.currentPosition < this.totalEntries);
  }
};

// --- Global Utility Functions ---

// Main program entry point.
initiateProcessing();

/**
 * Fetches the next raw line from the input stream.
 * @returns {string} The next available line.
 */
function getNextEntry() {
  return lineIterator.advanceAndRetrieve();
}

/**
 * Reads the next line and attempts to parse it as an integer.
 * @returns {number} The parsed integer.
 */
function obtainNumericValue() {
  return dataManipulator(getNextEntry(), 101); // Using a new conversion mode ID
}

/**
 * Reads the next line and splits it by spaces into an array of strings.
 * @returns {string[]} An array of strings.
 */
function getTokensAsStrings() {
  return dataManipulator(getNextEntry(), 102); // Using a new conversion mode ID
}

/**
 * Reads the next line, splits it by spaces, and converts parts to numbers.
 * @returns {number[]} An array of numbers.
 */
function getTokensAsNumbers() {
  return dataManipulator(getNextEntry(), 104); // Using a new conversion mode ID
}

/**
 * Reads the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function getCharactersAsArray() {
  return dataManipulator(getNextEntry(), 106); // Using a new conversion mode ID
}

/**
 * Checks if there are more entries available in the input stream.
 * @returns {boolean} True if data is available, false otherwise.
 */
function isDataAvailable() {
  return lineIterator.canAdvance();
}

/**
 * Displays output to the standard console.
 * @param {any} content The content to display.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Reports an error message to the standard error console.
 * @param {any} errorMessage The error content to report.
 */
function reportError(errorMessage) {
  console.error("ERROR: " + errorMessage);
}

// --- Data Transformation Utility ---
// This function handles various types of data conversions based on the specified mode.
/**
 * Transforms an input value based on a given conversion mode.
 * @param {any} itemToConvert The value to be transformed.
 * @param {number} conversionMode The mode specifying the desired transformation.
 * @returns {any} The transformed value.
 *
 * Conversion Modes:
 * 101: Convert to integer. Returns original if not a valid number.
 * 102: Split string by space into an array of strings.
 * 103: (New) Return input as is, no transformation.
 * 104: Split string by space, then convert each part to a number.
 * 106: Split string into an array of individual characters.
 * 108: Join array elements with " | ".
 * 109: Join array elements with a newline character.
 * 110: Join array elements without any separator.
 * Default: Returns the original input value.
 */
function dataManipulator(itemToConvert, conversionMode) {
  try {
    // A nested function for converting string elements to numbers.
    const toNumerical = (str) => Number(str);

    switch (conversionMode) {
      case 101: // Convert to integer
        // Using parseInt with radix 10 for explicit decimal conversion.
        let parsedInt = parseInt(itemToConvert, 10);
        // If parsing results in NaN, return the original item.
        return isNaN(parsedInt) ? itemToConvert : parsedInt;
      case 102: // Split by space into string array
        // Ensure input is a string before splitting.
        return String(itemToConvert).split(" ");
      case 103: // Return input as is (new mode)
        return itemToConvert;
      case 104: // Split by space into number array
        // Apply string conversion, then split, then map to numbers.
        return String(itemToConvert).split(" ").map(toNumerical);
      case 106: // Split into character array
        // Convert to string and then split into characters.
        return String(itemToConvert).split("");
      case 108: // Join array elements with " | "
        // Ensure input is an array before joining.
        return Array.isArray(itemToConvert) ? itemToConvert.join(" | ") : itemToConvert;
      case 109: // Join array elements with newline
        return Array.isArray(itemToConvert) ? itemToConvert.join("\n") : itemToConvert;
      case 110: // Join array elements without separator
        return Array.isArray(itemToConvert) ? itemToConvert.join("") : itemToConvert;
      default:
        // For any unknown mode, simply return the original item.
        return itemToConvert;
    }
  } catch (operationError) {
    // In case of any error during transformation, log it and return the original item.
    reportError(`Transformation failed for mode ${conversionMode}: ${operationError.message}`);
    return itemToConvert;
  }
}

/**
 * The main logic execution function.
 * This function orchestrates the reading of input, performs calculations, and outputs the result.
 */
function initiateProcessing() {
  // Validate if there's any data available before proceeding.
  if (!isDataAvailable()) {
    reportError("No input data provided to process.");
    return; // Exit if no data.
  }

  // Read the primary numerical input value.
  const targetValue = obtainNumericValue();

  // Basic validation: Ensure the targetValue is a number.
  if (typeof targetValue !== 'number' || isNaN(targetValue)) {
    reportError(`Invalid input detected: "${targetValue}". Expected a numeric value.`);
    return;
  }

  // Intermediate variable for the division result.
  const divisionQuotient = Math.floor(targetValue / 11);
  // Calculate the base output value.
  let finalAnswer = divisionQuotient * 2;

  // Determine the remainder for further adjustment.
  const moduloResult = targetValue % 11;

  // Apply conditional adjustments based on the remainder.
  if (moduloResult >= 6) {
    // If remainder is 6 or more, add 2 to the result.
    finalAnswer += 2;
  } else if (moduloResult > 0) {
    // If remainder is between 1 and 5 (inclusive), add 1 to the result.
    finalAnswer++;
  }
  // No action needed if moduloResult is 0.

  // Display the final computed answer.
  displayResult(finalAnswer);
}