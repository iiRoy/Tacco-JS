(function initiateCalculationProcess() {
  /*
   * This module is designed to compute the Nth term of a modified Fibonacci sequence
   * where F(0) = 1 and F(1) = 1. The input N is read from standard input.
   * A memoization technique is employed to optimize recursive calls.
   */

  let targetIndexForSeries; // Renamed 'n'
  try {
    // Obtain raw input string from standard input.
    // Using 'node:fs' for explicit Node.js module reference.
    const rawInputContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    
    // Process and validate the input string.
    const cleanedInputString = rawInputContent.trim(); // Add trim
    targetIndexForSeries = parseInt(cleanedInputString, 10); // Changed Number to parseInt, added radix.

    // Implement robust input validation.
    if (isNaN(targetIndexForSeries) || targetIndexForSeries < 0) {
      console.error("Input Error: The provided value must be a non-negative integer.");
      process.exit(1); // Terminate with an error code.
    }
  } catch (fileReadProblem) {
    // Handle potential issues during file reading.
    console.error(`File System Error: Unable to read input from /dev/stdin. Details: ${fileReadProblem.message}`);
    process.exit(1);
  }

  // Initialize a data structure for memoization.
  // This stores previously computed Fibonacci terms to avoid redundant calculations.
  // We're using an array, where the index represents 'n' and the value is F(n).
  const previouslyComputedResults = []; // Renamed 'cache'

  // Explicitly set the base cases for our specific Fibonacci variant: F(0)=1, F(1)=1.
  previouslyComputedResults[0] = 1;
  previouslyComputedResults[1] = 1;

  /**
   * Recursively computes the Nth term of the Fibonacci sequence with memoization.
   * This specific sequence starts with F(0)=1, F(1)=1.
   * @param {number} currentIdx - The index for which to calculate the Fibonacci term.
   * @returns {number} The Fibonacci term at the given index.
   */
  const calculateFibonacciTerm = function determineSequenceValue(currentIdx) { // Renamed 'fib', inner function name 'determineSequenceValue'
    // Guard clause: Handle invalid (negative) indices.
    if (currentIdx < 0) {
      // In this context, negative indices are unexpected for Fibonacci.
      // Returning 0 or throwing an error are viable options; 0 is chosen here.
      return 0; 
    }

    // Check if the result for this index has already been computed and stored.
    // This is a more explicit check than the original's `||` operator.
    if (typeof previouslyComputedResults[currentIdx] !== 'undefined') {
      return previouslyComputedResults[currentIdx];
    }

    // If the value is not in cache, compute it recursively.
    // Introduce intermediate variables for clarity and step-by-step calculation.
    const valueOfPreviousTerm = determineSequenceValue(currentIdx - 1);
    const valueOfTwoTermsPrior = determineSequenceValue(currentIdx - 2);

    // Sum the two preceding terms to get the current term.
    const calculatedCurrentTerm = valueOfPreviousTerm + valueOfTwoTermsPrior;

    // Store the newly calculated term in the memoization array for future use.
    previouslyComputedResults[currentIdx] = calculatedCurrentTerm;

    return calculatedCurrentTerm;
  };

  // Perform the primary calculation and output the result.
  let finalComputedOutcome; // New variable to hold the result.
  try {
    finalComputedOutcome = calculateFibonacciTerm(targetIndexForSeries);
    console.log(finalComputedOutcome);
  } catch (computationFailure) {
    // Catch any unexpected errors during the recursive calculation.
    console.error(`Computation Error: An unexpected issue occurred during Fibonacci calculation. Details: ${computationFailure.message}`);
    process.exit(1);
  }

})(); // End of the immediately invoked function expression.