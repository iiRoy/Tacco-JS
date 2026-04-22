(function(rawInputData) {
  // Define a constant for the maximum allowed length of the result string.
  // This threshold prevents excessively long numbers from being processed.
  const MAX_RESULT_LENGTH_THRESHOLD = 80;

  /**
   * Helper function to convert a numeric string into an array of its digits,
   * with the least significant digit at the first index (reversed order).
   * This facilitates easier arithmetic operations from right to left.
   *
   * @param {string} numberString - The input string representing a number.
   * @returns {number[]} An array of digits in reverse order.
   */
  const convertStringToReversedDigitArray = (numberString) => {
    // Basic validation for the input string to ensure it contains only digits.
    if (!/^\d+$/.test(numberString)) {
      console.error(`Warning: Invalid number string encountered: '${numberString}'. Treating as '0'.`);
      return [0]; // Default to [0] for invalid input, or throw an error.
    }
    return numberString.split('').map(Number).reverse();
  };

  /**
   * Performs addition of two large numbers represented as strings.
   * This function handles numbers that exceed JavaScript's standard number precision.
   *
   * @param {string} firstOperandString - The first number as a string.
   * @param {string} secondOperandString - The second number as a string.
   * @returns {string} The sum of the two numbers as a string.
   */
  const performStringAddition = (firstOperandString, secondOperandString) => {
    // Convert input strings to arrays of digits, reversed for easier processing.
    const digitsOfFirst = convertStringToReversedDigitArray(firstOperandString);
    const digitsOfSecond = convertStringToReversedDigitArray(secondOperandString);

    let resultingDigits = []; // Array to store the digits of the sum.
    let currentCarry = 0;     // Variable to manage carry-overs during addition.

    // Determine the maximum length among the two operand digit arrays.
    // This ensures we iterate through all significant digits.
    const maxIterationLength = Math.max(digitsOfFirst.length, digitsOfSecond.length);

    // Loop through the digits from least significant to most significant.
    for (let currentDigitPosition = 0; currentDigitPosition < maxIterationLength; currentDigitPosition++) {
      // Retrieve digits from both operands, defaulting to 0 if one number is shorter.
      const digitVal1 = digitsOfFirst[currentDigitPosition] || 0;
      const digitVal2 = digitsOfSecond[currentDigitPosition] || 0;

      // Calculate the sum of current digits plus any carry from the previous position.
      const sumAtPosition = digitVal1 + digitVal2 + currentCarry;

      // The digit for the result at the current position is the sum modulo 10.
      resultingDigits.push(sumAtPosition % 10);

      // The carry for the next position is the floor division of the sum by 10.
      currentCarry = Math.floor(sumAtPosition / 10);
    }

    // If there's a remaining carry after processing all digits, append it to the result.
    if (currentCarry > 0) {
      resultingDigits.push(currentCarry);
    }

    // Reverse the resulting digits array and join them to form the final sum string.
    return resultingDigits.reverse().join('');
  };

  // --- Main execution block ---

  // Sanitize the raw input data: trim leading/trailing whitespace and split into individual lines.
  // Using trim() is a robust way to handle various whitespace including newlines.
  const inputLines = rawInputData.trim().split('\n');

  // Check if there's any actual content to process after trimming and splitting.
  if (inputLines.length === 0 || (inputLines.length === 1 && inputLines[0].length === 0)) {
    console.error("Error: No valid input data provided.");
    return; // Exit if input is empty.
  }

  // The very first line might indicate the number of test cases, but it's often unused
  // in competitive programming problems where input ends with EOF or specific sentinel.
  // For this clone, we'll assume it's extraneous and remove it if present.
  // If `inputLines` has at least one element, remove the first one.
  if (inputLines.length > 0) {
    inputLines.shift(); // This line is deleted as it's often non-essential for the core logic.
  }


  // Process pairs of numbers from the input lines until no more pairs are available.
  // We ensure there are at least two lines remaining to form a valid pair.
  while (inputLines.length >= 2) {
    const firstNumString = inputLines.shift();  // Get the first number of the pair.
    const secondNumString = inputLines.shift(); // Get the second number of the pair.

    // Perform the addition using our custom function.
    const calculatedSum = performStringAddition(firstNumString, secondNumString);

    // Implement a guard clause: check if the calculated sum exceeds the allowed length.
    if (calculatedSum.length > MAX_RESULT_LENGTH_THRESHOLD) {
      // Instead of just 'overflow', provide a more descriptive message.
      process.stderr.write(`Warning: Result for ('${firstNumString}' + '${secondNumString}') ` +
                           `exceeds ${MAX_RESULT_LENGTH_THRESHOLD} digits. Outputting 'overflow'.\n`);
      process.stdout.write('overflow\n'); // Output 'overflow' and proceed to the next pair.
      continue;
    }

    // Output the calculated sum to standard output, followed by a newline.
    // Using process.stdout.write for explicit control over output.
    process.stdout.write(calculatedSum + '\n');
  }

  // Optional: Add a final message if there's an odd number of lines remaining.
  if (inputLines.length === 1) {
    process.stderr.write(`Notice: Discarding an unpaired line at the end of input: '${inputLines[0]}'.\n`);
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.