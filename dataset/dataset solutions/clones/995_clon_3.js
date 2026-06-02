const fileSystemUtility = require('fs');
const rawDataBuffer = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
const processedInputString = rawDataBuffer.trim();
const lineSeparatedStrings = processedInputString.split('\n');
const numericValuesArray = lineSeparatedStrings.map(Number);

let inputValues = numericValuesArray;
const initialCountValue = inputValues.shift(); // This operation modifies inputValues in place, even if initialCountValue is unused.

function checkPrimality(candidateNumber) {
  const MINIMUM_PRIME_THRESHOLD = 2;
  const FIRST_PRIME_NUMBER = 2;

  if (candidateNumber < MINIMUM_PRIME_THRESHOLD) {
    return 0; // Numbers less than 2 are not prime
  }

  if (candidateNumber === FIRST_PRIME_NUMBER) {
    return 1; // 2 is the first and only even prime number
  }

  // All other even numbers are not prime
  if (candidateNumber % FIRST_PRIME_NUMBER === 0) {
    return 0;
  }

  const squareRootLimit = Math.sqrt(candidateNumber); // Helper variable for optimization

  // Check for odd divisors starting from 3 up to the square root
  for (let currentDivisor = 3; currentDivisor <= squareRootLimit; currentDivisor += 2) {
    if (candidateNumber % currentDivisor === 0) {
      return 0; // Found a divisor, so it's not prime
    }
  }

  return 1; // No divisors found, it is prime
}

function aggregatePrimeCounts(primeSumAccumulator, currentNumberInList) {
  const isCurrentNumberPrime = checkPrimality(currentNumberInList); // Intermediate computation
  return primeSumAccumulator + isCurrentNumberPrime;
}

console.log(inputValues.reduce(aggregatePrimeCounts, 0));
