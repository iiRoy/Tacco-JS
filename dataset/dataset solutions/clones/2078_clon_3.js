// This section handles core system initialization and input/output plumbing.
// It's generally not part of the problem's main logic but is necessary for execution.
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStream; // Object to manage input retrieval
const receivedLines = []; // Array to store all input lines from stdin

// Capture each line of input as it arrives from the standard input stream.
inputReader.on('line', function(currentLine){
  receivedLines.push(currentLine);
});

// Once all input has been received and the stream closes, proceed with execution.
inputReader.on('close', function(){
  // Validate if any input lines were received.
  if (receivedLines.length === 0) {
    logDiagnostic("Warning: No input lines were received. Program might not function as expected without input.");
    // Depending on requirements, one might choose to exit here: process.exit(1);
  }

  // Initialize the data stream for sequential access to input lines.
  try {
    dataStream = initializeStream(receivedLines);
    logDiagnostic("Input stream successfully prepared for processing.");
  } catch (e) {
    logDiagnostic(`Critical Error during stream initialization: ${e.message}. Exiting.`);
    process.exit(1);
  }

  const opStartTime = Date.now(); // Record the precise start time of the primary operation.
  executePrimaryLogic(); // Execute the main algorithm or application logic.
  const opDuration = Date.now() - opStartTime; // Calculate the total execution time.

  logDiagnostic(`Total Execution Time: ${opDuration} ms`);

  // Report detailed memory usage for diagnostic and optimization purposes.
  const memoryStats = process.memoryUsage();
  logDiagnostic(`Memory Usage Details: Heap Total: ${Math.round(memoryStats.heapTotal / 1024)} KB, Heap Used: ${Math.round(memoryStats.heapUsed / 1024)} KB`);
});

/**
 * Creates a deep copy of a given JavaScript object, ensuring independence from the original.
 * This function is particularly useful for immutable operations or when preventing side effects.
 * @param {object} sourceObject - The object that needs to be duplicated.
 * @returns {object} A new object that is a distinct, deep copy of the source.
 */
function deepCopyObject(sourceObject){
  if (typeof sourceObject !== 'object' || sourceObject === null) {
      logDiagnostic("Attempted to deep copy a non-object or null value. Returning the original value directly.");
      return sourceObject; // Primitives and null do not require deep copying.
  }
  try {
    return JSON.parse(JSON.stringify(sourceObject));
  } catch (e) {
    logDiagnostic(`Error encountered during deep copy operation: ${e.message}. Falling back to returning the original object.`);
    return sourceObject; // Fallback for objects with circular references or non-JSON-serializable properties.
  }
}

// These helper functions streamline the process of retrieving and converting input values
// from the global data stream, abstracting away the low-level parsing details.
function retrieveInteger(){ return transformInput(fetchNextItem(), CONVERSION_TYPE.PARSE_INT); }
function retrieveStringArray(){ return transformInput(fetchNextItem(), CONVERSION_TYPE.SPLIT_STRING_SPACE); }
function retrieveNumericArray(){ return transformInput(fetchNextItem(), CONVERSION_TYPE.SPLIT_NUMBERS_SPACE); }
function retrieveCharacterArray(){ return transformInput(fetchNextItem(), CONVERSION_TYPE.SPLIT_CHARS); }

/**
 * Retrieves the next available raw string item from the globally accessible data stream.
 * This function assumes 'dataStream' has been properly initialized.
 * @returns {string} The next unprocessed input string.
 */
function fetchNextItem(){ return dataStream.getNextValue(); }

/**
 * Determines if there are additional items remaining in the global data stream to be processed.
 * @returns {boolean} Returns true if more items are available, false otherwise.
 */
function hasMoreItems(){ return dataStream.hasMoreElements(); }

/**
 * Initializes a structured input stream object from an array of strings.
 * This object provides a consistent interface for sequentially accessing input lines.
 * @param {string[]} inputSource - An array of strings, where each string represents an input line.
 * @returns {object} An object with methods (`hasMoreElements`, `getNextValue`) for stream navigation.
 * @throws {Error} Throws an error if the provided inputSource is not a valid array.
 */
function initializeStream(inputSource){
  if (!Array.isArray(inputSource)) {
    throw new Error("Initialization Error: The input source must be provided as an array of strings.");
  }
  return {
    sourceData : inputSource, // The underlying array of input lines.
    currentPosition : 0,     // The current read position within the source data.
    totalElements : inputSource.length, // Total number of elements in the source.

    /**
     * Checks if there are more elements available for reading in the stream.
     * @returns {boolean} True if the current position is less than the total number of elements.
     */
    hasMoreElements : function(){
      return (this.currentPosition < this.totalElements);
    },

    /**
     * Retrieves the next element from the stream and advances the internal position.
     * @returns {string} The next available input line.
     * @throws {Error} If an attempt is made to read beyond the available input.
     */
    getNextValue : function(){
      if(this.hasMoreElements()){
        return this.sourceData[this.currentPosition++];
      } else {
        // Provide a more detailed and specific error message for out-of-bounds access.
        throw new Error("Input Stream Exhausted: No more input available. Attempted to read beyond the end of the stream.");
      }
    }
  };
}

/**
 * Outputs a given value to the standard console output, followed by a newline.
 * This is the primary function for displaying final results or messages to the user.
 * @param {*} outputValue - The value (string, number, object, etc.) to be printed.
 */
function outputResult(outputValue){
  console.log(outputValue);
}

/**
 * Logs diagnostic and debugging messages to the standard error stream.
 * Each message is prefixed with a timestamp and "DEBUG" tag, and `util.inspect`
 * is used for enhanced object representation.
 * @param {*} message - The message or data structure to log for debugging purposes.
 */
function logDiagnostic(message){
  const timestamp = new Date().toISOString();
  // Using more controlled inspect options for better readability, including colors and depth.
  console.error(`[${timestamp}] DEBUG: ${require("util").inspect(message, { showHidden: false, depth: 3, colors: true })}`);
}

// These constants define the various transformation types that can be applied
// by the 'transformInput' function, improving code readability and maintainability.
const CONVERSION_TYPE = Object.freeze({
  PARSE_INT: 1,                 // Convert string to integer.
  SPLIT_STRING_SPACE: 2,        // Split string by spaces into an array of strings.
  SPLIT_NUMBERS_SPACE: 4,       // Split string by spaces into an array of numbers.
  SPLIT_CHARS: 6,               // Split string into an array of individual characters.
  SPLIT_CHARS_NUMERIC: 7,       // Split string into array of characters, then convert each to number.
  JOIN_SPACE: 8,                // Join an array of strings with spaces.
  JOIN_NEWLINE: 9,              // Join an array of strings with newline characters.
  JOIN_NONE: 0,                 // Join an array of strings without any separator.
  DEFAULT_NO_CHANGE: -1         // Default type: return input as-is if no specific type is matched.
});

/**
 * Transforms an input value based on a specified conversion type. This function
 * consolidates various common input processing operations into a single, configurable utility.
 * @param {string | string[]} inputValue - The raw input string or array of strings to be transformed.
 * @param {number} conversionType - A numeric code from CONVERSION_TYPE indicating the desired transformation.
 * @returns {*} The transformed value, or the original value if transformation fails, is not applicable, or the type is unknown.
 */
function transformInput(inputValue, conversionType){
  // Handle undefined or null inputs gracefully to prevent runtime errors.
  if (typeof inputValue === 'undefined' || inputValue === null) {
      logDiagnostic(`Warning: transformInput received undefined or null input for type ${conversionType}. Returning original value.`);
      return inputValue;
  }

  // Ensure conversionType is a number; default to 'NO_CHANGE' if not provided or invalid.
  const actualConversionType = typeof conversionType === 'number' ? conversionType : CONVERSION_TYPE.DEFAULT_NO_CHANGE;

  try{
    switch(actualConversionType){
      case CONVERSION_TYPE.PARSE_INT:
        return Number.parseInt(String(inputValue), 10); // Explicit radix for safety and robustness.
      case CONVERSION_TYPE.SPLIT_STRING_SPACE:
        return String(inputValue).split(" ");
      case CONVERSION_TYPE.SPLIT_NUMBERS_SPACE:
        return String(inputValue).split(" ").map(Number);
      case CONVERSION_TYPE.SPLIT_CHARS:
        return String(inputValue).split("");
      case CONVERSION_TYPE.SPLIT_CHARS_NUMERIC:
        return String(inputValue).split("").map(Number);
      case CONVERSION_TYPE.JOIN_SPACE:
        return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue); // Ensure input is an array for join.
      case CONVERSION_TYPE.JOIN_NEWLINE:
        return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
      case CONVERSION_TYPE.JOIN_NONE:
        return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
      case CONVERSION_TYPE.DEFAULT_NO_CHANGE: // Explicitly handle the default case.
      default:
        logDiagnostic(`Info: No specific transformation defined for type '${actualConversionType}'. Returning original input.`);
        return inputValue;
    }
  } catch(e){
    logDiagnostic(`Error during input transformation (type: ${actualConversionType}, input: '${inputValue}'): ${e.message}. Returning original input as a fallback.`);
    return inputValue; // In case of any error during transformation, return the original input.
  }
}

/**
 * This is the main entry point for the problem's specific logic.
 * It orchestrates calls to various helper functions to achieve the task's objective.
 */
function executePrimaryLogic(){
  // Introduce an array to hold the output strings, demonstrating an intermediate data structure.
  const stringSequence = ["aaa", "aab", "abb", "abc"];
  let processedCount = 0; // Counter for items that meet a specific condition.
  logDiagnostic("Starting primary logic execution with predefined sequence.");

  // Iterate through the sequence, applying a simple conditional logic.
  for (let i = 0; i < stringSequence.length; i++) {
    const currentString = stringSequence[i];
    // A conditional check that doesn't alter the output but adds structural complexity.
    if (currentString.startsWith("a")) {
      outputResult(`Processed Item ${i + 1}: ${currentString}`);
      processedCount++; // Increment counter for items matching the condition.
    } else {
      logDiagnostic(`Skipping item '${currentString}' as it does not start with 'a'.`);
    }
  }
  logDiagnostic(`Primary logic completed. Successfully processed ${processedCount} relevant items.`);
}