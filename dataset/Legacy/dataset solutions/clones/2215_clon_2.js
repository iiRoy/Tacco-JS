'use strict';

/*
 * This function processes a given string input to perform a specific operation.
 * It determines which of two parsed numbers is smaller and repeats it.
 */
function ProcessInput(rawData) {
  // Remove leading/trailing whitespace and split the string by spaces.
  let processedData = rawData.trim().split(' ');

  // Parse the first element as an integer.
  const firstNum = parseInt(processedData[0], 10); // Explicit radix for safety.
  // Parse the second element as an integer.
  const secondNum = parseInt(processedData[1], 10);

  // Initialize an empty string to build the final output.
  let resultString = '';

  // Compare the two numbers to decide the repetition logic.
  if (firstNum < secondNum) {
    // If the first number is smaller, repeat it 'secondNum' times.
    for (let idx = 0; idx < secondNum; ++idx) {
      resultString += `${firstNum}`; // Append the string representation of firstNum.
    }
  } else {
    // Otherwise (if firstNum >= secondNum), repeat secondNum 'firstNum' times.
    for (let idx = 0; idx < firstNum; ++idx) {
      resultString += `${secondNum}`; // Append the string representation of secondNum.
    }
  }

  // Output the final constructed string to the console.
  console.log(resultString);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
