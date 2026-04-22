// This script processes input data
function ExecuteProgram(rawData) {
  // Define a large prime number for modulo operations
  const moduloValue = 1000000007;

  // First, parse the raw input string into a structured array of strings,
  // then convert those string elements into integers.
  let processedData = convertToIntMatrix(parseInputString(rawData));

  // Generate all possible combinations based on the first two numbers
  // from the first line of processed input.
  let combinationsList = generateCombinations(processedData[0][0], processedData[0][1]);

  // Initialize a variable to accumulate results
  let totalResult = 0;

  // Iterate through each generated combination
  for (let idx = 0; idx < combinationsList.length; idx++) {
    // Calculate the range difference for the current combination
    // and add it to the total, applying the modulo.
    totalResult = (totalResult + calculateRangeDifference(processedData[1], combinationsList[idx])) % moduloValue;
  }

  // Output the final computed total to the standard output.
  console.log(totalResult);
}

// This function computes the difference between the maximum and minimum
// values within an array, specified by a pattern of indices.
function calculateRangeDifference(valueArray, currentCombination) {
  // Initialize minimum and maximum values using the first element indicated by the combination
  let minimumValue = valueArray[currentCombination[0] - 1];
  let maximumValue = valueArray[currentCombination[0] - 1];

  // Iterate through the rest of the combination elements
  for (let itemIndex = 1; itemIndex < currentCombination.length; itemIndex++) {
    // Update the minimum value if a smaller one is found
    minimumValue = Math.min(minimumValue, valueArray[currentCombination[itemIndex] - 1]);
    // Update the maximum value if a larger one is found, using the currently observed minimum.
    maximumValue = Math.max(minimumValue, valueArray[currentCombination[itemIndex] - 1]);
  }

  // Return the difference between the highest and lowest values found.
  return (maximumValue - minimumValue);
}

// This utility function takes a raw input string and parses it into
// a 2D array of strings, splitting by newlines and then by spaces.
function parseInputString(rawText) {
  // Split the entire input string into individual lines
  let inputLines = rawText.split("\n");
  // Initialize a new array to store the parsed lines
  let lineArray = [];

  // Loop through each line of the input
  for (let lineNum = 0; lineNum < inputLines.length; lineNum++) {
    // Split each line by spaces and store it as an inner array
    lineArray[lineNum] = inputLines[lineNum].split(" ");
  }
  return lineArray; // Return the 2D array of strings
}

// This function converts a 2D array of strings into a 2D array of integers.
function convertToIntMatrix(stringMatrix) {
  // Initialize an empty array to hold the integer matrix
  let integerMatrix = [];

  // Iterate over each row in the input string matrix
  for (let rowIdx = 0; rowIdx < stringMatrix.length; rowIdx++) {
    integerMatrix[rowIdx] = []; // Initialize the current row as an empty array
    // Iterate over each column in the current row
    for (let colIdx = 0; colIdx < stringMatrix[rowIdx].length; colIdx++) {
      // Convert the string element to an integer and store it
      integerMatrix[rowIdx][colIdx] = parseInt(stringMatrix[rowIdx][colIdx], 10);
    }
  }
  return integerMatrix; // Return the fully converted integer matrix
}

// This function generates all k-combinations from a set of n elements (1 to n).
// It implements a specific algorithm for combination generation.
function generateCombinations(upperBound, combinationLength) {
  // Array to store all generated combinations
  let finalCombinations = [];
  // Array to hold the current combination being built
  let currentSequence = [];

  // Initialize the first combination: [1, 2, ..., k]
  for (let startVal = 1; startVal <= combinationLength; startVal++) {
    currentSequence.push(startVal);
  }

  // Loop indefinitely until all combinations are found
  while (true) {
    // Add a copy of the current sequence to the list of final combinations
    finalCombinations.push([...currentSequence]);

    // Find the rightmost element that can be incremented
    let lastChangeableIndex = currentSequence.length - 1;
    for (let reverseIndex = currentSequence.length - 1; reverseIndex >= 0; reverseIndex--) {
      // Check if the current element has reached its maximum possible value
      if (currentSequence[reverseIndex] !== upperBound - (currentSequence.length - reverseIndex - 1)) {
        break; // Found an element that can be incremented
      } else {
        lastChangeableIndex = reverseIndex - 1; // Move to the left
      }
    }

    // If no element can be incremented, all combinations have been generated
    if (lastChangeableIndex >= 0) {
      // Increment the chosen element
      let anchorValue = currentSequence[lastChangeableIndex];
      // Update the chosen element and all elements to its right
      for (let offsetIndex = 0; offsetIndex < currentSequence.length - lastChangeableIndex; offsetIndex++) {
        currentSequence[lastChangeableIndex + offsetIndex] = anchorValue + offsetIndex + 1;
      }
    } else {
      break; // Exit the loop
    }
  }
  return finalCombinations; // Return the complete list of combinations
}

// The following lines are for environment setup and should not be modified.
// They read input from stdin and invoke the main processing function.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
// Example usage: ExecuteProgram("4 2\n1 1 3 4");