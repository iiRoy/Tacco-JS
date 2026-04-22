const retrieveInputData = () => {
  // Utilizing the 'node:fs' module for standardized file system operations.
  // Reading from file descriptor 0 effectively captures standard input on Unix-like systems.
  // This approach ensures compatibility across various Node.js environments.
  return require('node:fs').readFileSync(0, 'utf8');
};

const emitResultToConsole = (valueToDisplay) => {
  // A dedicated function for output, promoting modularity.
  // Ensures the output is converted to a string and terminated with a newline character.
  process.stdout.write(String(valueToDisplay) + '\n');
};

const processMainLogic = (sourceInputString) => {
  // Step 1: Prepare the input.
  // Trim any leading/trailing whitespace from the entire input block.
  // Split the input into individual lines, handling both Windows (\r\n) and Unix (\n) line endings.
  // A robust regex is used for splitting.
  const parsedInputLines = sourceInputString.trim().split(/\r?\n/);

  // Step 2: Extract and validate the primary numerical value.
  // If the first line is empty or non-existent, default to '0' to prevent errors.
  // Explicitly convert the string to a number.
  const numericalInputRepresentation = Number(parsedInputLines[0] || '0');

  // Define a constant for the minimum acceptable input value.
  const MINIMUM_INPUT_THRESHOLD = 100;

  // Step 3: Implement an early exit condition.
  // If the main number is less than the predefined threshold, a specific outcome is produced.
  if (numericalInputRepresentation < MINIMUM_INPUT_THRESHOLD) {
    emitResultToConsole(0); // Output 0 as per application requirements.
    return; // Terminate execution for this input.
  }

  // Step 4: Isolate the last two digits of the number.
  // This is achieved using the modulo operator, which is a mathematical rewrite of string slicing.
  let twoDigitSuffixValue = numericalInputRepresentation % MINIMUM_INPUT_THRESHOLD;

  // Initialize a counter for the reduction operations.
  let reductionStepCounter = 0;

  // Step 5: Handle a specific edge case for the two-digit suffix.
  // If the suffix is exactly zero, a distinct output is required.
  if (twoDigitSuffixValue === 0) {
    emitResultToConsole(1); // Output 1 for this specific condition.
    return; // Exit early.
  }

  // Step 6: Adjust the counter for a particular initial value.
  // This preserves the original algorithm's behavior where a suffix of '1' leads to a higher final count.
  if (twoDigitSuffixValue === 1) {
    reductionStepCounter = 1; // Sets the base count for '1' before the loop increments it.
  }

  // Step 7: Iteratively reduce the two-digit suffix to zero.
  // The loop continues as long as the suffix is not zero.
  while (twoDigitSuffixValue !== 0) {
    // Apply modulo operations based on a cascading set of conditions.
    // The order of divisors (5, 4, 3, 2) is critical to the algorithm's logic.
    if (twoDigitSuffixValue >= 5) {
      twoDigitSuffixValue %= 5; // Equivalent to twoDigitSuffixValue = twoDigitSuffixValue % 5.
    } else if (twoDigitSuffixValue >= 4) {
      twoDigitSuffixValue %= 4;
    } else if (twoDigitSuffixValue >= 3) {
      twoDigitSuffixValue %= 3;
    } else if (twoDigitSuffixValue >= 2) {
      twoDigitSuffixValue %= 2;
    } else {
      // If none of the above conditions met, twoDigitSuffixValue must be 1.
      // Modulo by 1 effectively sets any integer to 0.
      twoDigitSuffixValue %= 1;
    }
    reductionStepCounter++; // Increment the counter for each operation performed.
  }

  // Step 8: Final comparison and result determination.
  // Define a constant for the multiplier used in the final calculation.
  const MULTIPLIER_CONSTANT = 100;
  // Calculate a threshold value based on the total reduction steps.
  const calculatedThresholdLimit = reductionStepCounter * MULTIPLIER_CONSTANT;

  // Compare the original numerical input against the derived threshold.
  // The comparison direction is inverted for a Type III variation, while maintaining semantic equivalence.
  if (numericalInputRepresentation > calculatedThresholdLimit) {
    emitResultToConsole(1); // Output 1 if the input exceeds the threshold.
  } else {
    emitResultToConsole(0); // Otherwise, output 0.
  }
};

// Entry point of the program:
// Retrieve the raw input data and then pass it to the main processing function.
processMainLogic(retrieveInputData());