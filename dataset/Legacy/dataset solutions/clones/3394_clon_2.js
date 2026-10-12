"use strict";
// This function checks if a given number is a power of two.
// It does so by converting the number to its binary representation
// and then verifying if it starts with '1' and all subsequent digits are '0'.
function isPowerOfTwo(value) {
  // Convert the input number to its binary string representation.
  let binaryRepresentation = value.toString(2);

  // A power of two in binary always starts with '1' followed by zeros.
  // If the first digit isn't '1', it's not a power of two.
  if (binaryRepresentation[0] !== "1") {
    return false;
  }

  // Iterate through the rest of the binary string.
  // All subsequent digits must be '0' for it to be a power of two.
  for (let idx = 1; idx < binaryRepresentation.length; idx++) {
    if (binaryRepresentation[idx] !== "0") {
      return false; // Found a '1' after the leading '1', so not a power of two.
    }
  }
  // If we reached here, it means the number is a power of two.
  return true;
}

// The primary function to process the input data.
function processInput(rawData) {
  // Split the raw input string by newlines and filter out any empty lines.
  const parsedLines = rawData.split("\n").filter(lineContent => lineContent !== "");

  // The actual numbers are on the second line (index 1).
  // Split them by spaces and convert each part to a number.
  const initialNumbers = parsedLines[1].split(" ").map(Number);

  // Sort the numbers in descending order. This is crucial for the algorithm.
  let descendingNumbers = initialNumbers.sort((firstVal, secondVal) => secondVal - firstVal);

  // Initialize a counter for the number of pairs found.
  let pairCount = 0;
  // Continue processing as long as there are numbers left in the array.
  while (descendingNumbers.length > 0) {
    // Flag to track if a suitable pair was found for the current largest number.
    let foundMatch = false;
    // Iterate through the remaining numbers, starting from the second element.
    // We're looking for a pair with the largest number (at index 0).
    for (let currentIdx = 1; currentIdx < descendingNumbers.length; currentIdx++) {
      // Calculate the sum of the largest number and the current number in the loop.
      let currentSum = descendingNumbers[0] + descendingNumbers[currentIdx];
      // Check if their sum is a power of two.
      if (isPowerOfTwo(currentSum)) {
        // If a pair is found, remove both numbers from the array.
        // Remove the current number (at currentIdx).
        descendingNumbers.splice(currentIdx, 1);
        // Remove the largest number (at index 0).
        descendingNumbers.splice(0, 1);
        // Increment the pair counter.
        pairCount += 1;
        // Set the flag to true as a match was found.
        foundMatch = true;
        // Break out of the inner loop as we've processed the largest number.
        break;
      }
    }

    // If no pair was found for the largest number, remove it from the array.
    // This ensures the loop progresses and avoids infinite loops.
    if (!foundMatch) {
      descendingNumbers.splice(0, 1);
    }
  }

  // Output the total number of pairs found to the console.
  console.log(pairCount);
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
