var fileSystemModule = require('fs');

var dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var inputBuffer = new Buffer(dataLength);
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var inputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Begin the primary execution flow
processData();

// This function orchestrates the prime number search for each input value.
function processData() {
  var foundPrimes = generatePrimeList();

  // Iterate through the provided input lines, excluding the last one if it's empty.
  for (var idx = 0, totalLines = inputLines.length - 1; idx < totalLines; idx++) {
    var currentValue = Number(inputLines[idx]);

    var lowerBoundPrime = 0;
    var upperBoundPrime = 0;

    // Search for the bounding prime numbers around the currentValue.
    for (var primeIdx = 0, primeCount = foundPrimes.length; primeIdx < primeCount; primeIdx++) {
      var currentPrime = foundPrimes[primeIdx];
      var nextPrime = foundPrimes[primeIdx + 1];

      // Determine the prime number immediately less than the input.
      if (currentPrime < currentValue && nextPrime >= currentValue) {
        lowerBoundPrime = currentPrime;
      }
      // Determine the prime number immediately greater than the input.
      if (currentPrime <= currentValue && nextPrime > currentValue) {
        upperBoundPrime = nextPrime;
        break; // Exit loop once both bounds are identified.
      }
    }

    // Output the pair of bounding primes.
    console.log(lowerBoundPrime, upperBoundPrime);
  }
}

// This function computes a list of prime numbers up to a predefined limit using a sieve.
function generatePrimeList() {
  var sieveLimit = 50023;
  var sieveArray = new Int8Array(sieveLimit + 1); // 0 for prime, 1 for composite

  // Mark 0 and 1 as non-prime.
  sieveArray[0] = 1;
  sieveArray[1] = 1;

  // Implement the Sieve of Eratosthenes.
  for (var sieveIterator = 2, sieveSqrtLimit = Math.floor(Math.sqrt(sieveLimit)); sieveIterator <= sieveSqrtLimit; sieveIterator++) {
    if (sieveArray[sieveIterator]) {
      continue; // Skip if already marked as composite.
    }

    // Mark all multiples of the current prime as composite.
    for (var multipleIterator = (sieveIterator << 1); multipleIterator <= sieveLimit; multipleIterator += sieveIterator) {
      sieveArray[multipleIterator] = 1;
    }
  }

  // Collect the prime numbers into a new array.
  var resultantPrimes = new Int32Array(5135); // Pre-allocated size for efficiency.
  var resultIndex = 0;
  for (var sieveIterator = 1; sieveIterator <= sieveLimit; sieveIterator++) {
    if (!sieveArray[sieveIterator]) {
      resultantPrimes[resultIndex++] = sieveIterator;
    }
  }

  return resultantPrimes;
}
