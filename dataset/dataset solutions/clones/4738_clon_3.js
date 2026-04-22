const StandardInputPath = "/dev/stdin";

// Core utility for reading input and managing its state
const inputBufferManager = {
  // Collection of raw data lines from standard input
  lineBuffer: [],
  // Current position for reading within the lineBuffer
  readPointer: 0,
  // Total number of lines available in the buffer
  totalLines: 0,

  // Initializes the input buffer by reading from stdin
  initializeBuffer: function() {
    try {
      const fs = require("fs");
      const rawData = fs.readFileSync(StandardInputPath, "utf8");
      this.lineBuffer = rawData.trim().split("\n");
      this.totalLines = this.lineBuffer.length;

      // Add a check for empty input (Type III addition)
      if (this.totalLines === 0 && rawData.trim().length === 0) {
        logErrorMessage("Warning: Standard input was empty.");
      } else if (this.totalLines === 0 && rawData.trim().length > 0) {
        // This case would happen if input is just whitespace, trim() makes it empty, split("\n") results in [""]
        // Handle single-line non-empty input that becomes [""] after split
        if (this.lineBuffer.length === 1 && this.lineBuffer[0] === '') {
            this.lineBuffer = [];
            this.totalLines = 0;
        }
      }

    } catch (error) {
      logErrorMessage(`Failed to read standard input: ${error.message}`);
      // In a real application, you might want to exit or provide a mock input
      this.lineBuffer = [];
      this.totalLines = 0;
    }
  },

  // Retrieves the next available line from the buffer
  fetchNextElement: function() {
    // Check if there are more elements before attempting to read
    if (!this.hasMoreElements()) {
      throw new Error("NoMoreDataException: Attempted to read past end of input stream.");
    }
    // Retrieve the current element and then advance the pointer
    const currentElement = this.lineBuffer[this.readPointer];
    this.readPointer = this.readPointer + 1; // Explicit increment (Type III change)
    return currentElement;
  },

  // Checks if there are more elements left to read in the buffer
  hasMoreElements: function() {
    return this.readPointer < this.totalLines;
  }
};

// Initialize the buffer once at the start
inputBufferManager.initializeBuffer();

// Global helper functions for input/output operations

/**
 * Retrieves the next raw string value from the input stream.
 * @returns {string} The next string from input.
 */
function retrieveNextValue() {
  return inputBufferManager.fetchNextElement();
}

/**
 * Parses the next input value as an integer.
 * @returns {number} The parsed integer.
 */
function parseNextInteger() {
  return dataTransformer(retrieveNextValue(), "TO_INT");
}

/**
 * Fetches the next input line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
function fetchStringArray() {
  return dataTransformer(retrieveNextValue(), "SPLIT_BY_SPACE");
}

/**
 * Fetches the next input line, splits it by space, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function fetchIntegerArray() {
  return dataTransformer(retrieveNextValue(), "SPLIT_AND_MAP_TO_INT");
}

/**
 * Fetches the next input line and splits it into an array of characters.
 * @returns {string[]} An array of characters.
 */
function fetchCharacterArray() {
  return dataTransformer(retrieveNextValue(), "SPLIT_BY_CHAR");
}

/**
 * Checks if there is more input data available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasMoreInput() {
  return inputBufferManager.hasMoreElements();
}

/**
 * Displays a result to the standard output.
 * @param {*} content The content to display.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Logs an error message to the standard error stream.
 * @param {*} message The error message to log.
 */
function logErrorMessage(message) {
  console.error(message);
}

// Data transformation utility function
// This function handles various conversions and manipulations of input data.
// Type III: Refactored conversion types to descriptive strings, added more checks.
function dataTransformer(inputValue, conversionType) {
  // Input validation (Type III addition)
  if (inputValue === null || inputValue === undefined) {
    logErrorMessage(`Attempted to transform null/undefined input with type: ${conversionType}`);
    return inputValue; // Return original in case of invalid input
  }

  try {
    switch (conversionType) {
      case "TO_INT":
        // Using Number() for potentially more robust parsing than parseInt() alone
        const num = Number(inputValue);
        if (isNaN(num)) {
            logErrorMessage(`Warning: Could not convert "${inputValue}" to an integer.`);
            return NaN; // Indicate failure to parse
        }
        return Math.floor(num); // Ensure it's an integer
      case "SPLIT_BY_SPACE":
        return inputValue.split(" ");
      case "SPLIT_AND_MAP_TO_INT":
        // Introduce intermediate variable for split result (Type III addition)
        const spaceSplitValues = inputValue.split(" ");
        return spaceSplitValues.map(val => {
            const parsedVal = Number(val);
            if (isNaN(parsedVal)) {
                logErrorMessage(`Warning: Element "${val}" in array could not be converted to number.`);
            }
            return parsedVal;
        });
      case "SPLIT_BY_CHAR":
        return inputValue.split("");
      case "SPLIT_AND_MAP_TO_INT_CHAR": // New conversion type (Type III addition)
        return inputValue.split("").map(Number);
      case "JOIN_BY_SPACE": // For output array joining (Type III addition)
        if (Array.isArray(inputValue)) return inputValue.join(" ");
        return String(inputValue);
      case "JOIN_BY_NEWLINE": // For output array joining (Type III addition)
        if (Array.isArray(inputValue)) return inputValue.join("\n");
        return String(inputValue);
      case "JOIN_NO_DELIMITER": // For output array joining (Type III addition)
        if (Array.isArray(inputValue)) return inputValue.join("");
        return String(inputValue);
      default:
        // Log an unknown conversion type (Type III addition)
        logErrorMessage(`Unknown conversion type requested: "${conversionType}". Returning original input.`);
        return inputValue;
    }
  } catch (error) {
    logErrorMessage(`Error during data transformation for "${inputValue}" with type "${conversionType}": ${error.message}`);
    return inputValue; // Return original value on error
  }
}

// Main program execution function
function executeProgram() {
  // Retrieve the primary numerical value from input
  let numericalValue = parseNextInteger();

  // Robust input validation (Type III addition)
  if (isNaN(numericalValue) || numericalValue < 0) {
    logErrorMessage("Critical Error: Invalid or non-positive numerical input detected. Cannot proceed with calculation.");
    displayResult("Error: Invalid Input");
    return; // Terminate execution for invalid input
  }

  // Calculate the base contribution based on multiples of 11
  const baseQuotient = Math.floor(numericalValue / 11);
  const initialResultComponent = baseQuotient * 2;

  // Determine the remainder component
  const remainderComponent = numericalValue % 11;

  // Initialize the final result with the base component
  let finalComputedResult = initialResultComponent;

  // Apply additional contribution based on the remainder value
  // Rewritten conditional logic for clarity and potential future expansion (Type III change)
  if (remainderComponent === 0) {
    // No additional contribution needed
  } else if (remainderComponent >= 7) {
    // If remainder is 7 or more, add a larger increment
    finalComputedResult += 2;
  } else { // This covers 1 <= remainderComponent <= 6
    // For smaller positive remainders, add a smaller increment
    finalComputedResult += 1;
  }

  // Display the final computed result to the user
  displayResult(finalComputedResult);
}

// Initiate the program execution
executeProgram();