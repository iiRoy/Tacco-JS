const fileSystemModule = require("fs"); // Import the Node.js file system module for file operations

let inputLineContent = fileSystemModule.readFileSync("/dev/stdin"); // Read the entire content from standard input

const upperBound = Number(inputLineContent); // Convert the read input string into a numerical upper bound

let finalSum = 0; // Initialize a variable to accumulate the total sum

// Loop through each possible divisor from 1 up to the specified upper bound
for (let currentDivisor = 1; currentDivisor <= upperBound; currentDivisor++) {
  // Calculate the integer quotient when the upper bound is divided by the current divisor
  const quotientValue = Math.floor(upperBound / currentDivisor);

  // Add the term (currentDivisor * quotientValue * (quotientValue + 1)) / 2 to the running total
  // This formula is equivalent to currentDivisor * (1 + 2 + ... + quotientValue)
  finalSum += (currentDivisor * quotientValue * (quotientValue + 1)) / 2;
}

console.log(finalSum); // Print the final calculated sum to the console
