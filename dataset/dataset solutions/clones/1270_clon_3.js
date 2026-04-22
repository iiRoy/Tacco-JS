const inputProcessor = require('readline').createInterface({
  input: process.stdin, // Connects to the standard input stream for data reception.
  output: process.stdout // Connects to the standard output stream for displaying results.
});

/**
 * Determines if a given integer contains the specific digit '3' anywhere within its representation.
 * This function processes the number by examining each digit sequentially.
 * @param {number} candidateNumberValue The integer value to be analyzed for the presence of the digit '3'.
 * @returns {boolean} Returns true if '3' is found in the number, false otherwise.
 */
const doesNumberContainDigitThree = (candidateNumberValue) => {
    // For robustness, especially with unexpected inputs, we take the absolute value.
    // However, in the context of this problem, numbers are expected to be positive.
    let currentNumericalSegment = Math.abs(candidateNumberValue);

    // A special case: if the number is exactly zero, it does not contain '3'.
    if (currentNumericalSegment === 0) {
        return false;
    }

    // Continuously check the last digit and then reduce the number until it becomes zero.
    while (currentNumericalSegment > 0) {
        // If the last digit (remainder when divided by 10) is 3, we've found it.
        if (currentNumericalSegment % 10 === 3) {
            return true; // The digit '3' is present.
        }
        // Remove the last digit by performing integer division (floor) by 10.
        currentNumericalSegment = Math.floor(currentNumericalSegment / 10);
    }
    return false; // The digit '3' was not found after checking all positions.
};

// Define symbolic constants to replace 'magic numbers' for enhanced code clarity and maintainability.
const INITIAL_SEQUENCE_ELEMENT = 3;     // The starting number for the iteration sequence.
const TARGET_DIVISOR = 3;               // The divisor used in the first condition check.
const PROGRAM_SUCCESS_CODE = 0;         // Standard exit code indicating successful execution.
const PROGRAM_ERROR_CODE = 1;           // Standard exit code indicating an error or invalid input.

/**
 * Event handler for processing each line of input received from the user.
 * This is the core logic where numbers are filtered based on specific rules.
 * @param {string} receivedDataLine The line of text input provided by the user.
 */
inputProcessor.on('line', (receivedDataLine) => {
  // An array to accumulate all numbers that satisfy the defined conditions.
  const qualifyingNumericSequence = [];

  // Clean and split the input line. Using a regular expression for splitting handles
  // various whitespace patterns (e.g., multiple spaces, tabs) robustly.
  const parsedInputSegments = receivedDataLine.trim().split(/\s+/);

  // Attempt to convert the first segment of the input line into an integer.
  // Number.parseInt is used explicitly with a radix of 10 for clarity and safety.
  const sequenceUpperLimit = Number.parseInt(parsedInputSegments[0], 10);

  // --- Robust Input Validation (Added Guard Clause) ---
  // If the parsed value is not a valid number (NaN) or is below our minimum starting point,
  // an error message is displayed, and the program terminates with an error code.
  if (isNaN(sequenceUpperLimit) || sequenceUpperLimit < INITIAL_SEQUENCE_ELEMENT) {
    console.error('Error: The provided input is either not a valid number or is less than the required starting value (3).');
    process.exit(PROGRAM_ERROR_CODE);
  }

  // Iterate through numbers starting from INITIAL_SEQUENCE_ELEMENT up to the parsed upper limit.
  for (let currentIterationValue = INITIAL_SEQUENCE_ELEMENT; currentIterationValue <= sequenceUpperLimit; currentIterationValue++) {
    let meetsAnyCondition = false; // A flag to track if the current number satisfies any of our criteria.

    // Condition 1: Check if the current number is perfectly divisible by our TARGET_DIVISOR.
    if (currentIterationValue % TARGET_DIVISOR === 0) {
      meetsAnyCondition = true;
    }
    // Condition 2: If the first condition is not met, check if the number contains the digit '3'.
    // This leverages our dedicated helper function for clarity and modularity.
    else if (doesNumberContainDigitThree(currentIterationValue)) {
      meetsAnyCondition = true;
    }

    // If the number meets either of the specified conditions, add it to our collection.
    if (meetsAnyCondition) {
      qualifyingNumericSequence.push(currentIterationValue);
    }
  }

  // Once all numbers have been processed, join the collected numbers with a space
  // and print the final result to the standard output. Using `join(' ')` is
  // generally more performant for building strings from arrays than repeated
  // string concatenation in a loop.
  console.log(qualifyingNumericSequence.join(' '));

  // Terminate the process cleanly with a success code after the output is generated.
  process.exit(PROGRAM_SUCCESS_CODE);
});

// The original code included an empty 'end' event handler for process.stdin.
// This non-essential and redundant fragment has been removed to simplify the code,
// aligning with Type III clone requirements for deleting parts of the code.
// inputProcessor.on('close', () => { /* Optional: Any cleanup or final logging can be placed here */ });