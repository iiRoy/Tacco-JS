"use strict";

// This class is responsible for parsing input data from a multi-line string.
function InputReader(sourceText, conversionFunction) {
  this._sourceLines = sourceText.split("\n"); // Store input as an array of lines.
  this._currentSegmentIndex = 0;              // Index of the current token within the line.
  this._currentLineIndex = 0;                 // Index of the current line being processed.
  this._valueConverter = conversionFunction || Number; // Function to convert tokens to desired type (defaults to Number).
}

// Prototype method to retrieve the next single token from the input stream.
InputReader.prototype.readNextToken = function() {
  var activeLine = this._sourceLines[this._currentLineIndex];
  if (!activeLine) {
    return; // No more lines to process.
  }

  // Split the current line into individual tokens.
  var lineParts = activeLine.trim().split(" ");
  var extractedToken = lineParts[this._currentSegmentIndex];
  this._currentSegmentIndex++; // Advance to the next token position.

  // If all tokens on the current line have been consumed, reset token index and move to the next line.
  if (lineParts.length === this._currentSegmentIndex) {
    this._currentSegmentIndex = 0;
    this._currentLineIndex++;
  }
  return this._valueConverter(extractedToken); // Convert and return the token.
};

// Prototype method to retrieve all tokens from the current line as an array.
InputReader.prototype.readCurrentLineTokens = function() {
  var targetLine = this._sourceLines[this._currentLineIndex];
  if (!targetLine) {
    return; // No more lines.
  }

  this._currentSegmentIndex = 0; // Reset token index for the new line.
  this._currentLineIndex++;      // Move to the next line.

  // Split the line, convert each token, and return the array.
  return targetLine.split(" ").map(this._valueConverter);
};

// Function to generate a list of prime numbers up to a specified limit using the Sieve of Eratosthenes.
function generatePrimeList(upperBound) {
  // Initialize a boolean array, assuming all numbers are prime initially.
  const isPrimeTracker = new Array(upperBound + 1).fill(true);
  isPrimeTracker[0] = false; // 0 is not prime.
  isPrimeTracker[1] = false; // 1 is not prime.

  const foundPrimes = []; // Array to store the prime numbers.

  // Iterate from 2 up to the upper bound.
  for (let currentNum = 2; currentNum <= upperBound; currentNum += 1) {
    // If currentNum is marked as prime, add it to our list.
    if (true === isPrimeTracker[currentNum]) {
      foundPrimes.push(currentNum);
      // Mark all multiples of this prime as not prime, starting from its square.
      let multipleCandidate = currentNum * currentNum;
      while (multipleCandidate <= upperBound) {
        isPrimeTracker[multipleCandidate] = false;
        multipleCandidate += currentNum;
      }
    }
  }
  return foundPrimes; // Return the collected list of prime numbers.
}

// Pre-calculate a list of primes up to 100,000 for later use.
var primeCollection = generatePrimeList(100000);

// Main function to execute the problem's logic.
function processSolution(incomingData) {
  // Create an instance of our input parser.
  var dataParser = new InputReader(incomingData);

  // Read the first number, which indicates the count of subsequent numbers.
  var elementCount = dataParser.readNextToken();
  var numericalSequence = [];

  // Read 'elementCount + 1' numbers into an array.
  for (var indexA = 0; indexA <= elementCount; indexA++) {
    numericalSequence.push(dataParser.readNextToken());
  }

  // Reverse the order of the numerical sequence.
  numericalSequence = numericalSequence.reverse();

  // Calculate the greatest common divisor (GCD) of all numbers in the sequence.
  let overallDivisor = numericalSequence[0];
  for (var indexB = 1; indexB <= elementCount; indexB++) {
    overallDivisor = Math.abs(computeGCD(overallDivisor, numericalSequence[indexB]));
  }

  // Divide each number in the sequence by the overall GCD.
  numericalSequence = numericalSequence.map(value => value / overallDivisor);

  // Initialize an array to store the final set of results.
  var finalResultList = [];

  // Filter primes that are relevant to the current problem's 'elementCount'.
  primeCollection
    .filter(primeValue => primeValue <= elementCount)
    .forEach(specificPrime => {
      // If the first element is not divisible by the current prime, skip it.
      if (numericalSequence[0] % specificPrime !== 0) {
        return;
      }

      // Iterate through a range related to the specific prime.
      for (var indexC = 1; indexC < specificPrime; indexC++) {
        var currentOffset = indexC;
        var accumulatedSum = 0;
        // Sum elements at specific intervals determined by the prime.
        while (currentOffset <= elementCount) {
          accumulatedSum += numericalSequence[currentOffset];
          currentOffset += specificPrime - 1;
        }
        // If the accumulated sum is not divisible by the prime, skip this prime.
        if (accumulatedSum % specificPrime !== 0) {
          return;
        }
      }
      // If all conditions pass, add the prime to the results.
      finalResultList.push(specificPrime);
    });

  // Extract prime factors from the 'overallDivisor' and add them to the results.
  var primeScanIndex = 0;
  while (overallDivisor > 1 && primeScanIndex < primeCollection.length) {
    if (overallDivisor % primeCollection[primeScanIndex] === 0) {
      finalResultList.push(primeCollection[primeScanIndex]);
      // Remove all occurrences of this prime factor from overallDivisor.
      while (overallDivisor % primeCollection[primeScanIndex] === 0) {
        overallDivisor = overallDivisor / primeCollection[primeScanIndex];
      }
    }
    primeScanIndex += 1;
  }
  // If after division, overallDivisor is still greater than 1, it's a prime factor itself.
  if (overallDivisor > 1) {
    finalResultList.push(overallDivisor);
  }

  // Sort the final results in ascending order.
  finalResultList.sort((first, second) => first - second);

  // Print unique elements from the sorted list.
  var lastPrintedValue;
  for (var outputIndex = 0; outputIndex < finalResultList.length; outputIndex++) {
    if (lastPrintedValue !== finalResultList[outputIndex]) {
      console.log(finalResultList[outputIndex]);
    }
    lastPrintedValue = finalResultList[outputIndex];
  }
}

// Function to compute the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
function computeGCD(firstNum, secondNum) {
  if (secondNum === 0) {
    return firstNum;
  }
  return computeGCD(secondNum, firstNum % secondNum);
}

// Read input from standard input and pass it to the main processing function.
processSolution(require("fs").readFileSync("/dev/stdin", "utf8"));