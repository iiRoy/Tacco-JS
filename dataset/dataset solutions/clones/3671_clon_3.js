function processInputData(sourceDataContent) {
    // Split the entire raw input string by newline characters to get an array of individual lines.
    const inputLines = sourceDataContent.split('\n');

    // The first line of the input specifies the total number of test scenarios to process.
    // We convert this string to a numeric value using the Number constructor.
    const totalScenarios = Number(inputLines[0]);

    // An array to accumulate the outcome (either "Yes" or "No") for each scenario.
    const scenarioOutcomes = [];

    /**
     * Helper function to evaluate a single test scenario based on its parameters.
     * This function encapsulates the core logic, making it reusable and enabling early exits.
     * @param {string[]} paramsArray - An array of string representations of the four numeric parameters.
     * @returns {string} "Yes", "No", or "No (Max Iterations)" indicating the scenario's outcome.
     */
    const evaluateSingleScenario = (paramsArray) => {
        // Destructure and convert the string parameters to numbers using map(Number).
        // Renamed A, B, C, D to valAlpha, valBeta, valGamma, valDelta for Type II change.
        let [valAlpha, valBeta, valGamma, valDelta] = paramsArray.map(Number);

        // Store the initial value of valAlpha for later comparison within the cycle.
        const initialValAlpha = valAlpha;

        // --- Initial Guard Clauses (reordered and rephrased for Type III) ---
        // If the initial 'valAlpha' is less than 'valBeta', it's impossible to
        // make progress in the cycle, so it's an immediate "No".
        if (valAlpha < valBeta) {
            return "No";
        }
        // If 'valDelta' is less than 'valBeta', adding 'valDelta' won't help
        // overcome the 'valBeta' consumption, leading to a "No" outcome.
        if (valDelta < valBeta) {
            return "No";
        }
        // If the initial 'valAlpha' is already less than 'valGamma',
        // the condition for "Yes" is met immediately without cycling.
        if (valAlpha < valGamma) {
            return "Yes";
        }

        // Calculate the effective starting value for the cyclic process.
        // This is equivalent to (original A % B) + B, ensuring the value is at least B.
        // Renamed 'newA' to 'currentCycleValue'.
        let currentCycleValue = (valAlpha % valBeta) + valBeta;

        // --- Core Cyclic Logic ---
        // Introduce a counter to prevent infinite loops, a Type III addition for robustness.
        let cycleIterationCounter = 0;
        const MAXIMUM_PERMITTED_ITERATIONS = 5000000; // A large arbitrary limit.

        // Continue cycling as long as 'currentCycleValue' is sufficient and iteration limit not reached.
        while (currentCycleValue >= valBeta && cycleIterationCounter < MAXIMUM_PERMITTED_ITERATIONS) {
            cycleIterationCounter++; // Increment the iteration count.

            // Calculate the value remaining after 'valBeta' is consumed from 'currentCycleValue'.
            const valueAfterConsumption = currentCycleValue - valBeta;

            // Apply the logic based on whether 'valueAfterConsumption' is within 'valGamma' threshold.
            if (valueAfterConsumption <= valGamma) {
                // If it's within the threshold, 'valDelta' is added.
                currentCycleValue = valueAfterConsumption + valDelta;
            } else {
                // Otherwise, 'currentCycleValue' just becomes 'valueAfterConsumption'.
                currentCycleValue = valueAfterConsumption;
            }

            // Check if the 'currentCycleValue' has reached or surpassed the 'initialValAlpha'.
            if (currentCycleValue >= initialValAlpha) {
                return "Yes"; // The success condition is met.
            }
        }

        // --- Post-Loop Evaluation (Type III refinement) ---
        // If the loop terminated because the maximum iterations were reached,
        // it suggests a potential issue or a very long-running "No" case.
        if (cycleIterationCounter >= MAXIMUM_PERMITTED_ITERATIONS) {
            return "No (Max Iterations)"; // Provide more specific feedback.
        }
        // If the loop completed without meeting the "Yes" condition, it's a "No".
        return "No";
    };

    // Iterate through each scenario line, starting from the second line (index 1)
    // up to the total number of scenarios specified.
    for (let currentScenarioIndex = 1; currentScenarioIndex <= totalScenarios; currentScenarioIndex++) {
        // Split the current scenario's line by space to get its individual parameters.
        const currentScenarioParameters = inputLines[currentScenarioIndex].split(' ');

        // Evaluate the scenario using the helper function and store its result.
        scenarioOutcomes.push(evaluateSingleScenario(currentScenarioParameters));
    }

    // Output all collected results, with each outcome separated by a newline.
    console.log(scenarioOutcomes.join('\n'));
}

// --- Input Handling (Type III modification with different variable names) ---
// Utilize Node.js's 'fs' module to read synchronous input from '/dev/stdin'.
const fileSystemUtility = require('fs');
const standardInputFilePath = '/dev/stdin';
const rawInputContentBuffer = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

// Invoke the main processing function with the content read from standard input.
processInputData(rawInputContentBuffer);