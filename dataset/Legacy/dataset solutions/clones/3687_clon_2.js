// This script provides a framework for reading input, performing calculations, and displaying results.
// It is designed to process structured data from standard input.

var inputHandler = initializeInputReader(); // Global instance for managing input lines.

ProcessData(); // Initiates the main execution flow of the application.

/**
 * Reads the next available line from the input buffer and converts it to an integer.
 * @returns {number} The integer value of the next input line.
 */
function readInteger() {
  return convertInput(getNextLine(), 1);
}

/**
 * Reads the next line, splits it by spaces, and returns an array of strings.
 * @returns {string[]} An array of strings from the next input line.
 */
function readStringArray() {
  return convertInput(getNextLine(), 2);
}

/**
 * Reads the next line, splits it by spaces, and converts each part to a number, returning an array of numbers.
 * @returns {number[]} An array of numbers from the next input line.
 */
function readIntegerArray() {
  return convertInput(getNextLine(), 4);
}

/**
 * Reads the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters from the next input line.
 */
function readCharacterArray() {
  return convertInput(getNextLine(), 6);
}

/**
 * Retrieves the subsequent line from the input stream managed by the inputHandler.
 * @returns {string} The next line of input.
 */
function getNextLine() {
  return inputHandler.getNextLine();
}

/**
 * Checks if there are more lines remaining in the input buffer to be processed.
 * @returns {boolean} True if more lines are available, false otherwise.
 */
function hasMoreLines() {
  return inputHandler.hasMoreLines();
}

/**
 * Reads the entire content of the standard input file, trims whitespace, and splits it into an array of lines.
 * @returns {string[]} An array where each element is a line from the standard input.
 */
function getInputFileContent() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/**
 * Initializes and returns an object responsible for managing input lines.
 * This object provides methods to check for more lines and retrieve the next line.
 * @returns {object} An input reader instance.
 */
function initializeInputReader() {
  var fileContentLines = getInputFileContent(); // Fetch all lines from the input source.
  var readerInstance = {
    "lineBuffer": fileContentLines, // Stores all input lines.
    "currentLineIndex": 0, // Tracks the current position in the line buffer.
    "totalLines": fileContentLines.length, // Total number of lines available.

    /**
     * Determines if there are additional lines to read in the buffer.
     * @returns {boolean} True if the current index is less than the total number of lines.
     */
    "hasMoreLines": function() {
      return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Retrieves the next line from the buffer and advances the index.
     * @returns {string} The next line of input, or an empty string if no more lines.
     */
    "getNextLine": function() {
      if (!this.hasMoreLines()) {
        return ""; // No more lines, return an empty string.
      } else {
        var currentInputLine = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++; // Move to the next line.
        return currentInputLine;
      }
    }
  };
  return readerInstance;
}

/**
 * Prints the given value to the standard output console.
 * @param {*} valueToDisplay The value to be printed.
 */
function printOutput(valueToDisplay) {
  console.log(valueToDisplay);
}

/**
 * Prints the given error message to the standard error console.
 * @param {*} errorMessage The error message or object to be printed.
 */
function printError(errorMessage) {
  console.error(errorMessage);
}

/**
 * A versatile utility function to convert or process input based on a specified type.
 * @param {*} inputValue The input value to be converted.
 * @param {number} conversionType An integer code indicating the desired conversion.
 *   - 1: Parse as an integer.
 *   - 2: Split string by spaces into an array of strings.
 *   - 4: Split string by spaces and convert parts to numbers (array of numbers).
 *   - 6: Split string into an array of individual characters.
 *   - 7: Split string into characters and convert each to a number (array of numbers).
 *   - 8: Join array elements with a space.
 *   - 9: Join array elements with a newline character.
 *   - 0: Join array elements without any separator.
 * @returns {*} The converted value, or the original value if conversion fails or type is unknown.
 */
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((element) => Number(element));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue; // Return original if conversion type is not recognized.
    }
  } catch (err) {
    return inputValue; // On error, return the original input value.
  }
}

/**
 * The core logic function that processes the input data.
 * It reads N, M, and D, then performs a four-level nested loop calculation
 * to count occurrences of specific conditions.
 */
function ProcessData() {
  var firstLineData = readIntegerArray(); // Read the first line containing N, M, D.
  var dimensionN = firstLineData[0]; // The upper bound for loop iterations.
  var dimensionM = firstLineData[1]; // A variable read but not utilized in the original logic.
  var distanceD = firstLineData[2]; // The target distance for absolute difference checks.

  var occurrenceMap = {}; // An object to store the frequency of `matchCount` values.

  // Four nested loops, each iterating from 1 up to `dimensionN`.
  for (var idxA = 1; idxA <= dimensionN; idxA++) {
    for (var idxB = 1; idxB <= dimensionN; idxB++) {
      for (var idxC = 1; idxC <= dimensionN; idxC++) {
        for (var idxD = 1; idxD <= dimensionN; idxD++) {
          var matchCount = 0; // Counter for conditions met in the current iteration.

          // Check if the absolute difference between pairs equals `distanceD`.
          if (Math.abs(idxA - idxB) === distanceD) matchCount++;
          if (Math.abs(idxC - idxB) === distanceD) matchCount++;
          if (Math.abs(idxC - idxD) === distanceD) matchCount++;

          // Increment the count for the current `matchCount` in the `occurrenceMap`.
          if (occurrenceMap[matchCount] === undefined) {
            occurrenceMap[matchCount] = 1; // Initialize if not present.
          } else {
            occurrenceMap[matchCount]++; // Increment if already present.
          }
        }
      }
    }
  }
  printOutput(occurrenceMap); // Display the final map of match counts.
}
