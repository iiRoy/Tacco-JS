"use strict";

// This function processes the input data to determine if a condition is met.
function ProcessInput(rawData) {
  // Clean and split the raw input string into an array of lines.
  let processedLines = rawData.trim().split('\n');

  // The first line contains the total number of elements.
  let totalElements = Number(processedLines[0]);

  // The second line contains space-separated numbers, convert them to an array of numbers.
  let numericValues = processedLines[1].trim().split(' ').map(Number);

  // Initialize an object to store counts of even and odd numbers.
  let parityTally = {};

  // Iterate through each number in the array.
  for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
    let currentValue = numericValues[currentIdx]; // Get the current number.

    // Check if the current number is even or odd.
    if (currentValue % 2 === 0) {
      // If even, increment the 'even' count, or initialize to 1 if not present.
      parityTally['even'] = parityTally['even'] ? parityTally['even'] + 1 : 1;
    } else {
      // If odd, increment the 'odd' count, or initialize to 1 if not present.
      parityTally['odd'] = parityTally['odd'] ? parityTally['odd'] + 1 : 1;
    }
  }

  // After counting, check if the total count of odd numbers is odd.
  // If the 'odd' count is not present, it defaults to 0, which is even.
  if ((parityTally['odd'] || 0) % 2 !== 0) {
    // If the count of odd numbers is odd, print 'NO'.
    console.log('NO');
    return; // Exit the function early.
  }

  // If the count of odd numbers is even (or zero), print 'YES'.
  console.log('YES');
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
