function calculatePrimes(upperBound) {
   // Initialize an array to store numbers and mark non-primes using Sieve of Eratosthenes
   let sieveArray = [];
   // Populate the array with numbers from 0 up to the specified upper limit
   for (let idx = 0; idx <= upperBound; idx++) {
      sieveArray[idx] = idx;
   }

   // Mark 0 and 1 as not prime numbers
   sieveArray[0] = false;
   sieveArray[1] = false;

   // Calculate the integer part of the square root of the upper bound for optimization
   const limitSqrt = Math.floor(Math.sqrt(upperBound));

   // Iterate from the first prime number (2) up to the square root limit
   for (let idx = 2; idx <= limitSqrt; idx++) {
      // If the current number is already marked as not prime, skip to the next number
      if (sieveArray[idx] === false) {
         continue;
      }
      // Mark all multiples of the current prime number as not prime
      // Start marking from idx * idx, but the original code starts from idx + idx.
      // Adhering to original logic: start from the first multiple greater than idx itself.
      for (let multiplier = idx + idx; multiplier <= upperBound; multiplier += idx) {
         sieveArray[multiplier] = false;
      }
   }

   // Collect all numbers that are still marked as prime into a new list
   let primeNumbersList = [];
   for (let idx = 0; idx <= upperBound; idx++) {
      if (sieveArray[idx] !== false) {
         primeNumbersList.push(sieveArray[idx]);
      }
   }
   // Return the final list of prime numbers
   return primeNumbersList;
}

// Pre-calculate a list of prime numbers up to 999,999
const precomputedPrimes = calculatePrimes(999999);

// Read the entire input from standard input as a UTF-8 string
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace, split by newlines, and convert each part to a number
const inputNumbers = (rawData.trim()).split("\n").map(Number);

// Iterate through each number provided in the input
for (let idx = 0; idx < inputNumbers.length; idx++) {
   const currentNumber = inputNumbers[idx];

   // If the current input number is 0, it signifies the end of input, so break the loop
   if (currentNumber === 0) {
      break;
   }

   // Initialize a variable to accumulate the sum of primes
   let totalSum = 0;
   // Sum the first 'currentNumber' primes from the precomputed list
   for (let primeIndex = 0; primeIndex < currentNumber; primeIndex++) {
      totalSum += precomputedPrimes[primeIndex];
   }

   // Print the calculated sum to the console
   console.log(totalSum);
}
