function processInput( dataLines ) {
  // Initialize an arbitrary numerical setting, though it's not directly utilized further in this specific algorithm.
  const initialValue = parseInt(dataLines[0], 10);

  // A data structure to keep track of the frequency of various numerical elements.
  let frequencyStore = {};
  // This variable will hold the largest numerical key encountered within the input data.
  let maximumKey = 0;

  // Process the second line of the input, splitting it into individual string components.
  dataLines[1].split(" ").forEach( (currentElementStr) => {
    // Convert each string component into its numerical equivalent.
    const currentElement = Number(currentElementStr);
    // Increment the count for the current element; if it's new, initialize its count to 1.
    frequencyStore[currentElement] = (frequencyStore[currentElement] || 0) + 1;
    // Update the maximum key found so far if the current element is larger.
    maximumKey = Math.max( maximumKey, currentElement );
  });

  // This variable will store the cumulative result of the calculations.
  let finalResult = 1;
  // A placeholder object, though its specific usage for index -1 isn't directly involved in the final calculation loop.
  const previousCounts = {};
  previousCounts[-1] = 1; // Sets an arbitrary starting point for potential lookups.

  // Begin an iterative process from 1 up to the determined maximum key.
  for ( let iteratorIndex = 1; iteratorIndex <= maximumKey; iteratorIndex++ ) {
    // Multiply the current result by the power of frequencies.
    // If a frequency is not found (undefined), it defaults to 0 for the power calculation.
    finalResult *= Math.pow( (frequencyStore[iteratorIndex - 1] || 0), (frequencyStore[iteratorIndex] || 0) );

    // If the frequency count for the current index is zero, the entire result becomes zero.
    if ( (frequencyStore[iteratorIndex] || 0) === 0 ) {
      finalResult = 0;
    }
    // Apply a modulo operation to the result to keep it within a specific numerical range.
    finalResult %= 998244353;
  }

  // Display the final computed numerical outcome to the standard output.
  console.log( finalResult );
}

// Global object utilized for memoization to cache computed factorial values.
const factorialCache = {};

function calculateFactorial( numberToFactorial ) {
  // The base case for factorial calculation: factorial of 1 is always 1.
  if ( numberToFactorial === 1 ) {
    return 1;
  }
  // Check if the factorial for the given number has already been computed and stored in the cache.
  if ( factorialCache[numberToFactorial] ) {
    return factorialCache[numberToFactorial];
  }
  // If not cached, compute the factorial recursively and then store it in the cache before returning.
  return factorialCache[numberToFactorial] = numberToFactorial * calculateFactorial( numberToFactorial - 1 );
}

// Initiate the primary data processing function using input streamed from the standard input.
processInput( require('fs').readFileSync('/dev/stdin', 'utf8').split("\n") );