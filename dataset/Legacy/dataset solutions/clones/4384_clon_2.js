"use strict";

// This script processes numerical input to find the maximum frequency of numbers
// within a specific range around each input value.

function processInput(rawData) {
  // Parse the raw input string into an array of integers.
  // The first element is typically the count of numbers, which is ignored here.
  let processedData = rawData.split(/\s|\n/).map((val) => ~~val);

  // Extract the actual numbers, skipping the first element.
  const originalNumbers = processedData.slice(1, processedData.length);

  // Create an array to store expanded numbers: N-1, N, N+1 for each original number N.
  let expandedNumbers = [];
  for (let idx = 0; idx < originalNumbers.length; idx++) {
    expandedNumbers.push(originalNumbers[idx] - 1);
    expandedNumbers.push(originalNumbers[idx]);
    expandedNumbers.push(originalNumbers[idx] + 1);
  }

  // Sort the expanded numbers to easily count consecutive occurrences.
  const sortedExpandedNumbers = expandedNumbers.sort((elemA, elemB) => elemA - elemB);

  // Initialize variables for frequency counting.
  let maxFrequency = 1; // Stores the maximum frequency found so far.
  let currentCount = 1; // Stores the count of the current consecutive number.
  let lastValue = Number.MAX_SAFE_INTEGER; // Stores the last number encountered.

  // Iterate through the sorted expanded numbers to find the maximum frequency.
  for (let jdx = 0; jdx < sortedExpandedNumbers.length; jdx++) {
    if (lastValue === sortedExpandedNumbers[jdx]) {
      // If the current number is the same as the last one, increment its count.
      currentCount++;
    } else {
      // If it's a new number, reset the count and update the last value.
      lastValue = sortedExpandedNumbers[jdx];
      currentCount = 1;
    }
    // Update the overall maximum frequency.
    maxFrequency = Math.max(currentCount, maxFrequency);
  }

  // Output the final maximum frequency.
  console.log(maxFrequency);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
