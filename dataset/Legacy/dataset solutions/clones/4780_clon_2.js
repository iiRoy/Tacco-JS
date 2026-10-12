function calculateCombinations(dataString) {
  // Split the input string by space to get individual numeric parts.
  let parts = dataString.split(' ');

  // Parse the first part as the maximum allowed value (K).
  const maxVal = parseInt(parts[0], 10);

  // Parse the second part as the target sum (S).
  const targetSum = parseInt(parts[1], 10);

  // Initialize a counter for valid combinations.
  let count = 0;

  // Outer loop iterates for the first number from 0 up to maxVal (inclusive).
  for (let firstNum = 0; firstNum <= maxVal; firstNum++) {
    // Inner loop iterates for the second number from 0 up to maxVal (inclusive).
    for (let secondNum = 0; secondNum <= maxVal; secondNum++) {
      // Calculate the required third number to reach the target sum.
      const thirdNum = targetSum - (firstNum + secondNum);

      // Check if the calculated third number is within the valid range [0, maxVal].
      if (thirdNum >= 0 && thirdNum <= maxVal) {
        // If it is, increment the combination counter.
        count++;
      }
    }
  }

  // Output the total number of valid combinations to the console.
  console.log(count);
}

// Read input from standard input and pass it to the main function.
calculateCombinations(require('fs').readFileSync('/dev/stdin', 'utf8'));
