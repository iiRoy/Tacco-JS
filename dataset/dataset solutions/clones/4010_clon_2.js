"use strict";

// Function to create combinations without repetition
const generateUniqueCombinations = (inputElements, selectionSize) => {
  // Base case: if we need combinations of length 1, each element is a combination.
  if (selectionSize === 1) {
    return inputElements.map(singleElement => [singleElement]);
  }

  // Initialize an array to store all generated combinations.
  const resultCombinations = [];

  // Iterate through each element in the input array.
  inputElements.forEach((currentElement, elementIndex) => {
    // Recursively find combinations of a smaller size from the remaining elements.
    // We slice the array to ensure no repetitions and maintain order.
    const subCombinations = generateUniqueCombinations(
      inputElements.slice(elementIndex + 1),
      selectionSize - 1
    );

    // For each smaller combination found, prepend the current element to it.
    subCombinations.forEach((subCombination) => {
      resultCombinations.push([currentElement].concat(subCombination));
    });
  });

  // Return the complete list of unique combinations.
  return resultCombinations;
};

// Main processing function for the problem
const processInputData = (inputString) => {
    // Clean and split the input string into lines
    inputString = inputString.trim().split("\n");
    // Parse the first line as the number of names
    const numNames = parseInt(inputString[0]);
    // Extract the names from the input, starting from the second line
    const nameList = inputString.splice(1, numNames + 1); // N+1 because splice is 0-indexed and we want N names after the first line

    // Predefined index arrays for combination logic
    const firstIndices = [0, 0, 0, 0, 0, 0, 1, 1, 1, 2];
    const secondIndices = [1, 1, 1, 2, 2, 3, 2, 2, 3, 3];
    const thirdIndices = [2, 3, 4, 3, 4, 4, 3, 4, 4, 4];

    // Array to store counts of names starting with 'M', 'A', 'R', 'C', 'H'
    let initialCharCounts = [0, 0, 0, 0, 0];

    // Iterate through the list of names to count initial characters
    for (let nameIdx in nameList) {
        if (nameList[nameIdx][0] === "M") {
            initialCharCounts[0]++;
        }

        if (nameList[nameIdx][0] === "A") {
            initialCharCounts[1]++;
        }

        if (nameList[nameIdx][0] === "R") {
            initialCharCounts[2]++;
        }

        if (nameList[nameIdx][0] === "C") {
            initialCharCounts[3]++;
        }

        if (nameList[nameIdx][0] === "H") {
            initialCharCounts[4]++;
        }
    }

    // Variable to accumulate the final sum of products
    let totalCombinations = 0;

    // Calculate the sum based on the predefined indices and character counts
    for (let comboIdx = 0; comboIdx < 10; comboIdx++) {
        totalCombinations += initialCharCounts[firstIndices[comboIdx]] * initialCharCounts[secondIndices[comboIdx]] * initialCharCounts[thirdIndices[comboIdx]];
    }

    // Output the final calculated sum
    console.log(totalCombinations);
};

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
