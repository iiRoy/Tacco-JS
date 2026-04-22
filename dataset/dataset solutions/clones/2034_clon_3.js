const fileSystem = require("fs");

/**
 * Reads and processes the standard input stream.
 * @returns {string[]} An array of strings, each representing a line from stdin.
 */
function acquireInputLines() {
  try {
    const rawContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const cleanedContent = rawContent.trim();
    if (!cleanedContent) {
      console.warn("Warning: Standard input was empty. Returning an empty array.");
      return [];
    }
    return cleanedContent.split("\n");
  } catch (error) {
    console.error("An error occurred while attempting to read standard input:", error.message);
    return []; // Return an empty array on error to prevent further crashes
  }
}

/**
 * Initializes and returns an input line processor.
 * This object manages reading lines sequentially from a buffered input.
 * @returns {object} An input processor instance with methods to check and retrieve lines.
 */
function createLineProcessor() {
  const bufferedLines = acquireInputLines();
  let currentLineIndex = 0;
  const totalAvailableLines = bufferedLines.length;

  const processor = {
    // The complete list of input lines, stored for sequential access.
    inputBuffer: bufferedLines,
    // Pointer to the current line to be read next.
    linePointer: currentLineIndex,
    // Total count of lines initially loaded into the buffer.
    lineCount: totalAvailableLines,

    /**
     * Checks if there are more lines remaining in the input buffer.
     * @returns {boolean} True if more lines can be read, false otherwise.
     */
    hasMoreLines: function () {
      return this.linePointer < this.lineCount;
    },

    /**
     * Fetches the next available line from the input buffer and advances the pointer.
     * @returns {string} The next line as a string, or an empty string if no more lines are available.
     */
    retrieveNextLine: function () {
      if (!this.hasMoreLines()) {
        // Optionally, log an error or throw an exception if reading past the end is critical.
        // console.error("Attempted to read beyond the end of the input stream.");
        return "";
      }
      const lineData = this.inputBuffer[this.linePointer];
      this.linePointer++; // Move to the next line for subsequent calls.
      return lineData;
    },
  };
  return processor;
}

// A global instance of the input coordinator, initialized once.
let inputCoordinator = createLineProcessor();

/**
 * Outputs a given message to the standard output stream.
 * @param {*} message The content to be displayed. Can be any data type.
 */
function emitOutput(message) {
  console.log(message);
}

/**
 * Logs an error message to the standard error stream, prefixed for identification.
 * @param {*} errorMessage The error content to be logged.
 */
function recordError(errorMessage) {
  console.error("APPLICATION LOG [ERROR]:", errorMessage);
}

// --- Data Parsing and Transformation Utilities ---

/**
 * Defines various parsing modes for input data, used by the processValue function.
 * @enum {number}
 */
const ParsingMode = {
  AS_INTEGER: 1, // Convert to a single integer.
  STRING_ARRAY_SPACE_DELIMITED: 2, // Split string by spaces into a string array.
  INTEGER_ARRAY_SPACE_DELIMITED: 4, // Split string by spaces, then convert each part to an integer.
  CHAR_ARRAY: 6, // Split string into an array of individual characters.
  INTEGER_ARRAY_CHAR_DELIMITED: 7, // Split string into characters, then convert each to an integer.
  JOIN_SPACE: 8, // Join an array of strings with spaces.
  JOIN_NEWLINE: 9, // Join an array of strings with newline characters.
  JOIN_NONE: 0, // Join an array of strings without any delimiter.
  DEFAULT_PASS_THROUGH: -1, // Default mode: return the value as is.
};

/**
 * Transforms an input value based on a specified parsing mode.
 * Handles various conversions like string to integer, splitting strings into arrays, etc.
 * @param {string|string[]} rawValue The input value to transform.
 * @param {ParsingMode} mode The desired transformation mode, from the ParsingMode enum.
 * @returns {*} The transformed value, or the original value if transformation fails or mode is unknown.
 */
function processValue(rawValue, mode) {
  try {
    switch (mode) {
      case ParsingMode.AS_INTEGER:
        return parseInt(String(rawValue), 10); // Ensure input is string, parse as base-10.
      case ParsingMode.STRING_ARRAY_SPACE_DELIMITED:
        return String(rawValue).split(" ");
      case ParsingMode.INTEGER_ARRAY_SPACE_DELIMITED:
        // Filter out empty strings before mapping to Number to avoid NaN for multiple spaces.
        return String(rawValue).split(" ").filter(s => s !== "").map((segment) => Number(segment));
      case ParsingMode.CHAR_ARRAY:
        return String(rawValue).split("");
      case ParsingMode.INTEGER_ARRAY_CHAR_DELIMITED:
        return String(rawValue).split("").map((char) => Number(char));
      case ParsingMode.JOIN_SPACE:
        return Array.isArray(rawValue) ? rawValue.join(" ") : rawValue;
      case ParsingMode.JOIN_NEWLINE:
        return Array.isArray(rawValue) ? rawValue.join("\n") : rawValue;
      case ParsingMode.JOIN_NONE:
        return Array.isArray(rawValue) ? rawValue.join("") : rawValue;
      case ParsingMode.DEFAULT_PASS_THROUGH:
      default:
        return rawValue; // If mode is not recognized, return the original value.
    }
  } catch (conversionError) {
    recordError(`Failed to process value '${rawValue}' with mode ${mode}. Error: ${conversionError.message}`);
    return rawValue; // Return original value on error to prevent application halt.
  }
}

// --- Specialized Input Fetchers leveraging the coordinator and transformer ---

/**
 * Retrieves the next raw line directly from the input buffer.
 * @returns {string} The next unprocessed input line.
 */
function getNextRawLine() {
  return inputCoordinator.retrieveNextLine();
}

/**
 * Retrieves the next input line and converts it to a single integer.
 * @returns {number} The parsed integer value.
 */
function getNextInteger() {
  const line = getNextRawLine();
  return processValue(line, ParsingMode.AS_INTEGER);
}

/**
 * Retrieves the next input line and splits it into an array of strings using space as a delimiter.
 * @returns {string[]} An array of string tokens.
 */
function getNextStringTokens() {
  const line = getNextRawLine();
  return processValue(line, ParsingMode.STRING_ARRAY_SPACE_DELIMITED);
}

/**
 * Retrieves the next input line, splits it by spaces, and converts each part to an integer.
 * @returns {number[]} An array of integer values.
 */
function getNextIntegerTokens() {
  const line = getNextRawLine();
  return processValue(line, ParsingMode.INTEGER_ARRAY_SPACE_DELIMITED);
}

/**
 * Retrieves the next input line and splits it into an array of individual characters.
 * @returns {string[]} An array of single-character strings.
 */
function getNextCharacterArray() {
  const line = getNextRawLine();
  return processValue(line, ParsingMode.CHAR_ARRAY);
}

// --- Main Application Logic ---

/**
 * Executes the primary problem-solving logic.
 * This function handles reading specific inputs, processing them, and producing a final result.
 */
function runProblemSolver() {
  // Read the initial configuration line, expected to contain five integers: X, Y, A, B, C.
  const configValues = getNextIntegerTokens();

  // Extract key parameters for selection and counts.
  const maxApplesToSelect = configValues[0]; // Corresponds to X in the original problem.
  const maxBananasToSelect = configValues[1]; // Corresponds to Y.
  const totalApplesAvailable = configValues[2]; // Corresponds to A (not used in core logic, but read).
  const totalBananasAvailable = configValues[3]; // Corresponds to B (not used).
  const totalColorfulAvailable = configValues[4]; // Corresponds to C (not used).

  // Basic validation for selection counts.
  if (maxApplesToSelect < 0 || maxBananasToSelect < 0) {
    recordError("Error: Number of items to select (X or Y) cannot be negative. Outputting 0.");
    emitOutput(0);
    return; // Exit early if input is invalid.
  }

  // Read the lists of present values for apples, bananas, and colorful items.
  let applePresentsList = getNextIntegerTokens(); // Corresponds to alist.
  let bananaPresentsList = getNextIntegerTokens(); // Corresponds to blist.
  let colorfulPresentsList = getNextIntegerTokens(); // Corresponds to clist.

  // Define a comparator function for sorting in descending order (highest value first).
  const descendingSortComparator = (valueA, valueB) => valueB - valueA;

  // Sort the initial present lists to easily pick the most delicious ones.
  applePresentsList.sort(descendingSortComparator);
  bananaPresentsList.sort(descendingSortComparator);

  // Select the top 'X' most delicious apples and 'Y' most delicious bananas.
  // Using slice for a more functional and concise way to get a sub-array.
  const selectedApples = applePresentsList.slice(0, maxApplesToSelect);
  const selectedBananas = bananaPresentsList.slice(0, maxBananasToSelect);

  // Combine all selected presents (apples, bananas) and the colorful presents.
  // The spread syntax provides an elegant way to concatenate arrays.
  let combinedPresents = [...selectedApples, ...selectedBananas, ...colorfulPresentsList];

  // Sort the combined list of presents again in descending order to find the overall top items.
  combinedPresents.sort(descendingSortComparator);

  // Calculate the total deliciousness from the top (X + Y) presents in the combined list.
  let totalDeliciousness = 0;
  const desiredPresentsCount = maxApplesToSelect + maxBananasToSelect;

  // Iterate up to the desired count or the length of the combined list, whichever is smaller.
  for (let k = 0; k < desiredPresentsCount && k < combinedPresents.length; k++) {
    totalDeliciousness += combinedPresents[k];
  }

  // Display the final calculated result to the standard output.
  emitOutput(totalDeliciousness);
}

// This line acts as the entry point for the script, initiating the problem solver.
runProblemSolver();