function ProcessGameSimulation(rawInputData) {
    // Extensive comments: This function simulates a turn-based resource depletion game
    // between two abstract entities. It determines which entity's resource
    // drops to zero or below first based on their respective consumption rates.

    // Input validation: Ensure the raw input is a string and not empty.
    if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Simulation Error: Input data is either missing or invalid. Expected a string of numbers.");
        return; // Exit if input is not suitable for processing.
    }

    // Tokenize the input string by one or more whitespace characters.
    const numericTokens = rawInputData.trim().split(/\s+/);

    // Validate the number of parameters provided.
    const REQUIRED_PARAMETERS = 4;
    if (numericTokens.length < REQUIRED_PARAMETERS) {
        console.error(`Simulation Error: Insufficient parameters. Expected ${REQUIRED_PARAMETERS}, received ${numericTokens.length}.`);
        return;
    }

    // Parse and assign values to descriptive, immutable constants.
    // These correspond to the initial state and fixed rates for the simulation.
    const initialEntityTwoResource = Number(numericTokens[0]); // Original: input[0] (A)
    const entityOneConsumptionRate = Number(numericTokens[1]);   // Original: input[1] (B)
    const initialEntityOneResource = Number(numericTokens[2]); // Original: input[2] (C)
    const entityTwoConsumptionRate = Number(numericTokens[3]);   // Original: input[3] (D)

    // Further validation: Ensure all parsed parameters are valid non-negative numbers.
    if (isNaN(initialEntityTwoResource) || isNaN(entityOneConsumptionRate) ||
        isNaN(initialEntityOneResource) || isNaN(entityTwoConsumptionRate) ||
        initialEntityTwoResource < 0 || entityOneConsumptionRate < 0 ||
        initialEntityOneResource < 0 || entityTwoConsumptionRate < 0) {
        console.error("Simulation Error: All game parameters must be valid non-negative numerical values.");
        return;
    }

    // Initialize mutable state variables for the simulation.
    let currentEntityOneResource = initialEntityOneResource; // Current resource level for Entity 1
    let currentEntityTwoResource = initialEntityTwoResource; // Current resource level for Entity 2

    // `activeEntityIndex` determines whose turn it is.
    // 0 represents Entity 1 (original `tTurn === 1`), 1 represents Entity 2 (original `tTurn === 0`).
    let activeEntityIndex = 0; // Entity 1 always starts the resource consumption.

    let simulationCompleted = false; // Flag to control the main simulation loop.
    let finalOutcomeMessage = "";    // Stores the message to be displayed at the end.
    let totalRoundsPlayed = 0;       // Keeps track of the number of turns taken.

    // Main simulation loop: Continues until one entity's resource is depleted.
    while (!simulationCompleted) {
        totalRoundsPlayed++; // Increment the round counter for each iteration.

        // Determine the active entity and apply resource consumption.
        if (activeEntityIndex === 0) { // It is Entity 1's turn (corresponds to original `tTurn === 1`)
            currentEntityOneResource -= entityOneConsumptionRate; // Entity 1 consumes its resource.

            // Check if Entity 1's resource has been depleted.
            if (currentEntityOneResource <= 0) {
                finalOutcomeMessage = "Yes"; // Output "Yes" if Entity 1's resource drops to zero or below.
                simulationCompleted = true;  // End the simulation.
            }
        } else { // It is Entity 2's turn (corresponds to original `tTurn === 0`)
            currentEntityTwoResource -= entityTwoConsumptionRate; // Entity 2 consumes its resource.

            // Check if Entity 2's resource has been depleted.
            if (currentEntityTwoResource <= 0) {
                finalOutcomeMessage = "No";  // Output "No" if Entity 2's resource drops to zero or below.
                simulationCompleted = true;  // End the simulation.
            }
        }

        // If the simulation has not completed this turn, switch to the next entity.
        // This toggles the `activeEntityIndex` between 0 and 1.
        if (!simulationCompleted) {
            activeEntityIndex = 1 - activeEntityIndex;
        }
    }

    // Output the final result of the simulation to the console.
    console.log(finalOutcomeMessage);
}

// Entry point for executing the simulation in a Node.js environment.
// Reads the entire content of standard input, decodes it as UTF-8,
// and passes it to the simulation function.
ProcessGameSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));