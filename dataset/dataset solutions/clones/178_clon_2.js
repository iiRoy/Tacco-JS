var ioModule = require('fs'),
    dataSize = ioModule.fstatSync(process.stdin.fd).size,
    byteContainer = new Buffer(dataSize),
    readAmount = ioModule.readSync(process.stdin.fd, byteContainer, 0, dataSize, 0),
    dataSegments = byteContainer.toString('utf8', 0, readAmount).split('\n');
executeProgram();

// Main processing logic starts here
function executeProgram() {
  const calculatedPrimes = generatePrimeList();

  for (let queryIndex = 0, totalQueries = dataSegments.length - 1;
       queryIndex < totalQueries;
       queryIndex++) {
    const targetNumber = parseInt(dataSegments[queryIndex]);
    
    let lowerBoundPrime = 0;
    let upperBoundPrime = 0;

    for (let primeIndex = 0, totalPrimes = calculatedPrimes.length;
         primeIndex < totalPrimes;
         primeIndex++) {
      const iteratingPrime = calculatedPrimes[primeIndex];
      const subsequentPrimeElement = calculatedPrimes[primeIndex + 1];

      if (iteratingPrime < targetNumber && subsequentPrimeElement >= targetNumber) {
        lowerBoundPrime = iteratingPrime;
      }
      if (iteratingPrime <= targetNumber && subsequentPrimeElement > targetNumber) {
        upperBoundPrime = subsequentPrimeElement;
        break; // Exit loop once upper bound is located
      }
    }
    
    console.log(lowerBoundPrime, upperBoundPrime);
  }
}

function generatePrimeList() {
  const maxVal = 50023; // Maximum value for prime number search
  let isNotPrimeMarker = new Uint8Array(maxVal + 1); // Using Uint8Array for boolean flags

  // Mark non-prime numbers using the Sieve of Eratosthenes algorithm
  isNotPrimeMarker[0] = isNotPrimeMarker[1] = 1; // Zero and one are not considered prime numbers
  for (let currentNum = 2, sqrtMax = Math.floor(Math.sqrt(maxVal));
       currentNum <= sqrtMax;
       currentNum++) {
    if (isNotPrimeMarker[currentNum]) {
      continue; // This number is already marked as composite
    }
       
    for (let multipleVal = (currentNum * 2);
         multipleVal <= maxVal;
         multipleVal += currentNum) {
      isNotPrimeMarker[multipleVal] = 1;
    }
  }
   
  let foundPrimesArray = new Uint32Array(5135); // Store the actual prime numbers
  let resultIndex = 0;
  for (let numberIterator = 1;
       numberIterator <= maxVal;
       numberIterator++) {
    if (!isNotPrimeMarker[numberIterator]) { // If not marked, it is a prime number
      foundPrimesArray[resultIndex++] = numberIterator;
    }
  }
     
  return foundPrimesArray;
}