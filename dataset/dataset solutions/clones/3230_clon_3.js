"use strict";

// This utility function calculates the bitwise exclusive OR (XOR) of two numerical inputs.
// It achieves this by converting the numbers into their binary string representations,
// padding them to equal lengths, and then performing a character-by-character comparison.
// The result is then converted back to a standard JavaScript number.
function computeBinaryXOR(firstNumericValue, secondNumericValue) {
  // Basic input validation: ensure both arguments are valid numbers.
  // This guard clause prevents unexpected behavior with non-numeric inputs.
  if (typeof firstNumericValue !== 'number' || typeof secondNumericValue !== 'number' || isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    // In case of invalid input, returning 0 might be an acceptable default
    // if the calling context can handle it gracefully.
    return 0;
  }

  // Convert each number into its binary string equivalent.
  let binaryStringOne = firstNumericValue.toString(2);
  let binaryStringTwo = secondNumericValue.toString(2);

  // Determine the maximum length between the two binary strings.
  // This ensures that both strings are aligned correctly for bit-wise comparison.
  const overallMaxLength = Math.max(binaryStringOne.length, binaryStringTwo.length);

  // Pad the beginning of each binary string with '0's until they both reach the overallMaxLength.
  // This step is crucial for accurate bit-by-bit XOR calculation.
  binaryStringOne = binaryStringOne.padStart(overallMaxLength, '0');
  binaryStringTwo = binaryStringTwo.padStart(overallMaxLength, '0');

  let accumulatedXORResultString = ''; // This string will build the binary result of the XOR operation.

  // Iterate through each bit position, from the most significant to the least significant.
  for (let currentBitIndex = 0; currentBitIndex < overallMaxLength; currentBitIndex++) {
    const bitFromFirst = binaryStringOne[currentBitIndex];
    const bitFromSecond = binaryStringTwo[currentBitIndex];

    // Perform the XOR logic: if bits are identical, the result bit is '0'; otherwise, it's '1'.
    accumulatedXORResultString += (bitFromFirst === bitFromSecond) ? '0' : '1';
  }

  // Convert the final binary result string back into an integer and return it.
  return parseInt(accumulatedXORResultString, 2);
}

// This is the core logic handler that processes the input data,
// calculates a dynamic XOR mask, and then computes the sum of XORed values.
const processInputDataset = (rawTextPayload) => {
  // Split the entire input string by newline characters.
  // The filter operation ensures that any empty lines (e.g., trailing newlines) are discarded.
  const parsedInputLines = rawTextPayload.split('\n').filter(line => line.trim().length > 0);

  // Extract numerical parameters from the first line.
  // The original problem likely implies 'paramN' is present but unused.
  // 'targetKValue' is a crucial parameter for mask adjustment.
  const [paramN, targetKValue] = parsedInputLines[0].split(' ').map(Number);

  // Parse the second line to obtain an array of numbers.
  const numericalSequence = parsedInputLines[1].split(' ').map(Number);

  // Validate the numerical sequence to ensure all elements are valid numbers.
  // An early exit prevents further processing with corrupted data.
  if (!Array.isArray(numericalSequence) || numericalSequence.some(val => isNaN(val))) {
    console.error("Error: The provided numerical sequence contains invalid entries.");
    return;
  }

  // Determine the largest number within the numerical sequence.
  // This helps in establishing a consistent bit length for binary representations.
  const maxElementInSequence = Math.max(...numericalSequence);

  // Calculate the number of bits required to represent the largest element in binary.
  // This 'universal' bit length ensures all binary strings are padded uniformly.
  const universalBitLength = maxElementInSequence.toString(2).length;

  // Convert each number in the sequence into a binary string.
  // Each string is padded with leading zeros to match the 'universalBitLength'.
  const paddedBinaryStringsList = numericalSequence.map(num => {
    let currentBinString = num.toString(2);
    return currentBinString.padStart(universalBitLength, '0');
  });

  let constructedMaskBinaryString = ''; // This string will accumulate the bits of our dynamic XOR mask.

  // Iterate through each bit position (from most significant to least significant)
  // to construct the optimal XOR mask.
  for (let bitIndex = 0; bitIndex < universalBitLength; bitIndex++) {
    let zeroBitCounter = 0; // Counts '0's at the current bit position across all numbers.
    let oneBitCounter = 0;  // Counts '1's at the current bit position across all numbers.

    // Count '0's and '1's for the current bit position across all padded binary strings.
    for (const binStr of paddedBinaryStringsList) {
      if (binStr[bitIndex] === '0') {
        zeroBitCounter++;
      } else {
        oneBitCounter++;
      }
    }

    // The logic here aims to construct a mask bit that, when XORed,
    // maximizes the '1's in the output if '0's are dominant in the input.
    // This typically leads to a larger sum of XORed values.
    constructedMaskBinaryString += (zeroBitCounter > oneBitCounter) ? '1' : '0';
  }

  // --- Adjusting the constructed mask based on the 'targetKValue' ---
  // The 'targetKValue' dictates the final length and potential value of the XOR mask.

  // Get the binary string length of 'targetKValue'.
  const kValueBinaryLength = targetKValue.toString(2).length;

  let finalAdjustedMaskBinary = ''; // This variable will hold the binary string of the final mask.

  // Condition 1: If the constructed mask is shorter than 'targetKValue's binary representation.
  // Pad the constructed mask with leading '1's to match 'targetKValue's length.
  // This ensures the mask has at least as many bits as K, potentially making it a larger number.
  if (constructedMaskBinaryString.length < kValueBinaryLength) {
    finalAdjustedMaskBinary = '1'.repeat(kValueBinaryLength - constructedMaskBinaryString.length) + constructedMaskBinaryString;
  }
  // Condition 2: If 'targetKValue' is exactly zero.
  // In this specific case, the mask is set to "0".
  else if (targetKValue === 0) {
    finalAdjustedMaskBinary = "0";
  }
  // Condition 3: If the constructed mask is longer than or equal to 'targetKValue's binary representation.
  // Truncate the constructed mask from its most significant bits to match 'targetKValue's length.
  // This implies that only the lower 'kValueBinaryLength' bits of the derived mask are relevant.
  else {
    finalAdjustedMaskBinary = constructedMaskBinaryString.slice(constructedMaskBinaryString.length - kValueBinaryLength);
  }

  // Convert the finalized binary mask string into an integer.
  const finalXORMaskNumeric = parseInt(finalAdjustedMaskBinary, 2);

  // Calculate the total sum of XOR operations.
  // Each number in the original sequence is XORed with 'finalXORMaskNumeric',
  // and these results are accumulated into a running total.
  let overallXORSum = 0;
  for (const valueItem of numericalSequence) {
    overallXORSum += computeBinaryXOR(valueItem, finalXORMaskNumeric);
  }

  // Output the final calculated sum to the console.
  console.log(overallXORSum);
};

// Entry point for execution:
// Reads the entire content of standard input synchronously using Node.js's 'fs' module,
// decodes it as UTF-8, and then passes it to the main processing function.
processInputDataset(require("fs").readFileSync("/dev/stdin", "utf8"));