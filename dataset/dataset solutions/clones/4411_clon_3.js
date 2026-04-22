// Utility function to present computed outcomes
const logFinalResult = (resultValue) => {
  // Ensure the value is not null or undefined before logging
  if (resultValue !== null && resultValue !== undefined) {
    console.log(String(resultValue)); // Explicitly convert the value to a string for logging
  } else {
    console.warn("Attempted to log an undefined or null result. Displaying default error.");
    console.error("Computation resulted in no valid output.");
  }
};

// Core logic for processing an input string and deriving a specific value.
const processCalculationWorkflow = (rawInputString) => {
  // Define a constant for the modulo operation to enhance readability and maintainability
  const MODULO_CONSTANT = 1000000007;

  // Initial validation of the raw input string to prevent errors
  if (!rawInputString || typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
    console.error("Invalid, empty, or non-string input provided to the workflow.");
    logFinalResult("ERROR: Invalid Input Payload"); // Utilize the custom logger for errors
    return; // Terminate execution early if input is invalid
  }

  // Split the input into an array of lines after trimming any leading/trailing whitespace
  const linesOfData = rawInputString.trim().split('\n');

  // Verify that there's at least one line to parse for the numerical limit
  if (linesOfData.length === 0) {
    console.error("No data lines discovered in the provided input payload.");
    logFinalResult("ERROR: No Data Lines");
    return;
  }

  // Attempt to parse the first line of data as the iteration limit
  let upperBound = Number(linesOfData[0]);

  // Validate the parsed number: it must be a non-negative integer
  if (isNaN(upperBound) || !Number.isInteger(upperBound) || upperBound < 0) {
    console.error(`Parsed numerical limit is invalid: "${linesOfData[0]}". Expected a non-negative integer.`);
    logFinalResult("ERROR: Invalid Iteration Limit");
    return;
  }

  // Initialize the result variable, starting with a base value of 1 for multiplicative accumulation
  let accumulatedProduct = 1;
  // Declare a temporary multiplier variable to hold the factor for each iteration
  let currentMultiplier = 1;

  // Iterate from 0 up to (but not including) the determined upper bound
  for (let loopCounter = 0; loopCounter < upperBound; ++loopCounter) {
    // Determine the multiplier based on the remainder when the loop counter is divided by 3
    const remainder = loopCounter % 3;

    // Use a switch statement for clearer and more explicit logic branching based on the remainder
    switch (remainder) {
      case 0: // If the loop counter is perfectly divisible by 3
        currentMultiplier = 3;
        break;
      case 1: // If the remainder is 1 when divided by 3
        currentMultiplier = 2;
        break;
      case 2: // If the remainder is 2 when divided by 3 (original code implicitly multiplied by 1 here)
        currentMultiplier = 1; // Explicitly set multiplier to 1, causing no change to the product
        break;
      default: // Fallback case, theoretically should not be reached with the modulo 3 operation
        console.warn(`An unexpected remainder value encountered: ${remainder}. Defaulting multiplier to 1.`);
        currentMultiplier = 1;
        break;
    }

    // Apply the multiplication and then the modulo operation in sequence to prevent overflow
    accumulatedProduct *= currentMultiplier; // First, perform the multiplication
    accumulatedProduct %= MODULO_CONSTANT;   // Then, apply the modulo to keep the number within bounds
  }

  // Output the final computed value using the dedicated logging function
  logFinalResult(accumulatedProduct);
};

// Main execution block: responsible for reading input from standard input and initiating the workflow.
try {
  // Dynamically import the Node.js file system module for I/O operations
  const fileSystemModule = require("fs");
  // Define the standard input path, typically used in competitive programming environments
  const standardInputPath = "/dev/stdin";

  // Read the content of the standard input file synchronously
  const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath);
  // Convert the buffer content to a UTF-8 string and trim any surrounding whitespace
  const processedInputString = fileContentBuffer.toString("utf8").trim();

  // Invoke the primary processing function with the obtained input string
  processCalculationWorkflow(processedInputString);
} catch (executionError) {
  // Catch and handle any errors that occur during file reading or initial program setup
  console.error("An unhandled error occurred during program execution:", executionError.message);
  logFinalResult("ERROR: Program Execution Failed"); // Log a generic error message
}