// This function performs addition of two potentially very large numbers,
// treating them as strings to avoid standard JavaScript number precision limits.
function performLargeAddition(firstNum, secondNum) {
   // Convert the first input number to a string, then split it into individual
   // character digits, reverse their order (for easier right-to-left addition),
   // and finally convert each character back to a numeric digit.
   const firstNumDigits = (firstNum + "").split("").reverse().map(Number);

   // Perform the same conversion for the second input number.
   const secondNumDigits = (secondNum + "").split("").reverse().map(Number);

   // Initialize an array to store the digits of the sum.
   let sumDigitsArray = [];

   // Determine the maximum length between the two digit arrays.
   // This helps in iterating through all digit positions.
   const maxDigitCount = Math.max(firstNumDigits.length, secondNumDigits.length);

   // Pre-fill the sum array with zeros. We add one extra slot
   // to accommodate a potential carry-over from the most significant digit.
   for (let digitIndex = 0; digitIndex < maxDigitCount + 1; digitIndex++) {
      sumDigitsArray[digitIndex] = 0;
   }

   // Iterate through each digit position, from least significant to most significant.
   for (let digitIndex = 0; digitIndex < maxDigitCount; digitIndex++) {
      let currentDigitSum = 0; // Accumulator for the sum at the current position.

      // Add the digit from the first number if it exists at the current position.
      if (firstNumDigits.length > digitIndex) {
         currentDigitSum += firstNumDigits[digitIndex];
      }

      // Add the digit from the second number if it exists at the current position.
      if (secondNumDigits.length > digitIndex) {
         currentDigitSum += secondNumDigits[digitIndex];
      }

      // Add the accumulated sum for this position to the sumDigitsArray.
      // This also incorporates any carry-over from the previous position.
      sumDigitsArray[digitIndex] += currentDigitSum;
   }

   // Process the sumDigitsArray to handle any carries that resulted from addition.
   for (let digitIndex = 0; digitIndex < maxDigitCount; digitIndex++) {
      // If the sum at the current position is 10 or more, a carry is needed.
      if (sumDigitsArray[digitIndex] >= 10) {
         sumDigitsArray[digitIndex] -= 10; // Keep only the unit digit.
         sumDigitsArray[digitIndex + 1]++; // Increment the next digit position (carry).
      }
   }

   // After all carries are processed, check if the most significant digit (the last element)
   // is zero. If it is, it means there was no carry to that position, so it can be removed.
   if (sumDigitsArray[sumDigitsArray.length - 1] === 0) {
      sumDigitsArray.pop();
   }

   // Reverse the array of digits back to their original order and join them
   // to form the final sum as a string.
   const finalResultString = sumDigitsArray.reverse().join("");

   return finalResultString; // Return the computed sum.
}

// Read the entire content of the standard input file as a UTF-8 string.
const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data: remove leading/trailing whitespace and split into an array of lines.
let inputLines = fileData.trim().split("\n");

// Loop indefinitely until all input lines have been processed.
while (true) {
   // If there are no more lines in the input array, break out of the loop.
   if (inputLines.length === 0) {
      break;
   }

   // Extract the next equation line from the beginning of the array.
   // Split the line by either '+' or '=' characters to get the operands and the expected sum.
   const currentEquationParts = inputLines.shift().split(/[\+\=]/);

   // Initialize an array to store any digits (0-9) that satisfy the current equation.
   let possibleSolutions = [];

   // Iterate through each possible digit from 0 to 9.
   for (let testDigit = 0; testDigit <= 9; testDigit++) {
      // Replace all occurrences of 'X' in the first operand with the current test digit,
      // then convert the resulting string to a number.
      const valA = currentEquationParts[0].replace(/X/g, testDigit) - 0;

      // Do the same for the second operand.
      const valB = currentEquationParts[1].replace(/X/g, testDigit) - 0;

      // Do the same for the expected sum, but keep it as a string for comparison.
      const valC = currentEquationParts[2].replace(/X/g, testDigit);

      // Use the custom large addition function to sum valA and valB.
      // If the result matches the expected sum (valC), then this testDigit is a solution.
      if (performLargeAddition(valA, valB) === valC) {
         possibleSolutions.push(testDigit); // Add the valid digit to the solutions array.
      }
   }

   // Output the result:
   // If exactly one solution is found, print that digit.
   // Otherwise (zero or multiple solutions), print "NA".
   console.log((possibleSolutions.length === 1) ? possibleSolutions[0] : "NA");
}
