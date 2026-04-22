"use strict";

// This function performs a bitwise XOR operation on two numeric values.
// It converts them to binary strings, pads them for equal length,
// then compares bit by bit to construct the XOR result string.
function exclusiveOr(val1, val2) {
  let binaryString1 = val1.toString(2); // Convert the initial value to its binary form
  let binaryString2 = val2.toString(2); // Convert the second value to its binary form

  // Determine the greatest length between the two binary representations
  let maxLength = Math.max(binaryString1.length, binaryString2.length);

  // Pad the shorter binary strings with leading zeros to match the maxLength
  binaryString1 = "0".repeat(maxLength - binaryString1.length) + binaryString1;
  binaryString2 = "0".repeat(maxLength - binaryString2.length) + binaryString2;

  let xorResultString = ""; // Initialize an empty string to accumulate the XOR output
  for (let idx = 0; idx < maxLength; idx += 1) { // Iterate through each position (bit)
    if (binaryString1[idx] === binaryString2[idx]) { // If the bits at this position are identical
      xorResultString += "0"; // The result bit is 0
    } else { // If the bits are different
      xorResultString += "1"; // The result bit is 1
    }
  }
  // Convert the constructed binary string back into an integer and return
  return parseInt(xorResultString, 2);
}

// This is the primary function to process the challenge input.
function processInput(rawData) {
  // Split the entire raw input string into an array of individual lines,
  // then filter out any blank lines that might be present.
  const lineArray = rawData.split("\n").filter(entry => entry !== "");

  // Extract the first two numbers from the first line of input:
  // countElements (N) and limitValue (K).
  const countElements = lineArray[0].split(" ").map(Number)[0];
  const limitValue = lineArray[0].split(" ").map(Number)[1];
  // Extract all numbers from the second line of input into an array.
  const numericArray = lineArray[1].split(" ").map(Number);

  // Create a sorted version of the numeric array to easily find the maximum element.
  const sortedArray = numericArray.sort((first, second) => first - second);
  const maximumElement = sortedArray[sortedArray.length - 1]; // Retrieve the highest value.
  // Calculate the maximum required binary length based on the largest number.
  const maxBinaryLength = maximumElement.toString(2).length;

  // Transform each number in the original numeric array into a binary string,
  // ensuring all binary strings are padded with leading zeros to `maxBinaryLength`.
  const binaryRepresentations = numericArray.map(numeral => {
    let currentBinary = numeral.toString(2); // Convert the current number to binary.
    // Pad with leading zeros if the current binary string is shorter than `maxBinaryLength`.
    return "0".repeat(maxBinaryLength - currentBinary.length) + currentBinary;
  });

  // This variable will store the calculated target binary string for the XOR operation.
  let intermediateBinaryString = "";
  // Iterate through each bit position, from most significant to least significant.
  for (let currentBitPosition = 0; currentBitPosition < maxBinaryLength; currentBitPosition++) {
    let zeroCount = 0; // Counter for '0's at the current bit position across all numbers.
    let oneCount = 0;  // Counter for '1's at the current bit position across all numbers.

    // Go through each padded binary representation to tally '0's and '1's at `currentBitPosition`.
    binaryRepresentations.forEach(singleBinaryString => {
      if (singleBinaryString[currentBitPosition] === "0") {
        zeroCount++;
      } else {
        oneCount++;
      }
    });

    // Based on the counts, decide what bit should be in the `intermediateBinaryString`
    // to maximize the XOR sum later. If there are more zeros, we want to XOR with 1
    // to flip them to 1s. If more ones, we want to XOR with 0 to keep them as 1s.
    if (zeroCount > oneCount) {
      intermediateBinaryString += "1";
    } else {
      intermediateBinaryString += "0";
    }
  }

  // Calculate the binary length of the `limitValue`.
  let limitBinaryLength = limitValue.toString(2).length;

  // Adjust the `intermediateBinaryString` based on `limitValue`'s binary length.
  if (intermediateBinaryString.length < limitBinaryLength) {
    // If the generated string is too short, prepend '1's to match `limitBinaryLength`.
    intermediateBinaryString = "1".repeat(limitBinaryLength - intermediateBinaryString.length) + intermediateBinaryString;
  } else if (limitValue === 0) {
    // Special condition: if `limitValue` is zero, the target `X` must also be zero.
    intermediateBinaryString = "0";
  } else {
    // If the generated string is too long, trim it from the left to match `limitBinaryLength`.
    intermediateBinaryString = intermediateBinaryString.slice(intermediateBinaryString.length - limitBinaryLength);
  }

  // Convert the final adjusted binary string into an integer.
  let calculatedXorTarget = parseInt(intermediateBinaryString, 2);

  // Apply the `exclusiveOr` function to each element in `numericArray` with the
  // `calculatedXorTarget`, then sum all the results.
  let finalXorSum = numericArray.map(element => exclusiveOr(element, calculatedXorTarget))
                                 .reduce((accumulator, currentValue) => currentValue + accumulator);
  // Print the final computed sum to standard output.
  console.log(finalXorSum);
}

// Read input from the standard input stream (e.g., from a file or console pipe)
// and pass it to the `processInput` function to begin execution.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));