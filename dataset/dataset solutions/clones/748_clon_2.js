function adjustDigit(val) {
  // If the value is 10 or more, apply a specific adjustment
  if (val >= 10) {
    val = val - 10 + 1;
  }
  return val;
}

// Read all input data from standard input
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into an array of lines
let lineData = rawData.trim().split("\n");

// The first line is a number, but it's not used in the logic
const numLines = lineData.shift() - 0;

// The second line is the card number string, split into characters
const cardNumberStr = lineData.shift().split("");

// The third line is another number, also not used in the logic
const someValue = lineData.shift() - 0;

// The fourth line contains space-separated numbers, parsed into an array
const digitOptions = lineData.shift().split(" ").map(Number);

// This array will store multipliers for the '*' characters
let multipliers = [];

// This variable accumulates the sum of known digits
let initialSum = 0;

// Iterate through each character of the card number string
for (let idx = 0; idx < cardNumberStr.length; idx++) {
  const charVal = cardNumberStr[idx]; // Current character

  if (charVal === "*") {
    // If it's a wildcard, determine its multiplier based on position
    if (idx % 2 === 0) {
      multipliers.push(1); // Even position gets multiplier 1
    } else {
      multipliers.push(2); // Odd position gets multiplier 2
    }
  } else {
    // If it's a digit, add its value to the initial sum
    if (idx % 2 === 0) {
      initialSum += charVal - 0; // Even position, add digit directly
    } else {
      // Odd position, multiply by 2 and apply adjustment
      initialSum += adjustDigit((charVal - 0) * 2);
    }
  }
}

// Initialize a 2D array for dynamic programming
let dynamicProg = [];
for (let idx = 0; idx <= multipliers.length; idx++) {
  dynamicProg[idx] = [];
  for (let currentSum = 0; currentSum < 100; currentSum++) {
    dynamicProg[idx][currentSum] = 0; // Initialize all sums to 0
  }
}

// Base case: one way to achieve a sum of 0 with no wildcards processed
dynamicProg[0][0] = 1;

// Fill the DP table
for (let idx = 0; idx < multipliers.length; idx++) {
  for (let optionIdx = 0; optionIdx < digitOptions.length; optionIdx++) {
    for (let currentSum = 0; currentSum < 100; currentSum++) {
      // If there's a way to reach 'currentSum' at the previous step
      if (dynamicProg[idx][currentSum] > 0) {
        // Calculate the value contributed by the current wildcard and option
        const addedValue = adjustDigit(digitOptions[optionIdx] * multipliers[idx]);
        // Add the number of ways to the next state
        dynamicProg[idx + 1][currentSum + addedValue] += dynamicProg[idx][currentSum];
      }
    }
  }
}

// Calculate the final count of valid combinations
let finalCount = 0;
for (let currentSum = 0; currentSum < 100; currentSum++) {
  // Check if the total sum (initial + current DP sum) is a multiple of 10
  if ((initialSum + currentSum) % 10 === 0) {
    finalCount += dynamicProg[multipliers.length][currentSum];
  }
}

// Output the final result
console.log(finalCount);
