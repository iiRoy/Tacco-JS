const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const receivedLines = [];

// Attach an event listener to process each incoming line of text.
inputReader.on('line', (inputLine) => {
  receivedLines.push(inputLine);
});

// Once the input stream concludes, execute the primary application logic.
inputReader.on('close', () => {
  dataProcessor = setupInputHandler(receivedLines);
  console.error("\n"); // Output a blank line to stderr for visual separation.

  const startTime = Date.now();
  executeProgram(); // Invoke the main function of the application.
  const elapsedTime = Date.now() - startTime;

  logDebugMessage(`time : ${elapsedTime}ms`);
  logDebugMessage(`memory : ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

/**
 * Generates a deep copy of an object by serializing it to JSON and then parsing it back.
 * This method is suitable for objects containing only JSON-compatible data types.
 * @param {object} originalObject The object that needs to be duplicated.
 * @returns {object} A new object that is a deep clone of the input.
 */
function duplicateObject(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the subsequent input entry and attempts to convert it into an integer.
 * @returns {number} The next input value, parsed as an integer.
 */
function retrieveInteger() {
  return performConversion(fetchNextItem(), 1);
}

/**
 * Retrieves the subsequent input entry and processes it into an array of strings,
 * typically by splitting it based on whitespace.
 * @returns {string[]} An array of strings derived from the next input.
 */
function retrieveStringArray() {
  return performConversion(fetchNextItem(), 2);
}

/**
 * Retrieves the subsequent input entry, splits it into parts, and then
 * converts each part into a numerical value.
 * @returns {number[]} An array of numbers derived from the next input.
 */
function retrieveIntegerArray() {
  return performConversion(fetchNextItem(), 4);
}

/**
 * Retrieves the subsequent input entry and breaks it down into an array of individual characters.
 * @returns {string[]} An array of single-character strings from the next input.
 */
function retrieveCharacterArray() {
  return performConversion(fetchNextItem(), 6);
}

/**
 * Obtains the next available data item from the configured input processing utility.
 * @returns {string} The next piece of input data.
 */
function fetchNextItem() {
  return dataProcessor.getNextEntry();
}

/**
 * Determines if there are additional data items pending in the input processing utility.
 * @returns {boolean} True if more items are available, false otherwise.
 */
function hasMoreItems() {
  return dataProcessor.hasMoreEntries();
}

/**
 * Constructs and returns an object designed to manage and provide sequential access to input lines.
 * This object includes methods for checking availability and retrieving the next line.
 * @param {string[]} rawInputLines An array containing all the raw input lines received.
 * @returns {object} An input handler with navigation capabilities.
 */
function setupInputHandler(rawInputLines) {
  return {
    sourceData: rawInputLines,
    currentPosition: 0,
    maximumEntries: rawInputLines.length,

    /**
     * Verifies if there are any unread entries remaining in the source data.
     * @returns {boolean} True if the current position is less than the total number of entries.
     */
    hasMoreEntries: function() {
      return (this.currentPosition < this.maximumEntries);
    },

    /**
     * Fetches the next entry from the source data and advances the internal pointer.
     * Throws an error if an attempt is made to read beyond the available data.
     * @returns {string} The next entry in the sequence.
     * @throws {string} An error message indicating that no more input is available.
     */
    getNextEntry: function() {
      if (this.hasMoreEntries()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      }
    }
  };
}

/**
 * Outputs a given message to the standard console output stream.
 * @param {*} messageContent The data or message to be displayed.
 */
function displayOutput(messageContent) {
  console.log(messageContent);
}

/**
 * Writes a debug message to the standard error stream, formatted for inspection.
 * @param {*} messageContent The data or message to be logged for debugging.
 */
function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Executes various data transformations or array operations based on a specified conversion type.
 * This utility function centralizes common input parsing and formatting tasks.
 * @param {*} inputValue The data to be processed or converted.
 * @param {number} conversionType A numeric code indicating the desired operation:
 *   - 1: Parses the input as an integer.
 *   - 2: Splits the input string by spaces into an array of strings.
 *   - 4: Splits the input string by spaces and converts each part to a number.
 *   - 6: Splits the input string into an array of individual characters.
 *   - 7: Splits the input string into characters and converts each to a number.
 *   - 8: Joins array elements with a space character.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 *   - Default: Returns the input value without modification.
 * @returns {*} The result of the conversion or the original input if an error occurs.
 */
function performConversion(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    // In case of a conversion error, the original input value is returned.
    return inputValue;
  }
}

// This function encapsulates the core logic of the program.
function executeProgram() {
  displayOutput("aaa");
  displayOutput("aab");
  displayOutput("aba");
  displayOutput("abb");
  displayOutput("abc");
}
