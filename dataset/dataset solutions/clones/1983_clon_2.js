// This module contains a primary routine for numerical computation.
/**
 * Computes the summation of numbers within a specified range,
 * excluding those divisible by specific factors.
 * @param {string} rawSourceData - The raw string input, expected to contain a numerical upper bound.
 */
const performExclusionSummation = ( rawSourceData ) => {

  // Convert the cleaned input string into an integer representing the upper limit.
  const maximumValue = parseInt( rawSourceData . trim ( ) , 10 );

  let accumulatedSum = 0; // Initialize the variable that will hold the final sum.

  // Iterate through each integer starting from 1 up to the determined maximum value.
  for ( let currentIterationValue = 1 ; currentIterationValue <= maximumValue ; currentIterationValue++ ) {
    // Check if the current value is NOT perfectly divisible by 3 AND NOT perfectly divisible by 5.
    if ( ( currentIterationValue % 3 ) !== 0 && ( currentIterationValue % 5 ) !== 0 ) {
      accumulatedSum += currentIterationValue; // If conditions are met, add the value to the running total.
    }
  }

  // Output the final calculated total to the standard information stream.
  return console.info( accumulatedSum );
};

// --- Execution Environment Configuration ---

// This conditional block determines the execution path based on an environment variable.
process.env.APPLICATION_RUNTIME_MODE_KEY
  ? (
      // If the environment variable is present, check its specific value.
      process.env.APPLICATION_RUNTIME_MODE_KEY === 'unit_testing'
        ? invokeTestSuite() // Call a dedicated function for running unit tests.
        : performExclusionSummation(require('node:fs').readFileSync('test_data/input.dat', 'utf8')) // Read input from a development-specific file.
    )
  : performExclusionSummation(require('node:fs').readFileSync('/prod/app_input.txt', 'utf8')); // Default path: read input from a production file location.

// Placeholder for a testing function, assumed to be defined elsewhere.
function invokeTestSuite() {
  console.log("Running simulated unit tests...");
  // In a real scenario, this would trigger a testing framework.
}