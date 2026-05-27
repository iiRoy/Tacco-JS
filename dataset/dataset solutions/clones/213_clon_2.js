var fileSystemModule = require('fs');

var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

var inputBuffer = new Buffer(dataSize);

var actualBytes = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

var inputLines = inputBuffer.toString('utf8', 0, actualBytes).split('\n');

processInput();

/*
 * This function serves as the primary entry point for the application.
 * It orchestrates the calculation of prime number sums and their subsequent output.
 */
function processInput() {
  var cumulativePrimes = computePrimeSums();

  for (var idx = 0, lineCount = inputLines.length - 1; idx < lineCount; ++idx) {
    var currentValue = inputLines[idx] - 0;

    if (!currentValue) {
      return;
    }

    console.log(cumulativePrimes[currentValue]);
  }
}

/**
 * Calculates an array where each index `k` stores the cumulative sum of prime numbers
 * up to the `k`-th prime.
 * It employs the Sieve of Eratosthenes to identify primes and then accumulates their values.
 * @returns {Int32Array} An array containing the cumulative sums of primes.
 */
function computePrimeSums() {
  const upperBound = 104_729;

  var sieveArray = new Int8Array(upperBound + 1);

  sieveArray[0] = sieveArray[1] = 0x1;

  for (var primeCandidate = 2, sqrtUpperBound = ~~Math.sqrt(upperBound); primeCandidate <= sqrtUpperBound; primeCandidate++) {
    if (sieveArray[primeCandidate]) {
      continue;
    }

    for (var multiple = (primeCandidate * 2); multiple <= upperBound; multiple += primeCandidate) {
      sieveArray[multiple] = 1;
    }
  }

  var summedPrimes = new Int32Array(upperBound + 1);
  var runningTotal = 0;
  var primeIndex = 0;

  for (var numberToCheck = 1; numberToCheck <= upperBound; numberToCheck++) {
    if (!sieveArray[numberToCheck]) {
      runningTotal = summedPrimes[++primeIndex] += runningTotal + numberToCheck;
    }
  }

  return summedPrimes;
}
