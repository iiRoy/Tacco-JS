// This file provides an implementation for a specific numerical computation.

// Secure the file system module for reading input.
const fileSystem = require('fs');

// Specify a constant value for the modulo operation.
const MODULO_NUMERIC_VALUE = 998244353n; // Utilizing BigInt for precise large number calculations.

/**
 * Computes the modular exponentiation of BigInt numbers.
 * This function calculates (base ^ exponent) % MODULO_NUMERIC_VALUE.
 *
 * @param {bigint} baseOperand - The base number for the power calculation.
 * @param {bigint} exponentOperand - The exponent to raise the base to.
 * @returns {bigint} The result of the modular exponentiation.
 */
function calculateModularPower(baseOperand, exponentOperand) {
  let accumulatingResult = 1n; // Start with BigInt 1 as the initial product.
  let currentBaseValue = baseOperand; // The current base, updated in each iteration.
  let currentExponentValue = exponentOperand; // The current exponent, reduced in each iteration.

  // Employ the method of exponentiation by squaring for efficiency.
  while (currentExponentValue > 0n) {
    if (currentExponentValue % 2n === 1n) { // If the exponent is odd.
      accumulatingResult = (accumulatingResult * currentBaseValue) % MODULO_NUMERIC_VALUE;
    }
    currentBaseValue = (currentBaseValue * currentBaseValue) % MODULO_NUMERIC_VALUE;
    currentExponentValue /= 2n; // Perform integer division to halve the exponent.
  }
  return accumulatingResult;
}

// A global switch to control the activation of diagnostic messages.
const ACTIVATE_DIAGNOSTICS = false; // Set to true to enable detailed output for debugging.

// Designate the error console as the output stream for diagnostic information.
const diagnosticOutputChannel = console.error;

/**
 * Outputs a sequence of arguments to the designated diagnostic stream.
 * This function handles a variable number of input arguments recursively.
 *
 * @param {...any} itemsToLog - Any number of items to be displayed.
 */
function recordDiagnosticEntry(...itemsToLog) {
  if (itemsToLog.length === 0) {
    diagnosticOutputChannel('\n'); // If no items, simply print a newline.
    return;
  }
  diagnosticOutputChannel(itemsToLog[0]); // Print the first item.
  if (itemsToLog.length > 1) {
    diagnosticOutputChannel(', '); // Add a separator if more items follow.
    recordDiagnosticEntry(...itemsToLog.slice(1)); // Recursively call for remaining items.
  } else {
    diagnosticOutputChannel('\n'); // Ensure a newline at the end of the full message.
  }
}

/**
 * A conditional logging utility that only executes if diagnostics are enabled.
 * This mimics a preprocessor macro for conditional compilation.
 *
 * @param {...any} argumentsForLogging - Arguments to be passed to the logging function.
 */
const emitConditionalLog = (...argumentsForLogging) => {
  if (ACTIVATE_DIAGNOSTICS) {
    diagnosticOutputChannel("  Debug Information: ");
    recordDiagnosticEntry(...argumentsForLogging);
  }
};

// The primary function orchestrating the entire numerical process.
function performCoreComputation() {
  // Retrieve all input lines from the standard input source.
  const entireInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Parse the first line to determine the overall count of elements.
  const dataSetLength = parseInt(entireInputContent[0], 10);

  // Process the second line, splitting it into individual numeric values.
  const rawNumericData = entireInputContent[1].split(' ').map(Number);

  // Create an array to maintain the frequency of each number, initialized to zero.
  // This structure is equivalent to the 'C' vector in the original C++ code.
  const occurrenceTallies = new Array(dataSetLength).fill(0);

  // Allocate an array to hold the direct input values.
  // This array corresponds to the 'D' vector from the C++ source.
  const receivedValues = new Array(dataSetLength);

  // Iterate through the raw data to populate both the receivedValues and occurrenceTallies.
  // This loop structure mirrors the 'REP' macro found in the C++ implementation.
  for (let currentElementIndex = 0; currentElementIndex < dataSetLength; ++currentElementIndex) {
    const valueAtCurrentPosition = rawNumericData[currentElementIndex];
    receivedValues[currentElementIndex] = valueAtCurrentPosition;
    occurrenceTallies[valueAtCurrentPosition]++; // Increment the count for the observed value.
  }

  // Execute an initial validation check based on specific conditions.
  // This conditional block faithfully replicates the logic of the C++ code.
  if (receivedValues[0] !== 0 || occurrenceTallies[0] >= 2) {
    console.log(0); // If conditions are met, output zero and terminate the program.
    return;
  }

  // Initialize a BigInt variable to accumulate the final calculated product.
  // This variable is the JavaScript equivalent of 'result' in the C++ code.
  let ultimateProduct = 1n;

  // Traverse a specific range of indices for the main calculation loop.
  // This loop's behavior is identical to the 'REPS' macro in the C++ code.
  for (let processingIteration = 2; processingIteration < dataSetLength; ++processingIteration) {
    const baseForExponentiation = BigInt(occurrenceTallies[processingIteration - 1]);
    const exponentForExponentiation = BigInt(occurrenceTallies[processingIteration]);

    // Compute the modular power for the current terms.
    // The C++ code used pow(C[i-1], C[i]), which is replicated here with BigInts.
    const currentTermResult = calculateModularPower(baseForExponentiation, exponentForExponentiation);

    // Update the overall product by multiplying with the current term and applying the modulo.
    ultimateProduct = (ultimateProduct * currentTermResult) % MODULO_NUMERIC_VALUE;

    // This line serves as a structural placeholder, mirroring an empty comment line
    // in the original C++ code to maintain a consistent statement count.
  }

  // Output the final calculated product to the console.
  console.log(ultimateProduct.toString());
}

// Initiate the execution of the main computational routine.
performCoreComputation();