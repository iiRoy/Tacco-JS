// This file computes a specific average.

/**
 * Computes a special kind of average for two numbers.
 * @param {number} firstNum  - The initial numeric value.
 * @param {number} secondNum - The subsequent numeric value.
 */
function calculateAverage(firstNum, secondNum) {
  // Calculate the total of the two input numbers.
  let sumOfNumbers = firstNum + secondNum;

  // Check if the sum is an even number.
  if (sumOfNumbers % 2 === 0) {
    // If even, compute half of the sum.
    let resultValue = sumOfNumbers / 2;
    console.log(resultValue); // Output the computed value.
  } else {
    // If odd, indicate that the operation is not possible under these rules.
    console.log('IMPOSSIBLE');
  }
}

// Retrieve the first command-line argument and convert it to a number.
const inputOne = Number(process.argv[2]);

// Retrieve the second command-line argument and convert it to a number.
const inputTwo = Number(process.argv[3]);

// Execute the average calculation function with the parsed inputs.
calculateAverage(inputOne, inputTwo);
