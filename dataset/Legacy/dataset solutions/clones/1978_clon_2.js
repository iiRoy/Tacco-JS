'use strict';

// A utility function to print messages to the console.
const displayOutput = (textToDisplay) => console.log(textToDisplay);

/**
 * Processes the given input data to determine if it contains the digit 7.
 * @param {string} rawInputData - The entire input as a single string.
 */
function AnalyzeInput(rawInputData) {
  // Split the input string by newline characters into an array of lines.
  // The first line of input is at rawInputData[0], the second at rawInputData[1], and so on.
  const inputLines = rawInputData.split("\n");

  // Extract the first number from the first line of input.
  // It's assumed to be the first space-separated token on the first line.
  let currentValue = parseInt(inputLines[0].split(" ")[0], 10);

  // A flag to indicate if the digit 7 has been found.
  let foundSevenDigit = false;

  // Loop as long as the number is greater than 1 (to check its digits).
  while (currentValue > 0) {
    // Get the last digit of the current number.
    const digitValue = currentValue % 10;

    // Check if the last digit is 7.
    if (digitValue === 7) {
      foundSevenDigit = true; // Set the flag to true.
      break; // Exit the loop early as 7 has been found.
    }

    // Remove the last digit by integer division.
    currentValue = Math.floor(currentValue / 10);
  }

  // Output the result based on whether a 7 was found.
  if (foundSevenDigit) {
    displayOutput('Yes');
  } else {
    displayOutput('No');
  }
}

// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
AnalyzeInput(require("fs").readFileSync("/dev/stdin", "utf8"));
