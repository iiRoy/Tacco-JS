/**
 * Processes raw input text to simulate a resource management scenario across multiple test cases.
 * Each test case involves an initial resource, a consumption rate, a replenishment threshold, and a replenishment amount.
 * @param {string} rawTextContent - The entire input string, typically from stdin, with lines separated by newlines.
 */
function processInputData(rawTextContent) {
    // Split the entire input content into individual lines.
    const inputLines = rawTextContent.split('\n');

    // Parse the first line to determine the total number of simulation scenarios.
    // Adding a check for valid integer parsing (Type III: guard clause/validation).
    const numberOfSimulationsStr = inputLines[0];
    const totalScenarios = parseInt(numberOfSimulationsStr, 10);

    // If parsing fails or count is invalid, log and exit (Type III: error handling).
    if (isNaN(totalScenarios) || totalScenarios <= 0) {
        console.error("Error: Invalid or missing number of test cases in input.");
        return;
    }

    // Iterate through each scenario, starting from the second line of input.
    // The loop runs for 'totalScenarios' times.
    for (let currentScenarioIdx = 1; currentScenarioIdx <= totalScenarios; currentScenarioIdx++) {
        const currentLine = inputLines[currentScenarioIdx];

        // Skip empty lines that might occur, especially at the end of input (Type III: guard clause).
        if (!currentLine || currentLine.trim() === '') {
            // console.warn(`Warning: Skipping empty line at index ${currentScenarioIdx}.`);
            continue;
        }

        // Split the current line into its numeric components.
        const stringParameters = currentLine.split(' ');

        // Parse individual parameters for the current simulation.
        // Using descriptive names for clarity (Type II: renaming).
        const initialResourceLevel = parseInt(stringParameters[0], 10);
        const resourceDecrementAmount = parseInt(stringParameters[1], 10);
        const replenishmentThreshold = parseInt(stringParameters[2], 10);
        const replenishmentBoost = parseInt(stringParameters[3], 10);

        // Validate parsed numbers (Type III: guard clause/validation).
        if (isNaN(initialResourceLevel) || isNaN(resourceDecrementAmount) ||
            isNaN(replenishmentThreshold) || isNaN(replenishmentBoost)) {
            console.log("Error processing scenario: Invalid numeric input.");
            continue; // Move to the next scenario if parsing failed.
        }

        // Determine the outcome of the current simulation using a dedicated helper function.
        // This encapsulates the core logic, improving readability and maintainability (Type III: helper function).
        const isSimulationSuccessful = runResourceSimulation(
            initialResourceLevel,
            resourceDecrementAmount,
            replenishmentThreshold,
            replenishmentBoost
        );

        // Output the result for the current scenario.
        if (isSimulationSuccessful) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}

/**
 * Simulates a resource management process to determine if a stable or growing state is reached.
 * This function encapsulates the complex simulation logic.
 * @param {number} startValue - The initial resource amount (equivalent to original 'A').
 * @param {number} consumptionRate - The amount consumed each cycle (equivalent to original 'B').
 * @param {number} refillTrigger - The threshold for conditional replenishment (equivalent to original 'C').
 * @param {number} refillAmount - The amount replenished if trigger is met (equivalent to original 'D').
 * @returns {boolean} - True if a successful state is reached, false otherwise.
 */
function runResourceSimulation(startValue, consumptionRate, refillTrigger, refillAmount) {
    // --- Initial validation and early exit conditions (Type III: guard clauses) ---

    // If initial resource is less than consumption, it's impossible to proceed.
    if (startValue < consumptionRate) {
        return false;
    }

    // If replenishment is less than consumption, it's impossible to maintain.
    if (refillAmount < consumptionRate) {
        return false;
    }

    // If initial resource is already below the refill trigger, it's an immediate success condition.
    // This seems to be an "easy win" scenario.
    if (startValue < refillTrigger) {
        return true;
    }

    // --- Simulation setup ---

    // Store the original starting value to compare against for success conditions.
    const initialReferenceValue = startValue;

    // Calculate the resource level after an initial consumption and replenishment cycle.
    // This is equivalent to `newA = A % B; A = newA + B;` from the original code.
    // It ensures that `currentResourcePool` is at least `consumptionRate` for the loop.
    let currentResourcePool = (startValue % consumptionRate) + consumptionRate;

    // --- Main simulation loop (Type III: structural rewrite, added safety) ---

    // A safety counter to prevent infinite loops in unforeseen edge cases.
    const MAXIMUM_ITERATIONS_ALLOWED = 1_000_000;
    let iterationTracker = 0;

    // Continue the simulation as long as resources are sufficient for consumption
    // and the maximum iteration limit has not been reached.
    while (currentResourcePool >= consumptionRate && iterationTracker < MAXIMUM_ITERATIONS_ALLOWED) {
        iterationTracker++; // Increment iteration counter.

        // Calculate the resource level after consuming the standard amount.
        let postConsumptionResource = currentResourcePool - consumptionRate;

        // Apply conditional replenishment based on the threshold.
        if (postConsumptionResource <= refillTrigger) {
            currentResourcePool = postConsumptionResource + refillAmount;
        } else {
            currentResourcePool = postConsumptionResource;
        }

        // Check for success conditions:
        // 1. Resource level has doubled or more compared to the original start.
        // 2. Resource level has returned to exactly the original start value (implying stability).
        if (currentResourcePool >= (2 * initialReferenceValue) || currentResourcePool === initialReferenceValue) {
            return true; // Simulation successful.
        }
    }

    // If the loop finishes without meeting the success conditions, the simulation failed.
    // This typically means resources dwindled below the consumption rate or max iterations reached.
    return false;
}

// Entry point for execution: Read input from stdin and pass it to the processing function.
// This part remains similar as it's the external interface, but variables are renamed.
const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

try {
    const rawInputContentFromStdin = fileSystemModule.readFileSync(standardInputPath, 'utf8');
    processInputData(rawInputContentFromStdin);
} catch (errorDetails) {
    console.error(`An error occurred while reading input or processing data: ${errorDetails.message}`);
    // Optionally, provide more specific error handling based on errorDetails.code
}