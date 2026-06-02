function solveEquations() {
  // Iterate over each line of input, which represents an equation to solve.
  rawData.forEach(function(equationString) {
    // Declare variables to hold parts of the equation and intermediate results.
    var firstOperandStr, secondOperandStr, resultStr, // Strings representing the operands and result
        matchResult,                                 // Result of the regex match
        firstNum, secondNum, targetNum,              // Numeric values after 'X' replacement
        digitCandidate;                              // The digit (0-9) being tested for 'X'

    // If the line is empty or just whitespace, skip it.
    if (equationString.trim() === '') {
      return;
    }

    // Use a regular expression to parse the equation string into its components.
    // The regex captures three groups: the first operand, the second operand, and the result.
    matchResult = equationString.match(/([0-9X]+)\+([0-9X]+)\=([0-9X]+)/);

    // Extract the captured parts from the match result.
    firstOperandStr = matchResult[1];
    secondOperandStr = matchResult[2];
    resultStr = matchResult[3];

    // Loop through possible digits (0-9) to substitute for 'X'.
    for (digitCandidate = 0; digitCandidate <= 9; digitCandidate++) {
      // Special handling for digit 0:
      // If the current digit candidate is 0, and any of the operands/result
      // starts with 'X' but is not just 'X' (e.g., "X1" instead of "X"),
      // then substituting 0 would create an invalid number with a leading zero (e.g., "01").
      // In such cases, skip this digit candidate and continue to the next.
      if (digitCandidate === 0 && (
          (firstOperandStr !== 'X' && firstOperandStr.charAt(0) === 'X') ||
          (secondOperandStr !== 'X' && secondOperandStr.charAt(0) === 'X') ||
          (resultStr !== 'X' && resultStr.charAt(0) === 'X')
      )) {
        continue; // Move to the next digit candidate
      }

      // Replace all occurrences of 'X' in the operand/result strings with the current digit candidate.
      // Then, convert these modified strings to integers.
      firstNum = parseInt(firstOperandStr.replace(/X/g, digitCandidate), 10);
      secondNum = parseInt(secondOperandStr.replace(/X/g, digitCandidate), 10);
      targetNum = parseInt(resultStr.replace(/X/g, digitCandidate), 10);

      // Check if the equation holds true with the current digit substitution.
      if (firstNum + secondNum === targetNum) {
        break; // If a solution is found, exit the loop.
      }
    }

    // After the loop, if digitCandidate is 10, it means no solution was found (loop completed without breaking).
    // Otherwise, digitCandidate holds the digit that made the equation true.
    console.log(digitCandidate === 10 ? 'NA' : digitCandidate);
  });
}

// Global variable to accumulate input from stdin.
var rawData = '';

// Set up standard input processing.
process.stdin.resume(); // Keep the process alive while waiting for input.
process.stdin.setEncoding('utf8'); // Specify the character encoding for input.

// Event listener for incoming data chunks.
process.stdin.on('data', function(incomingChunk) {
  rawData += incomingChunk; // Append each chunk of data to the rawData string.
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Once all input is received, split the rawData into an array of lines.
  rawData = rawData.split('\n');
  // Call the main function to process the equations.
  solveEquations();
});
