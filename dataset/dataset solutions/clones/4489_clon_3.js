function ProcessInputData(rawInputString) {
  /*
   * This module processes a string containing space-separated numerical values.
   * It aims to sum the first three identified numbers and then subtract the
   * overall maximum value found across all valid numbers in the input.
   * Error handling and robust parsing are integrated.
   */

  // Validate the initial input string to ensure it's a non-empty string.
  if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    // Log an error and terminate if the input is not a valid string or is empty.
    console.error("Input provided is either not a string or is empty. Cannot proceed.");
    return;
  }

  // Split the input string into individual components based on spaces.
  const stringTokens = rawInputString.split(' ');
  
  // Array to store successfully parsed numerical values.
  const parsedNumericValues = [];

  // Iterate through each string token to parse it into a number.
  // This loop also identifies the global maximum value among all parsed numbers.
  let overallMaximum = -Infinity; // Initialize with the lowest possible value to ensure any number becomes the max.

  for (let idx = 0; idx < stringTokens.length; idx++) {
    const token = stringTokens[idx];
    // Attempt to convert the token to a number.
    const currentNumber = Number(token);

    // Check if the conversion resulted in a valid number.
    if (isNaN(currentNumber)) {
      // Log a warning for non-numeric tokens and skip them,
      // as they cannot be used in numerical calculations.
      console.warn(`Encountered non-numeric token '${token}' at index ${idx}. Skipping this value.`);
      continue; // Move to the next token in the input.
    }

    // Add the successfully parsed number to our collection.
    parsedNumericValues.push(currentNumber);

    // Update the overall maximum if the current number is greater.
    if (currentNumber > overallMaximum) {
      overallMaximum = currentNumber;
    }
  }

  // Guard clause: Check if we have enough numbers for the core logic.
  // The original code implicitly assumes at least 3 numbers for `a`, `b`, `c`.
  // If fewer than three numbers are available, the sum of `a + b + c`
  // would involve `undefined` values, leading to `NaN` in JavaScript.
  // To mimic this original behavior, we print NaN directly in this scenario.
  if (parsedNumericValues.length < 3) {
    console.log(NaN);
    return;
  }

  // Calculate the sum of the first three numerical values.
  // This directly corresponds to `a + b + c` from the original code's logic.
  const sumOfFirstThree = parsedNumericValues[0] + parsedNumericValues[1] + parsedNumericValues[2];

  // The final calculation: sum of first three numbers minus the overall maximum
  // value found across all valid numbers in the input.
  const finalComputedResult = sumOfFirstThree - overallMaximum;

  // Output the final result to the console.
  console.log(finalComputedResult);
}

// Helper function to abstract away the file system interaction and script execution context.
function ExecuteFromStandardInput() {
  // Utilize Node.js's built-in 'fs' module to read content from /dev/stdin.
  // The 'utf8' encoding ensures proper character interpretation for text input.
  const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
  
  // Invoke the primary data processing function with the fetched content.
  ProcessInputData(standardInputContent);
}

// Initiate the execution flow of the script by calling the wrapper function.
ExecuteFromStandardInput();