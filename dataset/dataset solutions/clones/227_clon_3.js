// Define a constant for the maximum value up to which prime numbers will be generated.
// This upper bound determines the range of numbers for which primality checks are efficient.
const MAX_PRIME_GENERATION_LIMIT = 50000;

/**
 * Generates an array of prime numbers up to a specified numerical limit.
 * Implements a basic sieve-like approach, optimized by checking only odd numbers
 * and divisors up to the square root of the current candidate.
 * @param {number} generationLimit - The inclusive upper bound for prime number generation.
 * @returns {number[]} An array containing all prime numbers less than or equal to `generationLimit`.
 */
const retrieveAllPrimesUpTo = (generationLimit) => {
  // If the limit is less than 2, no prime numbers exist.
  if (generationLimit < 2) {
    return [];
  }

  // Initialize the list of found primes with the first prime number.
  const identifiedPrimes = [2];

  // Iterate through odd numbers starting from 3 up to the generation limit.
  for (let candidateNumber = 3; candidateNumber <= generationLimit; candidateNumber += 2) {
    let isCandidatePrime = true; // Assume the candidate is prime until proven otherwise.

    // Check for divisibility by previously identified primes.
    // Optimization: Only need to check divisors up to the square root of the candidateNumber.
    // This is equivalent to checking if (divisor * divisor) > candidateNumber.
    for (let primeDivisorIndex = 0; primeDivisorIndex < identifiedPrimes.length; ++primeDivisorIndex) {
      const currentPrimeDivisor = identifiedPrimes[primeDivisorIndex];

      // If the square of the current prime divisor exceeds the candidate,
      // then the candidate has no smaller prime factors, meaning it's prime.
      if (currentPrimeDivisor * currentPrimeDivisor > candidateNumber) {
        break;
      }

      // If the candidate number is divisible by the current prime divisor, it's not prime.
      if (candidateNumber % currentPrimeDivisor === 0) {
        isCandidatePrime = false;
        break; // No need to check further divisors for this candidate.
      }
    }

    // If the candidate remained prime after all checks, add it to our list.
    if (isCandidatePrime) {
      identifiedPrimes.push(candidateNumber);
    }
  }
  return identifiedPrimes;
};

// Execute the prime generation function to populate the global list of primes.
const masterPrimeList = retrieveAllPrimesUpTo(MAX_PRIME_GENERATION_LIMIT);

/**
 * Creates a Map for efficient O(1) average-case lookup of primality.
 * This map stores prime numbers as keys with a boolean value (true) to indicate their existence.
 */
const primeLookupDictionary = new Map();
// Populate the lookup dictionary from the master list of primes.
for (const currentPrimeValue of masterPrimeList) {
  primeLookupDictionary.set(currentPrimeValue, true);
}

// --- Input Handling Mechanism ---

// A buffer to accumulate all incoming standard input data.
let accumulatedInputBuffer = '';

// Resume the standard input stream to begin listening for data.
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from standard input.
process.stdin.on('data', (incomingDataChunk) => {
  // Append the received data chunk to the buffer.
  accumulatedInputBuffer += incomingDataChunk;
});

// Event listener for when the standard input stream ends.
process.stdin.on('end', () => {
  // Process the accumulated input:
  // 1. Split the buffer into individual lines.
  // 2. Trim whitespace from each line.
  // 3. Filter out any lines that are empty after trimming.
  const processedInputLines = accumulatedInputBuffer
    .split('\n')
    .map(lineContent => lineContent.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

  // Once input is prepared, invoke the main problem-solving function.
  executeProblemSolvingRoutine(processedInputLines);
});


/**
 * The main routine to process a list of numeric inputs,
 * determining for each input how many distinct pairs of primes (p1, p2) exist
 * such that p1 + p2 = N, where N is the input number, and p1 <= p2.
 * This is a variant of Goldbach's Conjecture.
 * @param {string[]} queries - An array of strings, where each string represents a target number.
 */
const executeProblemSolvingRoutine = (queries) => {
  const totalQueriesCount = queries.length; // Get the total number of queries to process.

  // Iterate through each query in the provided list.
  for (let currentQueryIndex = 0; currentQueryIndex < totalQueriesCount; ++currentQueryIndex) {
    const currentQueryString = queries[currentQueryIndex];
    // Parse the current query string into an integer. Use Number.parseInt for explicit global function access.
    const targetSumN = Number.parseInt(currentQueryString, 10);

    // Guard clause: If the parsed number is 0, it's a termination signal for the problem.
    if (targetSumN === 0) {
      break; // Exit the loop and stop processing further queries.
    }

    // Guard clause: Handle invalid or extremely small inputs.
    // Numbers less than 4 cannot be represented as a sum of two primes (excluding 1).
    if (Number.isNaN(targetSumN) || targetSumN < 4) {
      console.log(0); // Output 0 pairs for invalid or out-of-scope numbers.
      continue; // Move to the next query without further processing this one.
    }

    // Calculate the midpoint of the target sum. Primes for the first part of the pair
    // only need to be checked up to this value.
    const searchMidpoint = Math.floor(targetSumN / 2);

    let foundPrimePairCount = 0; // Initialize a counter for valid prime pairs.

    // Iterate through the pre-generated master list of prime numbers.
    // 'firstPrimeComponent' will be the smaller prime in the pair (p1).
    for (let primeListTraversalIndex = 0; primeListTraversalIndex < masterPrimeList.length; ++primeListTraversalIndex) {
      const firstPrimeComponent = masterPrimeList[primeListTraversalIndex];

      // Optimization: If the first prime component already exceeds the midpoint,
      // then any subsequent prime will also exceed it, making it impossible to form a sum.
      if (firstPrimeComponent > searchMidpoint) {
        break; // Exit the inner loop.
      }

      // Calculate the required second prime component (p2) for the sum.
      const secondPrimeComponent = targetSumN - firstPrimeComponent;

      // Check if the 'secondPrimeComponent' is also a prime number using the fast lookup dictionary.
      // Additionally, ensure that 'secondPrimeComponent' is greater than or equal to 'firstPrimeComponent'
      // to avoid counting the same pair twice (e.g., 3+7 and 7+3) and to adhere to the p1 <= p2 convention.
      if (primeLookupDictionary.has(secondPrimeComponent) && secondPrimeComponent >= firstPrimeComponent) {
        foundPrimePairCount++; // Increment the count if a valid pair is found.
      }
    }
    // Output the total count of prime pairs found for the current target sum.
    console.log(foundPrimePairCount);
  }
};