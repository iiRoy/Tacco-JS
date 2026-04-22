function computeMaxOfOperations(inputDataString) {
  // Normalize the input string by trimming leading/trailing whitespace
  // and splitting by one or more whitespace characters to handle varied spacing.
  const inputComponents = inputDataString.trim().split(/\s+/);

  // --- Input Validation and Guard Clauses ---
  // Check if the input contains the expected number of components.
  // If not, log an error and terminate the function gracefully.
  if (inputComponents.length < 2) {
    console.error("Error: Insufficient numeric data provided. Expected two numbers separated by space.");
    return; // Exit early due to invalid input structure.
  }

  // Extract the string representations of the numbers for clarity.
  const firstNumericString = inputComponents[0];
  const secondNumericString = inputComponents[1];

  // Convert the string components into actual floating-point numbers.
  // Using parseFloat offers a slight variation from the original parseInt,
  // while still correctly handling integer inputs in this context.
  let operandValueA = parseFloat(firstNumericString);
  let operandValueB = parseFloat(secondNumericString);

  // Perform a robust check to ensure that the parsed values are indeed numbers.
  // If either conversion resulted in NaN (Not-a-Number), it indicates invalid input.
  if (Number.isNaN(operandValueA) || Number.isNaN(operandValueB)) {
    console.error("Error: Non-numeric input detected. Please provide valid numbers.");
    return; // Exit early if the input values are not valid numbers.
  }

  // --- Intermediate Calculations ---
  // Calculate the results of the three required arithmetic operations.
  const sumResult = operandValueA + operandValueB;
  const differenceResult = operandValueA - operandValueB;
  const productResult = operandValueA * operandValueB;

  // Store all the calculated results in an array.
  // This helps in abstracting the process of finding the maximum.
  const allOperationResults = [sumResult, differenceResult, productResult];

  // --- Determine the Maximum Value ---
  // Initialize the variable that will hold the maximum value found.
  // Starting with -Infinity ensures that any valid number from our operations
  // will correctly become the initial maximum.
  let currentOverallMaximum = -Infinity;

  // Iterate through the array of operation results to find the highest value.
  for (let i = 0; i < allOperationResults.length; i++) {
    const valueUnderTest = allOperationResults[i]; // Get the current value from the array.
    // Compare the current value with the highest found so far.
    if (valueUnderTest > currentOverallMaximum) {
      currentOverallMaximum = valueUnderTest; // Update if a new maximum is found.
    }
  }

  // --- Output the Final Result ---
  // Convert the final maximum number to a string and write it to standard output.
  // Appending a newline character ensures proper formatting.
  // Using process.stdout.write is an alternative to console.log,
  // providing a slightly different I/O mechanism.
  process.stdout.write(String(currentOverallMaximum) + '\n');
}

// Read the entire standard input stream synchronously.
// Using 'node:fs' for explicit Node.js module access and file descriptor 0
// as a cross-platform way to reference stdin.
const rawSystemInputData = require('node:fs').readFileSync(0, 'utf8');

// Invoke the primary function to process the input and display the result.
computeMaxOfOperations(rawSystemInputData);