// This JavaScript module computes a specific numerical result
// based on three integer inputs provided via standard input.
console.log(
  (
    (inputDataString) => { // An immediately invoked function expression (IIFE) is used here.
      // The input string is expected to contain three space-separated integers.
      // These are parsed and assigned to distinct variables.
      const [firstNum, secondNum, thirdNum] = inputDataString
        .trim() // Remove leading/trailing whitespace.
        .split(' ') // Split the string by spaces into an array of string numbers.
        .map(currentVal => currentVal | 0); // Convert each string number to an integer using bitwise OR.

      // The core calculation logic.
      // It involves a conditional multiplier (2 or 1) based on 'thirdNum'.
      // The final result is formatted as a string.
      return `${(thirdNum ? 2 : 1) * (firstNum - thirdNum) / firstNum / firstNum * (secondNum - 1)}`;
    }
  )(
    require('fs').readFileSync('/dev/stdin', 'utf8') // Read the entire content of standard input as a UTF-8 string.
  )
);
