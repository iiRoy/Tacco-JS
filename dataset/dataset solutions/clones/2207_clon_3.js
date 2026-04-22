'use strict' // Enforce stricter parsing and error handling for improved code quality.

/**
 * @typedef {object} ActionDetails
 * @property {number} expenditure - The resource cost or energy drain incurred by performing this action.
 * @property {number} numberYield - The value or reward gained from executing this action.
 */

/**
 * Calculates a priority metric or 'efficiency score' for a given action,
 * taking into account the current available resource supply. This metric
 * guides the selection process of actions in the simulation.
 *
 * @param {number} currentResourceSupply - The total quantity of the primary resource currently available.
 * @param {ActionDetails} actionParameters - An object detailing the action's cost and benefit.
 * @returns {number} A computed numerical score indicating the action's priority or value.
 */
const computeActionPriority = (currentResourceSupply, actionParameters) => {
  // Determine the actual resource consumption, ensuring it does not exceed the available supply.
  // This effectively caps the expenditure at the current resource level.
  let effectiveConsumption = Math.min(actionParameters.expenditure, currentResourceSupply);

  // Implement a safeguard against division by zero.
  // If the effective consumption is zero, the action might be infinitely good (if it yields something)
  // or neutral (if it yields nothing). Assign a very large value for sorting purposes if there's a yield.
  if (effectiveConsumption === 0) {
    return (actionParameters.numberYield > 0) ? Number.MAX_SAFE_INTEGER : 0;
  }

  // The core calculation: (currentSupply / effectiveConsumption) * yield.
  // This formula weights the yield by a factor derived from the current resource
  // and the action's adjusted consumption.
  return (currentResourceSupply / effectiveConsumption) * actionParameters.numberYield;
};

/**
 * Executes a simulation process to determine the maximum accumulated value
 * by iteratively applying actions based on a dynamic priority system.
 * The simulation continues until the primary resource is depleted or a
 * predefined maximum number of steps is reached.
 *
 * @param {string} rawInputString - The complete raw input content as a single string.
 */
function runResourceSimulation(rawInputString) {
  // --- Input Data Parsing and Initial Validation ---

  // Verify that input data is not empty or just whitespace.
  if (!rawInputString || rawInputString.trim().length === 0) {
    console.error("Simulation Aborted: No input data was provided.");
    return; // Terminate if input is absent.
  }

  // Divide the raw input into individual lines for sequential processing.
  const allInputLines = rawInputString.trim().split('\n');

  // Extract and remove the first line, which contains global simulation parameters.
  const initialConfigLine = allInputLines.shift();
  if (!initialConfigLine) {
      console.error("Simulation Aborted: Missing the initial configuration line in input.");
      return;
  }

  // Parse the numerical tokens from the configuration line.
  const configTokens = initialConfigLine.split(' ').map(token => Number(token));

  // Validate the parsed configuration numbers.
  if (configTokens.some(isNaN) || configTokens.length < 1) {
    console.error("Simulation Aborted: Invalid numerical parameters in the initial configuration.");
    return;
  }

  let availableEnergySupply = configTokens[0]; // The primary depletable resource.
  // Note: The second number in `configTokens` (if present) representing the count of action types
  // is implicitly handled by the number of subsequent lines and not directly used here.

  // Process the remaining lines to construct a list of actionable operations.
  /** @type {ActionDetails[]} */
  const potentialOperations = allInputLines.map((lineText, lineIndex) => {
    const operationTokens = lineText.split(' ').map(token => Number(token));
    // Validate each operation line for correctness.
    if (operationTokens.some(isNaN) || operationTokens.length !== 2) {
      console.warn(`Warning: Skipping malformed operation definition on input line ${lineIndex + 2}: "${lineText}"`);
      return null; // Mark invalid entries for removal.
    }
    // Return a structured object for valid operations.
    return { expenditure: operationTokens[0], numberYield: operationTokens[1] };
  }).filter(operation => operation !== null); // Remove any null entries resulting from invalid lines.

  // If no valid operations are available after parsing, the simulation cannot proceed.
  if (potentialOperations.length === 0) {
      console.log({ finalAccumulatedValue: 0 }); // No operations, no value accumulation.
      return;
  }

  // Initialize the total accumulated value.
  let finalAccumulatedValue = 0;
  let currentSimulationStep = 0; // Counter for simulation iterations.
  const MAXIMUM_SIMULATION_ITERATIONS = 1000000; // A safety limit to prevent infinite loops.

  // --- Core Simulation Loop ---
  // The simulation continues as long as there is energy and the iteration limit hasn't been hit.
  while (availableEnergySupply > 0 && currentSimulationStep < MAXIMUM_SIMULATION_ITERATIONS) {
    currentSimulationStep++; // Increment step counter.

    // Create a temporary, sorted list of operations based on their priority at the current energy level.
    // A shallow copy is made to ensure the original 'potentialOperations' array remains untouched.
    // The sorting order is ascending based on `computeActionPriority`, meaning the operation
    // with the *lowest* priority score will be selected first.
    const prioritizedOperationList = [...potentialOperations].sort((opA, opB) => {
      const scoreForA = computeActionPriority(availableEnergySupply, opA);
      const scoreForB = computeActionPriority(availableEnergySupply, opB);
      return scoreForA - scoreForB;
    });

    // Select the operation deemed highest priority (i.e., lowest score) by the sorting logic.
    const selectedOperation = prioritizedOperationList[0];

    // Defensive check: If no operation could be selected (e.g., list became empty unexpectedly), break.
    if (!selectedOperation) {
        console.warn("No valid operation could be selected in this step. Halting simulation prematurely.");
        break;
    }

    // Apply the effects of the chosen operation.
    const energyConsumedByOperation = selectedOperation.expenditure;
    const valueGainedFromOperation = selectedOperation.numberYield;

    availableEnergySupply -= energyConsumedByOperation; // Deduct the cost.
    finalAccumulatedValue += valueGainedFromOperation;   // Add to the total reward.

    // Optional: Detailed logging for debugging purposes.
    // console.log(`Step ${currentSimulationStep}: Consumed ${energyConsumedByOperation}, Gained ${valueGainedFromOperation}. Current energy: ${availableEnergySupply}, Total value: ${finalAccumulatedValue}`);
  }

  // --- Final Output and Post-Simulation Checks ---
  // Issue a warning if the simulation terminated due to reaching the maximum iteration limit.
  if (currentSimulationStep >= MAXIMUM_SIMULATION_ITERATIONS) {
      console.warn(`Warning: Simulation reached its maximum allowed iterations (${MAXIMUM_SIMULATION_ITERATIONS}) before resource depletion.`);
  }

  // Present the final accumulated value with a clear label.
  console.log({ finalAccumulatedValue });
}

// Main execution entry point: Reads input from standard input and initiates the simulation.
// This setup is typical for Node.js applications interacting with command-line input.
runResourceSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));