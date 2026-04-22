/**
 * This module is designed to calculate an expected probability based on a specific process.
 * It determines the average probability of a sequence of doublings for initial values
 * reaching a predefined threshold.
 *
 * The problem involves iterating through numbers from 1 to N. For each number, if it's
 * less than K, it's repeatedly doubled until it reaches or exceeds K. Each doubling step
 * contributes a 0.5 probability. The goal is to find the average probability over all N starting numbers.
 */

/**
 * Computes the average probability of a value reaching a target threshold
 * through successive doublings, starting from each integer from 1 to N.
 *
 * @param {string} rawInputString - A string containing two space-separated positive integers:
 *                                   - The first integer (N) represents the upper bound for the initial values.
 *                                   - The second integer (K) represents the target threshold.
 */
function computeExpectedOutcome(rawInputString) {
  // Begin by parsing the input string into its constituent numeric components.
  // The input is expected to be two space-separated numbers.
  const processedInputTokens = rawInputString.split(' ');

  // Convert the string tokens into numerical data types.
  // 'totalSamples' corresponds to 'N' in the problem description.
  const totalSamples = Number(processedInputTokens[0]);
  // 'targetLimit' corresponds to 'K' in the problem description.
  const targetLimit = Number(processedInputTokens[1]);

  // --- Robust Input Validation ---
  // These checks ensure that the program receives valid and sensible input,
  // preventing potential errors or unexpected behavior.
  if (isNaN(totalSamples) || isNaN(targetLimit)) {
    console.error("Input Error: Provided values are not valid numbers. Please ensure N and K are integers.");
    return; // Terminate execution if input is malformed.
  }
  if (totalSamples <= 0) {
    console.error("Input Error: The total number of samples (N) must be a positive integer.");
    return;
  }
  if (targetLimit <= 0) {
    console.error("Input Error: The target limit (K) must be a positive integer.");
    return;
  }
  // --- End Input Validation ---

  // Initialize a floating-point accumulator for the sum of individual probabilities.
  // This variable will hold the aggregated probability across all iterations.
  let totalWeightedSum = 0.0;

  // The primary loop iterates through each possible starting value,
  // from 1 up to and including 'totalSamples'.
  for (let currentDrawValue = 1; currentDrawValue <= totalSamples; currentDrawValue++) {

    // Conditional logic to determine the probability contribution of the current value.
    if (currentDrawValue >= targetLimit) {
      // If the current starting value is already at or beyond the target limit,
      // its probability of "success" (reaching the limit) is 1.0 (certainty).
      totalWeightedSum += 1.0;
    } else {
      // If the current value is below the target, we must calculate the probability
      // of it reaching the threshold through a series of doublings.

      // A temporary variable to simulate the doubling process without altering 'currentDrawValue'.
      let temporaryWorkingValue = currentDrawValue;
      // Counter for the number of doubling operations required.
      let doublingStepsCounter = 0;

      // Repeatedly double the 'temporaryWorkingValue' until it meets or exceeds 'targetLimit'.
      while (temporaryWorkingValue < targetLimit) {
        temporaryWorkingValue *= 2;        // Perform the doubling.
        doublingStepsCounter++;            // Increment the counter for each doubling step.
      }

      // Calculate the probability factor for this specific starting value.
      // Each doubling step has a probability of 0.5. If 'n' steps are needed,
      // the total probability is (0.5)^n, which is equivalent to 1 / (2^n).
      const probabilityFactor = 1.0 / (2 ** doublingStepsCounter);

      // Add this calculated probability to the running total.
      totalWeightedSum += probabilityFactor;
    }
  }

  // After processing all starting values, compute the final average probability.
  // This is done by dividing the total accumulated probability by the number of samples (N).
  const finalAverageProbability = totalWeightedSum / totalSamples;

  // Output the computed average probability to the standard console.
  console.log(finalAverageProbability);
}

// --- Program Execution Entry Point ---
// This block handles reading input from the system and initiating the computation.
try {
  // Attempt to read all data from standard input ('/dev/stdin'),
  // interpret it as UTF-8 text, and remove any extraneous whitespace.
  const systemInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();

  // Invoke the main computational function with the acquired input string.
  computeExpectedOutcome(systemInputData);
} catch (executionError) {
  // Provide a robust error message if there's an issue with reading the input file.
  console.error("Runtime Error: Failed to process input from /dev/stdin. Details:", executionError.message);
}