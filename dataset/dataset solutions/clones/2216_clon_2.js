'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Processes the input data to generate and print a specific repeated string.
 * This function takes an array of strings, parses the first line for two numbers,
 * then constructs two different repeated strings based on these numbers,
 * and finally prints one of them based on a comparison.
 * @param {string[]} dataLines - An array of strings, where the first element is expected to contain two space-separated integer values.
 */
const processInput = (dataLines) => {
  // Extract the first line of input, split it by spaces, and convert each part to an integer.
  // The radix 10 is explicitly provided for parseInt for best practice.
  const numericValues = dataLines[0].split(' ').map(itemStr => parseInt(itemStr, 10));

  // Assign the two parsed numbers to distinct, descriptive variables.
  const firstNum = numericValues[0];
  const secondNum = numericValues[1];

  // Initialize two empty string variables that will be built up in subsequent loops.
  let firstRepeatedString = '';
  let secondRepeatedString = '';

  // Loop 'secondNum' times. In each iteration, append the 'firstNum' (converted to string)
  // to the 'firstRepeatedString'.
  for (let idxA = 0; idxA < secondNum; idxA++) {
    firstRepeatedString += firstNum;
  }

  // Loop 'firstNum' times. In each iteration, append the 'secondNum' (converted to string)
  // to the 'secondRepeatedString'.
  for (let idxB = 0; idxB < firstNum; idxB++) {
    secondRepeatedString += secondNum;
  }

  // Use a ternary operator to decide which of the two constructed strings to print to the console.
  // If 'firstNum' is strictly greater than 'secondNum', 'secondRepeatedString' is printed.
  // Otherwise, 'firstRepeatedString' is printed.
  console.log(firstNum > secondNum ? secondRepeatedString : firstRepeatedString);
};

// This is the entry point for the script. It reads the entire content of standard input,
// decodes it as UTF-8, splits it into an array of lines, and then passes this array
// to the 'processInput' function for further processing.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
