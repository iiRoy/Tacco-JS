const fileSystemModule = require('fs');

// Define the standard input file path for reading data.
const standardInputPath = '/dev/stdin';

/**
 * Retrieves raw input data from a specified path, processes it,
 * and returns an array of cleaned lines.
 * Handles potential file reading errors.
 * @returns {string[]} An array where each element is a line from the input, trimmed and non-empty.
 */
function acquireAndParseInputLines() {
    try {
        // Read the entire file content as a UTF-8 string.
        const rawContentBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');
        // Trim overall whitespace, split into lines, and filter out any empty lines.
        return rawContentBuffer.trim().split('\n').filter(lineContent => lineContent.length > 0);
    } catch (error) {
        // Log an error if file reading fails and return an empty array to prevent further processing.
        console.error(`Error encountered while reading from ${standardInputPath}: ${error.message}`);
        return [];
    }
}

// Initialize a global array to hold all game configuration lines.
let gameScenarioConfigurations = acquireAndParseInputLines();

/**
 * Executes the main game simulation logic, processing multiple scenarios
 * until a termination signal is received or no more input is available.
 */
function commenceGameSimulation() {
    let currentScenarioId = 0; // Tracks the number of scenarios processed.

    // Outer loop continues indefinitely until an explicit break condition is met.
    while (true) {
        currentScenarioId++;

        // Attempt to retrieve the next configuration line.
        const nextConfigurationString = gameScenarioConfigurations.shift();

        // If no more lines are available, gracefully exit the simulation.
        if (!nextConfigurationString) {
            // console.log("No further game configurations found. Terminating simulation.");
            break;
        }

        // Check for the specific termination sequence "0 0".
        const terminationSequence = "0 0";
        if (nextConfigurationString.trim() === terminationSequence) {
            // console.log(`Termination sequence '${terminationSequence}' detected. Exiting simulation after ${currentScenarioId - 1} scenarios.`);
            break;
        }

        // Parse the numerical parameters from the current configuration line.
        const parsedNumericParameters = nextConfigurationString.split(' ').map(Number);

        // Validate the structure and content of the parsed parameters.
        if (parsedNumericParameters.length !== 2 || parsedNumericParameters.some(isNaN)) {
            console.warn(`Skipping malformed configuration (Scenario ${currentScenarioId}): "${nextConfigurationString}". Expected two valid numbers.`);
            continue; // Proceed to the next scenario.
        }

        let totalParticipants = parsedNumericParameters[0]; // Represents 'n' from original code.
        let initialResourceSupply = parsedNumericParameters[1]; // Represents 'p' from original code.

        // Validate the logical constraints of the game parameters.
        if (totalParticipants <= 0 || initialResourceSupply < 0) {
            console.warn(`Skipping invalid game parameters (Scenario ${currentScenarioId}): Participants=${totalParticipants}, Resources=${initialResourceSupply}. Participants must be positive, resources non-negative.`);
            continue; // Proceed to the next scenario.
        }

        // Initialize an array to store each participant's current resource holdings.
        // Using Array.fill(0) is a concise way to create an array of zeros.
        const participantResourceHoldings = Array(totalParticipants).fill(0); // Represents 'arr' from original.

        let currentParticipantIndex = 0; // Represents 'j' from original, indicating the active participant.
        const maximumSimulationSteps = 1000000; // A safety limit to prevent infinite loops in simulation.

        let simulationActive = true; // Flag to control the inner game loop for the current scenario.

        // Inner loop simulates the game turns for the current scenario.
        for (let stepCounter = 0; stepCounter < maximumSimulationSteps && simulationActive; stepCounter++) {
            // Ensure the participant index wraps around cyclically.
            currentParticipantIndex = currentParticipantIndex % totalParticipants;

            // Decision branch: Is there a common resource supply available?
            if (initialResourceSupply > 0) {
                // If yes, consume one resource from the common supply.
                initialResourceSupply--;
                // And allocate it to the current participant.
                participantResourceHoldings[currentParticipantIndex]++;

                // After resource allocation, check for a winning condition.
                if (initialResourceSupply === 0) {
                    // A participant wins if they have all the resources and the common pool is empty.
                    // This means all *other* participants must have zero resources.
                    const isOnlyOneResourceHolder = participantResourceHoldings.every((holdingAmount, indexInArray) => {
                        return (indexInArray === currentParticipantIndex) || (holdingAmount === 0);
                    });

                    if (isOnlyOneResourceHolder) {
                        // Output the index of the winning participant (0-based).
                        console.log(currentParticipantIndex);
                        simulationActive = false; // Mark simulation as complete for this scenario.
                        break; // Exit the inner simulation loop.
                    }
                }
            } else {
                // If the common resource supply is empty, the current participant contributes their holdings.
                // Transfer all resources from the current participant to the common supply.
                initialResourceSupply = participantResourceHoldings[currentParticipantIndex];
                // Reset the current participant's holdings to zero.
                participantResourceHoldings[currentParticipantIndex] = 0;
            }

            // Advance to the next participant for the subsequent step.
            currentParticipantIndex++;
            // The modulo operation at the beginning of the loop handles the actual wrap-around.
        }

        // Optional: Add a warning if the simulation reached its maximum steps without a clear winner,
        // which might indicate an issue or a particularly long game.
        // if (simulationActive) {
        //     console.warn(`Scenario ${currentScenarioId} (N=${totalParticipants}, P=${initialResourceSupply}) did not conclude within ${maximumSimulationSteps} steps.`);
        // }
    }
}

// Start the game simulation process.
commenceGameSimulation();