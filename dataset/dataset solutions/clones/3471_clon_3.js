let computationalRegister = [];

/**
 * Applies a specific numerical transformation to two designated elements within the global
 * 'computationalRegister' array. The operation involves conditionally decrementing one value,
 * then integer-halving it, and finally adding this result to another value.
 *
 * @param {number} primaryIndex - The zero-based index of the array element that will be potentially decremented and then halved.
 * @param {number} secondaryIndex - The zero-based index of the array element that will have the processed value added to it.
 */
function processNumericalUpdate(primaryIndex, secondaryIndex) {
  // Before halving, ensure the value at 'primaryIndex' is even.
  // If the least significant bit is 1 (indicating an odd number), decrement it by one.
  // This transformation ensures that subsequent division by two yields an integer.
  if ((computationalRegister[primaryIndex] & 1) === 1) {
    computationalRegister[primaryIndex]--; // Use postfix decrement for conciseness
  }

  // Perform an integer division by two on the value at 'primaryIndex'.
  // The right bit shift operator (>>) is an efficient way to achieve integer division by powers of 2.
  const interimHalvedValue = computationalRegister[primaryIndex] >> 1;

  // Add the 'interimHalvedValue' to the element at 'secondaryIndex'.
  computationalRegister[secondaryIndex] += interimHalvedValue;

  // Update the element at 'primaryIndex' with its new halved value.
  computationalRegister[primaryIndex] = interimHalvedValue;
}

/**
 * Orchestrates the entire simulation process. This includes parsing raw input data,
 * initializing the primary data store, executing a series of iterative transformations,
 * and finally presenting the computed results.
 *
 * @param {string} rawTextualInput - The raw string input, typically from standard input,
 *                                  expected to contain space-separated numbers on the first line.
 */
function runSimulationSequence(rawTextualInput) {
  // Input validation: Check for null, undefined, or empty string inputs.
  if (!rawTextualInput || typeof rawTextualInput !== 'string' || rawTextualInput.trim().length === 0) {
    console.error("Critical Error: Provided input data is either missing or malformed. Cannot proceed.");
    process.exit(1); // Exit with an error code
  }

  // Extract the first non-empty line of the input, as per problem specification.
  const firstDataLine = rawTextualInput.split('\n')[0].trim();

  // Parse the numerical components from the extracted line.
  // Expecting three integer values. Using parseInt with radix 10 for explicit conversion.
  const parsedNumericComponents = firstDataLine.split(/\s+/).map(strVal => {
    const num = parseInt(strVal, 10);
    // Validate each parsed number.
    if (isNaN(num)) {
      console.error(`Input Error: Non-numeric value "${strVal}" found in input. All inputs must be integers.`);
      process.exit(1);
    }
    return num;
  });

  // Verify that exactly three numerical components were successfully parsed.
  if (parsedNumericComponents.length !== 3) {
    console.error(`Input Error: Expected 3 numerical components, but received ${parsedNumericComponents.length}.`);
    process.exit(1);
  }

  // Initialize the global computational register with the parsed values.
  // Using spread syntax for clarity and to create a new array.
  computationalRegister = [...parsedNumericComponents];

  // The third component determines the total number of cycles for the simulation.
  let totalIterationCount = computationalRegister[2];

  // Validate the iteration count. It must be a positive integer.
  if (!Number.isInteger(totalIterationCount) || totalIterationCount < 0) {
    console.warn(`Warning: Invalid iteration count (${totalIterationCount}) detected. It should be a non-negative integer. Adjusting to 0 if negative.`);
    totalIterationCount = Math.max(0, totalIterationCount); // Ensure it's not negative
  }

  // Execute the main simulation loop for the specified number of iterations.
  // The loop variable 'currentCycle' is 0-indexed.
  for (let currentCycle = 0; currentCycle < totalIterationCount; currentCycle++) {
    // Determine the indices for the 'processNumericalUpdate' function based on cycle parity.
    // The original logic uses 1-based indexing for parity, so we use (currentCycle + 1).
    const isOddCycle = ((currentCycle + 1) % 2 !== 0);

    const operandA_Index = isOddCycle ? 0 : 1;
    const operandB_Index = isOddCycle ? 1 : 0;

    // Invoke the transformation function with the determined indices.
    processNumericalUpdate(operandA_Index, operandB_Index);
  }

  // After the simulation completes, output the final state of the first two elements
  // of the computational register in a user-friendly format.
  // A guard clause ensures these indices exist before attempting to log.
  if (computationalRegister.length >= 2) {
    console.log(`Simulation Result: ${computationalRegister[0]} ${computationalRegister[1]}`);
  } else {
    console.error("Output Error: Computational register does not contain enough elements for final display.");
  }
}

// --- Main Program Execution Block ---
// This section handles reading input from the environment and initiating the simulation.
try {
  // Read the entire content of standard input (usually /dev/stdin) synchronously.
  // Specify 'utf8' encoding to correctly interpret text input.
  const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

  // Pass the acquired input content to the simulation orchestrator.
  runSimulationSequence(systemInputContent);
} catch (executionError) {
  // Catch and report any errors that occur during file reading or the initial setup phase.
  console.error("An unexpected error occurred during program execution:", executionError.message);
  process.exit(1); // Terminate with an error code to indicate failure.
}