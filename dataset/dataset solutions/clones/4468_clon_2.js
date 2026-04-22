"use strict"; /* Enable strict mode for cleaner code execution */

// This function computes the greatest common divisor for all elements in a given numeric collection.
const calculateCommonDivisorForList = numberCollection => {
  let collectionLength,
    currentResult, // Stores the accumulated GCD
    currentItem; // Holds the current number being processed

  collectionLength = numberCollection.length;
  currentResult    = numberCollection[0]; // Initialize with the first element

  // Iterate through the rest of the collection to find the GCD
  for (let idx = 1; idx < collectionLength; ++idx) {
    currentItem = numberCollection[idx];
    currentResult = findGreatestCommonDivisor(currentResult, currentItem); // Update the GCD
  }

  return currentResult; // Return the final greatest common divisor
};

// This recursive utility function determines the greatest common divisor of two integers.
// It implements the Euclidean algorithm.
const findGreatestCommonDivisor = (firstNum, secondNum) => {
    // If the first number is zero, the GCD is the second number.
    // Otherwise, recursively call with the remainder and the first number.
    return firstNum
        ? findGreatestCommonDivisor(secondNum % firstNum, firstNum)
        : secondNum;
};

// The primary execution function for the program, processing input and providing output.
const executeProgram = inputData => {
    // Clean and parse the raw input string
    inputData = inputData.trim().split("\n");
    
    // Extract N and K values from the first line of input
    const totalNumbers = parseInt(inputData[0].split(" ")[0]); // Represents N
    const targetValue  = parseInt(inputData[0].split(" ")[1]); // Represents K
    
    // Process the second line: split, convert to integers, and sort in descending order
    let numericalSequence = inputData[1]
        .split(" ")
        .map(numericString => parseInt(numericString))
        .sort((valA, valB) => valB - valA); // Sort from largest to smallest
    
    // Determine the maximum element and the overall GCD of the sequence
    const maximumElement = numericalSequence[0];
    let   overallCommonDivisor = calculateCommonDivisorForList(numericalSequence);
    
    // Check if the maximum element is less than the target value
    if (maximumElement < targetValue) {
        console.log("IMPOSSIBLE"); // Output "IMPOSSIBLE" if condition met
        return; // Terminate execution
    }
    
    // Determine if the target value is a multiple of the overall GCD
    // and output "POSSIBLE" or "IMPOSSIBLE" accordingly
    console.log(targetValue % overallCommonDivisor === 0 ? "POSSIBLE" : "IMPOSSIBLE");
};

// Execute the main program function using file system input (common in competitive programming)
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));