// This module encapsulates a simulation process designed to model a dynamic system's evolution.
// It computes sequential states based on a recursive formula, mimicking population growth or similar phenomena.

/**
 * Initiates and executes a step-by-step simulation based on a set of initial conditions.
 * The process calculates subsequent state values from a preceding state, a growth factor,
 * and a constant decrement. Results for each step are outputted to the console.
 *
 * @param {string} rawInputParameters - A single string containing three space-delimited numerical values.
 *                                    These represent the reproduction rate, an environmental constant,
 *                                    and the initial starting value for the simulation.
 */
function executePopulationSimulation(rawInputParameters) {

  // Define key simulation constants to enhance readability and maintainability.
  const TOTAL_SIMULATION_STEPS = 10; // The total number of iterations to perform after the initial state.
  const REQUIRED_PARAMETER_COUNT = 3; // The expected number of numerical inputs.

  // --- Parameter Extraction and Validation ---
  // Safely split the input string into individual parameter tokens.
  const segmentedParameters = rawInputParameters.trim().split(/\s+/);

  // Implement a guard clause to ensure the integrity of the input data.
  if (segmentedParameters.length !== REQUIRED_PARAMETER_COUNT) {
    console.error("Input Error: Incorrect number of simulation parameters provided. Expected " + REQUIRED_PARAMETER_COUNT + ", but received " + segmentedParameters.length + ".");
    return; // Terminate execution gracefully if input is malformed.
  }

  // Parse the string segments into floating-point numbers for accurate calculations.
  // Using Number.parseFloat for explicit type conversion.
  const reproductionRate = Number.parseFloat(segmentedParameters[0]);
  const environmentalConstant = Number.parseFloat(segmentedParameters[1]);
  const initialSystemValue = Number.parseFloat(segmentedParameters[2]);

  // Validate that all parsed parameters are indeed valid numerical representations.
  if (isNaN(reproductionRate) || isNaN(environmentalConstant) || isNaN(initialSystemValue)) {
    console.error("Input Error: One or more provided parameters are not valid numerical values. Please check input format.");
    return; // Exit if any parameter fails numerical validation.
  }

  // --- Initializing the Simulation Trajectory ---
  // Declare an array to store the computed values for each simulation step.
  // This array will hold the entire history of the system's state.
  let systemStateHistory = [];

  // Set the first element of the history array to the provided initial value (epoch 0).
  systemStateHistory[0] = initialSystemValue;

  // --- Core Simulation Loop ---
  // Iterate through each subsequent simulation step, from the first step (index 1)
  // up to the total number of defined simulation steps.
  for (let currentStepIndex = 1; currentStepIndex <= TOTAL_SIMULATION_STEPS; currentStepIndex++) {
    // Retrieve the system's state from the immediately preceding step.
    const priorStepValue = systemStateHistory[currentStepIndex - 1];

    // Calculate the growth component for the current step.
    // This represents the influence of the reproduction rate on the prior state.
    const growthEffect = reproductionRate * priorStepValue;

    // Determine the new system state by applying the environmental constant as a decrement.
    const calculatedCurrentValue = growthEffect - environmentalConstant;

    // Store the newly computed system state in the history array.
    systemStateHistory[currentStepIndex] = calculatedCurrentValue;

    // Output the calculated value for the current step to the standard console.
    // This provides real-time feedback on the simulation's progress.
    console.log(systemStateHistory[currentStepIndex]);
  } // End of the simulation iteration loop.
}

// --- Application Execution Trigger ---
// This section demonstrates a typical invocation pattern for the simulation function,
// often seen in command-line scripts or competitive programming environments where
// input is read from standard input.
// It reads the entire content of '/dev/stdin' as a UTF-8 string and passes it
// to the simulation function for processing.
executePopulationSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));