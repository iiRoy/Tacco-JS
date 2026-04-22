(function () {
  // A buffer to accumulate all incoming data from standard input.
  let capturedInput = '';

  // This array will hold the processed lines, ready for the main logic.
  let processingQueue = [];

  /**
   * Calculates the number of trailing zeros in the factorial of a given non-negative integer.
   * This implementation leverages Legendre's formula.
   *
   * @param {number} targetNumber The integer for which to determine factorial trailing zeros.
   *                               Must be a non-negative integer.
   * @returns {number} The total count of trailing zeros. Returns 0 for invalid or zero input.
   */
  function computeTrailingZeroes(targetNumber) {
    // --- Type III: Added input validation and early exit conditions ---
    if (typeof targetNumber !== 'number' || !Number.isInteger(targetNumber) || targetNumber < 0) {
      console.warn(`Validation Notice: Provided value '${targetNumber}' is not a valid non-negative integer. Assuming 0 for calculation.`);
      return 0; // Invalid input results in zero trailing zeros.
    }

    if (targetNumber === 0) {
      // The factorial of 0 is 1, which has no trailing zeros.
      return 0;
    }

    let totalAccumulatedZeros = 0; // This variable accumulates the final count.
    let divisionTracker = targetNumber; // A temporary variable used for successive divisions.

    // --- Type III: Loop condition and internal calculation updated ---
    // The loop continues as long as the current value, when divided by 5,
    // yields a quotient of 1 or more, indicating further factors of 5.
    while (divisionTracker >= 5) { // Original: `j / 5 !== 0`
      const currentQuotient = Math.floor(divisionTracker / 5); // Calculate the integer part of the division.
      totalAccumulatedZeros += currentQuotient; // Add this count to the running total.
      divisionTracker = currentQuotient; // Update the tracker with the quotient for the next iteration.
    }

    return totalAccumulatedZeros; // Deliver the final computed count.
  }

  /**
   * Initiates the core processing logic. It iterates through the prepared
   * input lines, parses numerical entries, and outputs the calculated
   * trailing zero count for each valid number's factorial.
   * The process terminates upon encountering a '0' entry.
   */
  function initiateProcessing() {
    // --- Type III: Added guard clause for empty input queue ---
    if (!Array.isArray(processingQueue) || processingQueue.length === 0) {
      console.error("Processing halted: No valid input lines were found in the queue.");
      return;
    }

    // Iterate over each line string present in the pre-filtered input queue.
    for (const lineEntry of processingQueue) {
      // --- Type III: Added intermediate variable and validation steps ---
      const trimmedLine = lineEntry.trim(); // Remove any leading/trailing whitespace.

      // Skip processing entirely empty lines.
      if (trimmedLine.length === 0) {
        continue; // Proceed to the next line.
      }

      // Attempt to convert the cleaned line string into a base-10 integer.
      const currentNumericEntry = parseInt(trimmedLine, 10);

      // --- Type III: Added validation for non-numeric input ---
      if (isNaN(currentNumericEntry)) {
        console.warn(`Skipping entry: '${trimmedLine}' could not be parsed as a valid number.`);
        continue; // Move to the next line if parsing failed.
      }

      // --- Type III: Added explicit logging for termination condition ---
      // According to the problem specification, a '0' value signals the end of processing.
      if (currentNumericEntry === 0) {
        console.log("Termination Signal: A '0' was encountered, ceasing further input processing.");
        break; // Exit the loop immediately.
      }

      // Calculate the required value using the helper function.
      const computedZeroCount = computeTrailingZeroes(currentNumericEntry);

      // Output the result of the calculation to the standard output.
      console.log(computedZeroCount);
    }
  }

  // --- Type II: Reformatted and rewritten standard input handling ---
  // Ensure the Node.js process does not exit prematurely while awaiting input.
  process.stdin.resume();
  // Configure the input stream to interpret data as UTF-8 characters.
  process.stdin.setEncoding('utf8');

  // Register an event handler for when new data chunks are received.
  process.stdin.on('data', (dataChunk) => {
    capturedInput += dataChunk; // Append the new data to our accumulated buffer.
  });

  // Register an event handler for when the input stream has completely ended.
  process.stdin.on('end', () => {
    // --- Type III: Enhanced input processing (split and filter) ---
    // Split the entire captured input into an array of lines.
    // Then, filter out any lines that are empty or contain only whitespace,
    // ensuring only meaningful entries proceed to the main logic.
    processingQueue = capturedInput.split('\n').filter(line => line.trim().length > 0);

    // Once all input is gathered and pre-processed, start the main logic execution.
    initiateProcessing();
  });
}());