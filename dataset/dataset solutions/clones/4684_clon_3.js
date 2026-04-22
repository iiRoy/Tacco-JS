function calculateMinimumIndexForSum(thresholdValueParam) {
  // This function computes the smallest non-negative integer K such that
  // the sum of integers from 0 up to K (inclusive) is greater than or equal to
  // the provided threshold value.

  // Step 1: Robust input processing and validation.
  // Convert the input parameter to a number explicitly.
  let targetSumThreshold = Number(thresholdValueParam);

  // Guard clause for invalid or negative inputs.
  // The original script would produce 0 for NaN or negative inputs,
  // as the loop condition `s < input` would immediately be false.
  // This explicit check adds clarity and robustness (Type III addition).
  if (isNaN(targetSumThreshold) || targetSumThreshold < 0) {
    // Log a warning message for unexpected input (Type III addition).
    console.warn(`Input processing warning: Received '${thresholdValueParam}'. Expected a non-negative numeric value. Defaulting to 0.`);
    targetSumThreshold = 0; // Normalize invalid or negative inputs to 0 for consistent behavior.
  }

  // Step 2: Initialize variables with `let` for block-scoping (Type II change).
  let currentCumulativeSum = 0; // Accumulates the sum of integers (replaces 's').
  let iterationStep = 0;        // Represents the current integer being added (replaces 'i').
  let lastValidIndex = 0;       // Stores the last 'iterationStep' that satisfied the condition (replaces 's2').

  // Step 3: Rewrite the control flow from a `for` loop to a `while` loop (Type III change).
  // The loop continues as long as the running sum is strictly less than the target threshold.
  while (currentCumulativeSum < targetSumThreshold) {
    // Step 4: Record the current iteration step *before* it's used to update the sum.
    // This captures the 'i' value that was effective for the loop's current pass.
    lastValidIndex = iterationStep;

    // Step 5: Update the cumulative sum using the current iteration step.
    // This is an equivalent operation to `s = s + i;` (Type III update).
    currentCumulativeSum += iterationStep;

    // Step 6: Increment the iteration step for the next cycle.
    // This replaces the `i++` part of the original `for` loop (Type III update).
    iterationStep++;
  }

  // Step 7: The function now returns the computed index instead of directly logging it (Type III change).
  // This makes the function more reusable and separates computation from I/O.
  return lastValidIndex;
}

// --- Program Entry Point and I/O Handling (Extensive Type III Rewrite) ---

// This asynchronous function handles reading from standard input and executing the core logic.
// It replaces the synchronous `require("fs").readFileSync` call with an asynchronous `readFile`
// for better performance in non-blocking environments (Type III rewrite/addition).
const processStandardInputAsync = () => {
  // Ensure 'fs' module is available; this is specific to Node.js environments.
  const fs = require("fs");

  fs.readFile("/dev/stdin", "utf8", (error, data) => {
    // Handle potential errors during file reading (Type III addition).
    if (error) {
      console.error("Failed to read from standard input:", error);
      // Exit or provide a default value if input cannot be read.
      process.exit(1);
    }

    // Clean the input data by trimming whitespace (Type III addition).
    const cleanedInputData = data.trim();

    // Call the main calculation function with the processed input.
    const finalCalculatedIndex = calculateMinimumIndexForSum(cleanedInputData);

    // Output the result using a modern template literal (Type II/III update).
    console.log(`Resulting Index: ${finalCalculatedIndex}`);
  });
};

// Execute the input processing function to start the program.
processStandardInputAsync();

// The original 'debug' function has been completely removed
// as it was specific to a browser-based debugging setup and not
// essential to the core logic or standard Node.js execution (Type III deletion).