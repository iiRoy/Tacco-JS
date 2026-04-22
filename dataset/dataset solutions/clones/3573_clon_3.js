const ioProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const diagnostics = require('util'); // Used for detailed debug logging

// Buffer to store raw input lines as they are received.
let capturedInputLines = [];
// Object to manage access and conversion of buffered input.
let inputDataManager = null;

// Event listener for each line of input received.
ioProcessor.on('line', (currentLine) => {
  capturedInputLines.push(currentLine);
});

// Event listener for when the input stream is closed.
ioProcessor.on('close', () => {
  inputDataManager = createInputDataStream(capturedInputLines);
  
  debugLog("--- Application Execution Initiated ---");
  const executionStartTimestamp = performance.now(); // High-resolution timer for performance.
  
  // Invoke the main logic of the application.
  performCoreCalculation();
  
  const executionEndTimestamp = performance.now();
  const totalExecutionTime = executionEndTimestamp - executionStartTimestamp;
  
  debugLog("--- Application Execution Concluded ---");
  debugLog(`Performance Metrics:`);
  debugLog(`  Elapsed Time: ${totalExecutionTime.toFixed(3)} ms`);
  debugLog(`  Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Displays the final result or any standard output to the console.
 * @param {any} contentToDisplay The information to be printed to standard output.
 */
function displayOutput(contentToDisplay) {
  console.log(contentToDisplay);
}

/**
 * Logs detailed debug messages to the standard error stream.
 * Utilizes Node.js 'util.inspect' for better object representation.
 * @param {any} debugMessage The message or object to log for debugging purposes.
 */
function debugLog(debugMessage) {
  console.error("DIAGNOSTIC_OUTPUT:", diagnostics.inspect(debugMessage, { showHidden: false, depth: null, colors: false }));
}

/**
 * A utility object containing various methods for converting string inputs to desired data types.
 * This centralizes input parsing logic.
 */
const stringToDataConverter = {
  /** Converts a string to an integer (base 10). */
  toInteger: (inputString) => parseInt(inputString, 10),
  /** Splits a string by space into an array of strings. */
  toStringArray: (inputString) => inputString.split(" "),
  /** Splits a string by space and converts each part to a number. */
  toNumericArray: (inputString) => inputString.split(" ").map(Number),
  /** Splits a string into an array of individual characters. */
  toCharacterArray: (inputString) => inputString.split(""),
  /** Splits a string into characters and converts each to a number. */
  toNumericCharacterArray: (inputString) => inputString.split("").map(Number),
  /** Default conversion: returns the input string as is. */
  asIs: (inputString) => inputString
};

/**
 * Factory function to create an object that provides structured access to the buffered input lines.
 * It manages the current read position and offers helper methods for common input types.
 * @param {string[]} sourceLines The array of raw input strings collected from the stream.
 * @returns {object} An accessor object with methods like `hasMoreLines` and `retrieveNextLine`.
 */
function createInputDataStream(sourceLines) {
  let currentReadPointer = 0; // Keeps track of the next line to read.
  const totalAvailableLines = sourceLines.length;

  return {
    // Exposes the raw data source and internal state for debugging/inspection.
    _rawSourceData: sourceLines,
    _currentPosition: currentReadPointer,
    _totalLines: totalAvailableLines,

    /** Checks if there are more lines available to be read from the buffer. */
    hasMoreLines: function() {
      return this._currentPosition < this._totalLines;
    },

    /** Retrieves the next raw line from the input buffer and advances the read pointer. */
    retrieveNextLine: function() {
      if (!this.hasMoreLines()) {
        // Custom error for end-of-input condition, providing more context.
        throw new Error("Input buffer exhausted: Attempted to read beyond available lines.");
      }
      const lineContent = this._rawSourceData[this._currentPosition];
      this._currentPosition++; // Move to the next line.
      return lineContent;
    },

    // Convenient wrapper methods for common input data types, utilizing the converter.
    fetchNextInteger: function() { 
      return stringToDataConverter.toInteger(this.retrieveNextLine()); 
    },
    fetchNextStringArray: function() { 
      return stringToDataConverter.toStringArray(this.retrieveNextLine()); 
    },
    fetchNextNumericArray: function() { 
      return stringToDataConverter.toNumericArray(this.retrieveNextLine()); 
    },
    fetchNextCharacterArray: function() { 
      return stringToDataConverter.toCharacterArray(this.retrieveNextLine()); 
    },
    fetchNextNumericCharacterArray: function() { 
      return stringToDataConverter.toNumericCharacterArray(this.retrieveNextLine()); 
    }
  };
}

/**
 * This is the core logic function that solves the problem.
 * It reads input parameters and computes the final result.
 */
function performCoreCalculation() {
  debugLog("Entering core calculation logic.");

  // Fetch the first line of input, expected to be two numbers (N and K).
  const initialParams = inputDataManager.fetchNextNumericArray();
  
  // Validate the number of parameters.
  if (initialParams.length < 2) {
    debugLog(`Error: Expected at least 2 parameters, but received ${initialParams.length}.`);
    displayOutput("Invalid input: Not enough parameters.");
    return; 
  }

  const upperRangeLimit = initialParams[0]; // Corresponds to N in the original problem.
  const targetDivisor = initialParams[1];   // Corresponds to K in the original problem.

  // Guard clause: Handle non-positive divisors early.
  if (targetDivisor <= 0) {
    debugLog(`Warning: Target divisor is non-positive (${targetDivisor}). Result will be 0.`);
    displayOutput(0);
    return;
  }

  // Calculate the count of numbers x (1 <= x <= upperRangeLimit) such that x % targetDivisor === 0.
  // This is equivalent to floor(upperRangeLimit / targetDivisor).
  const countNumbersDivisibleByTarget = Math.floor(upperRangeLimit / targetDivisor);

  // Initialize count for numbers with a remainder of targetDivisor / 2.
  let countNumbersWithHalfRemainder = 0; 

  // This specific problem often involves counting triplets (a,b,c) where (a+b+c) is a multiple of K.
  // The solution relies on remainders modulo K. Specifically, it counts numbers with remainder 0
  // and numbers with remainder K/2 (if K is even).
  if (targetDivisor % 2 === 0) {
    const halfDivisorValue = targetDivisor / 2;
    
    // We need to count numbers of the form (m * targetDivisor + halfDivisorValue)
    // such that (m * targetDivisor + halfDivisorValue) <= upperRangeLimit.
    // Rearranging: m * targetDivisor <= upperRangeLimit - halfDivisorValue
    // So, m <= (upperRangeLimit - halfDivisorValue) / targetDivisor.
    // Since m starts from 0, the count is floor(...) + 1.
    // This is only possible if upperRangeLimit is at least halfDivisorValue.
    if (upperRangeLimit >= halfDivisorValue) {
      countNumbersWithHalfRemainder = Math.floor((upperRangeLimit - halfDivisorValue) / targetDivisor) + 1;
    }
    debugLog(`For K=${targetDivisor} (even): count of numbers with remainder K/2 is ${countNumbersWithHalfRemainder}.`);
  }

  // The final calculation is typically the sum of cubes of these counts.
  // This is a common pattern for problems counting (a,b,c) where (a+b+c) % K == 0.
  let finalCalculatedSum = Math.pow(countNumbersDivisibleByTarget, 3);
  
  // Add the cube of the 'half-remainder' count if K is even.
  if (targetDivisor % 2 === 0) {
    finalCalculatedSum += Math.pow(countNumbersWithHalfRemainder, 3);
  }

  displayOutput(finalCalculatedSum);
  debugLog("Core calculation completed and result displayed.");
}