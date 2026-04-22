"use strict";

// Renamed from I. This constructor initializes an object to process raw string input,
// breaking it into lines and then into tokens, with an optional type conversion function.
function InputReader(rawInputString, conversionFunction) {
  // Stores the input as an array of individual lines, handling both Unix and Windows line endings.
  this.sourceLines = rawInputString.split(/\r?\n/);
  // Keeps track of the current token's index within the active line.
  this.currentColumn = 0;
  // Indicates the index of the line currently being processed from `sourceLines`.
  this.currentLine = 0;
  // A function (defaulting to `Number`) used to convert string tokens into their desired data type.
  this.valueConverter = conversionFunction || Number;
}

// A new helper method to determine if there are any more tokens left to read in the input.
InputReader.prototype.hasMoreTokens = function() {
  // First, skip any entirely empty lines until a line with content or the end of input is reached.
  while (this.currentLine < this.sourceLines.length && this.sourceLines[this.currentLine].trim() === '') {
    this.currentLine++;
    this.currentColumn = 0; // Reset column index for the new line.
  }
  // If all lines have been processed, there are no more tokens.
  if (this.currentLine >= this.sourceLines.length) {
    return false;
  }
  // Split the current line into tokens, filtering out any empty strings that might result from multiple spaces.
  const currentLineTokens = this.sourceLines[this.currentLine].trim().split(/\s+/).filter(Boolean);
  // Returns true if the current column index is within the bounds of the tokens on the current line.
  return this.currentColumn < currentLineTokens.length;
};

// Renamed from 'a'. This method reads and returns the next single token from the input stream.
InputReader.prototype.readSingleValue = function() {
  // Before attempting to read, check if there are actually any tokens remaining.
  if (!this.hasMoreTokens()) {
    // If no more tokens, return undefined to signal the end of input.
    return undefined;
  }

  // Get the tokens from the current line, filtering out any empty strings.
  const lineTokens = this.sourceLines[this.currentLine].trim().split(/\s+/).filter(Boolean);

  // Extract the token at the current column and then advance the column index.
  const token = lineTokens[this.currentColumn];
  this.currentColumn++;

  // If all tokens on the current line have been consumed, reset the column and move to the next line.
  if (this.currentColumn >= lineTokens.length) {
    this.currentColumn = 0;
    this.currentLine++;
  }

  // Convert the extracted token using the specified `valueConverter` and return it.
  return this.valueConverter(token);
};

// Renamed from 'l'. This method reads and returns all tokens from the current line as an array.
InputReader.prototype.readEntireLine = function() {
  // Similar to `hasMoreTokens`, skip any empty lines at the start.
  while (this.currentLine < this.sourceLines.length && this.sourceLines[this.currentLine].trim() === '') {
    this.currentLine++;
    this.currentColumn = 0;
  }

  // If no more lines are available, return an empty array.
  if (this.currentLine >= this.sourceLines.length) {
    return [];
  }

  const currentLineText = this.sourceLines[this.currentLine];
  // Reset column and advance to the next line, as the entire current line is now processed.
  this.currentColumn = 0;
  this.currentLine++;

  // Split the line, filter out any empty string tokens, and apply the value converter to each.
  return currentLineText.trim().split(/\s+/).filter(Boolean).map(this.valueConverter);
};

// Renamed from sieveOfEratosthenes. This function generates a list of all prime numbers
// up to a specified maximum value using the Sieve of Eratosthenes algorithm.
function calculatePrimesUpToLimit(maxVal) {
  // If the maximum value is less than 2, there are no prime numbers to find.
  if (maxVal < 2) {
    return [];
  }

  // Initialize a boolean array `isPrime` where `isPrime[i]` is true if `i` is currently considered a prime candidate.
  const isPrime = new Array(maxVal + 1).fill(true);

  // Explicitly mark 0 and 1 as not prime.
  isPrime[0] = false;
  isPrime[1] = false;

  // This array will accumulate all the prime numbers discovered.
  const foundPrimes = [];

  // Iterate through numbers starting from 2 up to the specified maximum value.
  for (let currentNumber = 2; currentNumber <= maxVal; currentNumber++) {
    // If `currentNumber` is still marked as prime, it means it hasn't been crossed out by a smaller prime,
    // thus it is a prime number.
    if (isPrime[currentNumber]) {
      foundPrimes.push(currentNumber); // Add this prime to our list.

      // Mark all multiples of this prime as not prime. We start marking from `currentNumber * currentNumber`
      // because any smaller multiples (e.g., 2*currentNumber, 3*currentNumber) would have already been
      // marked by their respective smaller prime factors (2, 3, etc.).
      for (let multipleOfPrime = currentNumber * currentNumber; multipleOfPrime <= maxVal; multipleOfPrime += currentNumber) {
        isPrime[multipleOfPrime] = false;
      }
    }
  }
  return foundPrimes;
}

// Renamed from gcd. This function computes the Greatest Common Divisor (GCD) of two numbers
// using an iterative implementation of the Euclidean algorithm.
function findGreatestCommonDivisor(firstOperand, secondOperand) {
  // The Euclidean algorithm continues as long as the second operand is not zero.
  while (secondOperand !== 0) {
    // Calculate the remainder when `firstOperand` is divided by `secondOperand`.
    const remainder = firstOperand % secondOperand;
    // Update `firstOperand` to the value of `secondOperand`.
    firstOperand = secondOperand;
    // Update `secondOperand` to the calculated `remainder`.
    secondOperand = remainder;
  }
  // When `secondOperand` becomes zero, `firstOperand` holds the GCD.
  return firstOperand;
}

// Pre-calculate a list of prime numbers up to a high limit (e.g., 100,000).
// This list is stored globally and reused to optimize subsequent prime factorizations.
const precomputedPrimeList = calculatePrimesUpToLimit(100000);

// Renamed from main. This is the primary function that processes a sequence of numbers
// to identify specific prime factors based on a set of criteria.
function analyzeNumberSequence(rawDataInput) {
  // Create an instance of the InputReader to parse the raw input data.
  const dataReader = new InputReader(rawDataInput);

  // Read the first value from the input, which defines the length of the number sequence (N).
  let sequenceLength = dataReader.readSingleValue();

  // Implement a guard clause: Validate `sequenceLength` to ensure it's a non-negative integer.
  if (typeof sequenceLength !== 'number' || !Number.isInteger(sequenceLength) || sequenceLength < 0) {
    console.error("Error: Invalid or missing sequence length provided. Must be a non-negative integer.");
    return; // Exit if validation fails.
  }

  // Initialize an array to store the numerical sequence elements.
  const numericalSeries = [];
  // Populate the `numericalSeries` array with `sequenceLength + 1` elements as required by the problem.
  for (let elementCounter = 0; elementCounter <= sequenceLength; elementCounter++) {
    const value = dataReader.readSingleValue();
    // Guard clause: Check if enough elements are available in the input.
    if (value === undefined) {
      console.error(`Error: Insufficient input elements. Expected ${sequenceLength + 1}, but only found ${elementCounter}.`);
      return;
    }
    numericalSeries.push(value);
  }

  // The problem's logic necessitates processing the sequence in reverse order.
  // Explicitly reversing the array for clarity.
  numericalSeries.reverse();

  // Calculate the Greatest Common Divisor (GCD) for all elements in the `numericalSeries`.
  // Start with the absolute value of the first element to ensure a positive base for GCD calculation.
  let overallSequenceGcd = Math.abs(numericalSeries[0]);
  for (let currentElementIdx = 1; currentElementIdx <= sequenceLength; currentElementIdx++) {
    // Continuously update the `overallSequenceGcd` by finding the GCD with the next element.
    overallSequenceGcd = Math.abs(findGreatestCommonDivisor(overallSequenceGcd, numericalSeries[currentElementIdx]));
  }

  // Handle the edge case where the overall GCD is 0 (implying all numbers in the sequence were 0).
  if (overallSequenceGcd === 0) {
    console.error("Error: The Greatest Common Divisor of the sequence is zero. Cannot proceed with normalization.");
    return; // Cannot divide by zero, so terminate.
  }

  // Normalize the sequence: divide each element by the `overallSequenceGcd`.
  // This simplifies the numbers while preserving their relative divisibility properties.
  const normalizedSequence = numericalSeries.map(elementValue => elementValue / overallSequenceGcd);

  // Initialize a Set to store all unique prime factors discovered during the analysis.
  // Using a Set automatically handles uniqueness, avoiding duplicate factors.
  const discoveredPrimeFactors = new Set();

  // Filter the globally precomputed prime list to include only primes that are less than or equal to `sequenceLength`.
  // Primes larger than `sequenceLength` are not relevant for certain divisibility checks within the array bounds.
  const relevantPrimesForN = precomputedPrimeList.filter(p => p <= sequenceLength);

  // Begin the core analysis: Iterate through each relevant prime to check specific divisibility conditions.
  for (const currentPrimeCandidate of relevantPrimesForN) {
    // Condition 1: The first element (index 0) of the normalized sequence must be divisible by the `currentPrimeCandidate`.
    if (normalizedSequence[0] % currentPrimeCandidate !== 0) {
      continue; // If not divisible, this prime cannot be a factor according to the rules, so skip to the next prime.
    }

    let allSubConditionsMet = true; // Flag to track if all subsequent conditions for this prime are satisfied.

    // Condition 2: Evaluate sums of elements in specific sub-segments of the sequence.
    // This loop iterates through possible starting offsets for these segments.
    for (let segmentStartOffset = 1; segmentStartOffset < currentPrimeCandidate; segmentStartOffset++) {
      let currentSegmentSum = 0;
      // Traverse the sequence, summing elements at intervals defined by `(currentPrimeCandidate - 1)`.
      // The pattern is: `normalizedSequence[offset]`, `normalizedSequence[offset + (P-1)]`, `normalizedSequence[offset + 2*(P-1)]`, etc.
      for (let traversalIndex = segmentStartOffset; traversalIndex <= sequenceLength; traversalIndex += (currentPrimeCandidate - 1)) {
        currentSegmentSum += normalizedSequence[traversalIndex];
      }

      // If the sum of elements within this segment is not divisible by `currentPrimeCandidate`,
      // then this prime is not a valid factor for the sequence under these rules.
      if (currentSegmentSum % currentPrimeCandidate !== 0) {
        allSubConditionsMet = false; // Mark that a sub-condition failed.
        break; // No need to check further segments for this prime; move to the next prime candidate.
      }
    }

    // If all conditions (initial divisibility and all segment sums) are met for this prime,
    // add it to our set of discovered factors.
    if (allSubConditionsMet) {
      discoveredPrimeFactors.add(currentPrimeCandidate);
    }
  }

  // Now, factorize the `overallSequenceGcd` (which is the GCD of the original unnormalized sequence)
  // and add its prime factors to our `discoveredPrimeFactors` set.
  let remainingGcdValue = overallSequenceGcd; // Use a temporary variable to avoid modifying `overallSequenceGcd`.
  let primeIndex = 0;

  // Iterate through the `precomputedPrimeList` to find prime factors of `remainingGcdValue`.
  while (remainingGcdValue > 1 && primeIndex < precomputedPrimeList.length) {
    const currentPrecomputedPrime = precomputedPrimeList[primeIndex];

    // If the current prime divides `remainingGcdValue`.
    if (remainingGcdValue % currentPrecomputedPrime === 0) {
      discoveredPrimeFactors.add(currentPrecomputedPrime); // Add this prime factor to the set.

      // Continuously divide `remainingGcdValue` by this prime until it's no longer divisible.
      while (remainingGcdValue % currentPrecomputedPrime === 0) {
        remainingGcdValue /= currentPrecomputedPrime;
      }
    }
    primeIndex++; // Move to the next prime in our precomputed list.
  }

  // After iterating through all precomputed primes, if `remainingGcdValue` is still greater than 1,
  // it implies that the `remainingGcdValue` itself is a prime number (larger than any in our precomputed list).
  if (remainingGcdValue > 1) {
    discoveredPrimeFactors.add(remainingGcdValue); // Add this final prime factor.
  }

  // Convert the Set of unique prime factors into an Array and sort them in ascending numerical order.
  const finalSortedFactors = Array.from(discoveredPrimeFactors).sort((valA, valB) => valA - valB);

  // Print each unique, sorted prime factor to the console.
  finalSortedFactors.forEach(factor => {
    console.log(factor);
  });
}

// Read the entire input from standard input (e.g., a file redirected to stdin)
// and then pass it to the `analyzeNumberSequence` function for processing.
analyzeNumberSequence(require("fs").readFileSync("/dev/stdin", "utf8"));