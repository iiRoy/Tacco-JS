"use strict";

function main(programInput) {
  // Utility function to parse a string of space-separated numbers into an array of numbers
  const parseNumericLine = (lineContent) => lineContent.trim().split(" ").map(Number);

  // Utility function to sort an array in descending order and then extract a specified number of top elements
  const extractTopValuesDescending = (sourceArray, limitCount) => {
    // Create a shallow copy to avoid modifying the original array if it's passed by reference
    const sortedArray = [...sourceArray].sort((valueA, valueB) => valueB - valueA);
    return sortedArray.slice(0, limitCount);
  };

  // Parse the first line for configuration parameters: required counts for red and green apples
  // The last three values (a, b, c) from the original input[0] are unused, so they are ignored here.
  const [redAppleRequirement, greenAppleRequirement, , , ] = parseNumericLine(programInput[0]);

  // Parse the subsequent lines for the available apples of each type
  let initialRedApples = parseNumericLine(programInput[1]);
  let initialGreenApples = parseNumericLine(programInput[2]);
  let initialColorlessApples = parseNumericLine(programInput[3]);

  // Determine the best red apples based on the requirement
  const chosenRedApples = extractTopValuesDescending(initialRedApples, redAppleRequirement);

  // Determine the best green apples based on the requirement
  const chosenGreenApples = extractTopValuesDescending(initialGreenApples, greenAppleRequirement);

  // Determine the best colorless apples. The original logic considers up to (x+y) colorless apples.
  const relevantColorlessApples = extractTopValuesDescending(initialColorlessApples, redAppleRequirement + greenAppleRequirement);

  // Combine all potential apples: the best red, best green, and the relevant colorless apples.
  // This forms a pool from which the final selection will be made.
  const allCandidateApples = [...chosenRedApples, ...chosenGreenApples, ...relevantColorlessApples];

  // Sort the entire pool of candidate apples in descending order to easily pick the highest values.
  allCandidateApples.sort((valueA, valueB) => valueB - valueA);

  // The final selection consists of the top (redAppleRequirement + greenAppleRequirement) apples
  // from the combined and sorted pool. This step replaces the original nested loop logic,
  // as it achieves the identical behavioral outcome of maximizing the sum by selecting the best available.
  const finalSelectionForSum = allCandidateApples.slice(0, redAppleRequirement + greenAppleRequirement);

  // Calculate the total sum of the values of the apples in the final selection.
  const finalCalculatedSum = finalSelectionForSum.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  // Output the final sum to the console.
  console.log(finalCalculatedSum);
}

// Read input from standard input, process it, and pass it to the main function.
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
