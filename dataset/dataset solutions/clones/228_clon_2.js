var fileSystemModule = require('fs');
var inputDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(inputDataLength);
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0);
var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the primary execution flow of the program.
executePrimaryLogic();

// This function orchestrates the main logic: calculating prime sums and processing user input.
function executePrimaryLogic() {
  var calculatedPrimes = determinePrimeNumbers(); // Retrieve the list of prime numbers.
  var primeSumOccurrences = new Int32Array(50001); // Array to store frequency of prime sums.

  // Iterate through all possible pairs of prime numbers to find their sums.
  for (var outerIndex = 1; outerIndex < 5133; outerIndex++) {
    var currentPrimeValue = calculatedPrimes[outerIndex];
    for (var innerIndex = 1; innerIndex <= outerIndex; innerIndex++) {
      var currentSum = currentPrimeValue + calculatedPrimes[innerIndex];
      // If the sum exceeds the maximum allowed value, break the inner loop.
      if (currentSum > 50000) {
        break;
      }
      primeSumOccurrences[currentSum]++; // Increment the count for this specific sum.
    }
  }

  var linePointer = 0;
  var currentInputVal;
  // Read and process input values until a non-positive number is encountered.
  while (currentInputVal = +inputLines[linePointer++]) {
    console.log(primeSumOccurrences[currentInputVal]); // Output the frequency of the input number as a prime sum.
  }
}

// This function computes prime numbers up to a predefined limit using the Sieve of Eratosthenes.
function determinePrimeNumbers() {
  var upperBound = 49999; // The highest number to check for primality.
  var sieveArray = new Int8Array(upperBound + 1); // A boolean-like array for the sieve (0 = prime, 1 = composite).

  // Mark 0 and 1 as non-prime numbers.
  sieveArray[0] = sieveArray[1] = 1;

  // Apply the Sieve of Eratosthenes algorithm.
  for (var sieveIterator = 2, sqrtUpperBound = ~~Math.sqrt(upperBound); sieveIterator <= sqrtUpperBound; sieveIterator++) {
    // If the current number is already marked as composite, skip to the next.
    if (sieveArray[sieveIterator]) {
      continue;
    }

    // Mark all multiples of the current prime number as composite.
    for (var multipleIterator = (sieveIterator << 1); multipleIterator <= upperBound; multipleIterator += sieveIterator) {
      sieveArray[multipleIterator] = 1;
    }
  }

  var foundPrimesList = new Int32Array(5134); // Array to store the actual prime numbers found.
  var primeCountIndex = 0; // Index to track the position in the foundPrimesList.

  // Populate the list of prime numbers from the sieve array.
  for (var numberCheckIterator = 1; numberCheckIterator <= upperBound; numberCheckIterator++) {
    if (!sieveArray[numberCheckIterator]) { // If the number is prime (not marked as composite).
      foundPrimesList[++primeCountIndex] = numberCheckIterator;
    }
  }

  return foundPrimesList; // Return the array containing all prime numbers found.
}
