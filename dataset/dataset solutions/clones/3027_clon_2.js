"use strict";

// This class is designed to handle sequential reading of input data.
// It parses a multi-line string into tokens, allowing retrieval of individual values or full lines.
function InputProcessor(sourceString, valueParser) {
  this.sourceLines = sourceString.split("\n"); // Stores each line of the input string as an array element.
  this.currentColumnIndex = 0; // Tracks the position of the next token to read within the current line.
  this.currentLineIndex = 0; // Tracks the index of the current line being processed.
  this.parsingFunction = valueParser || Number; // The function used to convert string tokens to their desired type (e.g., Number, String).
}

// Prototype method to read and return the next single value (token) from the input stream.
InputProcessor.prototype.readNextValue = function() {
  let currentLineContent = this.sourceLines[this.currentLineIndex]; // Get the content of the current line.
  if (!currentLineContent) {
    return; // If there are no more lines, return undefined.
  }

  // Split the current line into an array of string tokens, after trimming leading/trailing whitespace.
  let lineTokens = currentLineContent.trim().split(" ");
  let extractedToken = lineTokens[this.currentColumnIndex]; // Retrieve the token at the current column index.
  this.currentColumnIndex++; // Advance the column index to point to the next token.

  // If all tokens on the current line have been read, reset the column index and move to the next line.
  if (lineTokens.length === this.currentColumnIndex) {
    this.currentColumnIndex = 0;
    this.currentLineIndex++;
  }
  // Parse the extracted token using the specified parsing function and return the result.
  return this.parsingFunction(extractedToken);
};

// Prototype method to read all values from the current line as an array of parsed values.
InputProcessor.prototype.readLineValues = function() {
  let currentLineContent = this.sourceLines[this.currentLineIndex]; // Get the content of the current line.
  if (!currentLineContent) {
    return; // If no more lines, return undefined.
  }
  this.currentColumnIndex = 0; // Reset column index as we're consuming the whole line.
  this.currentLineIndex++; // Advance to the next line.
  // Split the line into tokens, then map each token through the parsing function, returning the array.
  return currentLineContent.split(" ").map(this.parsingFunction);
};

// Implements the Sieve of Eratosthenes algorithm to find all prime numbers up to a specified limit.
function generatePrimesUpTo(upperBound) {
  // Create a boolean array, initially marking all numbers from 0 to upperBound as potentially prime.
  const isPrimeFlags = new Array(upperBound + 1).fill(true);
  isPrimeFlags[0] = false; // 0 is not a prime number.
  isPrimeFlags[1] = false; // 1 is not a prime number.

  const primeNumbersList = []; // This array will store the prime numbers found.

  // Iterate from the first prime number (2) up to the specified upper bound.
  for (let currentNumber = 2; currentNumber <= upperBound; currentNumber += 1) {
    // If the current number is marked as prime (i.e., it hasn't been crossed out yet).
    if (true === isPrimeFlags[currentNumber]) {
      primeNumbersList.push(currentNumber); // Add it to our list of primes.
      let multipleValue = currentNumber * currentNumber; // Start marking multiples from currentNumber squared.
      // Mark all multiples of the current prime as not prime.
      while (multipleValue <= upperBound) {
        isPrimeFlags[multipleValue] = false; // Mark as not prime.
        multipleValue += currentNumber; // Move to the next multiple.
      }
    }
  }
  return primeNumbersList; // Return the complete list of prime numbers.
}

// Pre-calculate a list of prime numbers up to 100,000 for efficient lookup later.
var cachedPrimes = generatePrimesUpTo(100000);

// Computes the greatest common divisor (GCD) of two non-negative integers using the Euclidean algorithm.
function calculateGreatestCommonDivisor(firstNumber, secondNumber) {
  if (secondNumber === 0) {
    return firstNumber; // Base case: GCD(a, 0) is 'a'.
  }
  // Recursive step: GCD(a, b) is equivalent to GCD(b, a % b).
  return calculateGreatestCommonDivisor(secondNumber, firstNumber % secondNumber);
}

// The main function that processes the input data and solves the problem.
function processInputAndSolve(rawData) {
  // Initialize an input handler to parse the raw string data.
  var inputHandler = new InputProcessor(rawData);

  // Read the first value, which represents the size of the subsequent array.
  var arraySize = inputHandler.readNextValue();
  var inputArray = []; // Declare an array to hold the input numbers.

  // Populate the inputArray by reading 'arraySize + 1' values from the input.
  for (var loopCounter = 0; loopCounter <= arraySize; loopCounter++) {
    inputArray.push(inputHandler.readNextValue());
  }
  // Reverse the order of elements in the array.
  inputArray = inputArray.reverse();

  // Calculate the greatest common divisor of all elements in the reversed array.
  let commonDivisor = inputArray[0];
  for (var loopCounter = 1; loopCounter <= arraySize; loopCounter++) {
    commonDivisor = calculateGreatestCommonDivisor(commonDivisor, inputArray[loopCounter]);
  }

  // Divide each element in the array by the calculated common divisor.
  inputArray = inputArray.map(elementValue => elementValue / commonDivisor);

  var resultDivisors = []; // This array will store the final set of unique divisors.

  // Iterate through the pre-calculated primes to find divisors that satisfy specific conditions.
  cachedPrimes.forEach(currentPrime => {
    // If the first element of the modified array is not divisible by the current prime, skip this prime.
    if (inputArray[0] % currentPrime !== 0) {
      return; // Move to the next prime in the cachedPrimes list.
    }

    // Perform a specific check: sum elements at indices j, j+(prime-1), j+2*(prime-1), etc.
    // This sum must be divisible by the currentPrime for it to be a valid divisor.
    for (var innerLoopIndex = 1; innerLoopIndex < currentPrime; innerLoopIndex++) {
      var currentJ = innerLoopIndex;
      var sumOfElements = 0;
      while (currentJ <= arraySize) {
        sumOfElements += inputArray[currentJ];
        currentJ += currentPrime - 1;
      }
      // If the sum is not divisible by the current prime, then this prime is not a valid divisor.
      if (sumOfElements % currentPrime !== 0) {
        return; // Exit the forEach callback for this currentPrime.
      }
    }
    // If all checks pass, add the current prime to our list of result divisors.
    resultDivisors.push(currentPrime);
  });

  // After checking against cached primes, handle any remaining prime factors within the 'commonDivisor'.
  var primeCheckIndex = 0;
  while (commonDivisor > 1 && primeCheckIndex < cachedPrimes.length) {
    // If the commonDivisor is divisible by the current prime from our cached list.
    if (commonDivisor % cachedPrimes[primeCheckIndex] === 0) {
      resultDivisors.push(cachedPrimes[primeCheckIndex]); // Add this prime factor to the results.
      // Continuously divide commonDivisor by this prime until it's no longer divisible.
      while (commonDivisor % cachedPrimes[primeCheckIndex] === 0) {
        commonDivisor = commonDivisor / cachedPrimes[primeCheckIndex];
      }
    }
    primeCheckIndex += 1; // Move to the next prime in the cached list.
  }
  // If, after all divisions by cached primes, commonDivisor is still greater than 1, it means
  // the remaining commonDivisor itself is a prime factor (larger than any in cachedPrimes).
  if (commonDivisor > 1) {
    resultDivisors.push(commonDivisor);
  }

  // Sort the final list of divisors in ascending numerical order.
  resultDivisors.sort((valA, valB) => valA - valB);

  var previousOutputValue; // Variable to keep track of the last printed value to avoid duplicates.
  // Iterate through the sorted result divisors and print each unique one to the console.
  for (var outputIndex = 0; outputIndex < resultDivisors.length; outputIndex++) {
    if (previousOutputValue !== resultDivisors[outputIndex]) {
      console.log(resultDivisors[outputIndex]); // Print the unique divisor.
    }
    previousOutputValue = resultDivisors[outputIndex]; // Update the tracker for the next iteration.
  }
}

// Read the entire content of standard input synchronously and pass it to the main processing function.
processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
