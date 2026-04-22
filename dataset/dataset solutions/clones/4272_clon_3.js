function processInputData(rawInputText) {
  // Comments: This function takes raw input text, parses it, and performs a specific calculation.
  // It includes robust error checking for input format and quantity.

  // Step 1: Normalize and split the raw input into individual lines.
  // Using trim() to handle potential leading/trailing whitespace in the overall input.
  const inputLines = rawInputText.trim().split('\n');

  // Step 2: Validate the number of input lines.
  // A guard clause to ensure we have at least two lines for the two required numbers.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient data provided. Expected at least two numeric lines.");
    // Returning null to indicate a failure in processing.
    return null; 
  }

  // Step 3: Parse the first two lines into numeric values.
  // Using Array.prototype.map for a clean parsing operation.
  // Number() is used for parsing, which is generally more flexible than parseInt() for floating points,
  // but for integer inputs, it behaves similarly.
  const parsedOperands = inputLines.slice(0, 2).map(lineContent => {
    const trimmedLine = lineContent.trim(); // Ensure each line is trimmed before parsing.
    const numericValue = Number(trimmedLine);

    // Step 3a: Validate if the parsed value is a valid number.
    if (isNaN(numericValue)) {
      console.error(`Error: Invalid numeric input encountered: '${trimmedLine}'.`);
      // Returning NaN will cause the subsequent check to fail, stopping further processing.
      return NaN;
    }
    return numericValue;
  });

  // Step 4: Check if any parsing operation failed.
  if (parsedOperands.some(val => isNaN(val))) {
    // If any value in the parsedOperands array is NaN, it means an error occurred during parsing.
    return null;
  }

  // Step 5: Destructure the parsed values for clarity in calculation.
  const [firstFactor, secondFactor] = parsedOperands;

  // Step 6: Perform the core arithmetic operation.
  // This intermediate variable makes the calculation step explicit.
  const doubledSecondFactor = secondFactor * 2;
  const finalCalculatedValue = doubledSecondFactor - firstFactor;

  // Step 7: Return the computed result.
  return finalCalculatedValue;
}

// --- Main execution block for reading input and invoking the processing function ---

// Using a dedicated variable for the file system module.
const fileSystemModule = require('fs');
// Defining the standard input path as a constant.
const standardInputFilePath = '/dev/stdin';

let rawInputContentString;

// Adding a try-catch block for robust file reading.
try {
  // Read all content from standard input, specified with UTF-8 encoding.
  rawInputContentString = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
} catch (readOperationError) {
  // Log an error message if file reading fails and exit the process.
  console.error(`Failed to read input from ${standardInputFilePath}: ${readOperationError.message}`);
  process.exit(1); // Indicate an error exit status.
}

// Call the main processing function with the obtained input.
const operationOutcome = processInputData(rawInputContentString);

// Check the outcome of the data processing.
// Only log the result if the processing was successful (did not return null).
if (operationOutcome !== null) {
  console.log(operationOutcome);
} else {
  // If operationOutcome is null, an error message would have been logged by processInputData.
  // Exit with an error status to signal failure.
  process.exit(1);
}