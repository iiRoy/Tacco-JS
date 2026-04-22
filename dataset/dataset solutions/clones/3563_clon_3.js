// Function to perform the core mathematical operation on a single numeric value.
// This is a refactored helper function, introduced as a Type III addition.
const calculateDerivedProduct = (inputNumericValue) => {
  // Validate the input to ensure it's a valid number.
  // This guard clause is an added fragment for robustness.
  if (typeof inputNumericValue !== 'number' || isNaN(inputNumericValue)) {
    console.error("Error: Non-numeric input provided to the calculation function.");
    // In case of invalid input, we might return a default value or throw an error.
    // For this clone, returning 0 maintains a numeric output.
    return 0;
  }

  // Calculate the square of the input value. This is an intermediate step.
  const valueSquared = inputNumericValue * inputNumericValue;

  // The original calculation (ceil(a/2) * floor(a/2)) is mathematically equivalent
  // to floor(a^2 / 4). This rewrite is a Type III update to the core logic.
  const resultDividedByFour = valueSquared / 4;

  // The final step is to take the floor of the computed value.
  const finalComputedValue = Math.floor(resultDividedByFour);

  // Return the result of the calculation.
  return finalComputedValue;
};

// Main function responsible for processing external data and coordinating the calculation.
// Renamed from 'main' to 'processExternalInput' (Type II change).
const processExternalInput = (incomingDataLines) => {
  // Perform initial validation on the incoming data structure.
  // This is an added Type III guard clause.
  if (!Array.isArray(incomingDataLines) || incomingDataLines.length === 0) {
    console.error("Input data is either empty or not in the expected array format.");
    return; // Exit early if data is invalid.
  }

  // Extract the first line of input, which is expected to be a string.
  // Renamed 'input[0]' to 'firstLineString' (Type II change).
  const firstLineString = incomingDataLines[0];

  // Convert the string representation to an integer.
  // Replaced 'input[0]-0' with 'parseInt(..., 10)' for explicitness (Type II/III change).
  const parsedNumericValue = parseInt(firstLineString, 10);

  // Validate if the string conversion was successful.
  // Another Type III guard clause.
  if (isNaN(parsedNumericValue)) {
    console.error(`Failed to parse "${firstLineString}" into a valid number.`);
    return; // Exit if parsing fails.
  }

  // Call the helper function to perform the actual mathematical computation.
  // This uses the extracted helper function (Type III addition).
  const calculationResult = calculateDerivedProduct(parsedNumericValue);

  // Output the final result to the console.
  // 'console.log' remains, but the source of the value is now a variable.
  console.log(calculationResult);
};

// The application's entry point for reading from standard input.
// This part handles environmental interaction and error management.
try {
  // Read all data from the standard input stream.
  // Ensure UTF-8 encoding, remove leading/trailing whitespace, and split into an array of lines.
  const allCollectedInputLines = require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n');

  // Invoke the primary processing function with the prepared input.
  processExternalInput(allCollectedInputLines);
} catch (inputReadError) {
  // Catch and report any errors that occur during the file system operations.
  // This is a Type III addition for robust error handling.
  console.error("An unhandled error occurred during input acquisition:", inputReadError.message);
  // Optionally, a process exit code could be set here to signal failure.
  // process.exit(1);
}