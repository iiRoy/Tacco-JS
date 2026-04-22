// This section handles the input collection and initial setup.
// It's designed to be self-contained for managing standard input/output streams.
const inputCollector = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let parsedInputData = null; // Will store the processed input structure after all lines are read.
const collectedRawLines = []; // Buffer to temporarily hold lines read from standard input.

// Event listener to capture each line of input as it becomes available.
inputCollector.on('line', (currentLineSegment) => {
  // Basic validation: ensure the line is not empty or just whitespace.
  if (currentLineSegment && currentLineSegment.trim().length > 0) {
    collectedRawLines.push(currentLineSegment);
  } else {
    // Optionally log if an empty line is received, but for this problem, it's usually ignored.
    // logDebug("Received an empty or whitespace-only line, skipping.");
  }
});

// Event listener for when the entire input stream has closed.
// This signifies that all input lines have been collected.
inputCollector.on('close', () => {
  // Initialize the data parser with all collected lines from standard input.
  parsedInputData = createLineParser(collectedRawLines);

  // Output a clear separator to standard error for better debug log readability.
  console.error("\n--- Application Execution Starting ---");

  // Record the precise start time for performance measurement.
  const startTime = Date.now();

  // Execute the primary application logic, which uses the parsed input.
  executePrimaryAlgorithm();

  // Calculate the total elapsed time since the algorithm began.
  const elapsedTime = Date.now() - startTime;
  // Log performance metrics to standard error.
  logDebug(`Total Runtime: ${elapsedTime} ms`);
  logDebug(`Memory Footprint: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
  console.error("--- Application Execution Finished ---\n"); // Another separator.
});

/**
 * Creates a parser instance designed to sequentially access an array of input lines.
 * This object manages the state of reading through the input.
 * @param {string[]} sourceInputLines - An array of raw input strings to be parsed.
 * @returns {object} An object providing methods to navigate and retrieve input lines.
 * @throws {TypeError} If the provided sourceInputLines is not a valid array.
 */
function createLineParser(sourceInputLines) {
  // Guard clause: Ensure the input is an array for robust operation.
  if (!Array.isArray(sourceInputLines)) {
    throw new TypeError("Input for line parser must be an array of strings. Received invalid type.");
  }

  let currentPosition = 0; // Internal pointer to the current line being processed.
  const totalEntries = sourceInputLines.length; // Total number of lines available for parsing.

  return {
    sourceData: sourceInputLines, // Stores the original array of lines.
    currentPosition: currentPosition, // Exposes the current read position.
    totalEntries: totalEntries, // Exposes the total number of lines.

    /**
     * Checks if there are any more lines remaining to be processed in the input stream.
     * @returns {boolean} True if additional lines exist, false otherwise.
     */
    hasMoreItems: function() {
      return this.currentPosition < this.totalEntries;
    },

    /**
     * Retrieves the next available line from the input and advances the internal pointer.
     * @returns {string} The next raw line of input.
     * @throws {Error} If an attempt is made to read beyond the end of the input.
     */
    fetchNextItem: function() {
      // Pre-condition check: ensure there are items to fetch.
      if (!this.hasMoreItems()) {
        // Provide a clear and specific error for out-of-bounds access.
        throw new Error("EndOfInputException: Attempted to fetch an item beyond the available input lines.");
      }
      const extractedLine = this.sourceData[this.currentPosition];
      this.currentPosition++; // Increment the pointer to the next line.
      return extractedLine;
    }
  };
}

/**
 * Retrieves the next item from the input stream and transforms it into an integer.
 * @returns {number} The parsed integer value.
 */
function retrieveInteger() {
  return performDataTransformation(fetchNextItem(), 1);
}

/**
 * Retrieves the next item from the input stream and transforms it into an array of strings,
 * typically by splitting a line by spaces.
 * @returns {string[]} An array of string segments.
 */
function retrieveStringArray() {
  return performDataTransformation(fetchNextItem(), 2);
}

/**
 * Retrieves the next item from the input stream and transforms it into an array of integers,
 * typically by splitting a line by spaces and converting each segment to a number.
 * @returns {number[]} An array of integer values.
 */
function retrieveIntegerArray() {
  return performDataTransformation(fetchNextItem(), 4);
}

/**
 * Retrieves the next item from the input stream and transforms it into an array of individual characters.
 * @returns {string[]} An array of single-character strings.
 */
function retrieveCharacterArray() {
  return performDataTransformation(fetchNextItem(), 6);
}

/**
 * Helper function to safely get the next item from the global data parser instance.
 * Encapsulates the check for parser initialization.
 * @returns {string} The next raw input line.
 * @throws {Error} If the input parser has not been properly initialized.
 */
function fetchNextItem() {
  // Guard clause: Ensure the parser is ready before attempting to use it.
  if (!parsedInputData) {
    throw new Error("Input parser object is not initialized. Cannot fetch items.");
  }
  return parsedInputData.fetchNextItem();
}

/**
 * Helper function to check if there are more items available in the input stream.
 * Provides a safe way to query the parser's state.
 * @returns {boolean} True if more items can be fetched, false otherwise.
 */
function hasMoreItems() {
  // If the parser isn't initialized, there are definitely no more items.
  if (!parsedInputData) {
    return false;
  }
  return parsedInputData.hasMoreItems();
}

/**
 * Prints the provided data to standard output. This is the primary function for application results.
 * @param {*} dataToDisplay - The data (string, number, array, etc.) to be printed.
 */
function printOutput(dataToDisplay) {
  console.log(dataToDisplay);
}

/**
 * Logs a debug message to standard error. This function is intended for development-time
 * debugging and provides simple string concatenation for output.
 * @param {*} debugPayload - The data or message to log for debugging purposes.
 */
function logDebug(debugPayload) {
  // Using a direct console.error call for simplicity, without complex object inspection.
  console.error(`[DEBUG]: ${debugPayload}`);
}

// A registry (Map) defining various data transformation functions.
// This structure replaces a traditional switch statement, offering better
// modularity and extensibility for different conversion types.
const transformationRegistry = new Map([
  [1, (val) => parseInt(val, 10)], // Convert string to an integer (base 10).
  [2, (val) => val.split(" ")],    // Split a string by spaces into an array of strings.
  [4, (val) => val.split(" ").map(Number)], // Split by spaces, then convert each part to a number.
  [6, (val) => val.split("")],    // Split a string into an array of individual characters.
  [7, (val) => val.split("").map(Number)], // Split into characters, then convert each to a number.
  [8, (arr) => arr.join(" ")],    // Join array elements into a string, separated by spaces.
  [9, (arr) => arr.join("\n")],   // Join array elements into a string, separated by newlines.
  [0, (arr) => arr.join("")],     // Join array elements into a string, without any separator.
]);

/**
 * Orchestrates various data transformations based on a specified type identifier.
 * It provides a centralized point for converting input values into desired formats.
 * @param {*} valueToConvert - The data (e.g., a string or array) that needs transformation.
 * @param {number} conversionType - A numeric identifier specifying the transformation to apply.
 * @returns {*} The transformed value, or the original value if transformation fails or is undefined.
 */
function performDataTransformation(valueToConvert, conversionType) {
  // Input validation: Handle null or undefined values gracefully to prevent errors.
  if (valueToConvert === null || valueToConvert === undefined) {
    logDebug(`Transformation warning: Input value is null/undefined for type ${conversionType}. Returning original value.`);
    return valueToConvert;
  }

  // Retrieve the specific transformation function from the registry.
  const transformer = transformationRegistry.get(conversionType);

  if (transformer) {
    try {
      // Execute the transformation function.
      return transformer(valueToConvert);
    } catch (error) {
      // Catch and log specific errors that occur during the transformation process.
      logDebug(`Transformation error (type ${conversionType}): ${error.message}. Returning original value.`);
      return valueToConvert; // Return the original value if an error occurs during transformation.
    }
  } else {
    // If no matching transformer is found for the given type, log and return the original value.
    logDebug(`Transformation type ${conversionType} is not registered. Returning original value as-is.`);
    return valueToConvert;
  }
}

/**
 * This is the primary algorithm execution function. It takes two initial parameters,
 * 'M' and 'K', and generates an output sequence based on a specific condition (K=0).
 * This function encapsulates the main business logic of the application.
 */
function executePrimaryAlgorithm() {
  // Retrieve the first line of input, expecting an array of two integers.
  const initialParametersArray = retrieveIntegerArray();

  // Guard clause: Validate that two parameters (M and K) were successfully retrieved.
  if (initialParametersArray.length < 2) {
    logDebug("Error: Insufficient parameters provided. Expected M and K values.");
    printOutput(-1); // Output an error indicator.
    return; // Terminate execution if input is malformed.
  }

  const matrixSizeExponent = initialParametersArray[0]; // The first parameter, 'M'.
  const constraintValue = initialParametersArray[1];    // The second parameter, 'K'.

  // Main conditional logic based on the 'K' parameter.
  if (constraintValue === 0) {
    // Special case: If K is 0, proceed with generating a specific sequence.

    // Calculate the total length of the output sequence.
    // Using bit shift (1 << N) is an efficient way to calculate 2^N.
    const sequenceLength = 1 << (matrixSizeExponent + 1); // Equivalent to 2^(M+1).

    // Initialize the result array with the calculated length.
    // Array.from is used for creating arrays with a specified length and optional initial values.
    const resultSequence = Array.from({ length: sequenceLength });

    // Determine the upper bound for the loop.
    const loopLimit = 1 << matrixSizeExponent; // Equivalent to 2^M.

    // Populate the result sequence. Each 'currentIdx' value appears twice consecutively.
    for (let currentIdx = 0; currentIdx < loopLimit; ++currentIdx) {
      const firstPosition = currentIdx * 2;
      const secondPosition = firstPosition + 1; // The next position after firstPosition.

      resultSequence[firstPosition] = currentIdx;
      resultSequence[secondPosition] = currentIdx;
    }

    // Convert the populated array into a space-separated string and print it to standard output.
    printOutput(performDataTransformation(resultSequence, 8));
  } else {
    // If K is not 0, the problem specifies a default output of -1.
    // This could represent an unsupported case or an error condition.
    printOutput(-1);
  }
}