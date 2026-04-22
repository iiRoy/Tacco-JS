(function(sourceInputData) {
  // This constant defines the upper limit for the inner calculation loop.
  // It corresponds to the '600' in the original code, now made explicit.
  const ITERATION_UPPER_BOUND = 600;

  // This constant stores the newline character for consistent use in string operations.
  const NEWLINE_DELIMITER = '\n';

  // --- Input Data Processing and Validation ---
  // The raw input string is first processed to ensure it's clean and ready for numeric conversion.
  // We check for a trailing newline character and remove it if present,
  // then split the string into individual lines.
  // Each line string is then converted into a floating-point number.
  let numericStepValues = sourceInputData.endsWith(NEWLINE_DELIMITER)
                         ? sourceInputData.slice(0, -1).split(NEWLINE_DELIMITER).map(Number)
                         : sourceInputData.split(NEWLINE_DELIMITER).map(Number);

  // Initial validation: Check if the processed input array is empty or contains non-numeric values.
  // If so, it indicates invalid input, and the processing should halt.
  if (!numericStepValues || numericStepValues.length === 0 || numericStepValues.some(isNaN)) {
    // In a real application, more robust error handling or logging would occur here.
    // For this example, we simply return, effectively skipping further processing.
    // console.error("Input data is invalid or empty. Aborting calculation.");
    return;
  }

  // --- Main Calculation Loop ---
  // This loop iterates through each numeric step value extracted from the input.
  // The `shift()` method is used to extract and remove the first element,
  // effectively consuming the array until it's empty.
  while (numericStepValues.length > 0) {
    // Retrieve the next step value for the current calculation cycle.
    let currentIterationStep = numericStepValues.shift();

    // Guard clause: Validate the current step value.
    // If the step is non-positive or not a number, it could lead to infinite loops or incorrect results.
    // Such invalid steps are skipped to maintain program stability.
    if (currentIterationStep <= 0 || isNaN(currentIterationStep)) {
      // console.warn(`Skipping invalid or non-positive step value: ${currentIterationStep}.`);
      continue; // Move to the next valid step value.
    }

    // Initialize an accumulator variable to store the sum of products for the current step.
    let cumulativeCalculationResult = 0;

    // A helper constant for the current step value, enhancing readability within the inner loop.
    const loopIncrementFactor = currentIterationStep;

    // --- Inner Iteration and Summation ---
    // This loop performs the core calculation: summing (iteration_value^2 * step_value).
    // It starts from zero and increments by `loopIncrementFactor` until it reaches `ITERATION_UPPER_BOUND`.
    for (let currentLoopIndex = 0; currentLoopIndex < ITERATION_UPPER_BOUND; currentLoopIndex += loopIncrementFactor) {
      // Calculate the square of the current iteration index.
      const squaredIndexValue = currentLoopIndex * currentLoopIndex;

      // Compute the term to be added to the cumulative result in this iteration.
      // This is the product of the squared index value and the loop increment factor.
      const termForAccumulation = squaredIndexValue * loopIncrementFactor;

      // Add the computed term to the running total.
      cumulativeCalculationResult += termForAccumulation;
    }

    // --- Output Generation ---
    // After completing all inner iterations for a given step value,
    // the final calculated sum is written to standard output, followed by a newline.
    // Using `process.stdout.write` instead of `console.log` for a slightly different I/O approach.
    process.stdout.write(String(cumulativeCalculationResult) + NEWLINE_DELIMITER);
  }

// The entire script is wrapped in an immediately invoked function expression (IIFE).
// This IIFE receives its input by reading the content of `/dev/stdin` using Node.js's file system module.
})(require('node:fs').readFileSync('/dev/stdin', 'utf8'));