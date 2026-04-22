const inputReader = require('readline');

const queryMessage = "Kindly provide an integer value for analysis: ";

const inputHandler = inputReader.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * This asynchronous function serves as the primary entry point for the script.
 * It manages user input, validates it, performs a parity check on the numeric value,
 * and then outputs the determined status.
 *
 * The core logic identifies whether a given integer is even or odd,
 * returning '1' for even numbers and '0' for odd numbers.
 * This structure replaces the traditional 'public static void main' method found in Java.
 */
async function performParityCheckOperation() {
  let obtainedValue; // Stores the raw string input from the user.
  let numericRepresentation; // Holds the parsed integer value after validation.
  let finalOutcome; // Stores the resulting parity indicator (1 or 0).

  // Type III: Implementing a robust input loop to ensure that only a valid
  // integer is accepted from the user. This adds a critical validation step.
  while (true) {
    // Type II: Replaced 'System.out.print' with 'inputHandler.question' for interactive prompting.
    // Type III: Utilizing async/await for a more modern and readable approach to handle
    // asynchronous user input, replacing synchronous Scanner operations.
    obtainedValue = await new Promise(resolve => {
      inputHandler.question(queryMessage, resolve);
    });

    // Type III: Explicitly parsing the input string to an integer (base 10).
    // This step includes explicit type conversion and validation, which was implicitly
    // handled by Java's Scanner.nextInt().
    numericRepresentation = parseInt(obtainedValue, 10);

    // Type III: Guard clause - Checks if the parsed value is a valid, whole number.
    // This adds a crucial error-checking mechanism not explicitly present in the original.
    if (!isNaN(numericRepresentation) && Number.isInteger(numericRepresentation)) {
      // Type III: Added an intermediate log message to confirm valid input reception.
      console.log(`\nSuccessfully received and processing the value: ${numericRepresentation}`);
      break; // Exit the loop as valid input has been secured.
    } else {
      // Type III: Provides user feedback for invalid input, enhancing user experience.
      console.error("Validation Error: The input provided is not a valid whole number. Please try again.");
      // Type III: Introduces a brief delay to make error messages more visible to the user.
      await new Promise(resolve => setTimeout(resolve, 750));
    }
  }

  // Type II: Renamed the variable for clarity.
  // Type III: Rewriting the core parity check logic. Instead of the modulo operator ('%'),
  // a bitwise AND operator ('&') is used to determine if the number is even.
  // This is an equivalent, often more performant, way to check parity for integers.
  const isValueEven = (numericRepresentation & 1) === 0;

  // Type III: The conditional assignment is refactored from an 'if-else' block
  // into a concise ternary operator, storing the result in a dedicated variable.
  // This demonstrates an equivalent but syntactically different approach.
  finalOutcome = isValueEven ? 1 : 0;

  // Type III: Adding an intermediate informational message before displaying the final result.
  console.log(`\nExecuting parity determination sequence...`);

  // Type II: Replaced 'System.out.println' with 'console.log' for output.
  // Type III: Enhanced the output message to be more descriptive, indicating the nature
  // of the calculated result.
  console.log(`\nFinal Calculated Result (1 for Even, 0 for Odd): ${finalOutcome}`);

  // Type III: Explicitly closing the readline interface to release system resources.
  // This is an added best practice for resource management in Node.js.
  inputHandler.close();
}

// Type III: Initiates the execution of the main function, serving as the script's entry point.
performParityCheckOperation();

/*
 * End of the numerical parity analysis script.
 * This program efficiently determines and reports the even/odd status of a user-provided integer.
 */