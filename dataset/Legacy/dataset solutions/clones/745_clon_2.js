function adjustValueForLuhn(digitInput) {
  // This function applies a specific transformation if the input digit is 10 or more.
  // It's part of a checksum calculation logic.
  if (digitInput >= 10) {
    digitInput = digitInput - 10 + 1;
  }
  return digitInput;
}

// Read input from standard input, assuming it's a file path.
var fileContentRaw = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input content.
var inputLines = fileContentRaw.trim().split("\n");

// Extract the first numerical value.
var initialCount = inputLines.shift() - 0;

// Extract the next line and split it into individual characters.
var idStringCharacters = inputLines.shift().split("");

// Extract another numerical parameter.
var parameterA = inputLines.shift() - 0;

// Extract the next line, split by space, and convert to numbers.
var numericDataArray = inputLines.shift().split(" ").map(Number);

// Initialize an array to store multiplier factors.
var multiplierList = [];

// Initialize a running sum for initial calculations.
var currentRunningSum = 0;

// Iterate through the characters of the identifier string.
idStringCharacters.forEach(function(charElement, elementIndex) {
  // If the character is an asterisk, determine its multiplier based on its position.
  if (charElement === "*") {
    if (elementIndex % 2 === 0) {
      multiplierList.push(1); // Even index gets multiplier 1
    } else {
      multiplierList.push(2); // Odd index gets multiplier 2
    }
  } else {
    // If it's a digit, add it to the running sum, applying a transformation if needed.
    if (elementIndex % 2 === 0) {
      currentRunningSum += charElement - 0; // Even index, add digit directly
    } else {
      currentRunningSum += adjustValueForLuhn((charElement - 0) * 2); // Odd index, double and adjust
    }
  }
});

// Initialize a 2D array for dynamic programming.
// The first dimension corresponds to the number of factors processed.
// The second dimension represents possible sums.
var dynamicProgramTable = [];
for (var tableRowIndex = 0; tableRowIndex <= 7; tableRowIndex++) {
  dynamicProgramTable[tableRowIndex] = [];
  for (var tableColSum = 0; tableColSum <= 1000000; tableColSum++) {
    dynamicProgramTable[tableRowIndex][tableColSum] = 0;
  }
}

// Set the initial state for the DP table: at step 0, the currentRunningSum has one way to be achieved.
dynamicProgramTable[0][currentRunningSum] = 1;

// Fill the dynamic programming table.
// Iterate through each multiplier factor.
for (var factorListIndex = 0; factorListIndex < multiplierList.length; factorListIndex++) {
  // Iterate through each number in the numeric data array.
  for (var dataArrayIndex = 0; dataArrayIndex < numericDataArray.length; dataArrayIndex++) {
    // Iterate through all possible sums calculated so far.
    for (var currentDpSum = 0; currentDpSum <= 1000000; currentDpSum++) {
      // If there's a way to reach 'currentDpSum' at the previous step,
      // calculate new sums by adding the transformed product of current number and factor.
      if (dynamicProgramTable[factorListIndex][currentDpSum] > 0) {
        dynamicProgramTable[factorListIndex + 1][currentDpSum + adjustValueForLuhn(numericDataArray[dataArrayIndex] * multiplierList[factorListIndex])] += dynamicProgramTable[factorListIndex][currentDpSum];
      }
    }
  }
}

// Calculate the final answer by summing up counts for sums divisible by 10.
var finalAnswer = 0;
for (var potentialFinalSum = 0; potentialFinalSum <= 1000000; potentialFinalSum++) {
  if (potentialFinalSum % 10 === 0) {
    finalAnswer += dynamicProgramTable[multiplierList.length][potentialFinalSum];
  }
}

// Output the final computed answer.
console.log(finalAnswer);
