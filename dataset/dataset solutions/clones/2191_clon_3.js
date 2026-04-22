const VERDICT_SUCCESS = "yes";
const VERDICT_FAILURE = "no";
const FILE_ENCODING_STANDARD = 'utf8';

/**
 * Executes a simulated battle scenario, processing input parameters
 * to determine if a target entity can be defeated within a given number of actions.
 *
 * @param {string} rawSimulationInput - The complete raw string input containing
 *                                      initial game state and attack patterns.
 */
function initiateBattleSimulation(rawSimulationInput) {
    // Validate the integrity of the provided input data.
    if (!rawSimulationInput || typeof rawSimulationInput !== 'string' || rawSimulationInput.trim().length === 0) {
        console.error("ERROR: Input data for simulation is missing or malformed.");
        return; // Terminate execution gracefully.
    }

    // Split the raw input into distinct lines, filtering out any empty lines.
    const processedInputLines = rawSimulationInput.trim().split("\n").filter(lineFragment => lineFragment.length > 0);

    // Verify that at least two lines of essential data are present.
    if (processedInputLines.length < 2) {
        console.error("ERROR: Insufficient data lines provided for battle simulation setup.");
        return;
    }

    // --- Parse Initial Game State Parameters (First Line) ---
    // The first line contains the entity's starting health and the maximum allowed actions.
    const initialParametersTokens = processedInputLines[0].split(" ");

    // Ensure both initial health and action limit are provided.
    if (initialParametersTokens.length < 2) {
        console.error("ERROR: Malformed initial parameters line. Expected two numeric values.");
        return;
    }

    // Convert string tokens to numerical values.
    let targetEntityHealth = Number(initialParametersTokens[0]);
    const maximumAllowedActions = Number(initialParametersTokens[1]);

    // Validate that the parsed numbers are valid and non-negative.
    if (isNaN(targetEntityHealth) || isNaN(maximumAllowedActions) || targetEntityHealth < 0 || maximumAllowedActions < 0) {
        console.error("ERROR: Invalid numeric values detected for entity health or maximum actions.");
        return;
    }

    // --- Parse Attack Damage Sequence (Second Line) ---
    // The second line contains a space-separated list of damage values.
    const damagePatternSequence = processedInputLines[1].split(" ").map(damageStr => Number(damageStr));

    // Validate the damage pattern sequence. It should not be empty and all values must be numeric.
    if (damagePatternSequence.length === 0 || damagePatternSequence.some(isNaN)) {
        console.error("ERROR: Damage pattern sequence is empty or contains non-numeric entries.");
        return;
    }

    // --- Core Battle Simulation Loop ---
    let totalActionsPerformed = 0; // Tracks the count of attacks made.
    let currentPatternIndex = 0;   // Index to cycle through the `damagePatternSequence`.

    // The simulation proceeds as long as the target entity's health remains non-negative.
    // The `do...while` loop ensures at least one action is recorded, matching original logic.
    do {
        totalActionsPerformed++; // Increment action count for each attack.

        // Apply damage from the current attack pattern to the entity's health.
        targetEntityHealth -= damagePatternSequence[currentPatternIndex];

        // Advance the pattern index, cycling back to the beginning if the end is reached.
        currentPatternIndex = (currentPatternIndex + 1) % damagePatternSequence.length;

    } while (targetEntityHealth >= 0); // Continue if the entity still has non-negative health.

    // --- Determine and Output Final Outcome ---
    // Compare the total number of actions taken against the maximum allowed.
    const simulationResult = (totalActionsPerformed <= maximumAllowedActions) ? VERDICT_SUCCESS : VERDICT_FAILURE;
    console.log(simulationResult);
}

// --- Program Entry Point ---
// This block handles reading input from the standard input stream and initiating the simulation.
try {
    const fileSystemModule = require('fs');
    // Read all data from standard input, using the defined encoding.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', FILE_ENCODING_STANDARD);
    
    // Invoke the main simulation function with the acquired input.
    initiateBattleSimulation(standardInputContent);
} catch (runtimeError) {
    // Catch and report any errors that occur during input reading or initial setup.
    console.error("An unexpected error occurred during program execution:", runtimeError.message);
}