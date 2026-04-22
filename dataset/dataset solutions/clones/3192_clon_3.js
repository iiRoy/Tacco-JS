"use strict";

// This program computes the Greatest Common Divisor (GCD) for a list of positive integers.
// It retrieves numerical data from standard input, processes it, and then applies
// a modified Euclidean algorithm to find the GCD of all provided numbers.

// Step 1: Read all incoming data from the standard input stream.
// The .trim() method is used to remove any leading/trailing whitespace,
// including potential empty lines at the end of the input.
const collectedStreamData = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

// Step 2: The problem setup often includes a count of elements on the first line.
// However, for this specific GCD computation, that count is not directly utilized
// in the algorithmic logic, so we will not parse or store it.
// const initialElementCount = parseInt(collectedStreamData[0], 10); // This line is intentionally omitted.

// Step 3: Extract the string containing the actual numbers from the second line of input.
const rawNumberSequenceString = collectedStreamData[1];

// Step 4: Perform basic validation on the raw number string.
// If the string is empty or contains only whitespace, it indicates no numbers were provided.
if (!rawNumberSequenceString || rawNumberSequenceString.trim().length === 0) {
    // In a production environment, one might throw an error or log a warning.
    // For competitive programming, we might assume valid input or handle a default case.
    console.log(0); // Assuming GCD of an empty set is 0 or undefined, 0 is a common placeholder.
    process.exit(0); // Terminate execution gracefully.
}

// Step 5: Convert the space-separated string of numbers into an array of integers.
// During parsing, individual values are validated, and only positive integers are kept.
// The array is immediately sorted in descending order to prepare for the GCD algorithm.
let workingDataSet = rawNumberSequenceString
  .split(" ")
  .map((valueToken) => {
      // Attempt to parse each token into an integer.
      const numericalValue = parseInt(valueToken.trim(), 10);
      // Check if parsing resulted in a valid number.
      if (isNaN(numericalValue)) {
          // Log a warning for non-numeric input, but continue processing valid numbers.
          // console.warn(`Skipping non-numeric input: '${valueToken}'`);
          return null; // Mark as invalid to be filtered out.
      }
      return numericalValue;
  })
  .filter(processedNum => processedNum !== null && processedNum > 0) // Remove nulls and non-positive numbers.
  .sort((valA, valB) => valB - valA); // Initial sort: largest first.

// Step 6: Handle edge cases based on the size of the filtered and sorted data set.
if (workingDataSet.length === 0) {
    // If no valid positive numbers remain after processing.
    console.log(0);
    process.exit(0);
} else if (workingDataSet.length === 1) {
    // If only one number remains, its GCD is itself.
    console.log(workingDataSet[0]);
    process.exit(0);
}

// Step 7: Main loop for GCD computation using an iterative Euclidean algorithm.
// The loop continues as long as there are at least two numbers in the array
// to perform the modulo operation on.
while (workingDataSet.length > 1) {
    // Store the two largest numbers at the front of the array into temporary variables.
    let primaryOperand = workingDataSet[0];
    let secondaryOperand = workingDataSet[1];

    // Calculate the remainder of the division.
    let computedRemainder = primaryOperand % secondaryOperand;

    if (computedRemainder === 0) {
        // If the remainder is zero, it means 'secondaryOperand' perfectly divides 'primaryOperand'.
        // In this case, 'secondaryOperand' is the GCD of these two numbers.
        // We can effectively discard 'primaryOperand' (as it's now reducible by 'secondaryOperand').
        // The array's first element is removed, making 'secondaryOperand' the new 'primaryOperand'.
        workingDataSet.shift();
    } else {
        // If a non-zero remainder exists, it becomes the new 'primaryOperand'.
        // The original 'primaryOperand' is replaced by this remainder.
        workingDataSet[0] = computedRemainder;
        // The array must be re-sorted to ensure that the two largest numbers
        // (which now include the new remainder) are at the front for the next iteration.
        workingDataSet.sort((valA, valB) => valB - valA);
    }
}

// Step 8: After the loop terminates, only one element will remain in the 'workingDataSet' array.
// This sole remaining element represents the Greatest Common Divisor of all original numbers.
// Output this final result to standard output.
console.log(workingDataSet[0]);