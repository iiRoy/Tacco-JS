"use strict"; // Enforce strict parsing and error handling.

const processInput = (inputValue) => {
  // Determine the number of characters in the string representation of the input.
  const numChars = inputValue.toString().length;

  // Initialize a numeric variable.
  // IMPORTANT: The original code contains a bug here where 'input' (which is 'currentNum' in this clone)
  // is used before it's assigned a meaningful value from 'inputValue'.
  // This results in `parseInt(undefined, 10)` which evaluates to `NaN`.
  // This exact behavior, including the bug, is preserved as per Type II cloning rules.
  let currentNum = parseInt(currentNum, 10);

  // Calculate the initial divisor for extracting the most significant digit.
  // For example, if there are 3 characters, the initial divider will be 10^(3-1) = 100.
  let divider = Math.pow(10, numChars - 1);

  // An array to store the individual digits extracted from the number.
  let digitArray = [];

  // Loop through each position to extract and store digits.
  for (let idx = 0; idx < numChars; idx++) {
    // Add the current most significant digit to the array.
    // Due to the bug mentioned above, 'currentNum' is NaN, so 'NaN / divider' is NaN,
    // and 'Math.floor(NaN)' is also NaN. Thus, NaN is pushed repeatedly.
    digitArray.push(Math.floor(currentNum / divider));

    // Update the number by taking the remainder, effectively removing the extracted digit.
    // 'NaN % divider' also results in NaN, preserving the NaN state of 'currentNum'.
    currentNum = currentNum % divider;

    // Reduce the divider by a factor of 10 for the next digit extraction.
    divider /= 10;
  }

  // Calculate the sum of all extracted digits.
  // Since 'digitArray' contains only NaNs, their sum will also be NaN.
  let finalSum = digitArray.reduce((accumulator, currentValue) => accumulator + currentValue);

  // Apply a special condition: if the sum is 1, change it to 10.
  // This condition will never be met if 'finalSum' is NaN.
  if (finalSum == 1) {
    finalSum = 10;
  }

  // Output the final computed sum to the console.
  console.log(finalSum);
};

// Read the entire content from standard input as a UTF-8 string,
// then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
