"use strict";

// This function processes a string of four digits to find an arithmetic expression
// that evaluates to 7 using three binary operators (+ or -).
function processInput(rawData) {
  // Convert the input string into an array of individual numeric digits.
  // The double tilde (~~) is used for a quick integer conversion.
  let digitArray = rawData.split("").map(digitChar => ~~digitChar);

  // Define all eight possible combinations of three binary operators.
  // Each inner array represents the operators for the three positions between the four digits.
  const operationCombinations = [
    ["+", "+", "+"], // Example: d1 + d2 + d3 + d4
    ["+", "+", "-"], // Example: d1 + d2 + d3 - d4
    ["+", "-", "-"], // Example: d1 + d2 - d3 - d4
    ["-", "-", "+"], // Example: d1 - d2 - d3 + d4
    ["-", "+", "-"], // Example: d1 - d2 + d3 - d4
    ["+", "-", "+"], // Example: d1 + d2 - d3 + d4
    ["-", "+", "+"], // Example: d1 - d2 + d3 + d4
    ["-", "-", "-"]  // Example: d1 - d2 - d3 - d4
  ];

  // Iterate through each predefined combination of operators.
  for (let idx = 0; idx < operationCombinations.length; idx++) {
    // Initialize the running total with the first digit from the input.
    let currentSum = digitArray[0];

    // Apply the first operator from the current combination.
    // If the operator is '+', add the second digit; otherwise, subtract it.
    currentSum += operationCombinations[idx][0] === "+" ? digitArray[1] : -1 * digitArray[1];

    // Apply the second operator.
    currentSum += operationCombinations[idx][1] === "+" ? digitArray[2] : -1 * digitArray[2];

    // Apply the third operator.
    currentSum += operationCombinations[idx][2] === "+" ? digitArray[3] : -1 * digitArray[3];

    // Check if the final calculated sum for this combination equals 7.
    if (currentSum === 7) {
      // If the sum is 7, construct and print the full arithmetic expression.
      console.log(
        digitArray[0] +
          operationCombinations[idx][0] +
          digitArray[1] +
          operationCombinations[idx][1] +
          digitArray[2] +
          operationCombinations[idx][2] +
          digitArray[3] +
          "=7"
      );
      // Once a solution is found, terminate the function.
      return false;
    }
  }
}

// Read the input from standard input, assuming it's a single line of digits.
// The 'utf8' encoding is specified for text input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
