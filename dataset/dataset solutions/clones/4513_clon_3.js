// --- Input and Utility Setup ---
// This section prepares the environment for reading input and provides general helper functions.

// Initializes an interface for reading input line by line from standard input.
const inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// An array to temporarily store all incoming lines from the input stream.
const collectedInputLines = [];

// Registers a callback to be executed for each line received from standard input.
inputLineReader.on('line', (currentInputLine) => {
  collectedInputLines.push(currentInputLine);
});

// Registers a callback to be executed once the input stream is closed.
inputLineReader.on('close', () => {
  // Create a specialized object to manage sequential access to the collected input lines.
  const inputSequenceManager = createInputDataManager(collectedInputLines);
  
  // A separator message, often used to visually distinguish debug output from final results.
  console.error('\n--- Input Processing Complete, Executing Main Logic ---');
  
  // Invoke the primary logic function of the application.
  executeProblemSolver(inputSequenceManager);
});

// Creates a deep copy of an object, handling special cases like Set objects.
function copyObjectDeeply(sourceObject) {
  // If the object is a Set, create a new Set from its elements.
  if (sourceObject instanceof Set) {
    return new Set(Array.from(sourceObject));
  }
  // For other plain objects or arrays, use JSON serialization for a deep copy.
  return JSON.parse(JSON.stringify(sourceObject));
}

// Fetches the next input segment and converts it into a single integer.
function retrieveNextInteger(inputManagerInstance) {
  return processSegmentForType(inputManagerInstance.advanceAndGetNext(), 1);
}

// Fetches the next input segment and converts it into an array of strings.
function retrieveNextStringArray(inputManagerInstance) {
  return processSegmentForType(inputManagerInstance.advanceAndGetNext(), 2);
}

// Fetches the next input segment and converts it into an array of integers.
function retrieveNextIntegerArray(inputManagerInstance) {
  return processSegmentForType(inputManagerInstance.advanceAndGetNext(), 4);
}

// Fetches the next input segment and converts it into an array of characters.
function retrieveNextCharacterArray(inputManagerInstance) {
  return processSegmentForType(inputManagerInstance.advanceAndGetNext(), 6);
}

// Constructs an object to manage the sequential reading of input data.
function createInputDataManager(allInputData) {  
  const sequentialReader = {
    // Stores the array of all input lines.
    dataLines : allInputData,
    // Tracks the current position for reading.
    currentReadIndex : 0,
    // The total number of lines available for reading.
    totalAvailableLines : allInputData.length,

    // Determines if there are more lines left to read in the sequence.
    canReadMore : function() {
      return (this.currentReadIndex < this.totalAvailableLines);
    },

    // Retrieves the next line from the sequence and advances the internal pointer.
    advanceAndGetNext : function() {
      if (this.canReadMore()) {
        const nextDataChunk = this.dataLines[this.currentReadIndex];
        this.currentReadIndex += 1; // Increment the index for the next read.
        return nextDataChunk;
      } else {
        // If no more data, signal an error to prevent out-of-bounds access.
        throw new Error('InputBufferEmptyError: Attempted to read beyond available input lines.');
      }
    }
  };

  // Optional: Add a validation check for empty input at initialization.
  if (sequentialReader.totalAvailableLines === 0) {
      console.warn("WARN: The provided input data is empty. Calculations might yield unexpected results.");
  }
  return sequentialReader;
}

// Outputs the final computed result to standard output.
function emitFinalOutput(resultValue) {
  console.log(resultValue);
}

// Sends diagnostic or debugging messages to standard error.
function logDiagnosticInfo(messageContent) {
  // Utilizes Node.js's 'util.inspect' for detailed object logging.
  console.error('DIAGNOSTIC: ' + require('util').inspect(messageContent, false, null));
}

/**
 * Applies a specific transformation to an input segment based on a numerical code.
 * This function is robust against common errors and handles various data conversions.
 * @param {string|string[]} segmentToProcess - The data segment to be transformed.
 * @param {number} transformationCode - A numeric code defining the transformation type.
 *   - 1: Parses the segment into an integer (base 10).
 *   - 2: Splits the segment by spaces into an array of strings.
 *   - 4: Splits by spaces and then converts each part to a number.
 *   - 6: Splits the segment into an array of individual characters.
 *   - 7: Splits into characters and then converts each character to a number.
 *   - 8: Joins array elements with a space character.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 *   - Any other code: Returns the segment unchanged.
 * @returns {any} The transformed data, or the original segment if transformation fails or is not specified.
 */
function processSegmentForType(segmentToProcess, transformationCode) {
  // Pre-check: If the segment is null or undefined, log a warning and return it as is.
  if (segmentToProcess === null || segmentToProcess === undefined) {
      logDiagnosticInfo("Encountered null/undefined input segment for transformation. Skipping.");
      return segmentToProcess;
  }

  let transformedOutput;
  try {
    switch (transformationCode) {
      case 1:
        transformedOutput = parseInt(segmentToProcess, 10); // Always specify radix for safety.
        break;
      case 2:
        transformedOutput = segmentToProcess.split(' ');
        break;
      case 4:
        transformedOutput = segmentToProcess.split(' ').map(Number);
        break;
      case 6:
        transformedOutput = segmentToProcess.split('');
        break;
      case 7:
        transformedOutput = segmentToProcess.split('').map(Number);
        break;
      case 8:
        // Ensure the segment is an array before attempting to join.
        transformedOutput = Array.isArray(segmentToProcess) ? segmentToProcess.join(' ') : segmentToProcess;
        break;
      case 9:
        transformedOutput = Array.isArray(segmentToProcess) ? segmentToProcess.join('\n') : segmentToProcess;
        break;
      case 0:
        transformedOutput = Array.isArray(segmentToProcess) ? segmentToProcess.join('') : segmentToProcess;
        break;
      default:
        transformedOutput = segmentToProcess; // No specific transformation applied.
    }
  } catch (conversionErrorDetails) {
    // In case of an error during conversion, log it but return the original segment,
    // mimicking the original function's non-crashing behavior.
    logDiagnosticInfo(`Error during segment transformation (code ${transformationCode}): ${conversionErrorDetails.message}`);
    transformedOutput = segmentToProcess;
  }
  return transformedOutput;
}

// A dedicated function to compute the factorial of a number, modulo a given modulus.
function computeFactorialModulo(valueForFactorial, specificModulus) {
    let currentFactorialProduct = 1;

    // Input validation: Factorial is not defined for negative numbers.
    if (valueForFactorial < 0) {
        logDiagnosticInfo(`Negative input (${valueForFactorial}) for factorial. Returning 0 as convention.`);
        return 0;
    }
    // Base cases: Factorial of 0 or 1 is 1.
    if (valueForFactorial === 0 || valueForFactorial === 1) {
        return 1 % specificModulus; // Ensure result is within modulus.
    }

    // Iterate from 1 up to the value to calculate the factorial.
    for (let currentMultiplier = 1; currentMultiplier <= valueForFactorial; currentMultiplier++) {
        // Multiply and take modulo at each step to prevent overflow.
        currentFactorialProduct = (currentFactorialProduct * currentMultiplier) % specificModulus;
    }
    return currentFactorialProduct;
}

// --- Core Application Logic ---
// This is the main function where the problem's solution is implemented.
function executeProblemSolver(inputDataSource) {
  // Read the first line of input, expecting two integers separated by a space.
  const parsedInputNumbers = retrieveNextIntegerArray(inputDataSource);
  
  // Extract the individual numbers for clarity and rename them.
  const numberA = parsedInputNumbers[0]; // Corresponds to original N
  const numberB = parsedInputNumbers[1]; // Corresponds to original M
  
  // Define the large prime modulus for all calculations.
  const MOD_CONSTANT = 1000000007;
  
  // Initialize a variable to accumulate the final result.
  let finalCalculatedResult = 1;
  
  // Calculate the absolute difference between the two input numbers.
  const absoluteDifference = Math.abs(numberA - numberB);

  // Early exit condition: If the absolute difference is 2 or more, the result is 0.
  // This acts as a guard clause to simplify subsequent calculations.
  if (absoluteDifference >= 2) {
    emitFinalOutput(0);
    return; // Terminate function execution immediately.
  }
  
  // Calculate the factorial of the first number (numberA!) modulo MOD_CONSTANT.
  const factorialOfA = computeFactorialModulo(numberA, MOD_CONSTANT);
  finalCalculatedResult = (finalCalculatedResult * factorialOfA) % MOD_CONSTANT;

  // Calculate the factorial of the second number (numberB!) modulo MOD_CONSTANT.
  const factorialOfB = computeFactorialModulo(numberB, MOD_CONSTANT);
  finalCalculatedResult = (finalCalculatedResult * factorialOfB) % MOD_CONSTANT;
  
  // Conditional multiplication: If both numbers are equal, multiply the result by 2.
  if (numberA === numberB) {
    // Introduce a temporary variable for the multiplier for better readability.
    const equalityMultiplier = 2;
    finalCalculatedResult = (finalCalculatedResult * equalityMultiplier) % MOD_CONSTANT;
  }
  
  // Display the final computed result to the user.
  emitFinalOutput(finalCalculatedResult);
}