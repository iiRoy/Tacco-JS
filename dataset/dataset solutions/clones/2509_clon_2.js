"use strict";

const processInput = (inputData) => {
  // Normalize input string: trim whitespace and split into lines
  inputData = inputData.trim().split("\n");

  // Extract the character string and repeat count from input
  const charArrayA = inputData[0].split("");
  const repeatCount = parseInt(inputData[1]);

  // Initialize counters for consecutive character streaks
  let countA = 0;
  let countB = 0;

  // Handle edge case: single character string
  if (charArrayA.length === 1) {
    console.log(Math.floor(repeatCount / 2));
    return; // Exit early for single character input
  }

  // Create a second mutable copy of the character array
  let charArrayB = [...charArrayA];
  let firstCharModified = false; // Flag to track if the first character of charArrayA was modified

  // First pass: Analyze charArrayA for consecutive characters
  // This loop identifies and marks consecutive pairs in the first array.
  for (let idx = 0; idx < charArrayA.length - 1; idx++) {
    // Check for consecutive characters
    if (charArrayA[idx] === charArrayA[parseInt(idx) + 1]) {
      // Special handling for the very last pair in the string
      if (idx === charArrayA.length - 2) {
        countA++;
        charArrayA[parseInt(idx) + 1] = "|"; // Mark the second character of the pair
        continue; // Move to the next iteration (which will be the end of the loop)
      }

      countA++; // Increment streak counter

      // Mark the second character of the pair, unless it's the very first character
      if (idx !== 0) {
        charArrayA[parseInt(idx) + 1] = "*";
      } else {
        // If the first character is part of a streak, mark it and set a flag
        charArrayA[idx] = "*";
        firstCharModified = true;
      }
    }
  }

  // Store the original first and last characters of the initial string
  let initialChar = charArrayA[0];
  let finalChar = charArrayA[charArrayA.length - 1];

  // If the first and last characters of the *original* string are identical,
  // and they form a "wrap-around" streak, adjust charArrayB and its counter.
  // This condition specifically checks for a potential streak across the string boundary.
  if (initialChar === finalChar) {
    charArrayB[0] = "@"; // Mark the first character
    charArrayB[charArrayB.length - 1] = "@"; // Mark the last character
    countB = 2; // Initialize countB for this specific boundary case
  }

  // Second pass: Analyze charArrayB for consecutive characters
  // This loop identifies and marks consecutive pairs in the second array.
  for (let jdx = 0; jdx < charArrayB.length - 1; jdx++) {
    // Check for consecutive characters
    if (charArrayB[jdx] === charArrayB[jdx + parseInt(1)]) {
      countB++; // Increment streak counter
      charArrayB[parseInt(jdx) + 1] = "?"; // Mark the second character of the pair
    }
  }

  let finalResult = 0; // Variable to store the computed answer

  // Calculate the final result based on the parity of repeatCount
  if (repeatCount % 2 === 0) {
    // If repeatCount is even, average the two streak counts and multiply by repeatCount
    finalResult = (countA + countB) * (repeatCount / 2);
  } else {
    // If repeatCount is odd, apply ceiling to one streak and floor to the other
    finalResult =
      countA * Math.ceil(repeatCount / 2) +
      countB * Math.floor(repeatCount / 2);
  }

  // Output the calculated result
  console.log(finalResult);
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
