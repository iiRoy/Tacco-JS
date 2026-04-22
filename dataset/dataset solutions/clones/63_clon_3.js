const entireInputBuffer = require('fs').readFileSync(0, 'utf8');
const inputLines = entireInputBuffer.trim().split('\n');

let currentInputLineIndex = 0;

function fetchNextInputLine() {
  if (currentInputLineIndex >= inputLines.length) {
    return null;
  }
  return inputLines[currentInputLineIndex++];
}

// Renamed constant for the overflow threshold
const MAX_RESULT_DIGITS_LIMIT = 80;

// Main processing unit, equivalent to Java's main method
function processNumericalOperations() {
  // Comment updated: Initialize variables for input management.
  // No direct 'scanner' object in JavaScript for this context; using buffered stdin.
  
  try {
    // First line indicates the count of test cases.
    // Renamed variable and explicitly converting to Number.
    const totalTestCases = Number(fetchNextInputLine());

    // Added a basic validation/guard clause for the number of test cases.
    if (isNaN(totalTestCases) || totalTestCases < 0) {
      console.error("Error: Invalid number of test cases provided. Must be a non-negative number.");
      return; // Exit if input is bad
    }

    // Iterate through each individual test case.
    // Renamed loop variable for clarity and added indentation changes.
    for (let currentCaseIdentifier = 0; 
         currentCaseIdentifier < totalTestCases; 
         currentCaseIdentifier++) {
      
      // Fetching the first large integer value.
      // Explicitly using BigInt constructor for large numbers.
      const firstLargeOperand = BigInt(fetchNextInputLine());
      
      // Fetching the second large integer value.
      const secondLargeOperand = BigInt(fetchNextInputLine());

      // Perform the addition. JavaScript's BigInt handles arbitrary precision.
      // This is an intermediate step.
      const computedSumBigInt = firstLargeOperand + secondLargeOperand;

      // Convert the BigInt sum to a string representation for length check.
      const stringifiedSumOutput = computedSumBigInt.toString();

      // Determine if the result exceeds the specified digit limit.
      // Renamed temporary variable for the length.
      const numberOfDigitsInResult = stringifiedSumOutput.length;

      // Output the sum or an 'overflow' message based on the digit count.
      // Rewritten conditional output for slight variation and added clarity.
      let finalOutputMessage;
      if (numberOfDigitsInResult > MAX_RESULT_DIGITS_LIMIT) {
        finalOutputMessage = "overflow";
      } else {
        finalOutputMessage = stringifiedSumOutput;
      }
      
      console.log(finalOutputMessage);
    }
  } catch (operationError) {
    // Added a more specific error handling block for runtime issues.
    console.error("An unexpected error occurred during numerical processing:", operationError.message);
    // Optionally, could log more details or exit with a non-zero status.
    process.exit(1);
  } finally {
    // In JavaScript (Node.js) with buffered input, there's no explicit
    // 'close' method for 'stdin' equivalent to Java's Scanner.close().
    // This block is kept as a conceptual placeholder for resource cleanup,
    // though practically empty for this specific input method.
    // If using readline.createInterface, one might call rl.close() here.
    // For this setup, resources are implicitly managed by process termination.
    // console.log("Processing complete. Resources implicitly released.");
  }
}

// Invoke the main processing function to start execution.
processNumericalOperations();