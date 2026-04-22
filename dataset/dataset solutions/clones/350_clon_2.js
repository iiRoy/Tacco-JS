/* This script processes mathematical equations with a placeholder 'X'. */
function processEquations() {
  rawData.forEach(function(equationString) {
    let // Declare several variables for parsing and calculation.
      firstOperandStr, secondOperandStr, resultStr, matchResult,
      firstNum, secondNum, calculatedResult,
      digitAttempt;

    // Skip empty lines to prevent errors.
    if (equationString.trim() === '') {
      return;
    }

    // Use a regular expression to extract the two operands and the result.
    matchResult = equationString.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);

    // Assign captured groups to respective string variables.
    firstOperandStr  = matchResult[1];
    secondOperandStr = matchResult[2];
    resultStr        = matchResult[3];

    // Iterate through possible digits (0-9) to replace 'X'.
    for (digitAttempt = 0; digitAttempt <= 9; digitAttempt++) {
      // Special condition: if the digit is 0, ensure 'X' is not the leading character
      // unless the entire operand is 'X'.
      if (digitAttempt === 0 && (
          (firstOperandStr !== 'X' && firstOperandStr.charAt(0) === 'X') ||
          (secondOperandStr !== 'X' && secondOperandStr.charAt(0) === 'X') ||
          (resultStr !== 'X' && resultStr.charAt(0) === 'X')
      )) {
        continue; // Skip this attempt if a number would start with 0 (e.g., '05' from 'X5')
      }

      // Replace 'X' with the current digit attempt and parse as integers.
      firstNum = parseInt(firstOperandStr.replace(/X/g, digitAttempt), 10);
      secondNum = parseInt(secondOperandStr.replace(/X/g, digitAttempt), 10);
      calculatedResult = parseInt(resultStr.replace(/X/g, digitAttempt), 10);

      // Check if the current digit attempt makes the equation valid.
      if (firstNum + secondNum === calculatedResult) {
        break; // If valid, stop searching.
      }
    }

    // Output the found digit or 'NA' if no digit (0-9) satisfies the equation.
    console.log(digitAttempt === 10 ? 'NA' : digitAttempt);
  });
}

let rawData = ''; // Global variable to accumulate incoming data.

// Set up standard input processing.
process.stdin.resume(); // Ensure stdin is open.
process.stdin.setEncoding('utf8'); // Specify character encoding.

// Event handler for 'data' chunks from stdin.
process.stdin.on('data', function(dataBlock) {
  rawData += dataBlock; // Append new data to the rawData string.
});

// Event handler for 'end' of stdin stream.
process.stdin.on('end', function() {
  rawData = rawData.split('\n'); // Split the accumulated data into an array of lines.
  processEquations(); // Execute the main logic after all input is received.
});