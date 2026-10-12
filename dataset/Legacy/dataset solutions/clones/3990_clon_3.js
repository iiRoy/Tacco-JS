'use strict';

function main(rawInputLine) {
  // Step 1: Parse the input string from the first line
  const firstLineContent = rawInputLine.split('\n')[0];
  const numberStringTokens = firstLineContent.split(' ');
  const parsedNumericValues = numberStringTokens.map(str => Number(str));

  // Extract the two input numbers
  const firstInputNumber = parsedNumericValues[0];
  const secondInputNumber = parsedNumericValues[1];

  // Define a small helper function for the common absolute difference calculation
  const calculateAbsoluteDifferenceFromTwo = (value) => Math.abs(value - 2);

  // Compute the two operands for multiplication
  const multiplierA = calculateAbsoluteDifferenceFromTwo(firstInputNumber);
  const multiplierB = calculateAbsoluteDifferenceFromTwo(secondInputNumber);

  let finalComputedResult;

  // Check for potential overflow before performing the multiplication
  // This prevents 'Infinity' or incorrect results from standard JS number multiplication
  // if either multiplier is 0, the product is 0, which is handled by the else branch.
  if (multiplierA > Number.MAX_SAFE_INTEGER / multiplierB || multiplierB > Number.MAX_SAFE_INTEGER / multiplierA) {
    // If the product might exceed MAX_SAFE_INTEGER, use a custom big integer multiplication approach

    // Helper function to convert a number into an array of its digits, in reverse order (least significant first)
    const convertToReversedDigitArray = (numValue) => String(numValue).split('').map(char => Number(char)).reverse();

    const digitsOfA = convertToReversedDigitArray(multiplierA);
    const digitsOfB = convertToReversedDigitArray(multiplierB);

    // Initialize an array to store the product digits.
    // Its size is the sum of the lengths of the input numbers' digits,
    // which is the maximum possible length for their product.
    let productDigitsAccumulator = Array(digitsOfA.length + digitsOfB.length).fill(0);

    // Nested helper function to handle carry propagation within the productDigitsAccumulator.
    // This function iterates through the digits from left to right (most significant to least significant)
    // and moves any 'tens' part to the next more significant digit.
    const propagateCarriesThroughArray = () => {
      for (let currentIdx = 0; currentIdx < productDigitsAccumulator.length; currentIdx++) {
        if (productDigitsAccumulator[currentIdx] >= 10) {
          const carryAmount = Math.floor(productDigitsAccumulator[currentIdx] / 10); // Get the carry value
          const remainingDigit = productDigitsAccumulator[currentIdx] % 10;         // Get the single digit remainder

          // Add the carry to the digit at the more significant position (to the left).
          // The smallest possible index for a digit that can have a value >= 10 is 1,
          // as productDigitsAccumulator[0] only receives carries, it's not directly assigned a product.
          if (currentIdx > 0) {
            productDigitsAccumulator[currentIdx - 1] += carryAmount;
          }
          productDigitsAccumulator[currentIdx] = remainingDigit;
        }
      }
    };

    // Perform the multiplication using a method similar to manual long multiplication
    for (let i = 0; i < digitsOfA.length; i++) {
      for (let j = 0; j < digitsOfB.length; j++) {
        const currentPartialProduct = digitsOfA[i] * digitsOfB[j];
        // Calculate the correct position for this partial product in the accumulator array.
        // (i+j) represents the position from the right (least significant digit).
        // We map this to the left-to-right indexed productDigitsAccumulator.
        const targetAccumulatorPosition = productDigitsAccumulator.length - (i + j) - 1;

        productDigitsAccumulator[targetAccumulatorPosition] += currentPartialProduct;
        propagateCarriesThroughArray(); // Propagate carries immediately after each addition
      }
    }

    // Remove any leading zeros from the accumulated product digits.
    let firstNonZeroDigitIndex = 0;
    // Continue incrementing the index as long as the digit is zero and it's not the very last digit
    // (to ensure '0' itself is not trimmed to an empty string).
    while (firstNonZeroDigitIndex < productDigitsAccumulator.length - 1 && productDigitsAccumulator[firstNonZeroDigitIndex] === 0) {
      firstNonZeroDigitIndex++;
    }

    // Convert the array of digits into a single string representation of the large number.
    finalComputedResult = productDigitsAccumulator.slice(firstNonZeroDigitIndex).join('');

  } else {
    // If the product fits within JavaScript's safe integer range, perform direct multiplication.
    finalComputedResult = multiplierA * multiplierB;
  }

  // Output the final result to the console.
  console.log(finalComputedResult);
}

// Read input from standard input (typically for competitive programming environments)
main(require("fs").readFileSync("/dev/stdin", "utf8"));
