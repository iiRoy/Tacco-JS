function transformValue(inputValue) {
  // If the input value is 10 or greater, apply a specific transformation.
  // This transformation effectively subtracts 9 from the value.
  if (inputValue >= 10) {
    inputValue = inputValue - 10 + 1;
  }
  // Return the (potentially transformed) value.
  return inputValue;
}

// Read input from standard input, assuming UTF-8 encoding.
// The 'fs' module is a built-in Node.js module for file system operations.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input:
// 1. Remove leading/trailing whitespace using trim().
// 2. Split the string into an array of lines using the newline character as a delimiter.
var lineData = rawData.trim().split('\n');

// Extract the first numerical value from the input lines.
// shift() removes the first element from the array and returns it.
// The unary plus operator (+0) converts the string to a number.
var firstNum = lineData.shift() - 0;

// Extract the second line, split it into individual characters, forming an array of characters.
var identifierString = lineData.shift().split('');

// Extract the third numerical value from the input lines.
var secondNum = lineData.shift() - 0;

// Extract the fourth line, split it by spaces, and convert each part to a number.
var numberArray = lineData.shift().split(' ').map(Number);

// Initialize an empty array to store factors.
var factorList = [];
// Initialize a sum variable.
var currentSum = 0;

// Iterate over each character in the identifierString.
identifierString.forEach(function(charVal, charIndex) {
  // Check if the current character is an asterisk.
  if (charVal === '*') {
    // If it's an asterisk, determine the factor based on its index parity.
    // Even index gets factor 1, odd index gets factor 2.
    if (charIndex % 2 === 0) {
      factorList.push(1);
    } else {
      factorList.push(2);
    }
  } else {
    // If it's not an asterisk, add its numerical value to the currentSum.
    // The logic depends on the index parity.
    if (charIndex % 2 === 0) {
      currentSum += charVal - 0; // Convert char to number and add.
    } else {
      // For odd indices, convert char to number, multiply by 2, and apply transformValue.
      currentSum += transformValue((charVal - 0) * 2);
    }
  }
});

// Initialize a 2D array (dynamic programming table) with zeros.
// The dimensions are (factorList.length + 1) rows and 100 columns.
var dynamicProgTable = [];
for (var rowIdx = 0; rowIdx <= factorList.length; rowIdx++) {
  dynamicProgTable[rowIdx] = [];
  for (var colSum = 0; colSum < 100; colSum++) {
    dynamicProgTable[rowIdx][colSum] = 0;
  }
}

// Set the base case for the DP table: one way to achieve a sum of 0 with no factors.
dynamicProgTable[0][0] = 1;

// Fill the DP table using nested loops.
// The outer loop iterates through the factors in factorList.
for (var rowIdx = 0; rowIdx < factorList.length; rowIdx++) {
  // The middle loop iterates through the numbers in numberArray.
  for (var arrIdx = 0; arrIdx < numberArray.length; arrIdx++) {
    // The inner loop iterates through possible sums.
    for (var colSum = 0; colSum < 100; colSum++) {
      // If there's a way to reach the current sum 'colSum' with 'rowIdx' factors,
      // then calculate the next possible sum by adding the transformed product
      // of a number from numberArray and the current factor.
      if (dynamicProgTable[rowIdx][colSum] > 0) {
        dynamicProgTable[rowIdx + 1][colSum + transformValue(numberArray[arrIdx] * factorList[rowIdx])] += dynamicProgTable[rowIdx][colSum];
      }
    }
  }
}

// Calculate the final result.
var finalResult = 0;
// Iterate through all possible sums in the last row of the DP table.
for (var colSum = 0; colSum < 100; colSum++) {
  // Check if the total sum (currentSum + colSum) is a multiple of 10.
  if ((currentSum + colSum) % 10 === 0) {
    // If it is, add the number of ways to achieve 'colSum' to the final result.
    finalResult += dynamicProgTable[factorList.length][colSum];
  }
}

// Print the final calculated result to the console.
console.log(finalResult);
