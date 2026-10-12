"use strict";

/**
 * Utility class for processing input strings line by line and token by token.
 * It handles parsing tokens into a specified data type.
 */
function InputProcessor(sourceText, valueParser) {
  this.sourceLines = sourceText.split("\n"); // Stores the input as an array of strings, one per line.
  this.currentColumn = 0; // Index of the next token to read on the current line.
  this.currentLine = 0; // Index of the current line being processed.
  this.parseFunction = valueParser || Number; // Function to convert string tokens to desired type (defaults to Number).
}

/**
 * Reads and returns the next single value from the input stream.
 * It advances the internal pointers to the next token.
 * @returns {any} The parsed value from the input.
 */
InputProcessor.prototype.readNextValue = function() {
  const currentLineContent = this.sourceLines[this.currentLine];
  if (!currentLineContent) {
    return; // No more lines to process.
  }

  const lineTokens = currentLineContent.trim().split(" "); // Split the current line into tokens.
  const tokenValue = lineTokens[this.currentColumn]; // Get the token at the current column.
  this.currentColumn++; // Move to the next column.

  // If all tokens on the current line have been read, reset column and move to the next line.
  if (lineTokens.length === this.currentColumn) {
    this.currentColumn = 0;
    this.currentLine++;
  }
  return this.parseFunction(tokenValue); // Parse and return the token.
};

/**
 * Reads all values from the current line, parses them, and advances to the next line.
 * @returns {Array<any>} An array containing all parsed values from the current line.
 */
InputProcessor.prototype.readLineValues = function() {
  const lineData = this.sourceLines[this.currentLine];
  if (!lineData) {
    return; // No more lines to process.
  }
  this.currentColumn = 0; // Reset column as we're starting a new line.
  this.currentLine++; // Move to the next line.
  return lineData.split(" ").map(this.parseFunction); // Split, parse all tokens, and return as an array.
};

// A large prime number used as a modulus for arithmetic operations to prevent overflow.
const primeModulus = 998244353;

/**
 * The main function that orchestrates the problem-solving logic.
 * It reads input, performs dynamic programming calculations, and prints the final result.
 * @param {string} rawInputData The entire input content as a single string.
 */
function processInputData(rawInputData) {
  const inputReader = new InputProcessor(rawInputData);

  const itemCount = inputReader.readNextValue(); // Read the first value, which is the count of items.
  const valueArray = [];
  // Populate an array with the subsequent 'itemCount' values.
  for (let loopIndex = 0; loopIndex < itemCount; loopIndex++) {
    valueArray.push(inputReader.readNextValue());
  }

  // Calculate the total sum of all values in the array.
  const totalSum = valueArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  let totalCombinations = 1;
  // Calculate 3^itemCount modulo primeModulus. This represents the total ways to assign items to 3 groups.
  for (let loopIndex = 0; loopIndex < itemCount; loopIndex++) {
    totalCombinations = (totalCombinations * 3) % primeModulus;
  }

  let countGreaterHalf = 0; // This variable will store the count of combinations where the sum of one group (R) is >= totalSum / 2.

  // Dynamic programming array to store counts of subset sums.
  // dynamicProgState1[k] will hold the number of ways to achieve a sum of 'k'.
  let dynamicProgState1 = [1]; // Base case: there's 1 way to achieve a sum of 0 (by taking no items).

  // Iterate through each item to update the DP state.
  for (let loopIndex = 1; loopIndex <= itemCount; loopIndex++) {
    const currentItemValue = valueArray[loopIndex - 1];
    // Create a new DP array for the current iteration. Its size depends on the maximum possible sum.
    const dynamicProgState2 = Array(dynamicProgState1.length + currentItemValue).fill(0);

    // Iterate through previous sums.
    for (let subSumIndex = 0; subSumIndex < dynamicProgState1.length; subSumIndex++) {
      // Case 1: The current item is NOT included in the sum for group R, but can be in one of the other two groups.
      // This effectively doubles the ways to achieve 'subSumIndex' from the previous state.
      dynamicProgState2[subSumIndex] = (dynamicProgState2[subSumIndex] + dynamicProgState1[subSumIndex] * 2) % primeModulus;

      // Case 2: The current item IS included in the sum for group R.
      const nextSum = subSumIndex + currentItemValue;
      // Ensure the new sum does not exceed the total possible sum.
      if (nextSum <= totalSum) {
        dynamicProgState2[nextSum] = (dynamicProgState2[nextSum] + dynamicProgState1[subSumIndex]) % primeModulus;
      }
    }
    dynamicProgState1 = dynamicProgState2; // Update the DP state for the next iteration.
  }

  // Sum up all counts where the subset sum is greater than or equal to half of the total sum.
  for (let subSumIndex = Math.ceil(totalSum / 2); subSumIndex <= totalSum; subSumIndex++) {
    countGreaterHalf = (countGreaterHalf + dynamicProgState1[subSumIndex]) % primeModulus;
  }

  let countExactHalf = 0; // This variable will store the count of combinations where the sum of one group (R) is exactly totalSum / 2.

  // This calculation is only performed if the total sum is an even number.
  if (totalSum % 2 === 0) {
    // Another dynamic programming array, similar to the first, but with a subtle difference in array sizing.
    let dynamicProgState3 = [1]; // Base case: 1 way to achieve sum 0.
    dynamicProgState3[0] = 1; // Explicitly setting for clarity, though redundant with [1] initialization.

    // Iterate through each item to update this DP state.
    for (let loopIndex = 1; loopIndex <= itemCount; loopIndex++) {
      const currentItemValue = valueArray[loopIndex - 1];
      // Create a new DP array for this iteration. Note the array size increment (+1).
      const dynamicProgState4 = Array(dynamicProgState3.length + 1).fill(0);

      // Iterate through previous sums.
      for (let subSumIndex = 0; subSumIndex < dynamicProgState3.length; subSumIndex++) {
        // Case 1: The current item is NOT included in the sum for group R.
        dynamicProgState4[subSumIndex] = (dynamicProgState4[subSumIndex] + dynamicProgState3[subSumIndex]) % primeModulus;

        // Case 2: The current item IS included in the sum for group R.
        const nextSum = subSumIndex + currentItemValue;
        // Ensure the new sum does not exceed the total possible sum.
        // Note: If 'nextSum' exceeds the bounds of 'dynamicProgState4', this line may cause a runtime error,
        // which is a direct replication of the original code's behavior.
        if (nextSum <= totalSum) {
          dynamicProgState4[nextSum] = (dynamicProgState4[nextSum] + dynamicProgState3[subSumIndex]) % primeModulus;
        }
      }
      dynamicProgState3 = dynamicProgState4; // Update the DP state.
    }
    // After processing all items, retrieve the count for the sum exactly equal to totalSum / 2.
    // Note: If 'totalSum / 2' exceeds the bounds of 'dynamicProgState3', this line may cause a runtime error,
    // which is a direct replication of the original code's behavior.
    countExactHalf = dynamicProgState3[totalSum / 2];
  }

  // Apply the inclusion-exclusion principle to calculate the final answer.
  // The formula is (Total - 3 * (R >= S/2) + 3 * (R = S/2)) mod primeModulus.
  let finalAnswer = (totalCombinations - countGreaterHalf * 3 + countExactHalf * 3) % primeModulus;
  // Ensure the result is positive by adding the modulus if it's negative.
  finalAnswer = (finalAnswer + primeModulus) % primeModulus;

  console.log(finalAnswer); // Output the final calculated answer.
}

// Read the entire content of standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
