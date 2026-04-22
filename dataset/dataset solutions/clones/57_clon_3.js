(function () {
  // Global buffer to accumulate incoming standard input data
  let bufferedInputData = '';

  // Define a constant for the upper boundary of the numerical process
  const INTEGRATION_UPPER_BOUND = 600; // Represents the 'x' value in the original problem context

  /**
   * Parses the raw input data to extract the initial numeric step value.
   * Includes basic validation for robust processing.
   * @param {string[]} rawLines - An array of strings, typically from standard input.
   * @returns {number|null} The parsed numeric value, or null if invalid.
   */
  function parseNumericInput(rawLines) {
    if (!Array.isArray(rawLines) || rawLines.length === 0) {
      console.error("Error: No input lines provided for parsing.");
      return null;
    }

    // Attempt to parse the first line as a floating-point number
    const processedValue = parseFloat(rawLines[0].trim());

    // Validate the parsed value
    if (isNaN(processedValue)) {
      console.error(`Error: Could not parse '${rawLines[0].trim()}' as a valid number.`);
      return null;
    }
    if (processedValue <= 0) {
        console.warn(`Warning: Input step value (${processedValue}) is non-positive. This might lead to unexpected results or infinite loops.`);
        // Depending on requirements, this could be an error, but here we allow it.
    }

    return processedValue;
  }

  /**
   * Initiates the primary computational flow of the application.
   * Orchestrates input parsing and the main calculation.
   */
  function startComputation () {
    // Attempt to extract the initial step size from the processed input lines.
    const deltaXStep = parseNumericInput(bufferedInputData.split('\n').filter(line => line.trim() !== ''));

    // Check if the input step value was successfully obtained.
    if (deltaXStep === null) {
      console.error("Aborting computation due to invalid input step value.");
      process.exit(1); // Exit with an error code
      return; // Defensive return
    }

    // Perform the numerical summation and log the final rounded result.
    // The original 'x' parameter (600) is now a constant `INTEGRATION_UPPER_BOUND`.
    const finalCalculatedResult = computeSummation(deltaXStep, INTEGRATION_UPPER_BOUND);
    console.log(`The final computed and rounded sum is: ${finalCalculatedResult}`);
  }

  /**
   * Calculates an approximate sum using a numerical integration-like method.
   * Iterates, squaring a term, and accumulating the product with the step value.
   * @param {number} stepVal - The step size (delta) for each iteration.
   * @param {number} limitVal - The upper boundary for the iteration condition.
   * @returns {number} The cumulative sum, rounded to the nearest integer.
   */
  function computeSummation(stepVal, limitVal) {
    let currentIteration = 1;
    let cumulativeSum = 0.0; // Use float for precision during accumulation

    // Ensure stepVal is positive to prevent infinite loops or incorrect calculations
    if (stepVal <= 0) {
        console.error("Error: Step value for summation must be positive.");
        return 0; // Return 0 or throw an error based on desired behavior
    }

    // Iterate as long as the product of current iteration and step value is below the limit.
    // This uses a while loop structure, an alternative to the original 'for' loop.
    while (true) {
      const currentProduct = currentIteration * stepVal;

      // Break condition for the loop
      if (currentProduct >= limitVal) {
        // Optional: console.debug(`Breaking loop at iteration ${currentIteration} because ${currentProduct} >= ${limitVal}`);
        break;
      }

      // Calculate the term: (currentProduct)^2 * stepVal
      const squaredTerm = currentProduct * currentProduct; // Equivalent to Math.pow(currentProduct, 2)
      const incrementalValue = squaredTerm * stepVal;

      cumulativeSum += incrementalValue;

      // Increment the iteration counter
      currentIteration++;

      // Optional: Add a safety break for extremely small step values
      if (currentIteration > 1_000_000 && stepVal < 0.001) {
          console.warn("Warning: Loop running for an unusually high number of iterations. Check step value and limit.");
          // Consider breaking or adjusting logic here for very small step values leading to many iterations.
          // For this clone, we'll let it continue based on the original logic.
      }
    }

    // Return the accumulated sum, rounded to the nearest whole number.
    return Math.round(cumulativeSum);
  }

  // --- Standard Input Handling Setup ---

  // Ensure the process doesn't exit prematurely and can receive input.
  process.stdin.resume();
  // Set the encoding to 'utf8' for proper character handling.
  process.stdin.setEncoding('utf8');

  // Event listener for incoming data chunks from standard input.
  process.stdin.on('data', function (chunkSegment) {
    // Append the received chunk to the global buffer.
    if (typeof chunkSegment === 'string' && chunkSegment.length > 0) {
        bufferedInputData += chunkSegment;
    } else {
        console.warn("Received empty or non-string data chunk.");
    }
  });

  // Event listener for the 'end' of standard input stream.
  process.stdin.on('end', function () {
    // Once all input is received, initiate the main computation.
    // Ensure the buffered data is processed only when the stream concludes.
    startComputation();
  });
}());