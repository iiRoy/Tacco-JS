"use strict";
(function(rawData){
  // Process the raw input string: trim, split by whitespace, and convert to numbers.
  rawData = rawData.trim().split(/\s+/).map(val => val - 0);

  // Extract the first number as the total item count.
  const itemCount = rawData.shift();

  // Determine two initial conditions based on the item count and remaining data.
  const isDivisibleByThree = (itemCount % 3 === 0); // Check if total count is a multiple of three.
  const isSumOfSquaresZero = (rawData.reduce((accumulator, currentVal) => accumulator + currentVal * currentVal, 0) === 0); // Check if sum of squares of remaining numbers is zero.

  // If neither of the initial conditions is met, output "No" and exit.
  if ((!isDivisibleByThree) && (!isSumOfSquaresZero)) {
    console.log("No");
    return;
  }

  // If the sum of squares is zero, output "Yes" and exit.
  if (isSumOfSquaresZero) {
    console.log("Yes");
    return;
  }

  // Initialize arrays to store unique elements and their frequencies.
  const uniqueElements = [];
  const elementFrequencies = [0, 0, 0]; // Max 3 unique elements expected.

  // Iterate through the remaining input data to populate unique elements and their counts.
  for (let idx = 0; idx < itemCount; idx++) {
    let currentUniqueCount = uniqueElements.length;

    // If more than 3 unique elements are found, output "No" and exit.
    if (currentUniqueCount > 3) {
      console.log("No");
      return;
    }

    // Check if the current number from input already exists in uniqueElements.
    for (let valIdx = 0; valIdx < currentUniqueCount; valIdx++) {
      if (rawData[idx] === uniqueElements[valIdx]) {
        elementFrequencies[valIdx]++; // Increment frequency for existing element.
        idx++; // Advance main loop index as this element is processed.
        valIdx = -1; // Reset inner loop to re-check from start (due to idx increment).
        continue;
      }
    }

    // If the number is new, add it to uniqueElements.
    uniqueElements.push(rawData[idx]);
    // Initialize its frequency if it's the first occurrence.
    if (elementFrequencies[currentUniqueCount] === 0) {
      elementFrequencies[currentUniqueCount]++;
    }
  }

  // After processing all numbers, check if the number of unique elements exceeds 3.
  if (uniqueElements.length > 3) {
    console.log("No");
    return;
  }

  // Define conditions for element frequencies.
  const areCountsEqual = ((elementFrequencies[0] === elementFrequencies[1]) && (elementFrequencies[1] === elementFrequencies[2]));
  const isSpecialCountPattern = ((elementFrequencies[2] === 0) && ((elementFrequencies[0] === (2 * elementFrequencies[1])) || (elementFrequencies[1] === (2 * elementFrequencies[0]))));

  // If neither frequency condition is met, output "No" and exit.
  if ((!areCountsEqual) && (!isSpecialCountPattern)) {
    console.log("No");
    return;
  }

  // Finally, check if the XOR sum of the first three unique elements is zero.
  const isXorSumZero = ((uniqueElements[0] ^ uniqueElements[1] ^ uniqueElements[2]) === 0);

  // Output "No" if the XOR sum is not zero, otherwise output "Yes".
  if (!isXorSumZero) {
    console.log("No");
    return;
  } else {
    console.log("Yes");
    return;
  }
})(require("fs").readFileSync("/dev/stdin", "utf8"));
