'use strict';

const outputMessage = (textToDisplay) => console.log(textToDisplay);

// This function processes the entire input data string.
function processInputString(rawInputString) {
  // The input string is split into lines.
  const inputLines = rawInputString.split("\n");
  
  // The first line is taken, split by space, and the first part is parsed as an integer.
  const firstLineContent = inputLines[0];
  let targetNumber = parseInt(firstLineContent.split(" ")[0], 10);

  const SEVEN_DIGIT_VALUE = 7;
  let containsDigitSeven = false;

  // Loop through the digits of the number from right to left.
  // The loop continues as long as there are digits left to check (number > 0).
  // This ensures all digits, including single-digit numbers, are evaluated.
  while (targetNumber > 0) {
    const currentDigit = targetNumber % 10; // Get the last digit
    
    if (currentDigit === SEVEN_DIGIT_VALUE) {
      containsDigitSeven = true;
      break; // If 7 is found, no need to check further digits.
    }
    
    // Remove the last digit by performing integer division.
    targetNumber = Math.floor(targetNumber / 10);
  }

  // Determine the final output message based on whether the digit 7 was found.
  const finalResult = containsDigitSeven ? 'Yes' : 'No';
  outputMessage(finalResult);
}

// *この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
