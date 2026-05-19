"use strict";

// Read the entire content of standard input as a UTF-8 string.
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input content into an array of tokens using space or newline as delimiters.
// Initialize an index to keep track of the current token being processed.
let inputTokens = fileContent.split(/ |\n/);
let tokenIndex = 0;

/**
 * Retrieves the next token from the input stream and converts it to a numeric type.
 * @returns {number} The parsed integer value of the next token.
 */
function getNextInt() {
  return +inputTokens[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The string value of the next token.
 */
function getNextString() {
  return inputTokens[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream and converts it to a BigInt type.
 * @returns {BigInt} The parsed BigInt value of the next token.
 */
function getNextBigInt() {
  return BigInt(inputTokens[tokenIndex++]);
}

/**
 * Extracts a specified number of tokens from the input stream.
 * Optionally converts these tokens to numbers if 'asStrings' is false.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, tokens are returned as strings; otherwise, as numbers.
 * @returns {Array<number|string>} An array containing the retrieved tokens.
 */
function getNextArray(count, asStrings) {
  if (asStrings) {
    return inputTokens.slice(tokenIndex, (tokenIndex += count));
  } else {
    return inputTokens.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Reads a 2D matrix of specified dimensions from the input stream.
 * Optionally converts matrix elements to numbers if 'asStrings' is false.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getNextMatrix(height, width, asStrings) {
  let matrixRows = [];
  let rowIdx = 0;
  if (asStrings) {
    for (; rowIdx < height; rowIdx++) {
      matrixRows.push(inputTokens.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      matrixRows.push(inputTokens.slice(tokenIndex, (tokenIndex += width)).map((val) => +val));
    }
  }
  return matrixRows;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A new multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  let args = arguments;
  let argCount = args.length;
  // Construct the inner-most array creation string
  let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  // Wrap it with outer array creations for each dimension
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the array
  return eval(arrayCreationString);
}

// Execute the primary problem-solving logic.
const programResult = solveProblem();

// If the problem-solving function returns a value (i.e., not undefined), print it to console.
if (programResult !== void 0) {
  console.log(String(programResult));
}

/**
 * The main function containing the core logic to solve the given problem.
 * It processes a binary string and calculates specific values based on bit counts.
 * @returns {string} The final computed results, joined by newline characters.
 */
function solveProblem() {
  const inputLength = getNextInt(); // N: length of the binary string
  const binaryString = getNextString(); // X: the binary string itself

  // Calculate the initial base count: 1 + (number of '1's in the binary string).
  let baseCount = 0x1; // Initialize with 1 (0x1 in hex)
  for (let idx = 0; idx < inputLength; idx++) {
    if (binaryString[idx] === "1") {
      baseCount++;
    }
  }

  // Initialize the array to store the final results for each position.
  let resultArray = createMultiDimArray(0, inputLength);

  // --- First Calculation Pass ---
  // Compute the initial modulo value for the first baseCount.
  let moduloValue1 = 0x0; // Initialize with 0 (0x0 in hex)
  for (let charIndex = 0; charIndex < inputLength; charIndex++) {
    moduloValue1 *= 0x2; // Multiply by 2 (0x2 in hex)
    moduloValue1 += +binaryString[charIndex]; // Add the current bit (0 or 1)
    moduloValue1 %= baseCount; // Take modulo
  }

  // Iterate through the binary string in reverse to calculate results for '0' bits.
  let powerOfTwoMod = 0x1; // Represents 2^k % baseCount, starting with 2^0 = 1
  for (let revIndex = inputLength; revIndex--; ) {
    if (binaryString[revIndex] === "0") {
      resultArray[revIndex] = 0x1; // Initialize count for this position to 1 (0x1)
      let tempValue = moduloValue1 + powerOfTwoMod; // Calculate (current_mod + 2^k)
      tempValue %= baseCount; // Take modulo with baseCount
      // Repeatedly take modulo by the bit count of the value until it becomes 0.
      while (tempValue) {
        tempValue %= countSetBits(tempValue);
        resultArray[revIndex]++; // Increment the result count
      }
    }
    powerOfTwoMod = (powerOfTwoMod * 0x2) % baseCount; // Update 2^k % baseCount for the next iteration
  }

  // Adjust the base count for the second calculation pass.
  baseCount -= 0x2; // Subtract 2 (0x2 in hex)

  // If the adjusted base count is less than 1, it means the original baseCount was 1 or 2.
  // In such cases, the subsequent modulo operation would be invalid or trivial,
  // so we return the current results.
  if (baseCount < 0x1) { // Check against 1 (0x1 in hex)
    return resultArray.join("\n");
  }

  // --- Second Calculation Pass ---
  // Re-compute the initial modulo value with the new, adjusted baseCount.
  let moduloValue2 = 0x0; // Initialize with 0 (0x0 in hex)
  for (let k = 0; k < inputLength; k++) {
    moduloValue2 *= 0x2; // Multiply by 2 (0x2 in hex)
    moduloValue2 += +binaryString[k]; // Add the current bit
    moduloValue2 %= baseCount; // Take modulo with the new baseCount
  }

  // Iterate through the binary string in reverse to calculate results for '1' bits.
  let powerOfTwoMod2 = baseCount - 0x1; // Represents (baseCount - 1) * (2^k % baseCount)
  for (let reverseIdx = inputLength; reverseIdx--; ) {
    if (binaryString[reverseIdx] === "1") {
      resultArray[reverseIdx] = 0x1; // Initialize count for this position to 1 (0x1)
      let currentVal = moduloValue2 + powerOfTwoMod2; // Calculate (current_mod + (baseCount - 1) * 2^k)
      currentVal %= baseCount; // Take modulo with the new baseCount
      // Repeatedly take modulo by the bit count of the value until it becomes 0.
      while (currentVal) {
        currentVal %= countSetBits(currentVal);
        resultArray[reverseIdx]++; // Increment the result count
      }
    }
    powerOfTwoMod2 = (powerOfTwoMod2 * 0x2) % baseCount; // Update for the next iteration
  }

  // Join the elements of the result array with newline characters and return the string.
  return resultArray.join("\n");
}

/**
 * Counts the number of set bits (1s) in a 32-bit integer using a parallel bit counting algorithm.
 * This is a highly optimized "popcount" function.
 * @param {number} numberToCount - The integer for which to count set bits.
 * @returns {number} The total number of set bits in the input integer.
 */
function countSetBits(numberToCount) {
  // Step 1: Sum bits in pairs (e.g., 01_01_01_01 -> 0010_0010)
  numberToCount = (numberToCount & 0x55555555) + ((numberToCount >> 0x1) & 0x55555555); // 1 (0x1)
  // Step 2: Sum results in groups of 4 bits
  numberToCount = (numberToCount & 0x33333333) + ((numberToCount >> 0x2) & 0x33333333); // 2 (0x2)
  // Step 3: Sum results in groups of 8 bits
  numberToCount = (numberToCount & 0x0f0f0f0f) + ((numberToCount >> 0x4) & 0x0f0f0f0f); // 4 (0x4)
  // Step 4: Sum results in groups of 16 bits
  numberToCount = (numberToCount & 0x00ff00ff) + ((numberToCount >> 0x8) & 0x00ff00ff); // 8 (0x8)
  // Step 5: Sum results in groups of 32 bits (final sum)
  return (numberToCount & 0x0000ffff) + ((numberToCount >> 0x10) & 0x0000ffff); // 16 (0x10)
}
