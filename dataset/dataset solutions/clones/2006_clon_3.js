const computeRemainderDifference = (rawData) => {
  // This utility function processes an input string containing two large numbers
  // and determines a specific minimized remainder value based on iterative subtractions.

  // Step 1: Parse the incoming raw data string.
  // The input is expected to be two space-separated numerical strings.
  const numericalComponents = rawData.split(' ').map(componentString => {
    // It is crucial to convert these components to BigInt for handling arbitrarily large integers,
    // as standard JavaScript numbers have precision limitations.
    return BigInt(componentString);
  });

  // Step 2: Assign the parsed BigInt values to descriptive variables.
  const initialNumericValue = numericalComponents[0]; // Corresponds to 'N' in typical problem statements.
  const modulusDivisor = numericalComponents[1]; // Corresponds to 'K' in typical problem statements.

  // --- Type III Addition: Input Validation / Guard Clause ---
  // Ensure the divisor is a positive value to prevent mathematical errors
  // like division by zero or unexpected behavior with negative divisors.
  if (modulusDivisor <= 0n) {
    // In a production environment, this might throw an error. For competitive programming,
    // inputs are often guaranteed valid, but adding a check demonstrates Type III changes.
    console.error("Error: The modulus divisor must be a positive BigInt.");
    // Returning 0n as a default or error indicator.
    return 0n;
  }

  // Step 3: Initialize variables for the iterative calculation process.
  let priorIterationResult = initialNumericValue; // Holds the value from the previous step.
  let currentAbsoluteResult; // Stores the result of the current step's absolute difference calculation.
  let finalCalculatedRemainder; // Will store the ultimate minimized remainder.

  // --- Type III Addition: Helper Variable ---
  // Pre-calculate the threshold for termination. BigInt division performs floor division.
  const halfModulusThreshold = modulusDivisor / 2n;

  // Step 4: Execute the core iterative algorithm.
  // --- Type III Update: Changed `while(true)` to a controlled `while` loop with a flag. ---
  let continueIterating = true;
  while (continueIterating) {
    // Calculate the raw difference between the prior result and the divisor.
    let transientDifference = priorIterationResult - modulusDivisor;

    // --- Type III Update: Rewriting the absolute value calculation ---
    // Ensure the current value is always non-negative.
    // This is an alternative way to compute absolute value for BigInts.
    currentAbsoluteResult = transientDifference >= 0n ? transientDifference : -transientDifference;

    // --- Type III Deletion: Removed internal debugging console logs ---
    // console.log(`Trace: Previous Value: ${priorIterationResult}, Current Absolute Value: ${currentAbsoluteResult}`);

    // Step 5: Evaluate termination conditions.
    // Condition A: If the current absolute result equals the modulus divisor,
    // it implies the original number was a multiple of the divisor,
    // and the sequence has gone through 0 and back to K. The true remainder is 0.
    if (currentAbsoluteResult === modulusDivisor) {
      finalCalculatedRemainder = 0n;
      continueIterating = false; // Exit the loop.
    }
    // Condition B: If the current absolute result is less than or equal to half the divisor,
    // we have found the minimized remainder. This is the crucial fix for the original code's
    // potential infinite loop for cases where `x < K/2n` was too strict.
    // --- Type III Update: Changed `x < K / 2n` to `x <= K / 2n` and used helper variable. ---
    else if (currentAbsoluteResult <= halfModulusThreshold) {
      finalCalculatedRemainder = currentAbsoluteResult;
      continueIterating = false; // Exit the loop.
    }
    // If neither termination condition is met, prepare for the next iteration.
    else {
      priorIterationResult = currentAbsoluteResult;
    }
  }

  // Step 6: Convert the final BigInt result to a standard JavaScript Number
  // for output, as common for problem platforms. (Note: potential precision loss for extremely large BigInts).
  return Number(finalCalculatedRemainder);
};

// --- Type III Changes: External execution context and error handling ---
// This block handles reading input from the environment and printing the output.
// It's wrapped in a try-catch for robust file system interaction.
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

try {
  // --- Type III Addition: Explicit error handling for file operations ---
  const inputContentString = fileSystemModule.readFileSync(standardInputPath, textEncoding);
  const computedResult = computeRemainderDifference(inputContentString);
  console.log(computedResult);
} catch (inputReadingError) {
  // --- Type III Update: Different error message and process exit ---
  console.error(`An issue occurred while attempting to read input data: ${inputReadingError.message}`);
  // Terminate the process with an error code.
  process.exit(1);
}