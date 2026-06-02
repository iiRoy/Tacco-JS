"use strict"; // Enforce strict mode for secure and robust JavaScript code execution

(function (rawInputData) {
  // Pre-process the raw input string:
  // 1. Remove leading/trailing whitespace.
  // 2. Split the string into an array of substrings using any whitespace as a delimiter.
  // 3. Convert each substring to a number using the unary minus operator (x - 0).
  rawInputData = rawInputData.trim().split(/\s+/).map(valStr => valStr - 0);

  // Extract the first numerical value from the processed array, which represents the total count of elements.
  const elementCount = rawInputData.shift();

  // Evaluate two distinct conditions:
  // 1. Check if the total element count is perfectly divisible by three.
  const isDivisibleByThree = (elementCount % 3 === 0);
  // 2. Calculate the sum of squares for all remaining numbers in the array and check if this sum is zero.
  const isSumOfSquaresZero = ((rawInputData.reduce((accumulator, currentValue) => accumulator + currentValue * currentValue, 0)) === 0);

  // Implement an early exit strategy based on the initial conditions.
  // If neither the element count is divisible by three NOR the sum of squares is zero, output "No" and terminate.
  if ((!isDivisibleByThree) && (!isSumOfSquaresZero)) {
    console.log("No"); // Output the negative result.
    return; // Exit the function immediately.
  }

  // If the sum of squares condition is met, it's a positive outcome.
  // Output "Yes" and terminate, as this condition takes precedence for a "Yes".
  if (isSumOfSquaresZero) {
    console.log("Yes"); // Output the positive result.
    return; // Exit the function immediately.
  }

  // Initialize data structures for tracking unique elements and their respective frequencies.
  const uniqueElements = []; // Stores up to three distinct numerical values.
  const elementFrequencies = [0, 0, 0]; // Stores the counts for each of the unique elements.

  // Iterate through the remaining numerical data to categorize and count elements.
  for (let idx = 0; idx < elementCount; idx++) {
    let currentUniqueCount = uniqueElements.length; // Get the current number of unique elements identified so far.

    // If more than three unique elements are encountered, the condition for "Yes" cannot be met.
    if (currentUniqueCount > 3) {
      console.log("No"); // Output "No".
      return; // Terminate execution.
    }

    // Attempt to find the current input number within the list of already identified unique elements.
    for (let uniqueIdx = 0; uniqueIdx < currentUniqueCount; uniqueIdx++) {
      if (rawInputData[idx] === uniqueElements[uniqueIdx]) {
        elementFrequencies[uniqueIdx]++; // Increment the frequency for the matched unique element.
        idx++; // Advance the main input index to process the next number.
        uniqueIdx = -1; // Reset the unique index to re-check from the beginning of uniqueElements for the new 'idx'.
        continue; // Skip to the next iteration of the outer loop.
      }
    }

    // If the current input number was not found among existing unique elements, add it as a new unique element.
    uniqueElements.push(rawInputData[idx]);
    // Initialize its frequency to 1 if it's the first time this unique element is encountered.
    if (elementFrequencies[currentUniqueCount] === 0) elementFrequencies[currentUniqueCount]++;
  }

  // After processing all numbers, evaluate the final condition:
  // Check if the frequencies of the first three unique elements are all equal.
  if (elementFrequencies[0] === elementFrequencies[1] && elementFrequencies[1] === elementFrequencies[2]) {
    console.log("Yes"); // If frequencies are equal, output "Yes".
  } else {
    console.log("No"); // Otherwise, output "No".
  }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input synchronously from standard input using Node.js 'fs' module.
