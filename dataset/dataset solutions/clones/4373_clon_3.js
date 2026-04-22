// This module is designed to process a string containing numerical data,
// performing a specific arithmetic operation based on the input values.
// Its primary goal is to compute a non-negative difference between two numbers.
function processNumericalData(inputStringContent) {
  // Begin by validating the integrity of the provided input string.
  // We ensure it's a non-empty string before proceeding with any parsing.
  if (typeof inputStringContent !== 'string' || inputStringContent.trim().length === 0) {
    // If the input is unsuitable, log an error and terminate this execution path.
    // In a more complex system, this might throw an exception or return a specific error code.
    console.error("Operational Fault: The input data provided is either null, not a string, or completely empty.");
    return;
  }

  // Split the cleaned input string into individual components based on whitespace.
  // Using a regular expression for splitting handles multiple spaces and other whitespace characters robustly.
  const textualParts = inputStringContent.trim().split(/\s+/);

  // A crucial check: ensure we have at least two numerical components to work with.
  if (textualParts.length < 2) {
    console.error("Operational Fault: Insufficient numerical components detected. Expected a minimum of two values.");
    return;
  }

  // Utilize array destructuring to extract the first two string representations
  // of the numbers, making the code more readable.
  const [firstToken, secondToken] = textualParts;

  // Convert the string tokens into actual numerical types.
  // It's important to validate these conversions to ensure they are indeed numbers.
  const valueA = Number(firstToken);
  const valueB = Number(secondToken);

  // Validate that both parsed values are legitimate numbers.
  // If either conversion failed (e.g., "hello" -> NaN), we report an error.
  if (isNaN(valueA) || isNaN(valueB)) {
    console.error(`Operational Fault: One or both input tokens ('${firstToken}', '${secondToken}') failed to convert into valid numerical representations.`);
    return;
  }

  // Calculate the final result. The logic dictates that if the first value
  // is less than or equal to the second, the outcome is zero. Otherwise,
  // it's the positive difference between the first and second values.
  // Math.max(0, ...) is an elegant way to achieve this "floor at zero" behavior.
  const finalComputedResult = Math.max(0, valueA - valueB);

  // Display the computed result to the standard output.
  // Using a template literal for consistent string output.
  console.log(`${finalComputedResult}`);
}

// This section serves as the script's entry point, typically for execution
// in environments like Node.js where input is read from standard I/O.
// It asynchronously reads the entire content of standard input as a UTF-8 string.
const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the core processing logic with the data obtained from standard input.
processNumericalData(rawSystemInput);