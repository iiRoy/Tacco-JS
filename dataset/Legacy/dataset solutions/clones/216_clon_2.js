var fileSystem = require('fs'); // File system module for input operations

// Read standard input synchronously
var dataLength = fileSystem.fstatSync(process.stdin.fd).size; // Get the size of the input stream
var inputBuffer = new Buffer(dataLength); // Create a buffer to hold the input data
var readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0); // Read data into the buffer
var inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n'); // Convert buffer to UTF-8 string and split into lines

// Initiate the primary processing function
processInput();

/**
 * Main function to process input lines and output cumulative prime sums.
 */
function processInput() {
  // Pre-calculate the array containing cumulative sums of prime numbers
  var cumulativePrimes = computeCumulativePrimeSums();

  // Iterate through each line of input, excluding the potential last empty line
  for (var lineIndex = 0, totalLines = inputLines.length - 1; lineIndex < totalLines; lineIndex++) {
    var currentNumber = inputLines[lineIndex] - 0; // Convert the input string to a numeric value

    // If the converted number is zero or falsy (e.g., empty string), skip this iteration
    if (!currentNumber) {
      continue;
    }

    // Output the pre-computed cumulative sum corresponding to the current input number
    console.log(cumulativePrimes[currentNumber]);
  }
}

/**
 * Calculates an array where each index `k` stores the cumulative sum of prime numbers up to `k`.
 * Uses a Sieve of Eratosthenes to find primes.
 * @returns {Int32Array} An array of cumulative prime sums.
 */
function computeCumulativePrimeSums() {
  const upperBound = 10000; // The maximum number to consider for prime calculation

  // Initialize a sieve array using Int8Array for memory efficiency.
  // 0 indicates a prime number, 1 indicates a composite number.
  var sieveArray = new Int8Array(upperBound + 1);

  // Mark 0 and 1 as non-prime (composite for the purpose of the sieve)
  sieveArray[0] = sieveArray[1] = 1;

  // Implement the Sieve of Eratosthenes
  // Iterate from 2 up to the square root of the upper bound
  for (var currentNum = 2, sqrtUpperBound = ~~Math.sqrt(upperBound); currentNum <= sqrtUpperBound; currentNum++) {
    // If currentNum is already marked as composite, skip it and move to the next number
    if (sieveArray[currentNum]) {
      continue;
    }

    // If currentNum is prime, mark all its multiples as composite
    // Start marking from currentNum * 2 (equivalent to currentNum << 1)
    for (var multipleNum = (currentNum << 1); multipleNum <= upperBound; multipleNum += currentNum) {
      sieveArray[multipleNum] = 1;
    }
  }

  // Create an array to store the cumulative sums of prime numbers
  var resultArray = new Int32Array(upperBound + 1);
  var runningSum = 0; // Variable to accumulate the sum of primes found so far
  var countPrimes = 0; // Index to populate the resultArray

  // Iterate from 1 to the upper bound to calculate and store cumulative sums
  for (var numToCheck = 1; numToCheck <= upperBound; numToCheck++) {
    // If numToCheck is prime (i.e., not marked as composite in sieveArray)
    if (!sieveArray[numToCheck]) {
      // Add the current prime to the running sum and store it in resultArray
      runningSum = resultArray[countPrimes] += runningSum + numToCheck;
      countPrimes++; // Increment the counter for primes found
    }
  }

  return resultArray; // Return the array containing the cumulative sums of primes
}
