/**
 * Executes a specific iterative numerical simulation based on provided input parameters.
 * The simulation involves a growth multiplier, an offset, and an initial accumulator value,
 * performing a fixed number of iterations and logging the accumulator's state at each step.
 *
 * @param {string} sourceData - The raw input string, expected to contain parameters on its first line.
 *                               The first line should have three space-separated numbers:
 *                               [growth_multiplier] [offset_amount] [initial_accumulator_value].
 */
function performIterativeSimulation(sourceData) {
  // Use 'let' for variables that will be reassigned, 'const' for those that won't.
  let growthMultiplier;
  let offsetAmount;
  let currentAccumulator;

  // Collection to store results of each iteration for later output.
  const simulationResults = [];

  // Define the total number of cycles for the simulation.
  const totalSimulationCycles = 10;

  try {
    // Split the entire input content into individual lines.
    const inputLines = sourceData.split('\n');

    // Basic validation: ensure there's at least one line of input.
    if (!inputLines || inputLines.length === 0) {
      throw new Error('Input data is empty or malformed: no lines found.');
    }

    // Extract the first meaningful line which should contain our numeric parameters.
    const parameterLine = inputLines[0].trim();

    // Split the first line by spaces to get individual parameter tokens.
    const parameterTokens = parameterLine.split(' ');

    // Validate the number of parameters.
    if (parameterTokens.length < 3) {
      throw new Error('Insufficient numeric parameters on the first line. Expected 3 values.');
    }

    // Parse the string tokens into numeric values. Using Number() for type conversion.
    // Assigning to intermediate constants first for readability and type clarity.
    const rawMultiplierStr = parameterTokens[0];
    const rawOffsetStr = parameterTokens[1];
    const rawInitialValueStr = parameterTokens[2];

    growthMultiplier = Number(rawMultiplierStr);
    offsetAmount = Number(rawOffsetStr);
    currentAccumulator = Number(rawInitialValueStr);

    // Validate if parsing resulted in actual numbers.
    if (isNaN(growthMultiplier) || isNaN(offsetAmount) || isNaN(currentAccumulator)) {
      throw new Error('Failed to parse one or more numeric parameters. Please check input format.');
    }

    // Begin the iterative calculation process.
    // The loop runs for a predefined number of cycles.
    for (let cycleIndex = 0; cycleIndex < totalSimulationCycles; cycleIndex++) {
      // Apply the core transformation formula:
      // New value = (Growth Factor * Current Value) - Offset.
      currentAccumulator = (growthMultiplier * currentAccumulator) - offsetAmount;

      // Store the result of the current iteration.
      simulationResults.push(currentAccumulator);
    }

    // Output all collected simulation results, each on a new line.
    simulationResults.forEach(value => {
      console.log(value);
    });

  } catch (errorDetails) {
    // Handle any errors that occurred during input processing or simulation.
    console.error("Operation failed:", errorDetails.message);
    // Optionally, could exit the process here: process.exit(1);
  }
}

// Entry point for execution: Read input from standard input and pass it to the simulation function.
// This part is wrapped in its own try-catch block to handle file system errors specifically.
try {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';

  // Read the entire content of the standard input file as a UTF-8 string.
  const allInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

  // Invoke the main simulation function with the acquired input.
  performIterativeSimulation(allInputContent);

} catch (ioError) {
  // Catch and report errors related to file reading (e.g., file not found, permission issues).
  console.error("Input reading error:", ioError.message);
  process.exit(1); // Exit with an error code to indicate failure.
}