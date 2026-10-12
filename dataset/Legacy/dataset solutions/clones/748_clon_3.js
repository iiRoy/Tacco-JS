const normalizeDigit = (digitValue) => {
   // Original: if(x>=10)x=x-10+1; return x;
   // This function calculates the sum of digits for two-digit numbers (e.g., 10 -> 1, 12 -> 3)
   // and returns the number itself for single-digit numbers.
   if (digitValue < 10) {
      return digitValue;
   }
   // For numbers 10 or greater, sum its digits.
   // For example, 10 becomes (10 % 10) + floor(10 / 10) = 0 + 1 = 1
   // 12 becomes (12 % 10) + floor(12 / 10) = 2 + 1 = 3
   return (digitValue % 10) + Math.floor(digitValue / 10);
};

const fileSystem = require('fs');
const rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputString.trim().split("\n");

// Parse initial values from input. Some are consumed but not used later.
const unusedCount = Number(inputLines.shift());
const idDigitsChars = inputLines.shift().split("");
const anotherUnusedVal = Number(inputLines.shift());
const allowedDigits = inputLines.shift().split(" ").map(Number);

const multipliersList = [];
let currentInitialSum = 0;

// Process the ID digits to build multipliersList and calculate currentInitialSum
for (let charIndex = 0; charIndex < idDigitsChars.length; charIndex++) {
   const digitChar = idDigitsChars[charIndex];
   const isEvenPosition = (charIndex % 2 === 0); // Helper boolean for position check

   if (digitChar === "*") {
      // If the character is an asterisk, add 1 or 2 to multipliersList based on position
      multipliersList.push(isEvenPosition ? 1 : 2);
   } else {
      // If it's a digit, convert to number and add to currentInitialSum
      const numericValue = Number(digitChar);
      if (isEvenPosition) {
         currentInitialSum += numericValue;
      } else {
         // For odd positions, multiply by 2 and normalize the digit
         currentInitialSum += normalizeDigit(numericValue * 2);
      }
   }
}

// Initialize the Dynamic Programming table.
// dpTable[i][s] will store the count of ways to achieve sum 's' using 'i' multipliers.
// The table size is (multipliersList.length + 1) rows and 100 columns (for sums 0-99).
const dpTable = Array.from({ length: multipliersList.length + 1 }, () => new Array(100).fill(0));

// Base case: There is one way to achieve a sum of 0 with zero multipliers.
dpTable[0][0] = 1;

// Fill the DP table
for (let multiplierIndex = 0; multiplierIndex < multipliersList.length; multiplierIndex++) {
   const currentMultiplier = multipliersList[multiplierIndex];

   for (let allowedDigitIndex = 0; allowedDigitIndex < allowedDigits.length; allowedDigitIndex++) {
      const currentAllowedDigit = allowedDigits[allowedDigitIndex];

      // Calculate the product and then normalize the digit
      const productBeforeNormalization = currentAllowedDigit * currentMultiplier;
      const normalizedProduct = normalizeDigit(productBeforeNormalization);

      for (let currentAccumulatedSum = 0; currentAccumulatedSum < 100; currentAccumulatedSum++) {
         // If there's a way to reach currentAccumulatedSum at the previous step
         if (dpTable[multiplierIndex][currentAccumulatedSum] > 0) {
            const nextSum = currentAccumulatedSum + normalizedProduct;
            // Add the count to the next state. JavaScript arrays automatically extend if index is out of bounds.
            dpTable[multiplierIndex + 1][nextSum] += dpTable[multiplierIndex][currentAccumulatedSum];
         }
      }
   }
}

let finalCount = 0;

// Calculate the final answer by summing up counts where (currentInitialSum + finalSumCandidate) is a multiple of 10.
// The loop iterates only for sums up to 99, as per the original code's bounds.
for (let finalSumCandidate = 0; finalSumCandidate < 100; finalSumCandidate++) {
   if ((currentInitialSum + finalSumCandidate) % 10 === 0) {
      // Add the count from the DP table for this specific sum.
      // If dpTable[multipliersList.length][finalSumCandidate] is undefined (meaning no ways to reach this sum),
      // it will be treated as 0 in the addition, which is correct.
      finalCount += dpTable[multipliersList.length][finalSumCandidate];
   }
}

console.log(finalCount);
