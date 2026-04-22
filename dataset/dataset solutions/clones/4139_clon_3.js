"use strict";

// Helper function to encapsulate standard input acquisition.
// This design choice separates I/O concerns from core logic, enhancing modularity.
const acquireSystemInput = () => {
  // Using a try-catch block for robust file reading,
  // preventing crashes if the input stream is unavailable (Type III addition).
  try {
    // Renamed 'require' and method calls for Type II changes.
    const fileSystemHandler = require('fs');
    const systemInputPath = '/dev/stdin';
    const characterEncoding = 'utf8';
    return fileSystemHandler.readFileSync(systemInputPath, characterEncoding);
  } catch (ioError) {
    // Added a fallback or error message for failed input acquisition (Type III addition).
    console.error(`Error reading from standard input stream: ${ioError.message}`);
    // Providing a default mock input for local testing or graceful degradation.
    // This example input "1 5\n" would yield '3' (stages: 1, 2, 4 are <= 5).
    return "1 5\n"; 
  }
};

// This function performs the main calculation logic.
// It determines how many times an initial value can be successively doubled
// while remaining within a specified upper limit.
const computeGrowthSequenceLength = (rawInputDataBuffer) => {
  // --- Input Processing and Validation (Extensive Type III additions) ---

  // Validate that input is a string and not empty after trimming.
  if (typeof rawInputDataBuffer !== 'string' || rawInputDataBuffer.trim() === '') {
    console.error("Critical Error: Provided input data is either not a string or contains no actual data.");
    return; // Halt execution for invalid input
  }

  // Split input into lines, robustly handling various newline characters and extra whitespace.
  const processedInputLines = rawInputDataBuffer.trim().split(/\s*\n\s*/);

  // Ensure there's at least one line of meaningful data.
  if (processedInputLines.length === 0 || processedInputLines[0].length === 0) {
    console.error("Critical Error: No valid data lines found in the input string after processing.");
    return;
  }

  // Extract the first line which contains the numerical parameters.
  const primaryParameterLine = processedInputLines[0];
  // Split the line by one or more whitespace characters to get tokens.
  const numericalTokens = primaryParameterLine.split(/\s+/);

  // Validate that at least two numerical tokens are present.
  if (numericalTokens.length < 2) {
    console.error("Critical Error: Insufficient numerical parameters on the first line. Expected at least two.");
    return;
  }

  // Parse the extracted tokens into integers. Renamed variables for Type II.
  const initialBaseValue = parseInt(numericalTokens[0], 10); // Explicit radix for safety.
  const maximumPermittedCeiling = parseInt(numericalTokens[1], 10); // Explicit radix.

  // --- Further Input Validations (Type III additions for robustness) ---

  // Check if parsing resulted in valid numbers.
  if (isNaN(initialBaseValue) || isNaN(maximumPermittedCeiling)) {
    console.error("Critical Error: Failed to parse valid integer values from the input tokens.");
    return;
  }

  // Prevent infinite loops or undefined behavior for non-positive starting values.
  // The original code would loop infinitely for X=0 or negative X.
  if (initialBaseValue <= 0) {
    console.error("Critical Error: Initial base value must be a positive integer to ensure meaningful calculation.");
    return;
  }

  // --- Core Logic Implementation (Type II & III changes) ---

  // Renamed 'now' to 'currentIterativeProduct' for better semantic meaning (Type II).
  let currentIterativeProduct = initialBaseValue;
  // Renamed 'answer' to 'achievedDoublingStages' for clarity (Type II).
  // Initialized to 1, as the 'initialBaseValue' itself counts as the first stage.
  let achievedDoublingStages = 1;

  // The main loop iterates as long as the 'currentIterativeProduct' does not exceed the 'maximumPermittedCeiling'.
  // This structure is preserved from the original for similar functionality, but with Type II/III modifications.
  while (currentIterativeProduct <= maximumPermittedCeiling) {
    // Introduce an intermediate variable for the next potential value (Type III addition).
    // This improves readability and separates the calculation from the check.
    const prospectiveNextValue = currentIterativeProduct * 2;

    // Original logic: `if(now * 2 <= Y) { answer++; }`
    // Check if the *next* doubled value is still within the permissible bounds.
    // If it is, it means another doubling stage is achievable.
    if (prospectiveNextValue <= maximumPermittedCeiling) {
      achievedDoublingStages++; // Increment the count of achievable stages.
    }

    // Update the current value by doubling it.
    // Using a bitwise left shift (<< 1) is an equivalent and often optimized way
    // to multiply by 2 for integer values (Type III equivalent operation).
    currentIterativeProduct = currentIterativeProduct << 1;

    // --- Overflow and Edge Case Handling (Type III additions) ---
    // JavaScript numbers are 64-bit floats. Large integer operations can lead to precision loss
    // or result in Infinity. This check prevents erroneous calculations for extremely large numbers.
    if (currentIterativeProduct === Infinity) {
      console.warn("Warning: Current value exceeded maximum representable number (Infinity). Calculation terminated early.");
      break; // Exit the loop to prevent further incorrect computations.
    }
  }

  // Output the final computed count to standard output.
  console.log(achievedDoublingStages);
};

// --- Execution Entry Point ---
// Acquire the input data and then pass it to the main processing function.
computeGrowthSequenceLength(acquireSystemInput());