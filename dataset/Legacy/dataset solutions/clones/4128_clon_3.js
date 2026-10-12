'use strict';

const parseNumericValue = (textValue) => parseInt(textValue, 10);

console.log((function(sourceInput) {
  const inputLines = sourceInput.trim().split('\n');
  const processedInputData = inputLines.map(line => line.split(' ').map(parseNumericValue));

  const firstLineData = processedInputData.shift();
  const numberOfQueries = firstLineData[0];

  const maximumSieveValue = 50000;

  // This array tracks primality for numbers of the form (2*index + 1)
  // oddNumberPrimality[k] is 1 if (2k+1) is prime, 0 otherwise
  const oddNumberPrimality = Array(maximumSieveValue).fill(1);
  oddNumberPrimality[0] = 0; // 2*0+1 = 1, which is not prime
  oddNumberPrimality[1] = 1; // 2*1+1 = 3, which is prime

  // This array will mark actual prime numbers: primeIndicator[k] is 1 if k is prime
  const primeIndicator = Array(maximumSieveValue + 1).fill(0);
  primeIndicator[0] = 0;
  primeIndicator[1] = 0;
  primeIndicator[2] = 1; // 2 is the first prime number

  // Helper function to determine if a number is prime using the oddNumberPrimality sieve
  const checkPrimality = (candidateNumber) => {
    if (candidateNumber < 2) return false;
    if (candidateNumber === 2) return true;
    if (candidateNumber % 2 === 0) return false; // Even numbers > 2 are not prime

    // For odd numbers, check the oddNumberPrimality array
    const correspondingOddSieveIndex = (candidateNumber - 1) / 2;
    return correspondingOddSieveIndex < maximumSieveValue && oddNumberPrimality[correspondingOddSieveIndex] === 1;
  };

  // Sieve of Eratosthenes for odd numbers (2k+1)
  for (let currentOddSieveIndex = 1; currentOddSieveIndex < maximumSieveValue; currentOddSieveIndex++) {
    if (oddNumberPrimality[currentOddSieveIndex] === 0) {
      continue; // (2*currentOddSieveIndex + 1) is composite, skip
    }
    const primeFactor = 2 * currentOddSieveIndex + 1;
    // Mark multiples of primeFactor (of the form 2j+1) as composite
    // Start marking from the first multiple not already covered by smaller primes
    for (let multipleIndex = currentOddSieveIndex + primeFactor; multipleIndex < maximumSieveValue; multipleIndex += primeFactor) {
      oddNumberPrimality[multipleIndex] = 0;
    }
  }

  // Populate the primeIndicator array based on the oddNumberPrimality sieve
  // The original code effectively marked all odd primes here.
  for (let numberToCheck = 3; numberToCheck <= maximumSieveValue; numberToCheck += 2) { // Iterate only odd numbers >= 3
    if (checkPrimality(numberToCheck)) {
      primeIndicator[numberToCheck] = 1;
    }
  }

  // Compute prefix sums for prime counts
  const cumulativePrimeSum = Array(maximumSieveValue + 1).fill(0);
  cumulativePrimeSum[0] = 0;
  cumulativePrimeSum[1] = 0;
  cumulativePrimeSum[2] = primeIndicator[2]; // Initialize with the count for 2

  for (let currentNumber = 3; currentNumber <= maximumSieveValue; currentNumber++) {
    cumulativePrimeSum[currentNumber] = cumulativePrimeSum[currentNumber - 1] + primeIndicator[currentNumber];
  }

  // Helper function to transform query bounds as per problem logic
  const adjustQueryBound = (originalValue, isUpperBoundary) => {
    const transformedValue = (originalValue - 1) / 2;
    return isUpperBoundary ? transformedValue + 1 : transformedValue;
  };

  // Process all queries
  const queryResultsList = [];
  for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
    const currentQueryPair = processedInputData[queryIndex];
    const originalLowerBound = currentQueryPair[0];
    const originalUpperBound = currentQueryPair[1];

    const adjustedLowerBound = adjustQueryBound(originalLowerBound, false);
    const adjustedUpperBound = adjustQueryBound(originalUpperBound, true);

    const countOfPrimesInRange = cumulativePrimeSum[adjustedUpperBound] - cumulativePrimeSum[adjustedLowerBound];
    queryResultsList.push(countOfPrimesInRange);
  }

  return queryResultsList.join('\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
