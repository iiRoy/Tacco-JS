const MOD_VAL = Math.pow(10, 9) + 7; // A large prime number used for modulo operations

/**
 * Computes the factorial of a given number modulo MOD_VAL.
 * @param {number} inputNumber The number for which to calculate the factorial.
 * @returns {number} The factorial of inputNumber, modulo MOD_VAL.
 */
function computeFactorialMod(inputNumber) {
  let currentProduct = inputNumber; // Initialize the product with the number itself
  // Iterate from 1 up to (but not including) the input number
  for (let counter = 1; counter < inputNumber; counter++) {
    currentProduct = (currentProduct * counter) % MOD_VAL; // Multiply and apply modulo at each step
  }
  return currentProduct; // Return the final modular factorial
}

/**
 * Processes the input string to calculate a specific value based on two numbers.
 * @param {string} rawData The input string containing two space-separated numbers.
 * @returns {number} The calculated result based on the problem's logic.
 */
function processInput(rawData) {
  const parsedData = rawData.split(" "); // Split the input string into an array of strings
  const valA = Number(parsedData[0]); // Convert the first part to a numeric value
  const valB = Number(parsedData[1]); // Convert the second part to a numeric value

  // If the absolute difference between the two numbers is 2 or more, the result is 0
  if (Math.abs(valA - valB) >= 2) {
    return 0;
  }

  // If the two numbers are equal
  if (valA === valB) {
    // Calculate (factorial(valA) * factorial(valB) * 2) % MOD_VAL
    return (computeFactorialMod(valA) * computeFactorialMod(valB) * 2) % MOD_VAL;
  }

  // If the numbers differ by exactly 1 (since the previous condition handled >= 2)
  // Calculate (factorial(valA) * factorial(valB)) % MOD_VAL
  return (computeFactorialMod(valA) * computeFactorialMod(valB)) % MOD_VAL;
}

// Read input from standard input, process it, and print the result to standard output
console.log(processInput(require("fs").readFileSync("/dev/stdin", "utf8")));
