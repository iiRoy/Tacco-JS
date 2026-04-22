// This section handles input/output plumbing and foundational utilities.
// It's designed to streamline data acquisition and presentation for the main algorithm.

// Global storage for raw input lines as they are read.
let capturedInputLines = [];

// Manages the input stream and provides methods to access parsed data.
let dataStreamHandler;

// Configure the interface for reading input line by line from standard input.
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input received.
inputProcessor.on('line', (currentLine) => {
  capturedInputLines.push(currentLine);
});

// Event listener for when the input stream closes.
inputProcessor.on('close', () => {
  // Initialize the data stream handler with all captured lines.
  dataStreamHandler = prepareInputDataStream(capturedInputLines);

  // Output a blank line to separate debug info from main output.
  console.error("\n");

  // Record the start time for performance measurement.
  const startTime = Date.now();

  // Execute the primary computational logic.
  performMainCalculation();

  // Calculate and display the elapsed time.
  const durationMilliseconds = Date.now() - startTime;
  logDiagnosticInfo("Execution Time : " + durationMilliseconds + "ms");

  // Calculate and display memory usage.
  const memoryUsageKB = Math.round(process.memoryUsage().heapTotal / 1024);
  logDiagnosticInfo("Memory Footprint : " + memoryUsageKB + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization/deserialization.
 * Note: This method has limitations (e.g., won't copy functions, Date objects, etc.).
 * @param {object} sourceObject The object to be cloned.
 * @returns {object} A new object that is a deep copy of the source.
 */
function deepReplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function obtainNextInteger() {
  return transformInputToken(retrieveNextElement(), 1);
}

/**
 * Retrieves the next string array from the input stream, splitting by spaces.
 * @returns {string[]} An array of strings.
 */
function obtainNextStringArray() {
  return transformInputToken(retrieveNextElement(), 2);
}

/**
 * Retrieves the next integer array from the input stream, splitting by spaces and parsing.
 * @returns {number[]} An array of integers.
 */
function obtainNextIntegerArray() {
  return transformInputToken(retrieveNextElement(), 4);
}

/**
 * Retrieves the next character array from the input stream, splitting by single characters.
 * @returns {string[]} An array of characters.
 */
function obtainNextCharacterArray() {
  return transformInputToken(retrieveNextElement(), 6);
}

/**
 * Advances the input stream and returns the next raw string element.
 * @returns {string} The next raw string from the input.
 */
function retrieveNextElement() {
  return dataStreamHandler.fetchNext();
}

/**
 * Checks if there are more elements available in the input stream.
 * @returns {boolean} True if more elements exist, false otherwise.
 */
function checkStreamAvailability() {
  return dataStreamHandler.canAdvance();
}

/**
 * Initializes and returns an object to manage reading from a list of input lines.
 * This object acts as a cursor for the input data.
 * @param {string[]} inputCollection An array of strings representing the input lines.
 * @returns {object} An object with methods to navigate and retrieve input.
 */
function prepareInputDataStream(inputCollection) {
  return {
    lineCollection: inputCollection,
    readPointer: 0,
    totalLines: inputCollection.length,

    /**
     * Determines if there are more lines to read in the collection.
     * @returns {boolean} True if there are unread lines, false otherwise.
     */
    canAdvance: function() {
      return (this.readPointer < this.totalLines);
    },

    /**
     * Fetches the next line from the collection and increments the read pointer.
     * Throws an error if no more input is available.
     * @returns {string} The next line of input.
     * @throws {Error} If attempting to read beyond the end of the input collection.
     */
    fetchNext: function() {
      if (this.canAdvance()) {
        return this.lineCollection[this.readPointer++];
      } else {
        // Using a standard Error object for better error handling.
        throw new Error("InputBufferExhausted: No more input lines available.");
      }
    }
  };
}

/**
 * Displays a string to the standard output, followed by a newline.
 * @param {string} message The string to be printed.
 */
function displayCalculationResult(message) {
  console.log(message);
}

/**
 * Logs detailed debug information to the standard error stream.
 * Uses Node.js's util.inspect for comprehensive object inspection.
 * @param {any} dataToInspect The data to log.
 */
function logDiagnosticInfo(dataToInspect) {
  // Using more verbose options for inspect to show hidden properties and deeper objects.
  console.error("DIAGNOSTIC_LOG: " + require("util").inspect(dataToInspect, {
    showHidden: true,
    depth: 5,
    colors: true
  }));
}

/**
 * Generic function to convert an input string or array based on a specified mode.
 * @param {string|string[]} inputValue The input to be converted.
 * @param {number} conversionMode A numeric code indicating the desired conversion.
 *                                - 1: Parse as integer.
 *                                - 2: Split string by space.
 *                                - 4: Split string by space and map to numbers.
 *                                - 6: Split string into individual characters.
 *                                - 7: Split string into individual characters and map to numbers.
 *                                - 8: Join array elements with space.
 *                                - 9: Join array elements with newline.
 *                                - 0: Join array elements without a separator.
 * @returns {any} The converted value. Returns original input on error or unknown mode.
 */
function transformInputToken(inputValue, conversionMode) {
  try {
    if (conversionMode === 1) {
      return parseInt(inputValue, 10); // Explicit radix for parseInt
    } else if (conversionMode === 2) {
      return String(inputValue).split(" ");
    } else if (conversionMode === 4) {
      return String(inputValue).split(" ").map(Number);
    } else if (conversionMode === 6) {
      return String(inputValue).split("");
    } else if (conversionMode === 7) {
      return String(inputValue).split("").map(Number);
    } else if (conversionMode === 8) {
      // Ensure inputValue is an array before joining
      return Array.isArray(inputValue) ? inputValue.join(" ") : String(inputValue);
    } else if (conversionMode === 9) {
      return Array.isArray(inputValue) ? inputValue.join("\n") : String(inputValue);
    } else if (conversionMode === 0) {
      return Array.isArray(inputValue) ? inputValue.join("") : String(inputValue);
    } else {
      // Default case: return the input as is if mode is unknown
      return inputValue;
    }
  } catch (conversionError) {
    // Log the error but return the original input to prevent crashing.
    logDiagnosticInfo(`Conversion failed for value: '${inputValue}' with mode: ${conversionMode}. Error: ${conversionError.message}`);
    return inputValue;
  }
}

// End of input/output and utility section.
// --------------------------------------------------------------------------

/**
 * This is the primary function where the core algorithm logic resides.
 * It processes a sequence of numbers based on specific matching rules
 * and calculates a cumulative product modulo a large prime.
 */
function performMainCalculation() {
  // Read the total number of elements in the sequence.
  const totalElements = obtainNextInteger();

  // Read the sequence of integers.
  const elementSequence = obtainNextIntegerArray();

  // Initialize counters for expected values.
  // These represent the 'next' value expected for each category (R, B, G).
  let expectedRedValue = 1;
  let expectedBlueValue = 0;
  let expectedGreenValue = 0;

  // Initialize the result accumulator.
  // The problem statement implies an initial value of 3 before the loop starts.
  let currentProductResult = 3;

  // Define the modulo constant to prevent integer overflow.
  const primeModulo = 1000000007;

  // --- Input Validation and Edge Case Handling ---

  // If the total number of elements is zero or negative, there's nothing to process.
  if (totalElements <= 0) {
    displayCalculationResult(0); // Or handle as an error, depending on problem spec.
    return;
  }

  // Check the very first element of the sequence.
  // If the first element is not 0, the sequence is invalid for the problem's rules.
  if (elementSequence[0] !== 0) {
    displayCalculationResult(0);
    return;
  }

  // --- Core Loop for Sequence Processing ---

  // Iterate through the sequence starting from the second element (index 1).
  for (let sequenceIndex = 1; sequenceIndex < totalElements; ++sequenceIndex) {
    let matchesInCurrentElement = 0; // Counts how many categories match the current element.
    let isElementProcessed = false; // Flag to ensure each increment happens only once per element.

    const currentElementValue = elementSequence[sequenceIndex]; // Cache current element for readability.

    // Check if the current element matches the 'Red' expectation.
    if (currentElementValue === expectedRedValue) {
      matchesInCurrentElement++;
      expectedRedValue++; // Increment for the next expected 'Red' value.
      isElementProcessed = true;
    }

    // Check if the current element matches the 'Blue' expectation.
    if (currentElementValue === expectedBlueValue) {
      matchesInCurrentElement++;
      // Only increment 'Blue' if it hasn't been incremented by 'Red' for this element.
      // This implicitly assumes a priority or distinct increment logic.
      if (!isElementProcessed) {
        expectedBlueValue++;
        isElementProcessed = true; // Mark as processed, though 'Red' might have already.
      }
    }

    // Check if the current element matches the 'Green' expectation.
    if (currentElementValue === expectedGreenValue) {
      matchesInCurrentElement++;
      // Only increment 'Green' if it hasn't been incremented by 'Red' or 'Blue' for this element.
      if (!isElementProcessed) {
        expectedGreenValue++;
        // isElementProcessed = true; // This line is redundant if the above `if (!isElementProcessed)` ensures it.
      }
    }

    // Update the cumulative product.
    // Ensure the product is always kept within the modulo range.
    currentProductResult = (currentProductResult * matchesInCurrentElement) % primeModulo;

    // Optional: Log intermediate results for debugging.
    // logDiagnosticInfo(`Index: ${sequenceIndex}, Value: ${currentElementValue}, Matches: ${matchesInCurrentElement}, Current Product: ${currentProductResult}`);
  }

  // Output the final calculated result.
  displayCalculationResult(currentProductResult);
}