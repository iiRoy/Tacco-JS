// Main entry point for the application logic.
const processInputAndCalculate = (incomingTextData) => {

  // Convert the cleaned input string into a large integer for calculations.
  let currentNumericState = BigInt(incomingTextData.trim());

  // A fixed string acting as a character reference table.
  // 'z' is at index 0, 'a' at 1, ..., 'y' at 25.
  const characterReferenceMap = 'zabcdefghijklmnopqrstuvwxyz';

  // An array to store the generated characters in their correct sequence.
  let collectedCharacters = [];

  // Loop continues as long as the numerical state is not zero.
  while (currentNumericState !== 0n) {

    // Determine the subsequent numerical state for the next iteration.
    // If the current state is exactly 26, the next state becomes 0.
    // Otherwise, it's the integer division of the current state by 26.
    const nextIterationState = currentNumericState === 26n ? 0n : currentNumericState / 26n;

    // Calculate the remainder when the current numerical state is divided by 26.
    const currentDivisionRemainder = currentNumericState % 26n;

    // Prepend the character corresponding to the remainder to the result array.
    // Using template literals to ensure the remainder is treated as a string index.
    collectedCharacters.unshift(characterReferenceMap[`${currentDivisionRemainder}`]);

    // Update the current numerical state for the next loop cycle.
    currentNumericState = nextIterationState;
  }

  // Output the final concatenated string of characters to the console.
  // The 'console' object itself is a global, so its methods are called directly.
  return console.log(collectedCharacters.join(''));
};

// --- Execution Environment Configuration ---

// Acquire the file system utility module.
const fileSystemUtility = require('fs');

// Determine the execution path based on environment variables.
// Check if a specific environment variable for testing is present.
if (process.env.APP_EXECUTION_MODE) {

  // If the test variable indicates a specific test run.
  if (process.env.APP_EXECUTION_MODE === 'run_automated_tests') {

    // Define and invoke a placeholder function for test execution.
    const executeTestSequence = () => {
      console.log("Initiating automated test sequence...");
      // Placeholder for actual test logic.
    };
    executeTestSequence();

  } else {

    // For other custom modes, read input from a development-specific file path.
    processInputAndCalculate(
      fileSystemUtility.readFileSync('dev/input_source_file.txt', 'utf8')
    );

  }

} else {

  // Default execution: read input from the standard input stream.
  processInputAndCalculate(
    fileSystemUtility.readFileSync('/sys/standard_input_stream', 'utf8')
  );

}