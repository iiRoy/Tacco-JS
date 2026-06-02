function adjustValue(inputVal) {
  // This function modifies a number based on its magnitude.
  if (inputVal >= 10) {
    inputVal = inputVal - 10 + 1;
  }
  return inputVal;
}

// Read input from standard input, assuming UTF-8 encoding.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into lines.
var lineSegments = rawData.trim().split("\n");

// Extract the first numeric value from the input lines.
var firstNum = lineSegments.shift() - 0;

// Extract the identifier string and convert it to an array of characters.
var identifierStringChars = lineSegments.shift().split("");

// Extract the second numeric value.
var secondNum = lineSegments.shift() - 0;

// Extract the array of numbers, splitting by space and converting to Number type.
var numericArray = lineSegments.shift().split(" ").map(Number);

// Initialize an array to store multiplier factors.
var multiplierFactors = [];

// Initialize a running sum.
var initialSum = 0;

// Iterate through the identifier characters to populate multiplierFactors and initialSum.
identifierStringChars.forEach(function(charVal, idx) {
  if (charVal === "*") {
    // If the character is an asterisk, determine the multiplier factor based on its index parity.
    if (idx % 2 === 0) {
      multiplierFactors.push(1);
    } else {
      multiplierFactors.push(2);
    }
  } else {
    // If it's a digit, add its value to the initial sum, applying adjustment if index is odd.
    if (idx % 2 === 0) {
      initialSum += charVal - 0;
    } else {
      initialSum += adjustValue((charVal - 0) * 2);
    }
  }
});

// Initialize a 2D array for dynamic programming.
var dynamicProgTable = [];

// Populate the DP table with zeros. The maximum sum can be around 1,000,000.
// The first dimension (rows) is small, related to the number of '*' characters.
for (var rowIdx = 0; rowIdx <= 7; rowIdx++) {
  dynamicProgTable[rowIdx] = [];
  for (var colSum = 0; colSum <= 1000000; colSum++) {
    dynamicProgTable[rowIdx][colSum] = 0;
  }
}

// Set the base case for the dynamic programming: at step 0, the initial sum has one way to be formed.
dynamicProgTable[0][initialSum] = 1;

// Iterate through the multiplier factors and numeric array to fill the DP table.
for (var factorIdx = 0; factorIdx < multiplierFactors.length; factorIdx++) {
  for (var arrayElementIdx = 0; arrayElementIdx < numericArray.length; arrayElementIdx++) {
    for (var currentSum = 0; currentSum <= 1000000; currentSum++) {
      // If the current state (dynamicProgTable[factorIdx][currentSum]) has a valid count,
      // propagate it to the next state.
      if (dynamicProgTable[factorIdx][currentSum] > 0) {
        // Calculate the value to add to the sum based on the current array element and multiplier factor.
        var valueToAdd = adjustValue(numericArray[arrayElementIdx] * multiplierFactors[factorIdx]);
        // Update the next DP state.
        dynamicProgTable[factorIdx + 1][currentSum + valueToAdd] += dynamicProgTable[factorIdx][currentSum];
      }
    }
  }
}

// Calculate the final result by summing up specific entries in the last row of the DP table.
var finalResult = 0;
for (var targetSumMultiple = 0; targetSumMultiple <= 100000; targetSumMultiple++) {
  finalResult += dynamicProgTable[multiplierFactors.length][targetSumMultiple * 10];
}

// Output the computed final result to the console.
console.log(finalResult);
