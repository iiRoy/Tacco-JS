"use strict";

// Utility class for parsing input data from a string source.
// Handles reading individual values or entire lines, with optional parsing function.
function DataStreamProcessor(sourceText, valueParserFn) {
  // Store the input source split into lines.
  this.sourceLines = sourceText.split(/\r?\n/);
  // Current index within the segments of the active line.
  this.currentSegmentIndex = 0;
  // Current line index being processed.
  this.currentLineIndex = 0;
  // Function to parse string segments into desired data types, defaults to Number.
  this.parseValueFunction = valueParserFn || Number;

  // Ensure initial state is valid.
  if (!Array.isArray(this.sourceLines) || this.sourceLines.length === 0) {
    console.error("Input source provided to DataStreamProcessor is empty or invalid.");
    this.sourceLines = [""]; // Prevent errors on empty input
  }
}

// Method to retrieve the next individual parsed value from the stream.
DataStreamProcessor.prototype.getNextValue = function () {
  let activeLineContent = this.sourceLines[this.currentLineIndex];

  // If the current line is undefined or empty, try to advance.
  if (!activeLineContent) {
    if (this.currentLineIndex >= this.sourceLines.length - 1) {
      // No more lines to process.
      return undefined;
    }
    // Skip empty lines until a non-empty one is found or end of stream.
    while (!activeLineContent && this.currentLineIndex < this.sourceLines.length - 1) {
      this.currentLineIndex++;
      this.currentSegmentIndex = 0; // Reset segment index for new line
      activeLineContent = this.sourceLines[this.currentLineIndex];
    }
    if (!activeLineContent) return undefined; // Still no content
  }

  const lineSegments = activeLineContent.trim().split(" ");

  // Handle cases where a line might be empty after trimming.
  if (lineSegments.length === 0 || (lineSegments.length === 1 && lineSegments[0] === '')) {
    this.currentLineIndex++;
    this.currentSegmentIndex = 0;
    return this.getNextValue(); // Recursively call to get from the next line
  }

  const currentSegment = lineSegments[this.currentSegmentIndex];
  this.currentSegmentIndex++;

  // If all segments on the current line have been consumed, move to the next line.
  if (this.currentSegmentIndex >= lineSegments.length) {
    this.currentSegmentIndex = 0;
    this.currentLineIndex++;
  }

  // Parse and return the extracted segment.
  const parsedItem = this.parseValueFunction(currentSegment);
  return parsedItem;
};

// Method to retrieve all parsed values from the current line and advance to the next.
DataStreamProcessor.prototype.getLineAsParsedValues = function () {
  let rawLineData = this.sourceLines[this.currentLineIndex];

  // If the line is empty or undefined, return an empty array and advance.
  if (!rawLineData || rawLineData.trim() === "") {
    this.currentLineIndex++;
    this.currentSegmentIndex = 0;
    return [];
  }

  this.currentSegmentIndex = 0; // Reset for the new line read.
  this.currentLineIndex++;

  const segments = rawLineData.trim().split(" ");
  const parsedValues = [];
  for (const seg of segments) {
    if (seg !== '') { // Avoid parsing empty strings from multiple spaces
      parsedValues.push(this.parseValueFunction(seg));
    }
  }
  return parsedValues;
};

// --- Mathematical Utility Functions ---

// Computes the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
function calculateGreatestCommonDivisor(firstNum, secondNum) {
  // Validate inputs are non-negative integers.
  if (!Number.isInteger(firstNum) || firstNum < 0 ||
      !Number.isInteger(secondNum) || secondNum < 0) {
    throw new Error("GCD function requires non-negative integer inputs.");
  }

  // Base case: if the second number is 0, the GCD is the first number.
  if (secondNum === 0) {
    return firstNum;
  }
  // Recursive step: GCD(a, b) = GCD(b, a % b).
  return calculateGreatestCommonDivisor(secondNum, firstNum % secondNum);
}

// Generates a list of prime numbers up to a specified limit using the Sieve of Eratosthenes.
function generatePrimesUpToLimit(maxNumber) {
  if (maxNumber < 2) {
    return []; // No primes less than 2.
  }

  // Initialize a boolean array indicating primality for each number up to maxNumber.
  // `true` means potentially prime, `false` means composite.
  const isPrimeTracker = Array.from({ length: maxNumber + 1 }, () => true);

  // 0 and 1 are not prime.
  isPrimeTracker[0] = false;
  isPrimeTracker[1] = false;

  const primeNumbersList = [];

  // Iterate from 2 up to the maximum number.
  for (let currentCandidate = 2; currentCandidate <= maxNumber; currentCandidate += 1) {
    // If the current number is marked as prime, add it to our list.
    if (isPrimeTracker[currentCandidate] === true) {
      primeNumbersList.push(currentCandidate);

      // Mark all multiples of this prime as composite.
      // Start marking from `currentCandidate * currentCandidate` because smaller multiples
      // would have already been marked by smaller prime factors.
      let multipleToMark = currentCandidate * currentCandidate;
      while (multipleToMark <= maxNumber) {
        isPrimeTracker[multipleToMark] = false;
        multipleToMark += currentCandidate; // Move to the next multiple.
      }
    }
  }
  return primeNumbersList;
}

// --- Global Data Initialization ---
// Precompute a list of prime numbers up to a certain limit for later use.
const precomputedPrimesList = generatePrimesUpToLimit(100_000);

// --- Helper function for the main logic ---
// Checks if the sum of elements at specific indices in an array is divisible by a prime.
function checkModuloSum(dataArray, numElements, primeDivisor, startOffset) {
  let currentArrayIdx = startOffset;
  let runningSumModulo = 0;
  const step = primeDivisor - 1; // The step in the original loop was prime - 1

  while (currentArrayIdx <= numElements) {
    runningSumModulo = (runningSumModulo + dataArray[currentArrayIdx]) % primeDivisor;
    currentArrayIdx += step; // Original logic was j += prime - 1
    // Handle the case where primeDivisor is 1, step would be 0, causing infinite loop.
    // However, primes start from 2, so primeDivisor - 1 is always >= 1.
  }
  return runningSumModulo === 0;
}

// Extracts unique prime factors from a given number using a precomputed list of primes.
function extractUniquePrimeFactors(numberToFactorize, availablePrimes) {
  const factors = new Set();
  let tempNumber = numberToFactorize;
  let primeIdx = 0;

  while (tempNumber > 1 && primeIdx < availablePrimes.length) {
    const currentPrime = availablePrimes[primeIdx];
    if (tempNumber % currentPrime === 0) {
      factors.add(currentPrime);
      while (tempNumber % currentPrime === 0) {
        tempNumber /= currentPrime;
      }
    }
    primeIdx++;
  }
  // If after dividing by all available primes, tempNumber is still > 1,
  // it means the remaining tempNumber is a prime factor itself (larger than precomputed primes).
  if (tempNumber > 1) {
    factors.add(tempNumber);
  }
  return Array.from(factors).sort((a, b) => a - b);
}


// --- Main Program Logic ---
// Processes the input data to find specific prime divisors based on problem logic.
function processInputAndFindSolutions(rawDataString) {
  // Initialize the input data parser.
  const dataParser = new DataStreamProcessor(rawDataString, parseInt);

  // Read the count of subsequent numbers, 'n'.
  const inputCount = dataParser.getNextValue();

  // Basic validation for inputCount.
  if (typeof inputCount !== 'number' || !Number.isInteger(inputCount) || inputCount < 0) {
    console.error("Invalid input count 'n' received:", inputCount);
    return; // Exit if inputCount is invalid.
  }

  const valueArray = [];
  // Read 'n + 1' numbers into the array.
  let readCounter = 0;
  while (readCounter <= inputCount) {
    const nextVal = dataParser.getNextValue();
    if (typeof nextVal !== 'number' || !Number.isInteger(nextVal)) {
      console.error(`Error reading value at index ${readCounter}. Received: ${nextVal}`);
      return;
    }
    valueArray.push(nextVal);
    readCounter++;
  }

  // Reverse the array as per the original problem logic.
  valueArray.reverse();

  // Calculate the Greatest Common Divisor (GCD) of all elements in the array.
  // Start with the first element and reduce. Handle empty array case.
  let commonDivisor = valueArray.length > 0 ? valueArray[0] : 0;
  if (valueArray.length > 1) {
    commonDivisor = valueArray.slice(1).reduce((currentGcd, nextVal) =>
      calculateGreatestCommonDivisor(currentGcd, nextVal), commonDivisor);
  }

  // Divide all elements in the array by their common divisor.
  // This simplifies the numbers while preserving their relative divisibility properties.
  const processedValueArray = valueArray.map(element => element / commonDivisor);

  // Initialize a set to store unique prime factors found.
  const collectedPrimeFactors = new Set();

  // Filter relevant primes and apply the core logic.
  // Only consider primes up to 'inputCount' for this specific check.
  const relevantPrimes = precomputedPrimesList.filter(p => p <= inputCount);

  for (const currentPrimeDivisor of relevantPrimes) {
    // Optimization: If the first element is not divisible by the current prime, skip.
    if (processedValueArray[0] % currentPrimeDivisor !== 0) {
      continue;
    }

    let allInnerChecksPass = true;
    // Iterate from 1 up to 'currentPrimeDivisor - 1'.
    for (let startIndex = 1; startIndex < currentPrimeDivisor; startIndex++) {
      // Use the helper function to check the sum modulo for this startIndex.
      if (!checkModuloSum(processedValueArray, inputCount, currentPrimeDivisor, startIndex)) {
        allInnerChecksPass = false;
        break; // If any sum check fails, this prime is not a solution.
      }
    }

    // If all checks passed, add this prime to the results.
    if (allInnerChecksPass) {
      collectedPrimeFactors.add(currentPrimeDivisor);
    }
  }

  // Now, extract prime factors from the initial commonDivisor.
  // These are also part of the solution.
  if (commonDivisor > 1) {
    const factorsFromGcd = extractUniquePrimeFactors(commonDivisor, precomputedPrimesList);
    factorsFromGcd.forEach(factor => collectedPrimeFactors.add(factor));
  }

  // Convert the set to an array, sort it, and print unique elements.
  const finalUniqueResults = Array.from(collectedPrimeFactors).sort((a, b) => a - b);

  // Print each unique result on a new line.
  for (const resultValue of finalUniqueResults) {
    console.log(resultValue);
  }
}

// Read input from standard input and execute the main processing function.
// Using file descriptor 0 for stdin is a common Node.js practice.
processInputAndFindSolutions(require('node:fs').readFileSync(0, 'utf8'));