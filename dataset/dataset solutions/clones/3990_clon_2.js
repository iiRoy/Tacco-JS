'use strict';

/**
 * Processes input to calculate a product, handling large numbers if necessary.
 * @param {string} inputData - The raw input string from stdin.
 */
function processInput(inputData) {

  // Parse the input string into an array of numbers.
  // Expects a single line with two space-separated integers.
  const numericValues = inputData.split('\n')[0].split(' ').map(valStr => Number(valStr));

  const firstNum = numericValues[0];
  const secondNum = numericValues[1];

  // Calculate the initial product: |firstNum - 2| * |secondNum - 2|
  let finalResult = Math.abs(firstNum - 2) * Math.abs(secondNum - 2);

  // Check if the product exceeds JavaScript's safe integer limit.
  if (finalResult > Number.MAX_SAFE_INTEGER) {

    /**
     * Performs multiplication of two numbers represented as strings,
     * returning the result as a string to handle arbitrary precision.
     * This simulates manual long multiplication.
     * @param {number} factorA - The first number.
     * @param {number} factorB - The second number.
     * @returns {string} The product as a string.
     */
    const performLargeMultiplication = (factorA, factorB) => {
      // Convert numbers to arrays of digits, reversed for easier processing.
      const digitsA = String(factorA).split('').map(digitChar => Number(digitChar)).reverse();
      const digitsB = String(factorB).split('').map(digitChar => Number(digitChar)).reverse();

      // Initialize an array to store the product digits.
      // Its maximum length is the sum of the lengths of the two factors.
      let productDigits = [...Array(digitsA.length + digitsB.length)].fill(0);

      /**
       * Helper function to propagate carries through the product digits array.
       * Iterates from right to left (least significant to most significant).
       */
      const adjustForCarry = () => {
        for (let idx = 0; idx < productDigits.length; idx++) {
          // If a digit position holds a value 10 or greater, a carry is needed.
          if (productDigits[idx] >= 10) {
            const carryVal = Math.floor(productDigits[idx] / 10); // The carry value
            const currentDigit = productDigits[idx] % 10;         // The digit remaining at current position

            // Add the carry to the next significant digit (leftward).
            // Note: `idx - 1` is correct because `productDigits` is reversed.
            if (idx + 1 < productDigits.length) {
                productDigits[idx + 1] += carryVal;
            } else {
                // If we need to carry beyond the current array size, extend it.
                productDigits.push(carryVal);
            }
            productDigits[idx] = currentDigit; // Update the current position with the remainder.
          }
        }
      };

      // Perform the long multiplication digit by digit.
      for (let idxA = 0; idxA < digitsA.length; idxA++) {
        for (let idxB = 0; idxB < digitsB.length; idxB++) {
          const intermediateProduct = digitsA[idxA] * digitsB[idxB];
          // Determine the position in the `productDigits` array for this intermediate product.
          // `idxA + idxB` corresponds to the correct position in the reversed array.
          const targetPosition = idxA + idxB;

          productDigits[targetPosition] += intermediateProduct;
          adjustForCarry(); // Adjust for any carries after adding.
        }
      }

      // Remove leading zeros from the result (most significant digits).
      // Since `productDigits` is reversed, we remove trailing zeros.
      while (productDigits.length > 1 && productDigits[productDigits.length - 1] === 0) {
          productDigits.pop();
      }

      // Reverse the array back and join digits to form the final string.
      return productDigits.reverse().join('');
    };

    // Recalculate the result using the big integer multiplication function.
    finalResult = performLargeMultiplication(Math.abs(firstNum - 2), Math.abs(secondNum - 2));
  }

  // Output the computed result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
