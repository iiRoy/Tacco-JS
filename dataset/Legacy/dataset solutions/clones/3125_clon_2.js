"use strict";

// This function processes the input data to calculate coloring possibilities.
function ProcessInput(rawData) {
  // Clean and parse the raw input string into an array of numbers.
  let parsedData = rawData.trim().split(/\s+/).map(val => val - 0);

  // Extract the total number of elements from the beginning of the array.
  let elementCount = parsedData.shift();

  // Initialize an array to store the last seen index for each color.
  // 'lastOccurrence[color]' will hold the index where 'color' was last encountered.
  let lastOccurrence = [];
  // Fill the array with a sentinel value indicating no prior occurrence.
  for (let idx = 0; idx < 2000000; idx++) {
    lastOccurrence[idx] = "not yet";
  }

  // Set the initial last occurrence for the very first color.
  lastOccurrence[parsedData[0]] = 0;

  // Initialize a dynamic programming array.
  // 'waysToColor[k]' represents the number of ways to color elements from index 0 up to 'k'.
  let waysToColor = [1]; // Base case: one way to color the first element.

  // Define the modulo value for calculations to prevent integer overflow.
  const moduloVal = Math.pow(10, 9) + 7;

  // Iterate through the remaining elements to build up the DP array.
  for (let idx = 1; idx < elementCount; idx++) {
    let currentColor = parsedData[idx];

    // Check if the current color has not been seen before, or if its last occurrence
    // was immediately before the current position (meaning no new segment starts).
    if (lastOccurrence[currentColor] === "not yet" || lastOccurrence[currentColor] === idx - 1) {
      // If so, the number of ways to color up to 'idx' is the same as up to 'idx-1'.
      waysToColor[idx] = waysToColor[idx - 1];
      // Update the last occurrence for the current color.
      lastOccurrence[currentColor] = idx;
      continue; // Move to the next element.
    }

    // If the current color has been seen before and not immediately preceding,
    // we can either extend the previous coloring or start a new segment from the last occurrence.
    waysToColor[idx] = (waysToColor[idx - 1] + waysToColor[lastOccurrence[currentColor]]) % moduloVal;
    // Update the last occurrence for the current color to the current index.
    lastOccurrence[currentColor] = idx;
  }

  // The final result is the number of ways to color all elements, which is the last element in the DP array.
  console.log(waysToColor.pop());
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
