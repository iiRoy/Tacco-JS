const inputPayload = []; // Buffer to accumulate raw input lines from standard input.

// The original `process.stdin.resume()` and `process.stdin.setEncoding('utf8')` calls
// are omitted here as a Type III modification. The `readline` module often handles
// stream resumption and encoding defaults adequately for basic use cases.

// Initialize a robust interface for reading data line by line from the input stream.
const streamProcessor = require('readline').createInterface({
  input: process.stdin,  // Directing the interface to read from standard input.
  output: process.stdout // Output stream is technically required for `readline` but not used for this specific task.
});

/**
 * Attaches an event listener for each complete line received from the input stream.
 * Each line is processed and stored in a temporary buffer.
 * @param {string} rawLineSegment - The raw text string received for the current line.
 */
streamProcessor.on('line', (rawLineSegment) => {
  // As a Type III modification, we trim whitespace from the received line for robustness.
  inputPayload.push(rawLineSegment.trim());
});

/**
 * Attaches an event listener that triggers when the input stream has finished.
 * This is where the primary data processing and calculation occurs.
 */
streamProcessor.on('close', () => {
  // Type III: Add an initial validation check to ensure at least one line was provided.
  if (inputPayload.length === 0) {
    console.error("Processing halted: No input lines were detected from the stream.");
    return; // Terminate execution gracefully if no data.
  }

  // Type III: Encapsulate the core processing logic within a try-catch block
  // to handle potential parsing or calculation errors robustly.
  try {
    // Retrieve the first available line of input for processing.
    const primaryInputLine = inputPayload[0];

    // Type III: Utilize array destructuring for cleaner extraction of string components
    // after splitting the line by spaces. `_extraComponents` captures any remaining parts.
    const [componentOneAsString, componentTwoAsString, ..._extraComponents] = primaryInputLine.split(' ');

    // Type III: Validate that sufficient components were extracted from the input line.
    if (!componentOneAsString || !componentTwoAsString) {
      console.error("Processing error: The first input line did not contain at least two space-separated numeric components.");
      return;
    }

    // Type III: Explicitly parse string components into numerical types.
    // `parseInt` is used for the first component (as original `*1` implies integer intent).
    // `parseFloat` is used for the second component (as original `/2` implies float intent).
    const numericValueA = Number.parseInt(componentOneAsString, 10);
    const numericValueB = Number.parseFloat(componentTwoAsString);

    // Type III: Perform validation on parsed numerical values.
    if (isNaN(numericValueA) || isNaN(numericValueB)) {
      console.error(`Data conversion error: One or more components ('${componentOneAsString}', '${componentTwoAsString}') could not be converted to valid numbers.`);
      return;
    }

    // Type III: Introduce a small helper function to abstract the calculation.
    // This enhances readability and reusability, even for a simple operation.
    /**
     * Performs a specific arithmetic calculation on two numeric inputs.
     * Original logic: (value1 * 1) + (value2 / 2)
     * Rewritten as: value1 + (value2 * 0.5) for Type III.
     * @param {number} val1 - The first numerical operand.
     * @param {number} val2 - The second numerical operand.
     * @returns {number} The result of the calculation.
     */
    const computeFinalResult = (val1, val2) => {
      // The `* 1` in the original code is redundant for numeric types,
      // so we simplify to `val1`. The `/ 2` is rephrased as `* 0.5`.
      return val1 + (val2 * 0.5);
    };

    // Execute the calculation using the prepared numeric values.
    const calculatedOutcome = computeFinalResult(numericValueA, numericValueB);

    // Type III: Provide a more descriptive output message for the final result.
    console.log(`Calculation completed successfully. Result: ${calculatedOutcome}`);

  } catch (processingIssue) {
    // Type III: Catch and report any unexpected errors during the processing phase.
    console.error(`An unhandled exception occurred during input processing: ${processingIssue.message}`);
  }
});