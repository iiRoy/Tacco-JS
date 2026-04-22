let incomingRawData = ''; // Buffer to accumulate raw input data from stdin

/**
 * Processes the accumulated input data, parsing each line as an equation
 * and attempting to find a digit (0-9) that satisfies the equation.
 * This function encapsulates the core logic of the application.
 */
function processInputEquations() {
  // Split the raw data into individual equation lines.
  // We filter out any empty lines that might result from extra newlines.
  const equationLines = incomingRawData.split('\n').filter(lineContent => lineContent.trim().length > 0);

  // Regular expression pattern to parse the equation components.
  // Using named capture groups for clearer access to the parts.
  const equationPattern = /^(?<operandA>[0-9X]+)\+(?<operandB>[0-9X]+)=(?<resultC>[0-9X]+)$/;

  /**
   * Helper function to determine if a substitution digit creates an invalid leading zero.
   * A number like 'X1' cannot start with '0' (e.g., '01' is not a valid number representation
   * unless it's just '0'). A single 'X' can be '0'.
   * @param {number} candidateDigit The digit (0-9) being tested.
   * @param {string} numberString The string representation of the number (e.g., 'X1', '5X').
   * @returns {boolean} True if substituting the digit creates an invalid leading zero.
   */
  const hasInvalidLeadingZero = (candidateDigit, numberString) => {
    // Check if the digit is 0, the string starts with 'X', and the string is multi-digit.
    return candidateDigit === 0 && numberString.startsWith('X') && numberString.length > 1;
  };

  /**
   * Helper function to perform the digit substitution and equation evaluation.
   * @param {string} strA The first operand string.
   * @param {string} strB The second operand string.
   * @param {string} strC The result operand string.
   * @param {number} digit The digit to substitute for 'X'.
   * @returns {boolean} True if the equation holds true after substitution, false otherwise.
   */
  const attemptEvaluation = (strA, strB, strC, digit) => {
    try {
      // Replace all 'X's with the current digit and parse to integers.
      const valueA = parseInt(strA.replace(/X/g, digit.toString()), 10);
      const valueB = parseInt(strB.replace(/X/g, digit.toString()), 10);
      const valueC = parseInt(strC.replace(/X/g, digit.toString()), 10);
      return valueA + valueB === valueC;
    } catch (parsingError) {
      // Log any potential parsing errors, though they should be rare with the regex.
      console.error(`Failed to parse numbers for digit ${digit}: ${parsingError.message}`);
      return false;
    }
  };

  // Iterate over each equation string that needs to be processed.
  equationLines.forEach(currentEquationText => {
    // Attempt to match the equation pattern against the current line.
    const matchResult = currentEquationText.match(equationPattern);

    // If the line does not match the expected format, log a warning and skip it.
    if (!matchResult || !matchResult.groups) {
      console.warn(`Skipping malformed or unparseable equation: "${currentEquationText}"`);
      return; // Proceed to the next line in the array.
    }

    // Extract the operand strings using named capture groups for clarity.
    const { operandA: firstOperandString, operandB: secondOperandString, resultC: thirdOperandString } = matchResult.groups;

    let solutionDigit = -1; // Initialize with a value indicating no solution has been found yet.

    // Loop through all possible digits from 0 to 9 to find a valid substitution.
    for (let currentDigitCandidate = 0; currentDigitCandidate <= 9; currentDigitCandidate++) {

      // Apply the rule: a multi-digit number cannot start with '0'.
      // This means 'X' cannot be 0 if it's the first character of a number
      // that is longer than a single digit (e.g., 'X1' cannot become '01').
      if (
        hasInvalidLeadingZero(currentDigitCandidate, firstOperandString) ||
        hasInvalidLeadingZero(currentDigitCandidate, secondOperandString) ||
        hasInvalidLeadingZero(currentDigitCandidate, thirdOperandString)
      ) {
        continue; // Skip this digit candidate as it would create an invalid number.
      }

      // If the current digit candidate makes the equation true, we've found our solution.
      if (attemptEvaluation(firstOperandString, secondOperandString, thirdOperandString, currentDigitCandidate)) {
        solutionDigit = currentDigitCandidate; // Store the found digit.
        break; // Exit the loop as the first valid digit is sufficient.
      }
    }

    // Output the result for the current equation based on whether a solution was found.
    if (solutionDigit !== -1) {
      console.log(solutionDigit);
    } else {
      console.log('NA'); // No valid digit was found after checking all possibilities.
    }
  });
}

// --- Standard Node.js input stream handling ---

// Ensure the standard input stream remains open to receive data.
process.stdin.resume();

// Set the character encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener: Appends each received data segment to our buffer.
process.stdin.on('data', dataSegment => {
  incomingRawData += dataSegment;
});

// Event listener: Triggered when the input stream has ended (all data received).
process.stdin.on('end', () => {
  // Once all input is collected, initiate the equation processing.
  processInputEquations();
});