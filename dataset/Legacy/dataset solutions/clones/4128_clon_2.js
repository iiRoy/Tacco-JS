'use strict';

// Main execution block for processing input and generating output
console.log(function(inputStr) {
  // Parse the input string: trim whitespace, split by newlines,
  // then for each line, split by spaces and convert values to integers.
  const dataRows = inputStr.trim().split('\n').map(
    (rowText) => rowText.split(' ').map((valueText) => valueText | 0)
  );

  // Extract the number of queries from the first line of input.
  const numQueries = dataRows.shift()[0];

  // Define the upper limit for the sieve algorithm.
  const limitVal = 50000;

  // Initialize an array to mark potential prime numbers (sieve).
  // All elements are initially set to 1 (true).
  const sieveArray = Array(limitVal).fill(1);

  // Initialize an array for prefix sums of prime counts.
  // This will store the cumulative count of "special" primes up to an index.
  const resultAccumulator = Array(limitVal + 1).fill(0);

  // Manually set initial values for the sieve and accumulator.
  // 0 is not prime, 1 is not considered prime in this context.
  sieveArray[0] = 0; // Mark 0 as not prime
  sieveArray[1] = 1; // Mark 1 as special (or not prime, depending on interpretation, but its value is 1 here)
  resultAccumulator[0] = 0;
  resultAccumulator[1] = 0;
  resultAccumulator[2] = 1; // The number 3 (which corresponds to index 1 in the sieve, 2*1+1) is a "special" prime.

  // Sieve of Eratosthenes-like process to find "special" primes.
  // This loop iterates through potential prime candidates.
  for (let currentIdx = 1; currentIdx < limitVal; currentIdx++) {
    // If the current number (2*currentIdx+1) is not marked as a prime candidate, skip it.
    if (!sieveArray[currentIdx]) {
      continue;
    }

    // Calculate the actual number represented by the current index (2*i+1).
    const currentPrimeVal = 2 * currentIdx + 1;

    // Check if the current index 'currentIdx' is even AND if its half (currentIdx/2)
    // was marked as a prime candidate. This identifies primes of the form 2*k+1 where k is even.
    // This condition effectively checks for primes p such that (p-1)/2 is even,
    // which means p-1 is a multiple of 4, or p is of the form 4k+1.
    if ((~currentIdx & 1) && sieveArray[currentIdx / 2]) {
      resultAccumulator[currentIdx + 1] = 1; // Mark this position in the accumulator.
    }

    // Mark multiples of the current prime value as not prime candidates.
    // This loop starts from the first multiple greater than currentIdx.
    for (let multipleIdx = currentIdx + currentPrimeVal; multipleIdx < limitVal; multipleIdx += currentPrimeVal) {
      sieveArray[multipleIdx] = 0; // Mark as composite.
    }
  }

  // Calculate prefix sums for the resultAccumulator array.
  // Each element resultAccumulator[kdx] will store the total count of "special" primes
  // up to the number corresponding to index kdx-1.
  for (let prefixSumIdx = 2; prefixSumIdx < limitVal; prefixSumIdx++) {
    resultAccumulator[prefixSumIdx] += resultAccumulator[prefixSumIdx - 1];
  }

  // Array to store the results of each query.
  let queryResults = [];

  // Process each query.
  for (let queryNum = 0; queryNum < numQueries; queryNum++) {
    // Extract the left and right bounds for the current query.
    // The input values are 1-indexed and represent actual numbers.
    // They are converted to 0-indexed array positions for the sieve.
    const startIdx = (dataRows[queryNum][0] - 1) / 2;
    const endIdx = (dataRows[queryNum][1] - 1) / 2 + 1;

    // Calculate the count of "special" primes within the given range
    // using the precomputed prefix sums.
    queryResults.push(resultAccumulator[endIdx] - resultAccumulator[startIdx]);
  }

  // Join the results with newline characters and return the final string.
  return queryResults.join('\n');

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
