"use strict";

// Custom input stream reader for parsing space-separated values
function DataStream(sourceText, typeConverter) {
  this._sourceLines = sourceText.split("\n"); // Stores the input as an array of lines
  this._colIndex = 0; // Current token index within the current line
  this._rowIndex = 0; // Current line index in the input
  this._typeConverter = typeConverter || Number; // Function to convert tokens (defaults to Number)
}

// Method to read the next individual token from the stream
DataStream.prototype.fetchValue = function() {
  let currentLineContent = this._sourceLines[this._rowIndex];
  if (!currentLineContent) {
    return; // No more lines to process
  }

  let tokensOnLine = currentLineContent.trim().split(" ");
  let nextToken = tokensOnLine[this._colIndex];
  this._colIndex++;

  // If all tokens on the current line have been consumed, advance to the next line
  if (tokensOnLine.length === this._colIndex) {
    this._colIndex = 0;
    this._rowIndex++;
  }
  return this._typeConverter(nextToken); // Convert and return the token
};

// Method to read all tokens from the current line as an array
DataStream.prototype.fetchLine = function() {
  let currentLineContent = this._sourceLines[this._rowIndex];
  if (!currentLineContent) {
    return; // No more lines to process
  }
  this._colIndex = 0; // Reset column index as we're reading a new line
  this._rowIndex++; // Move to the next line for subsequent reads
  return currentLineContent.split(" ").map(this._typeConverter); // Split, convert, and return all tokens
};

// Function to generate a list of prime numbers up to a specified upper bound
// using the Sieve of Eratosthenes algorithm.
function findPrimes(upperBound) {
  const isPrimeFlags = new Array(upperBound + 1).fill(true); // Initialize all numbers as potentially prime
  isPrimeFlags[0] = false; // 0 is not a prime number
  isPrimeFlags[1] = false; // 1 is not a prime number

  const primeNumbers = []; // Array to store the prime numbers found

  // Iterate from 2 up to the upper bound
  for (let currentNumber = 2; currentNumber <= upperBound; currentNumber += 1) {
    // If the current number is still marked as prime
    if (true === isPrimeFlags[currentNumber]) {
      primeNumbers.push(currentNumber); // Add it to our list of primes

      // Mark all multiples of this prime as not prime, starting from its square
      let currentMultiple = currentNumber * currentNumber;
      while (currentMultiple <= upperBound) {
        isPrimeFlags[currentMultiple] = false;
        currentMultiple += currentNumber; // Move to the next multiple
      }
    }
  }
  return primeNumbers; // Return the complete list of prime numbers
}

// Pre-calculate a list of prime numbers up to 100,000 for later use
var cachedPrimes = findPrimes(100000);

// Main function to process the input data and produce the required output
function processInput(rawData) {
  var dataHandler = new DataStream(rawData); // Create an instance of our input parser

  var arraySize = dataHandler.fetchValue(); // Read the first value, which indicates the size of the array
  var dataValues = []; // Initialize an array to hold the subsequent input values

  // Populate the dataValues array with 'arraySize + 1' elements
  for (var loopCounter = 0; loopCounter <= arraySize; loopCounter++) {
    dataValues.push(dataHandler.fetchValue());
  }
  dataValues = dataValues.reverse(); // Reverse the array as per the problem's logic

  // Calculate the greatest common divisor (GCD) of all elements in the array
  let greatestCommonDivisorVal = dataValues[0];
  for (var loopCounter = 1; loopCounter <= arraySize; loopCounter++) {
    greatestCommonDivisorVal = findGreatestCommonDivisor(greatestCommonDivisorVal, dataValues[loopCounter]);
  }

  // Divide each element in the array by the calculated GCD
  dataValues = dataValues.map(element => element / greatestCommonDivisorVal);

  var finalDivisors = []; // Array to store the unique prime divisors that satisfy the conditions

  // Filter through the pre-calculated primes and check specific conditions
  cachedPrimes.filter(currentPrimeFactor => currentPrimeFactor <= arraySize).forEach(currentPrimeFactor => {
    // If the first element of the modified array is not divisible by the current prime, skip it
    if (dataValues[0] % currentPrimeFactor !== 0) {
      return;
    }

    // Perform a specific sum check for elements based on the current prime factor
    for (var innerLoopIdx = 1; innerLoopIdx < currentPrimeFactor; innerLoopIdx++) {
      var subIndex = innerLoopIdx;
      var partialSum = 0;
      while (subIndex <= arraySize) {
        partialSum += dataValues[subIndex];
        subIndex += currentPrimeFactor - 1;
      }
      // If the partial sum is not divisible by the current prime, skip this prime
      if (partialSum % currentPrimeFactor !== 0) {
        return;
      }
    }
    finalDivisors.push(currentPrimeFactor); // If all checks pass, add the prime to our results
  });

  // Handle any remaining prime factors of the initial GCD value
  var primeScanIndex = 0;
  while (greatestCommonDivisorVal > 1 && primeScanIndex < cachedPrimes.length) {
    if (greatestCommonDivisorVal % cachedPrimes[primeScanIndex] === 0) {
      finalDivisors.push(cachedPrimes[primeScanIndex]); // Add the prime factor to results
      // Continuously divide out this prime factor from GCD until it's no longer divisible
      while (greatestCommonDivisorVal % cachedPrimes[primeScanIndex] === 0) {
        greatestCommonDivisorVal = greatestCommonDivisorVal / cachedPrimes[primeScanIndex];
      }
    }
    primeScanIndex += 1;
  }
  // If, after all divisions, GCD is still greater than 1, it means the remaining GCD is a prime factor itself
  if (greatestCommonDivisorVal > 1) {
    finalDivisors.push(greatestCommonDivisorVal);
  }

  // Sort the final list of divisors in ascending order
  finalDivisors.sort((valA, valB) => valA - valB);
  var lastPrintedValue; // Variable to track the last printed value to ensure uniqueness

  // Iterate through the sorted divisors and print only the unique ones
  for (var outputIdx = 0; outputIdx < finalDivisors.length; outputIdx++) {
    if (lastPrintedValue !== finalDivisors[outputIdx]) {
      console.log(finalDivisors[outputIdx]);
    }
    lastPrintedValue = finalDivisors[outputIdx];
  }
}

// Recursive function to compute the greatest common divisor (GCD) of two numbers
function findGreatestCommonDivisor(val1, val2) {
  if (val2 === 0) {
    return val1; // Base case: if val2 is 0, val1 is the GCD
  }
  return findGreatestCommonDivisor(val2, val1 % val2); // Recursive step using Euclidean algorithm
}

// Read the input from standard input and pass it to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
