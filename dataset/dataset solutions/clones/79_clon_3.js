(
  function (sourceData) {
    // This self-executing function processes raw input from a data source.
    // It aims to calculate the factorial of a number provided in the input.

    // Step 1: Clean and prepare the raw string data.
    // The .trim() method removes whitespace from both ends of a string,
    // which is a robust way to handle potential leading/trailing newlines or spaces.
    const trimmedInputString = sourceData.trim();

    // Step 2: Convert the cleaned string into an integer.
    // Using parseInt with a radix (base 10) ensures explicit conversion behavior.
    const candidateNumericValue = parseInt(trimmedInputString, 10);

    let finalOutputMessage; // A variable to hold the result or an error message.

    // Step 3: Validate the converted numeric value.
    // Check if the conversion resulted in a valid number and if it's non-negative.
    // Factorial is traditionally defined for non-negative integers.
    if (isNaN(candidateNumericValue) || candidateNumericValue < 0) {
      // If the input is not a valid non-negative integer, log an error.
      console.error("Error: Input must be a non-negative whole number.");
      finalOutputMessage = "INVALID_INPUT_DETECTED"; // Set an error message for display.
    } else {
      // If the input is valid, proceed with the factorial computation.
      const calculatedProduct = computeProductSeries(candidateNumericValue);

      // Check if the factorial function itself returned an error (e.g., null for internal validation).
      if (calculatedProduct === null) {
        console.error("Internal computation error encountered.");
        finalOutputMessage = "COMPUTATION_ERROR";
      } else {
        // Format the successful result for output.
        finalOutputMessage = `Result of Factorial: ${calculatedProduct}`;
      }
    }

    // Step 4: Display the final outcome or error message to the standard output.
    console.log(finalOutputMessage);

  }
)(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard in asynchronously.


// This function recursively computes the factorial of a given integer.
// It is named 'computeProductSeries' to differentiate from standard 'factorial' naming.
function computeProductSeries(inputNumber) {
  // Extensive validation for the argument passed to this recursive function.
  // Although the main block validates, this ensures function robustness in isolation.
  if (!Number.isInteger(inputNumber) || inputNumber < 0) {
    // For invalid inputs, return null to indicate an error to the caller.
    return null;
  }

  // Base Case: The factorial of 0 or 1 is defined as 1.
  // This condition handles both cases efficiently.
  if (inputNumber < 2) { // Covers inputNumber = 0 and inputNumber = 1
    return 1;
  }

  // Intermediate Step: Prepare the argument for the next recursive call.
  // Storing (inputNumber - 1) in a variable makes the next step clearer.
  const decrementedValue = inputNumber - 1;

  // Recursive Step: Multiply the current number by the factorial of the decremented value.
  // This forms the core of the recursive computation.
  return inputNumber * computeProductSeries(decrementedValue);
}