'use strict'

// Helper function to safely retrieve an element from an array, returning a default value if out of bounds.
const getElementOrDefault = (sourceArray, indexPosition, defaultValue = null) => {
  return indexPosition < sourceArray.length ? sourceArray[indexPosition] : defaultValue;
};

// Main function to process the input and determine the largest rectangle area.
function solveProblem(inputString) {
  // Helper function to parse the input string into a sorted array of bar lengths.
  const parseAndSortLengths = (rawInputData) => {
    const inputLines = rawInputData.split('\n');
    // The problem specifies bar lengths are on the second line (index 1).
    // Ensure the line exists before processing.
    if (inputLines.length < 2) {
      return []; // Return an empty array if the expected line is missing.
    }
    // Split the second line by space, convert each part to a Number,
    // then sort them in descending order to easily find largest pairs/quads.
    return inputLines[1].split(' ').map(Number).sort((a, b) => b - a);
  };

  const descSortedLengths = parseAndSortLengths(inputString);
  const targetSidesCount = 2; // We need two sides to form a rectangle.

  let calculatedArea = 0;
  const rectangleSides = [];
  // This flag helps manage iteration when a pair is found, ensuring the second element
  // of a pair isn't re-evaluated as the start of a new pair.
  let skipCurrentIndexForPairCheck = false;

  // Iterate through the sorted bar lengths to find suitable sides for a rectangle.
  for (let currentIndex = 0; currentIndex < descSortedLengths.length; currentIndex++) {
    // If the previous iteration identified a pair and set this flag,
    // it means the current 'currentIndex' refers to the second element of that pair.
    // We should skip processing it as a potential new starting bar for a pair.
    if (skipCurrentIndexForPairCheck) {
      skipCurrentIndexForPairCheck = false; // Reset the flag for the next iteration.
      continue; // Move to the next bar length.
    }

    const currentLength = descSortedLengths[currentIndex];
    const nextLength = getElementOrDefault(descSortedLengths, currentIndex + 1);
    const thirdLength = getElementOrDefault(descSortedLengths, currentIndex + 2);
    const fourthLength = getElementOrDefault(descSortedLengths, currentIndex + 3);

    // First, check for a special case: four identical bars.
    // This forms a square, which is the largest possible area from four equal lengths.
    if (currentLength === nextLength && currentLength === thirdLength && currentLength === fourthLength) {
      calculatedArea = currentLength * fourthLength; // All four are equal, so currentLength * currentLength.
      break; // Found the optimal solution, no need to continue.
    }

    // If no four identical bars, check for a pair of identical bars.
    // These pairs will form the sides of our rectangle.
    if (currentLength === nextLength) {
      rectangleSides.push(currentLength);
      // Since we found a pair (currentLength and nextLength),
      // the 'nextLength' will be at 'currentIndex + 1'.
      // We set the flag to skip processing 'currentIndex + 1' in the next loop iteration.
      skipCurrentIndexForPairCheck = true;
    }

    // If we have successfully found two distinct sides (pairs) for the rectangle,
    // calculate the area and exit.
    if (rectangleSides.length === targetSidesCount) {
      calculatedArea = rectangleSides[0] * rectangleSides[1];
      break; // Found the required sides, exit the loop.
    }
  }

  console.log(calculatedArea);
}

// Read the entire input from standard input and pass it to the problem solver.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
