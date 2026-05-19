"use strict";
// Utility class for reading input tokens from a string
function InputReader(inputString, parserFunction) {
  this._sourceLines = inputString.split("\n"); // Stores the input as an array of lines
  this._currentColumn = 0; // Index of the current token within the current line
  this._currentLine = 0; // Index of the current line being processed
  this._parseFunction = parserFunction || Number; // Function to convert token strings to desired type (defaults to Number)
}

// Prototype method to read the next single token
InputReader.prototype.readNextToken = function() {
  // Retrieve the content of the current line
  var currentLineContent = this._sourceLines[this._currentLine];
  if (!currentLineContent) return; // If no more lines, return undefined

  // Split the line into tokens based on space and trim leading/trailing whitespace
  var tokensOnLine = currentLineContent.trim().split(" ");
  var currentToken = tokensOnLine[this._currentColumn]; // Get the token at the current column index
  this._currentColumn++; // Advance to the next column

  // If all tokens on the current line have been consumed, reset column and move to the next line
  if (tokensOnLine.length === this._currentColumn) {
    this._currentColumn = 0;
    this._currentLine++;
  }
  return this._parseFunction(currentToken); // Parse the token using the specified function and return it
};

// Prototype method to read all tokens from the current line
InputReader.prototype.readLineTokens = function() {
  // Retrieve the content of the current line
  var currentLineContent = this._sourceLines[this._currentLine];
  if (!currentLineContent) return; // If no more lines, return undefined

  this._currentColumn = 0; // Reset column index as the entire line is being read
  this._currentLine++; // Advance to the next line

  // Split the line into tokens, parse each token, and return the resulting array
  return currentLineContent.split(" ").map(this._parseFunction);
};

// Function to generate a list of prime numbers up to a specified upper bound using the Sieve of Eratosthenes
function calculatePrimesSieve(upperBound) {
  // Create a boolean array, initialized to true, where index i indicates if i is prime
  const isPrimeFlags = new Array(upperBound + 1).fill(true);
  isPrimeFlags[0] = false; // 0 is not a prime number
  isPrimeFlags[1] = false; // 1 is not a prime number

  const primeNumbersList = []; // Array to store the prime numbers found

  // Iterate from 2 up to the upper bound
  for (let currentNumber = 2; currentNumber <= upperBound; currentNumber += 1) {
    // If the current number is marked as prime
    if (true === isPrimeFlags[currentNumber]) {
      primeNumbersList.push(currentNumber); // Add it to our list of primes

      // Mark all multiples of the current prime as not prime, starting from its square
      let multiple = currentNumber * currentNumber;
      for (; multiple <= upperBound;) {
        isPrimeFlags[multiple] = false;
        multiple += currentNumber; // Move to the next multiple
      }
    }
  }
  return primeNumbersList; // Return the array of prime numbers
}

// Pre-calculate a list of prime numbers up to 100,000
var primeCollection = calculatePrimesSieve(100000);

// Main function to process the input data and solve the problem
function processInput(rawData) {
  // Initialize an InputReader instance with the raw input data
  var inputProcessor = new InputReader(rawData);

  // Read the first number, which represents the count of elements
  var countOfElements = inputProcessor.readNextToken();
  var dataArray = []; // Array to store the subsequent input numbers

  // Read 'countOfElements + 1' numbers into the dataArray
  for (var idx = 0; idx <= countOfElements; idx++) {
    dataArray.push(inputProcessor.readNextToken());
  }

  // Reverse the order of elements in the dataArray
  dataArray = dataArray.reverse();

  // Calculate the Greatest Common Divisor (GCD) of all elements in the dataArray
  let arrayGcd = dataArray[0];
  for (var idx = 1; idx <= countOfElements; idx++) {
    arrayGcd = Math.abs(findGcd(arrayGcd, dataArray[idx]));
  }

  // Divide each element in the dataArray by the calculated arrayGcd
  dataArray = dataArray.map(elementValue => elementValue / arrayGcd);

  var resultPrimes = []; // Array to store the prime factors that satisfy the conditions

  // Filter the pre-calculated primes that are less than or equal to 'countOfElements'
  primeCollection.filter(potentialPrime => potentialPrime <= countOfElements).forEach(currentPrime => {
    // If the first element of the modified dataArray is not divisible by the current prime, skip it
    if (dataArray[0] % currentPrime !== 0) return;

    // Perform a specific check for the current prime
    for (var idx = 1; idx < currentPrime; idx++) {
      var innerIdx = idx;
      var sumOfElements = 0;
      while (innerIdx <= countOfElements) {
        sumOfElements += dataArray[innerIdx];
        innerIdx += currentPrime - 1;
      }
      // If the sum condition is not met for this prime, skip it
      if (sumOfElements % currentPrime !== 0) return;
    }
    // If all conditions are satisfied, add the current prime to the results
    resultPrimes.push(currentPrime);
  });

  // Factorize the remaining arrayGcd using the pre-calculated primes
  var primeIdx = 0;
  while (arrayGcd > 1 && primeIdx < primeCollection.length) {
    if (arrayGcd % primeCollection[primeIdx] === 0) {
      resultPrimes.push(primeCollection[primeIdx]); // Add the prime factor to results
      // Continuously divide arrayGcd by this prime factor until it's no longer divisible
      while (arrayGcd % primeCollection[primeIdx] === 0) {
        arrayGcd = arrayGcd / primeCollection[primeIdx];
      }
    }
    primeIdx += 1; // Move to the next prime in the collection
  }
  // If, after division, arrayGcd is still greater than 1, it means it's a prime factor itself
  if (arrayGcd > 1) {
    resultPrimes.push(arrayGcd);
  }

  // Sort the collected prime factors in ascending order
  resultPrimes.sort((valA, valB) => valA - valB);

  // Print unique prime factors to the console
  var previousValue;
  for (var idx = 0; idx < resultPrimes.length; idx++) {
    if (previousValue !== resultPrimes[idx]) { // Check for uniqueness
      console.log(resultPrimes[idx]);
    }
    previousValue = resultPrimes[idx]; // Update previous value for the next iteration
  }
}

// Function to calculate the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm
function findGcd(valA, valB) {
  if (valB === 0) return valA; // Base case: if valB is 0, valA is the GCD
  return findGcd(valB, valA % valB); // Recursive step: GCD(a, b) = GCD(b, a % b)
}

// Read input from standard input and pass it to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
