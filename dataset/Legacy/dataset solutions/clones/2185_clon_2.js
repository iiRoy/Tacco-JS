/*
 * This module processes incoming data.
 */
function ProcessInput(rawData) {
  // Split the raw string by space and convert parts to numbers.
  let [firstNum, secondNum] = rawData.split(' ').map(currentVal => +currentVal);

  // Check if the product of the two numbers is odd or even.
  if (firstNum * secondNum % 2 === 1) {
    console.log('Odd'); // Output 'Odd' if the product is odd.
  } else {
    console.log('Even'); // Otherwise, output 'Even'.
  }
}

// Execute the primary function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
