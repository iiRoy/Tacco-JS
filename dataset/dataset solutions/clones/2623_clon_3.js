const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputSourceAccessor; // Manages access to processed input lines.
const capturedLines = []; // Stores all lines read from standard input.

// Event listener for each line of input received.
inputReader.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

// Event listener for when input stream closes.
inputReader.on('close', () => {
  // Initialize the input processing mechanism with all captured lines.
  inputSourceAccessor = createInputProcessor(capturedLines);
  // Execute the primary application logic.
  executePrimaryLogic();
  // Ensure the process exits cleanly after operations.
  process.exit(0);
});

/**
 * Creates an object responsible for iterating through input lines.
 * @param {string[]} incomingData An array of strings representing input lines.
 * @returns {object} An object with methods to navigate and retrieve input.
 * @throws {Error} If incomingData is not a valid array.
 */
function createInputProcessor(incomingData) {
  // Basic validation for the input data structure.
  if (!Array.isArray(incomingData)) {
    throw new Error('Input data must be an array of strings to create a processor.');
  }

  return {
    dataLines: incomingData,
    currentPosition: 0,
    totalLines: incomingData.length,

    /**
     * Checks if there are more lines to process.
     * @returns {boolean} True if more input is available, false otherwise.
     */
    canAdvanceCursor: function() {
      return (this.currentPosition < this.totalLines);
    },

    /**
     * Retrieves the next available input line and advances the cursor.
     * @returns {string} The next input line.
     * @throws {Error} If no more input lines are available.
     */
    fetchNextToken: function() {
      if (this.canAdvanceCursor()) {
        const nextItem = this.dataLines[this.currentPosition];
        this.currentPosition++; // Increment after retrieval
        return nextItem;
      } else {
        throw new Error('EndOfInputException: No further input tokens are available for processing.');
      }
    }
  };
}

/**
 * Outputs a string to the standard output stream.
 * @param {string} content The string to be displayed.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Logs detailed debug information to the standard error stream.
 * @param {*} debugPayload The data to inspect and log.
 */
function logDebugInfo(debugPayload) {
  // Using util.inspect for pretty-printing complex objects.
  console.error(`[DEBUG]: ${require('util').inspect(debugPayload, { showHidden: false, depth: null, colors: true })}`);
}

/**
 * Retrieves the value of the k-th bit (0-indexed) of a given number.
 * @param {number} num The number from which to extract the bit.
 * @param {number} bitIndex The 0-indexed position of the bit to retrieve.
 * @returns {0|1} The value of the bit (0 or 1).
 * @throws {Error} If bitIndex is not a valid non-negative integer.
 */
function getKthBit(num, bitIndex) {
    if (!Number.isInteger(bitIndex) || bitIndex < 0) {
        throw new Error("Bit index must be a non-negative integer.");
    }
    return (num >> bitIndex) & 1;
}

/**
 * Performs various conversions and formatting operations on input data based on a specified type.
 * @param {*} inputData The data to be converted or formatted.
 * @param {number} conversionType A numeric code indicating the desired conversion.
 *   - 1: Parse input as an integer.
 *   - 2: Split string by spaces into an array of strings.
 *   - 4: Split string by spaces and parse each part as a number.
 *   - 6: Split string into an array of individual characters.
 *   - 7: Split string into characters and parse each as a number.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without any separator.
 * @returns {*} The converted or formatted data, or the original data if conversion fails or type is unknown.
 */
function formatAndParseInput(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 1: // Parse as integer
        return parseInt(inputData, 10);
      case 2: // Split string by spaces into array of strings
        return String(inputData).split(' ');
      case 4: // Split string by spaces and parse each part as number
        return String(inputData).split(' ').map(Number);
      case 6: // Split string into array of characters
        return String(inputData).split('');
      case 7: // Split string into array of characters and parse each as number
        return String(inputData).split('').map(Number);
      case 8: // Join array elements with spaces
        return Array.isArray(inputData) ? inputData.join(' ') : String(inputData);
      case 9: // Join array elements with newlines
        return Array.isArray(inputData) ? inputData.join('\n') : String(inputData);
      case 0: // Join array elements without any separator
        return Array.isArray(inputData) ? inputData.join('') : String(inputData);
      default: // No specific conversion, return as is
        logDebugInfo(`Unknown conversion type '${conversionType}' encountered in formatAndParseInput. Returning input data as-is.`);
        return inputData;
    }
  } catch (conversionError) {
    logDebugInfo(`Error during conversion for type '${conversionType}': ${conversionError.message}. Returning original data.`);
    return inputData; // Return original data on error to prevent application crash.
  }
}

// Concise helper functions for common input retrieval patterns, leveraging the input source accessor.
const retrieveNextInteger = () => formatAndParseInput(inputSourceAccessor.fetchNextToken(), 1);
const retrieveNextStringArray = () => formatAndParseInput(inputSourceAccessor.fetchNextToken(), 2);
const retrieveNextNumericArray = () => formatAndParseInput(inputSourceAccessor.fetchNextToken(), 4);
const retrieveNextCharCollection = () => formatAndParseInput(inputSourceAccessor.fetchNextToken(), 6);
const fetchNextToken = () => inputSourceAccessor.fetchNextToken();
const canAdvanceCursor = () => inputSourceAccessor.canAdvanceCursor();

/**
 * The main function encapsulating the core logic of the application.
 * This function identifies differing bit positions between pairs of numbers
 * within a specified numerical range. It reads an upper limit 'N', then
 * iterates through all unique pairs (i, j) where 0 <= i < j < N.
 * For each pair, it determines which bit positions (1-indexed, up to 10)
 * have different values in the binary representation of i and j, and prints
 * these positions.
 */
function executePrimaryLogic() {
  const upperLimit = retrieveNextInteger(); // Retrieve the primary range limit from input.

  // --- Input Validation and Edge Cases ---
  if (isNaN(upperLimit) || !Number.isInteger(upperLimit) || upperLimit < 0) {
    logDebugInfo(`Invalid upperLimit: ${upperLimit}. Must be a non-negative integer. Processing aborted.`);
    return; // Exit if the input is not valid.
  }
  if (upperLimit === 0 || upperLimit === 1) {
      // For N=0 or N=1, there are no pairs (i, j) where i < j.
      // This is an edge case where no output is expected, so we can exit early.
      return;
  }
  // --- End Input Validation ---

  let firstIndexIterator = 0; // Initialize the first loop counter.
  // Iterate 'firstIndexIterator' from 0 up to (upperLimit - 2)
  while (firstIndexIterator < upperLimit - 1) {
    let secondIndexIterator = firstIndexIterator + 1; // Initialize the second loop counter, starting one position after the first.
    // Iterate 'secondIndexIterator' from (firstIndexIterator + 1) up to (upperLimit - 1)
    while (secondIndexIterator < upperLimit) {
      const differingBitPositions = []; // Array to store the 1-indexed positions where bits differ.
      const maxBitCheck = 10; // Defines the maximum 0-indexed bit position to examine (bits 0 through 9).

      let bitPosition = 0; // Initialize counter for bit positions.
      // Loop through each bit position from 0 up to (maxBitCheck - 1).
      while (bitPosition < maxBitCheck) {
        // Extract the k-th bit for both current numbers.
        const bitValueForI = getKthBit(firstIndexIterator, bitPosition);
        const bitValueForJ = getKthBit(secondIndexIterator, bitPosition);

        // Check if the bits at the current position differ.
        // The XOR operator (^) returns 1 if bits are different, 0 if they are the same.
        if ((bitValueForI ^ bitValueForJ) === 1) {
          const humanReadableBitPosition = bitPosition + 1; // Convert 0-indexed bit position to 1-indexed.
          differingBitPositions.push(humanReadableBitPosition);
        }
        bitPosition++; // Move to the next bit position.
      }
      
      // Output the collected differing bit positions, formatted as a space-separated string.
      displayResult(formatAndParseInput(differingBitPositions, 8));
      secondIndexIterator++; // Increment the second loop counter.
    }
    firstIndexIterator++; // Increment the first loop counter.
  }
}