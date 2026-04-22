'use strict'

function processInput ( inputString ) {

  // Parse the input string: take the first line, split by space, convert to numbers.
  inputString = inputString.split('\n')[0].split(' ').map(charVal => parseInt(charVal, 10));

  const valueOne = inputString[0];
  const valueTwo = inputString[1];

  // Perform an initial calculation using absolute differences.
  let computedResult = Math.abs(valueOne - 2) * Math.abs(valueTwo - 2);

  // Check if the result exceeds JavaScript's maximum safe integer.
  if (computedResult > Number.MAX_SAFE_INTEGER) {

    // If the product exceeds the maximum safe integer, perform long multiplication with digit arrays.
    const calculateExtendedProduct = (factorX, factorY) => {
      // Convert the numbers to arrays of their individual digits, in reverse order.
      const firstNumDigits  = String(factorX).split('').map(charVal => parseInt(charVal, 10)).reverse();
      const secondNumDigits = String(factorY).split('').map(charVal => parseInt(charVal, 10)).reverse();

      // Initialize an array to store the product's digits, filled with zeros.
      // Its length is the sum of the lengths of the two factor's digit arrays.
      let productDigits = Array(firstNumDigits.length + secondNumDigits.length).fill(0);

      // This helper function handles carry-overs within the productDigits array.
      const manageCarries = () => {
        for (let currentPos = 0; currentPos < productDigits.length; currentPos++) {
          if (productDigits[currentPos] >= 10) {
            // Calculate the carry-over value (tens digit) and the remainder (units digit).
            const carryValue = Math.floor(productDigits[currentPos] / 10);
            const remainder  = productDigits[currentPos] % 10;

            // Add the carry to the next higher significant digit position.
            productDigits[currentPos - 1] += carryValue;
            // Update the current position with the remainder.
            productDigits[currentPos] = remainder;
          }
        }
      }

      // Implement the core logic for long multiplication (similar to pencil-and-paper method).
      for (let idxFactor1 = 0; idxFactor1 < firstNumDigits.length; idxFactor1++) {
        for (let idxFactor2 = 0; idxFactor2 < secondNumDigits.length; idxFactor2++) {
          // Calculate the partial product of two individual digits.
          const partialProduct = firstNumDigits[idxFactor1] * secondNumDigits[idxFactor2];
          // Determine the correct position in the result array for this partial product.
          const targetDigitIndex = productDigits.length - (idxFactor1 + idxFactor2) - 1;

          // Add the partial product to the corresponding digit position.
          productDigits[targetDigitIndex] += partialProduct;
          // Propagate any carries immediately after adding each partial product.
          manageCarries();
        }
      }

      // Remove any leading zero digits from the result array.
      for (let currentIdx = 0; currentIdx < productDigits.length; currentIdx++) {
        if (productDigits[currentIdx] !== 0) {
          productDigits = productDigits.slice(currentIdx);
          break;
        }
      }

      // Convert the array of result digits into a single string.
      return productDigits.join('');
    }

    // Assign the result of the extended product calculation to the main result variable.
    computedResult = calculateExtendedProduct(Math.abs(valueOne - 2), Math.abs(valueTwo - 2));
  }

  // Output the final computed result to the console.
  console.log(computedResult);
}

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));