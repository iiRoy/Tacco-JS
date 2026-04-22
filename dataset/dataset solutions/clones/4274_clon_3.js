function executeGrowthSimulation(programData) {
  /*
   * This module calculates a final numerical state based on initial parameters
   * extracted from a provided string input. It simulates a sequential growth
   * or accumulation process over a specified number of steps.
   *
   * The core logic involves conditionally doubling a value or adding a fixed
   * increment, depending on whether the current value exceeds a certain threshold.
   */

  const dataLines = programData.split('\n'); // Split the input string into individual lines

  // --- Parameter Parsing and Validation ---

  // Attempt to parse the total number of iterations for the simulation
  let maxIterations = parseInt(dataLines[0], 10);
  if (isNaN(maxIterations) || maxIterations < 0) {
    console.error("Warning: Invalid or negative iteration count detected. Defaulting to 0 steps.");
    maxIterations = 0; // Ensure a non-negative, valid iteration count
  }

  // Attempt to parse the fixed value used for addition or threshold comparison
  let additiveIncrement = parseInt(dataLines[1], 10);
  if (isNaN(additiveIncrement) || additiveIncrement < 0) {
    console.error("Warning: Invalid or negative additive increment. Defaulting to 1 for stability.");
    additiveIncrement = 1; // Provide a safe default for the increment
  }

  // Initialize the primary accumulator variable with its starting value
  let dynamicValueAccumulator = 1; // The process always begins from the integer 1

  // --- Iterative Growth Calculation ---

  // Loop through each simulation step as determined by maxIterations
  for (let currentStepIndex = 0; currentStepIndex < maxIterations; ++currentStepIndex) {
    // Determine if the current accumulator value is less than or equal to the additive increment.
    // This is a simplified check of (dynamicValueAccumulator * 2 - dynamicValueAccumulator) <= additiveIncrement
    // which reduces to dynamicValueAccumulator <= additiveIncrement.
    const conditionMetForDoubling = (dynamicValueAccumulator <= additiveIncrement);

    if (conditionMetForDoubling) {
      // If the condition is met, double the accumulator using a bitwise left shift.
      dynamicValueAccumulator <<= 1; // Equivalent to dynamicValueAccumulator = dynamicValueAccumulator * 2;
    } else {
      // Otherwise, add the additive increment to the accumulator.
      dynamicValueAccumulator += additiveIncrement;
    }

    // Optional: Log intermediate states for detailed tracing (can be commented out for production)
    // console.debug(`Step ${currentStepIndex + 1}: Current value is now ${dynamicValueAccumulator}`);
  }

  // Output the final computed value to the console
  console.log(dynamicValueAccumulator);
}

// --- Input Acquisition and Execution ---

const standardInputPath = "/dev/stdin"; // Define the standard input file path

try {
  // Read the entire content of the standard input file synchronously
  const fileInputContent = require("fs").readFileSync(standardInputPath, "utf8");

  // Invoke the main processing function with the obtained input
  executeGrowthSimulation(fileInputContent);

} catch (ioError) {
  // Handle potential errors during file reading
  console.error(`An I/O error occurred while attempting to read from ${standardInputPath}:`);
  console.error(`Details: ${ioError.message}`);
  // As a fallback or for testing without stdin, one might hardcode input:
  // executeGrowthSimulation("5\n3");
}