// Main processing routine for number analysis, analyzing input numbers for Goldbach-like conjectures
const executeProgram = function() {
  let
    idx, k, val, midpoint, pairCounter; // Declaring variables for iteration and calculation
  const inputSize = programInput.length; // Determine the total number of input lines to process

  for (idx = 0; idx < inputSize; idx++) {
    val = Number.parseInt(programInput[idx], 10); // Parse current input string to an integer, base 10
    if (val === 0) {
      break; // Exit loop immediately if a zero is encountered, signaling end of input
    }
    midpoint = Math.floor(val / 2); // Calculate the integer half of the current value using Math.floor
    
    // Iterate through the pre-calculated prime numbers
    for (pairCounter = 0, k = 0; foundPrimes[k] <= midpoint; k++) {
      // Check if the complement (val - current_prime) is also a prime number using the lookup map
      if (isPrimeMap[val - foundPrimes[k]]) {
        pairCounter++; // Increment the counter if both numbers form a prime pair
      }
    }
    console.log(pairCounter); // Output the total count of prime pairs found for the current input value
  }
};

// Immediately Invoked Function Expression to pre-calculate prime numbers up to a specified limit
const foundPrimes = ((upperBoundVal) => {
  let
    outerLoopCounter, innerLoopCounter, isPrimeCandidate; // Loop indices and flag for primality
  const generatedPrimes = [2]; // Start with the first prime number, 2
  if (upperBoundVal < 2) return []; // If limit is less than 2, no primes (except potentially 2 itself, but 2 is handled by initialization)

  for (outerLoopCounter = 3; outerLoopCounter <= upperBoundVal; outerLoopCounter += 2) {
    isPrimeCandidate = true; // Assume current odd number is prime until proven otherwise
    // Check for divisibility by already found primes
    // The original logic uses primes[j] < i*i, which is not the typical sqrt(i) optimization.
    // We replicate this structure exactly for Type II cloning.
    for (innerLoopCounter = 0; generatedPrimes[innerLoopCounter] < outerLoopCounter * outerLoopCounter; innerLoopCounter++) {
      if (outerLoopCounter % generatedPrimes[innerLoopCounter] === 0) {
        isPrimeCandidate = false; // Found a divisor, so it's not prime
        break; // Stop checking for this number, move to the next candidate
      }
    }
    if (isPrimeCandidate) {
      generatedPrimes.push(outerLoopCounter); // Add the number to our list of primes if it passed all checks
    }
  }
  return generatedPrimes; // Deliver the array of primes computed
})(50000); // The upper limit for prime generation is 50,000

// Create a hash map (object) for efficient prime number lookups
const isPrimeMap = foundPrimes.reduce(function(accumulatorMap, currentPrimeVal) {
  accumulatorMap[currentPrimeVal] = true; // Mark the prime number as existing in the map by setting its value to true
  return accumulatorMap; // Return the updated map for the next iteration
}, {}); // Initialize the accumulator with an empty object

// Global variable to accumulate all incoming raw program input from stdin
let programInputData = '';
let programInput; // This variable will store the processed input lines

// Configure standard input stream handling for Node.js environment
process.stdin.resume(); // Ensure the stdin stream stays open to receive data
process.stdin.setEncoding('utf8'); // Set encoding for incoming data to UTF-8

// Event listener for 'data' chunks received from stdin
process.stdin.on('data', function(receivedSegment) {
  programInputData += receivedSegment; // Append each data chunk to the raw data buffer
});

// Event listener for 'end' of stdin stream, signaling all input has been received
process.stdin.on('end', () => { // Using arrow function syntax for a concise callback
  programInput = programInputData.split('\n'); // Split the accumulated data into an array of lines based on newline character
  executeProgram(); // Initiate the main program logic after all input has been processed
});