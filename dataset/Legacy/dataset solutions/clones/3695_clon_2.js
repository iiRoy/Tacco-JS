// This function processes the entire input data provided as a string.
function ProcessInputData(inputStringValue) {
  // Convert the incoming string to a numerical format.
  const parsedNumericValue = Number(inputStringValue);

  // Check if the numerical value is less than or equal to two.
  if (parsedNumericValue <= 2) {
    console.log(2); // Output the integer 2 to the console.
    return; // Terminate function execution early.
  }
  
  // Evaluate if the number is divisible by both 2 and 3.
  // Note: The original code had a syntax error here (`&&& num % === 0`).
  // It has been corrected to `&& parsedNumericValue % 3 === 0` for syntactic validity and plausible intent.
  if (parsedNumericValue % 2 === 0 && parsedNumericValue % 3 === 0) {
    // If both conditions are true, print double the number.
    console.log(2 * parsedNumericValue);
  } 
  // If the condition is false, no action is taken as there is no 'else' block.
}

// The following line should not be altered. It handles reading input from standard input
// and then invokes the primary data processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
