// This module is designed to perform a specific numerical transformation and aggregation
// on input data, ultimately calculating a final product under a modulo constraint.
function  processInput(  receivedData  )
{

  // The first line of input provides a numerical value, typically representing a count
  // or initial parameter for the subsequent processing.
  const   initialCountVal = parseInt(receivedData[0], 10);

  // A hash map (object) to store the frequency of individual numbers encountered
  // in the input. Keys are the numbers, values are their occurrences.
  let    numberFrequencies = {};


  // This constant defines the modulo value used for all intermediate and final calculations.
  // It's a large prime number, common in competitive programming to prevent overflow.
  const  MODULUS_VALUE = 998244353;


  // Variable to keep track of the largest number found in the input sequence.
  let    greatestObservedNumber = 0;


  // The second line of input contains a space-separated string of numbers.
  // This block parses these numbers, updates their frequencies, and identifies the maximum.
  receivedData[1]
    .split(" ")
    .forEach( (itemStr) => {
        let   currentNumericValue = parseInt(itemStr, 10);

        // Increment the frequency count for the current number. If it's the first time
        // encountering this number, initialize its count to 1.
        numberFrequencies[currentNumericValue] = (numberFrequencies[currentNumericValue] || 0) + 1;

        // Update the maximum observed number if the current value is greater.
        greatestObservedNumber = Math.max(greatestObservedNumber, currentNumericValue);
    } );


  // Initialize the accumulator for the final product calculation.
  // Starting with 1 ensures correct multiplication.
  let    accumulatedProduct = 1;


  // An auxiliary object, declared and initialized with a single entry,
  // but it does not appear to be utilized in the subsequent calculation logic.
  const  supplementalStorage = {};
  supplementalStorage[-1] = 1; // Assigning an arbitrary value to an unused key.


  // This loop iterates from 1 up to the `greatestObservedNumber`.
  // In each iteration, it performs a specific multiplicative operation.
  for (  let currentIterationIndex = 1; currentIterationIndex <= greatestObservedNumber; currentIterationIndex++  )
  {
    // Retrieve the frequency of the number immediately preceding the current index.
    // Default to 0 if the number was not encountered (i.e., its frequency is undefined).
    const    previousElementFrequency = numberFrequencies[currentIterationIndex - 1] || 0;

    // Retrieve the frequency of the number at the current index.
    // Default to 0 if the number was not encountered.
    const    currentElementFrequency = numberFrequencies[currentIterationIndex] || 0;

    // The core calculation: multiply the accumulated product by
    // (the frequency of the previous number raised to the power of the current number's frequency).
    // The result is then taken modulo MODULUS_VALUE to keep it within bounds.
    accumulatedProduct = (accumulatedProduct * Math.pow(previousElementFrequency, currentElementFrequency)) % MODULUS_VALUE;
  }


  // Display the final computed product to the standard output.
  console.log(accumulatedProduct);
}


// --- SUPPORTING UTILITY FUNCTIONS ---

// A memoization cache to store results of factorial computations.
// This prevents redundant calculations for the same input number.
let    factorialMemo = {};


/**
 * Calculates the factorial of a given positive integer using recursion and memoization.
 *
 * @param {number} valueToFactorize - The integer for which the factorial is to be computed.
 * @returns {number} The factorial of 'valueToFactorize'.
 */
function  calculateFactorialValue(  valueToFactorize  )
{
  // Base case for the factorial function: factorial of 1 is 1.
  if  (  valueToFactorize === 1  )
    {
      return 1;
    }

  // Check if the factorial for 'valueToFactorize' has already been computed and stored in the cache.
  if  (  factorialMemo[valueToFactorize]  )
    {
      return factorialMemo[valueToFactorize];
    }

  // If not in cache, compute it recursively and store the result before returning.
  // This ensures that future calls with the same 'valueToFactorize' will use the cached result.
  const  computedResult = valueToFactorize * calculateFactorialValue(valueToFactorize - 1);
  factorialMemo[valueToFactorize] = computedResult;
  return computedResult;
}


// --- APPLICATION ENTRY POINT ---
// This block reads input from standard input, typically a file redirected to /dev/stdin,
// processes it, and then invokes the main `processInput` function with the parsed data.
processInput(
  require('fs')
    .readFileSync(
      '/dev/stdin',
      'utf8'
    )
    .split("\n")
);