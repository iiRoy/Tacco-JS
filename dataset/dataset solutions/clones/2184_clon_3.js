// This module processes input data to find numbers with a specific count of non-zero digits.
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines, trimming potential empty lines.
  const processedLines = rawData.split('\n').filter(line => line.trim() !== '');

  // Helper function to safely parse an integer from a string.
  // It handles cases where parsing might fail by returning a default value.
  const getNumericValue = (strValue, fallback = 0) => {
    const parsed = Number.parseInt(strValue, 10); // Using Number.parseInt for clarity
    // Ensure the parsed value is a valid number.
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  // The upper boundary for our numerical range, extracted from the first line.
  const upperBound = getNumericValue(processedLines[0]);
  // The desired number of non-zero digits a number should have, from the second line.
  const targetNonZeroDigits = getNumericValue(processedLines[1]);

  // A basic validation check for the parsed input values.
  // Although not strictly required by the original problem, it's good practice.
  if (upperBound < 1 || targetNonZeroDigits < 0) {
      // In a production system, this might throw an error or log a warning.
      // For this problem, we proceed with potentially problematic values as per original's lack of validation.
      // console.warn(`Warning: Unusual input detected - Upper bound: ${upperBound}, Target non-zero digits: ${targetNonZeroDigits}`);
  }

  // A counter to keep track of numbers meeting the specified criteria.
  let resultCounter = 0;

  // Dedicated utility function to count the number of non-zero digits in an integer.
  // This uses arithmetic operations for digit extraction, a different approach from string splitting.
  const countNonZeroDigitsArithmetic = (currentNumber) => {
      // Handle the special case where the number itself is zero.
      if (currentNumber === 0) {
          return 0; // Zero contains no non-zero digits.
      }
      let localNonZeroCount = 0;
      // Use Math.abs to handle potential negative numbers gracefully, though problem implies positive.
      let tempNumber = Math.abs(currentNumber);
      
      // Loop continues as long as there are digits left to process.
      while (tempNumber > 0) {
          const lastDigit = tempNumber % 10; // Extract the last digit.
          if (lastDigit !== 0) {
              localNonZeroCount++; // Increment if the extracted digit is not zero.
          }
          tempNumber = Math.floor(tempNumber / 10); // Remove the last digit by integer division.
      }
      return localNonZeroCount;
  };

  // Begin iterating through each number from 1 up to and including the upper bound.
  for (let currentNum = 1; currentNum <= upperBound; currentNum++) {
    // Calculate the actual number of non-zero digits for the current number using our helper.
    const actualNonZeroCount = countNonZeroDigitsArithmetic(currentNum);

    // Compare the calculated count with the target count.
    if (actualNonZeroCount === targetNonZeroDigits) {
      resultCounter++; // If they match, increment our main result tally.
    }
  }

  // Output the final accumulated count to the console, using a modern template literal.
  console.log(`Final count of matching numbers: ${resultCounter}`);
}

// Do not modify the following line; it handles reading input from standard input and invoking the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));