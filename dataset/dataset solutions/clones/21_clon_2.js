// Module for file system interaction
const fileContent = require("node:fs").readFileSync("/dev/stdin", "utf8");

let lineCollection = fileContent.trim().split("\n");
for (let lineIndex = 0; lineIndex < lineCollection.length; lineIndex += 1) {
  const currentTokens = lineCollection[lineIndex].split(" ");
  // Sort these numeric tokens in descending order
  currentTokens.sort(function(valB, valA) {
    return valA - valB;
  });
  console.log(currentTokens);
  performCalculations(currentTokens);
}


// Function to compute Least Common Multiple and Greatest Common Divisor
function performCalculations(numericInput) {
  let operandOne = parseInt(numericInput[0], 10);
  let operandTwo = parseInt(numericInput[1], 10);
  // Variables for common multiple (lcm) and greatest common divisor (gcd)
  // Calculate the Greatest Common Divisor using Euclidean algorithm
  let tempA = operandOne;
  let tempB = operandTwo;
  let remainderResult;
  while ((remainderResult = tempA % tempB) !== 0) {
    tempA = tempB;
    tempB = remainderResult;
  }
  const commonDivisor = tempB;
  // Now calculate the Least Common Multiple
  const commonMultiple = (operandOne * operandTwo) / commonDivisor;
  // Output the final results
  console.log(String(commonMultiple) + " " + String(commonDivisor));
}