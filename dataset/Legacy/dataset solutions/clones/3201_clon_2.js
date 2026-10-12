"use strict";

function ProcessInput(rawData) {
  // Split the raw input string into an array of individual lines.
  let inputLines = rawData.split("\n");

  // Initialize an array to store parsed numeric pairs.
  // Each pair will be an array of two numbers.
  let pairData = [];

  // Iterate three times to process the first three lines of input.
  for (let idx = 0; idx < 3; idx++) {
    // For each line, split it by whitespace, then convert each part to a number.
    // The `v - 0` trick ensures numeric conversion.
    pairData.push(inputLines[idx].split(/\s/).map((numVal) => numVal - 0));
  }

  // Initialize a frequency counter array.
  // Assuming numbers are 1-indexed and up to 4, so 5 elements are needed (index 0 unused or for padding).
  let frequencyCounts = [0, 0, 0, 0, 0];

  // Loop through the three pairs of numbers.
  for (let loopIndex = 0; loopIndex < 3; loopIndex++) {
    // Increment the count for the first number in the current pair.
    frequencyCounts[pairData[loopIndex][0]] += 1;
    // Increment the count for the second number in the current pair.
    frequencyCounts[pairData[loopIndex][1]] += 1;
  }

  // Check if every count in the frequency array is NOT equal to 3.
  // If all counts are different from 3, output "YES", otherwise "NO".
  console.log(
    frequencyCounts.every(function (currentCount) {
      return currentCount !== 3;
    })
      ? "YES"
      : "NO"
  );
}

// Read the input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
