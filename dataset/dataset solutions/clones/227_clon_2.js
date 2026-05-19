function executePrimeSumChecker() {
  // Declare variables for iteration, number processing, and result counting.
  let idx, subIdx, currentNum, halfNum, countPairs;
  // Determine the total number of input lines to process.
  const inputLineCount = rawData.length;

  // Iterate through each line of the provided input.
  for (idx = 0; idx < inputLineCount; idx++) {
    // Parse the current input line as an integer with base 10.
    currentNum = parseInt(rawData[idx], 10);
    // If the parsed number is zero, terminate the processing loop.
    if (currentNum === 0) {
      break;
    }
    // Calculate half of the current number using bitwise NOT for floor division.
    halfNum = ~~(currentNum / 2);

    // Initialize pair counter and inner loop index.
    for (countPairs = 0, subIdx = 0; primeNumbers[subIdx] <= halfNum; subIdx++) {
      // Check if the difference (currentNum - currentPrime) is also a prime number
      // using the pre-computed lookup map.
      if (primeLookupMap[currentNum - primeNumbers[subIdx]]) {
        countPairs++; // Increment the counter if a valid pair is found.
      }
    }
    // Output the total count of prime pairs found for the current number.
    console.log(countPairs);
  }
}

// Generate a list of prime numbers up to a specified limit using a self-executing function.
const primeNumbers = (function(upperBound) {
  let idxA, idxB, isPrimeCandidate; // Loop indices and a flag for primality check.
  const tempPrimes = [2]; // Initialize with the first prime number.

  // If the upper bound is less than 2, there are no primes to generate.
  if (upperBound < 2) {
    return [];
  }

  // Iterate through odd numbers starting from 3 up to the upper bound.
  for (idxA = 3; idxA <= upperBound; idxA += 2) {
    isPrimeCandidate = true; // Assume the current number is prime.
    // Check for divisibility by previously found primes.
    // The loop condition `tempPrimes[idxB] < idxA * idxA` is preserved from the original.
    for (idxB = 0; tempPrimes[idxB] < idxA * idxA; idxB++) {
      // If 'idxA' is divisible by a smaller prime, it's not a prime number.
      if (idxA % tempPrimes[idxB] === 0) {
        isPrimeCandidate = false; // Mark as not prime.
        break; // No need to check further divisors.
      }
    }
    // If the number passed all divisibility checks, add it to the list of primes.
    if (isPrimeCandidate) {
      tempPrimes.push(idxA);
    }
  }
  return tempPrimes; // Return the generated list of prime numbers.
})(50000); // Generate primes up to 50,000.

// Create a hash map (object) for efficient lookup of prime numbers.
const primeLookupMap = primeNumbers.reduce(function(accumulatorMap, primeVal) {
  accumulatorMap[primeVal] = true; // Mark the prime number as present in the map.
  return accumulatorMap; // Return the updated map for the next iteration.
}, {}); // Start with an empty object as the initial accumulator.

// Initialize a variable to accumulate raw input data from stdin.
let rawData = '';

// Resume stdin to start listening for input.
process.stdin.resume();
// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Attach a listener for 'data' events, appending chunks to 'rawData'.
process.stdin.on('data', function(inputChunk) {
  rawData += inputChunk;
});

// Attach a listener for the 'end' event, triggered when all input has been received.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines.
  rawData = rawData.split('\n');
  // Call the main processing function.
  executePrimeSumChecker();
});
