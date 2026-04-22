const RL_HANDLER = require('readline');
const STD_IN_STREAM = process.stdin;
const STD_OUT_STREAM = process.stdout;
const UTIL_MODULE = require('util');

// Initialize the input reading interface, binding to standard input/output streams.
const dataAcquirer = RL_HANDLER.createInterface({
  input: STD_IN_STREAM,
  output: STD_OUT_STREAM
});

// Global variable to hold the processed input handler instance.
let lineDataProcessor;
// Array to accumulate all raw input lines received.
const collectedInputLines = [];

// Event listener for each line of input received.
dataAcquirer.on('line', (currentLineData) => {
  // Store each line of data as it's received from the standard input source.
  collectedInputLines.push(currentLineData);
});

// Event listener triggered when the input stream is closed.
dataAcquirer.on('close', () => {
  // Once all input has been collected, initialize the data processor.
  lineDataProcessor = initializeDataHandler(collectedInputLines);

  logDebugMessage("--- Application Execution Commenced ---");
  const operationStartTime = new Date(); // Mark the start time for performance tracking.

  // Execute the primary business logic of the application.
  executePrimaryLogic();

  const operationEndTime = new Date(); // Mark the end time.
  const elapsedMillis = operationEndTime.getTime() - operationStartTime.getTime(); // Calculate duration.

  logDebugMessage("--- Application Execution Concluded ---");
  logDebugMessage(`Total processing duration: ${elapsedMillis} ms`); // Display elapsed time.
});

// --- Constants for Input Conversion Types ---
const CONV_TYPE_PARSE_INT = 1;         // Convert to integer.
const CONV_TYPE_SPLIT_SPACE_STR = 2;   // Split by space into string array.
const CONV_TYPE_SPLIT_SPACE_NUM = 4;   // Split by space into number array.
const CONV_TYPE_SPLIT_CHAR_STR = 6;    // Split by character into string array.
const CONV_TYPE_SPLIT_CHAR_NUM = 7;    // Split by character into number array.
const CONV_TYPE_JOIN_SPACE = 8;        // Join array elements with spaces.
const CONV_TYPE_JOIN_NEWLINE = 9;      // Join array elements with newlines.
const CONV_TYPE_JOIN_EMPTY = 0;        // Join array elements without separator.

/**
 * Retrieves the next available input line and attempts to parse it as an integer.
 * @returns {number} The parsed integer value.
 */
function retrieveNextInteger() {
  return convertInputData(advanceInputPointer(), CONV_TYPE_PARSE_INT);
}

/**
 * Retrieves the next available input line and splits it into an array of strings by spaces.
 * @returns {string[]} An array of strings.
 */
function fetchNextStringArray() {
  return convertInputData(advanceInputPointer(), CONV_TYPE_SPLIT_SPACE_STR);
}

/**
 * Retrieves the next available input line, splits it by spaces, and converts elements to numbers.
 * @returns {number[]} An array of numbers.
 */
function gatherNextIntegerArray() {
  return convertInputData(advanceInputPointer(), CONV_TYPE_SPLIT_SPACE_NUM);
}

/**
 * Retrieves the next available input line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function extractNextCharacterArray() {
  return convertInputData(advanceInputPointer(), CONV_TYPE_SPLIT_CHAR_STR);
}

/**
 * Advances the internal pointer of the input handler and returns the next raw input line.
 * @returns {string} The next raw input line.
 * @throws {Error} If no more input is available.
 */
function advanceInputPointer() {
  return lineDataProcessor.fetchNextItem();
}

/**
 * Checks if there are more input lines available to be processed.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasMoreInputData() {
  return lineDataProcessor.checkAvailability();
}

/**
 * Initializes an object responsible for managing and providing access to input lines.
 * @param {string[]} sourceLines - An array of raw input strings.
 * @returns {object} An object with methods to check availability and fetch next items.
 */
function initializeDataHandler(sourceLines) {
  // Implement a guard clause for invalid or empty input sources.
  if (!Array.isArray(sourceLines) || sourceLines.length === 0) {
    logDebugMessage("Warning: No input lines provided to the handler; creating a dummy handler.");
    return {
      dataLines: [],
      currentPosition: 0,
      totalLines: 0,
      checkAvailability: () => false, // Always report no availability.
      fetchNextItem: () => {
        throw new Error("Data stream is empty. No items to fetch.");
      }
    };
  }

  const handlerInstance = {
    dataLines: sourceLines,       // The collection of all input lines.
    currentPosition: 0,          // The current index in the dataLines array.
    totalLines: sourceLines.length, // The total count of input lines.

    /**
     * Checks if there are more lines remaining in the data stream.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    checkAvailability: function() {
      return (this.currentPosition < this.totalLines);
    },

    /**
     * Retrieves the next line from the data stream and advances the pointer.
     * @returns {string} The next input line.
     * @throws {Error} If an attempt is made to fetch data beyond the stream's end.
     */
    fetchNextItem: function() {
      // Pre-check for data availability to prevent out-of-bounds access.
      if (!this.checkAvailability()) {
        const errorMsg = "Input stream exhausted. No more elements available to retrieve.";
        logDebugMessage(`Error: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      const retrievedLine = this.dataLines[this.currentPosition]; // Store current line.
      this.currentPosition++; // Increment position for the next call.
      return retrievedLine;
    }
  };
  return handlerInstance;
}

/**
 * Displays a given content to the standard output stream.
 * @param {any} contentToDisplay - The data to be outputted.
 */
function displayOutput(contentToDisplay) {
  // Using process.stdout.write for direct stream interaction, appending a newline.
  STD_OUT_STREAM.write(String(contentToDisplay) + '\n');
}

/**
 * Logs a debug message to the standard error stream with additional metadata.
 * @param {any} messageContent - The content of the debug message.
 */
function logDebugMessage(messageContent) {
  // Utilize util.inspect for comprehensive object logging, with enhanced options.
  const formattedMessage = UTIL_MODULE.inspect(messageContent, {
    showHidden: false, // Do not show non-enumerable properties.
    depth: 5,          // Inspect objects up to 5 levels deep.
    colors: true       // Use ANSI escape codes for colored output (if supported).
  });
  process.stderr.write(`[DEBUG] ${new Date().toISOString()} | ${formattedMessage}\n`);
}

/**
 * Converts an input value based on a specified conversion type.
 * Supports various transformations like string splitting, integer parsing, and array joining.
 *
 * @param {string|string[]} inputValue - The data to be converted.
 * @param {number} conversionType - An integer representing the desired conversion.
 * @returns {any} The transformed data, or the original input if conversion fails or is not applicable.
 */
function convertInputData(inputValue, conversionType) {
  // Early exit for null or undefined input to prevent subsequent errors.
  if (inputValue === null || inputValue === undefined) {
    logDebugMessage("Warning: Attempted to convert null or undefined input value.");
    return inputValue;
  }

  try {
    // Using an if-else if structure for type III variation instead of a switch.
    if (conversionType === CONV_TYPE_PARSE_INT) {
      const parsedValue = parseInt(inputValue, 10); // Explicitly specify radix 10.
      // Return original if parsing results in NaN, otherwise return the number.
      return isNaN(parsedValue) ? inputValue : parsedValue;
    } else if (conversionType === CONV_TYPE_SPLIT_SPACE_STR) {
      return String(inputValue).split(" ");
    } else if (conversionType === CONV_TYPE_SPLIT_SPACE_NUM) {
      // Split, map to numbers, and filter out any non-numeric results.
      return String(inputValue).split(" ").map(Number).filter(n => !isNaN(n));
    } else if (conversionType === CONV_TYPE_SPLIT_CHAR_STR) {
      return String(inputValue).split("");
    } else if (conversionType === CONV_TYPE_SPLIT_CHAR_NUM) {
      // Split, map to numbers, and filter out any non-numeric results.
      return String(inputValue).split("").map(Number).filter(n => !isNaN(n));
    } else if (conversionType === CONV_TYPE_JOIN_SPACE) {
      // Ensure inputValue is an array for join operations, otherwise convert to string.
      return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue);
    } else if (conversionType === CONV_TYPE_JOIN_NEWLINE) {
      return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
    } else if (conversionType === CONV_TYPE_JOIN_EMPTY) {
      return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
    } else {
      // Default case: if no specific conversion type matches, return the input as is.
      logDebugMessage(`Notice: Unknown conversion type '${conversionType}'. Returning original input.`);
      return inputValue;
    }
  } catch (conversionError) {
    // Log conversion errors and return the original input to prevent application crash.
    logDebugMessage(`Conversion error for value: '${inputValue}', type: ${conversionType}. Details: ${conversionError.message}`);
    return inputValue;
  }
}

// --- Constants for Primary Logic ---
const DEFAULT_TRUNCATE_LENGTH = 7; // The default length for string truncation.
const ELLIPSIS_SUFFIX = "...";    // The suffix added to truncated strings.

/**
 * Executes the main business logic of the application.
 * Reads an integer and a string, then conditionally truncates and displays the string.
 */
function executePrimaryLogic() {
  const maxDisplayLength = retrieveNextInteger(); // Get the integer value.
  const inputStringValue = advanceInputPointer(); // Get the string value.

  // Implement a type validation guard for the input string value.
  if (typeof inputStringValue !== 'string') {
    logDebugMessage(`Error: Expected a string for 'inputStringValue', but received type '${typeof inputStringValue}'.`);
    displayOutput(""); // Output an empty string or a placeholder in case of error.
    return; // Exit the function gracefully.
  }

  // Use a ternary operator for a concise conditional expression.
  const finalOutput = (inputStringValue.length <= maxDisplayLength)
    ? inputStringValue // If the string is short enough, display it in full.
    : inputStringValue.substring(0, DEFAULT_TRUNCATE_LENGTH) + ELLIPSIS_SUFFIX; // Otherwise, truncate and append ellipsis.

  displayOutput(finalOutput); // Display the determined output string.
}