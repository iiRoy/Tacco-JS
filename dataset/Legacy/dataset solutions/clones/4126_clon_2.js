"use strict";

function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let inputLines = rawData.split("\n");

  // Implement a sieve-like algorithm to find prime numbers up to a certain limit
  // This is the upper limit for numbers we are interested in.
  const UPPER_BOUND = 101010;
  // Initialize an array to mark numbers as potentially prime (1) or not (0)
  let isPrimary = new Array(UPPER_BOUND).fill(1);
  // 0 and 1 are not prime numbers
  isPrimary[0] = isPrimary[1] = 0;

  // Iterate from 2 up to the upper bound
  for (let idx = 2; idx < UPPER_BOUND; idx++) {
    // If the current number is not marked as prime, skip it
    if (!isPrimary[idx]) continue;
    // Mark all multiples of the current prime number as not prime
    for (let multipleIdx = idx * 2; multipleIdx < UPPER_BOUND; multipleIdx += idx) {
      isPrimary[multipleIdx] = 0;
    }
  }

  // Determine which numbers are "2017-like"
  // A number 'x' is 2017-like if 'x' is prime, 'x' is odd, and (x+1)/2 is also prime.
  let likeNumbers = new Array(UPPER_BOUND).fill(0);
  for (let currentNum = 0; currentNum < UPPER_BOUND; ++currentNum) {
    // Only consider odd numbers
    if (currentNum % 2 === 0) continue;
    // Check if the number itself is prime AND (number + 1) / 2 is also prime
    if (isPrimary[currentNum] && isPrimary[(currentNum + 1) / 2]) {
      likeNumbers[currentNum] = 1; // Mark as 2017-like
    }
  }

  // Calculate prefix sums for the 'likeNumbers' array
  // This allows for efficient range sum queries.
  let prefixSums = new Array(UPPER_BOUND + 1).fill(0);
  for (let sumIdx = 0; sumIdx < UPPER_BOUND; ++sumIdx) {
    prefixSums[sumIdx + 1] = prefixSums[sumIdx] + likeNumbers[sumIdx];
  }

  // Process the queries
  // The first line of inputLines contains the number of queries
  let numQueries = parseInt(inputLines.shift().trim().split(/\s/)[0], 10);

  // Loop through each query
  for (let queryIdx = 0; queryIdx < numQueries; ++queryIdx) {
    // Each subsequent line contains two numbers, L and R, representing a range
    let rangeBounds = inputLines.shift().split(/\s/).map((valStr) => parseInt(valStr, 10));
    let leftBound = rangeBounds[0];
    let rightBound = rangeBounds[1];
    // Adjust the right bound for 1-based indexing in prefix sums
    ++rightBound;
    // Output the count of 2017-like numbers in the range [leftBound, rightBound-1]
    console.log(prefixSums[rightBound] - prefixSums[leftBound]);
  }
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
