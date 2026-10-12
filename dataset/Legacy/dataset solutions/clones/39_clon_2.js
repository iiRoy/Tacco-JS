function calculatePrimeCount(upperBound) {
  // This function determines the count of prime numbers up to a specified limit.
  // It uses a variation of the Sieve of Eratosthenes algorithm.
  let compositeTracker = [],
    currentNum,
    multipleNum,
    foundPrimes = [];

  // Iterate from the first prime candidate (2) up to the maximum value.
  for (currentNum = 2; currentNum <= upperBound; ++currentNum) {
    // If the current number has not been marked as composite, it is prime.
    if (!compositeTracker[currentNum]) {
      // Add the prime number to our list of found primes.
      foundPrimes.push(currentNum);

      // Mark all multiples of this prime as composite.
      // Start from 2 * currentNum (or currentNum << 1 for bitwise shift optimization).
      for (multipleNum = currentNum << 1; multipleNum <= upperBound; multipleNum += currentNum) {
        compositeTracker[multipleNum] = true; // Mark as not prime.
      }
    }
  }
  // Return the total count of prime numbers found.
  return foundPrimes.length;
}

// Read input from standard input, assuming it's a number.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Convert the input string to a number and then calculate and print the prime count.
console.log(calculatePrimeCount(Number(rawData)));
