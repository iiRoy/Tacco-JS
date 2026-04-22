'use strict'; // Enforce strict parsing rules for better code quality

/*
 * This function serves as the primary entry point
 * for processing the given input string data.
 * It identifies and counts specific geometric patterns.
 */
function processInputData(inputStringData) {
  // Trim leading/trailing whitespace and split the input into lines
  let processedLines = inputStringData.trim().split('\n');

  // The first line contains the total count of elements
  const totalElementsCount = Number(processedLines.shift());

  // The remaining line (now the first element in processedLines) contains
  // space-separated numbers. Parse them, convert to numbers, and sort ascending.
  let parsedNumbersArray = processedLines[0].split(' ').map(currentNumberValue => Number(currentNumberValue)).sort((valOne, valTwo) => valOne - valTwo);
  
  /*
   * Helper function to determine if three given side lengths
   * can form a valid triangle according to the triangle inequality theorem.
   * @param {number} sideLengthA - The length of the first side.
   * @param {number} sideLengthB - The length of the second side.
   * @param {number} sideLengthC - The length of the third side.
   * @returns {boolean} True if a triangle can be formed, false otherwise.
   */
  const canFormTriangle = (sideLengthA, sideLengthB, sideLengthC) => {
    return (sideLengthA + sideLengthB > sideLengthC) && (sideLengthA + sideLengthC > sideLengthB) && (sideLengthB + sideLengthC > sideLengthA);
  };

  // Initialize a counter for valid triangle combinations found
  let validTriangleCombinations = 0;

  // Iterate through all possible unique combinations of three distinct indices
  // The outer loop picks the first side
  for (let firstIndex = 0; firstIndex < totalElementsCount; firstIndex++) {
    // The middle loop picks the second side, ensuring it's after the first
    for (let secondIndex = firstIndex + 1; secondIndex < totalElementsCount; secondIndex++) {
      // The inner loop picks the third side, ensuring it's after the second
      for (let thirdIndex = secondIndex + 1; thirdIndex < totalElementsCount; thirdIndex++) {
        // Optimization: If the sum of the first two sides is less than the third side,
        // due to sorting, any subsequent third sides will also be too large.
        // Therefore, we can break from this inner loop.
        if (parsedNumbersArray[firstIndex] + parsedNumbersArray[secondIndex] < parsedNumbersArray[thirdIndex]) {
          break;
        }

        // Check if the current combination of three numbers forms a valid triangle
        if (canFormTriangle(parsedNumbersArray[firstIndex], parsedNumbersArray[secondIndex], parsedNumbersArray[thirdIndex])) {
          validTriangleCombinations++; // Increment the counter if it's a valid triangle
        }
      }
    }
  }

  // Output the final count of valid triangle combinations to the console
  console.log(validTriangleCombinations);
}

// Read the input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));