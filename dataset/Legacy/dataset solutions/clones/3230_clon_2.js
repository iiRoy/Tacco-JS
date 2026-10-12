"use strict";

/*
 * This module provides a utility function for bitwise XOR operation
 * on two numbers, converting them to binary strings for the calculation.
 */
function computeBitwiseXOR(firstOperand, secondOperand) {
  // Convert the first number to its binary string representation.
  let binaryStringA = firstOperand.toString(2);
  // Convert the second number to its binary string representation.
  let binaryStringB = secondOperand.toString(2);

  // Determine the maximum length between the two binary strings.
  let maxLength = Math.max(binaryStringA.length, binaryStringB.length);

  // Pad the shorter binary string with leading zeros to match the maximum length.
  binaryStringA = "0".repeat(maxLength - binaryStringA.length) + binaryStringA;
  // Pad the other shorter binary string with leading zeros to match the maximum length.
  binaryStringB = "0".repeat(maxLength - binaryStringB.length) + binaryStringB;

  // Initialize an empty string to store the result of the XOR operation.
  let xorResultString = "";
  // Iterate through the binary strings from left to right (most significant bit to least significant bit).
  for (let idx = 0; idx < maxLength; idx++) {
    // If the bits at the current position are the same, the XOR result is '0'.
    if (binaryStringA[idx] === binaryStringB[idx]) {
      xorResultString += "0";
    }
    // If the bits at the current position are different, the XOR result is '1'.
    else {
      xorResultString += "1";
    }
  }
  // Convert the resulting binary string back to an integer and return it.
  return parseInt(xorResultString, 2);
}

/**
 * Main processing function for the problem.
 * It reads input, performs calculations based on bitwise operations,
 * and prints the final sum.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInputData(rawData) {
  // Split the input string by newline characters and filter out any empty lines.
  const parsedLines = rawData.split("\n").filter((line) => line !== "");

  // Parse the first line to get N and K.
  const arraySize = parsedLines[0].split(" ").map(Number)[0];
  const targetValue = parsedLines[0].split(" ").map(Number)[1];
  // Parse the second line to get the array A.
  const originalArray = parsedLines[1].split(" ").map(Number);

  // Sort a copy of the array A to find the maximum element.
  const sortedArray = originalArray.sort((valA, valB) => valA - valB);
  const maximumElement = sortedArray[sortedArray.length - 1];
  // Determine the number of bits required to represent the maximum element.
  const maxBinaryDigits = maximumElement.toString(2).length;
  // Convert each number in the original array to its binary string representation,
  // padding with leading zeros to ensure all strings have the same length (maxBinaryDigits).
  const binaryRepresentations = originalArray.map((numValue) => {
    let binStr = numValue.toString(2);
    return "0".repeat(maxBinaryDigits - binStr.length) + binStr;
  });

  // Initialize an empty string to build the optimal XOR value's binary representation.
  let optimalXORString = "";
  // Iterate through each bit position from most significant to least significant.
  for (let bitPosition = 0; bitPosition < maxBinaryDigits; bitPosition++) {
    let zeroCount = 0; // Counter for '0's at the current bit position.
    let oneCount = 0; // Counter for '1's at the current bit position.

    // Count '0's and '1's at the current bit position across all binary representations.
    binaryRepresentations.forEach((currentBinaryString) => {
      if (currentBinaryString[bitPosition] === "0") {
        zeroCount++;
      } else {
        oneCount++;
      }
    });

    // Decide the bit for the optimalXORString based on counts.
    // If '0's are more frequent, choosing '1' for X at this position will maximize the sum.
    if (zeroCount > oneCount) {
      optimalXORString += "1";
    }
    // Otherwise, choosing '0' for X at this position is better or equal.
    else {
      optimalXORString += "0";
    }
  }

  // Determine the number of bits in the binary representation of K.
  let targetValueBinaryLength = targetValue.toString(2).length;

  // Adjust the optimalXORString based on the length of K.
  if (optimalXORString.length < targetValueBinaryLength) {
    // If optimalXORString is shorter than K's binary representation,
    // pad it with leading '1's to match K's length.
    optimalXORString =
      "1".repeat(targetValueBinaryLength - optimalXORString.length) +
      optimalXORString;
  } else if (targetValue === 0) {
    // Special case: if K is 0, the optimal XOR string should be "0".
    optimalXORString = "0";
  } else {
    // If optimalXORString is longer than K's binary representation,
    // truncate it from the left to match K's length.
    optimalXORString = optimalXORString.slice(
      optimalXORString.length - targetValueBinaryLength
    );
  }

  // Convert the final optimalXORString to an integer.
  let finalXORValue = parseInt(optimalXORString, 2);

  // Calculate the sum of XOR operations for each element in the original array with finalXORValue.
  let finalSum = originalArray
    .map((element) => computeBitwiseXOR(element, finalXORValue))
    .reduce((accumulator, currentValue) => currentValue + accumulator);
  // Print the final calculated sum to standard output.
  console.log(finalSum);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
