"use strict";

// This script processes input data to count odd numbers at specific indices.
const processInput = (rawData) => {
  // Remove leading/trailing whitespace from the raw input.
  const processedData = rawData.trim();

  // Split the input into lines, then parse each line.
  // The first line (N) is ignored, the second line (A) is used.
  const [firstLineData, numberArray] = processedData
    .split("\n") // Split by newline character
    .map((lineStr) => lineStr.split(" ").map((numStr) => parseInt(numStr, 10))); // Parse numbers

  // Initialize a counter for odd numbers.
  let oddCount = 0;

  // Iterate through the 'numberArray' starting from index 1, incrementing by 2.
  // This targets elements at indices 1, 3, 5, etc.
  for (let idx = 1; idx <= numberArray.length; idx += 2) {
    // Check if the number at the current index is odd.
    // The modulo operator (%) returns the remainder of a division.
    // If a number divided by 2 has a remainder of 1, it's odd.
    if (numberArray[idx] % 2 !== 0) {
      // If it's odd, increment the counter.
      oddCount++;
    }
  }

  // Output the final count of odd numbers to the console.
  console.log(oddCount);
};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
