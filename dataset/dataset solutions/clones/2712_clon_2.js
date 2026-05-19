'use strict'; // Activate strict mode for enhanced error checking and cleaner code.

(function(initialInputString) {
  // This function processes an input string, typically read from a file or standard input.

  // First, clean the input string:
  // 1. Remove leading/trailing whitespace using .trim().
  // 2. Split the string into an array of substrings based on one or more whitespace characters using .split(/\s+/).
  // 3. Convert each substring in the array to a number using .map().
  //    The `Number()` constructor is used for explicit type conversion.
  let numericalDataArray = initialInputString.trim().split(/\s+/).map(function(strValue) {
    return Number(strValue);
  });

  // Extract specific numerical values from the processed array into named constants.
  // These constants represent key parameters for the subsequent logic.
  const mainParameter = numericalDataArray[0]; // Corresponds to 'K' in the original problem context.
  const coordinateValueX = numericalDataArray[1]; // Corresponds to 'X'.
  const coordinateValueY = numericalDataArray[2]; // Corresponds to 'Y'.

  // Evaluate a conditional expression based on the extracted parameters.
  // The condition checks if 'mainParameter' is an even number AND
  // if the sum of 'coordinateValueX' and 'coordinateValueY' is an odd number.
  if ((mainParameter % 2 === 0) && ((coordinateValueX + coordinateValueY) % 2 === 1)) {
    // If the condition is met, print a specific error code or result to the console.
    console.log(-1);
    // Immediately exit the function, preventing any further execution within this scope.
    return;
  }

  // If the condition in the 'if' statement is not met, the function simply concludes
  // without performing any additional actions or producing further output.

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // This immediately invoked function expression (IIFE)
// reads the entire content of standard input ('/dev/stdin') as a UTF-8 string
// and passes it as the 'initialInputString' argument to the function.
