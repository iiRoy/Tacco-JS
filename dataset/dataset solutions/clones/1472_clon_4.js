const dataSource = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processingEngine = (currentSystemState, inputInstruction) => {
    // If the 'terminate' signal has been received, no further processing occurs.
    if (currentSystemState.terminate) {
        return currentSystemState;
    }

    // Deconstruct current state for easier access and prepare for next state.
    const { storageUnit, collectedResults } = currentSystemState;
    let nextStorageUnit = [...storageUnit]; // Create a new array to simulate immutability
    let nextCollectedResults = [...collectedResults];
    let nextTerminateStatus = false;

    // Process the instruction based on its exact string value.
    if (inputInstruction === "quit") {
        nextTerminateStatus = true;
    } else if (inputInstruction === "pop") {
        // If the storage unit has items, remove the last one and add it to collected results.
        if (nextStorageUnit.length > 0) {
            nextCollectedResults.push(nextStorageUnit.pop());
        }
    } else {
        // For any other instruction, extract the second space-separated token (if it exists).
        // This replicates the original behavior of pushing 'undefined' if no second token.
        const instructionParts = inputInstruction.split(' ');
        const itemToPlace = instructionParts[1];
        nextStorageUnit.push(itemToPlace);
    }

    // Return the new state of the system.
    return {
        storageUnit: nextStorageUnit,
        collectedResults: nextCollectedResults,
        terminate: nextTerminateStatus
    };
};

// Prepare the raw input by trimming overall whitespace and splitting into lines.
// No individual line trimming is applied to match the original's specific behavior.
const instructionSequence = dataSource.trim().split('\n');

// Define the initial state of our processing system.
const initialSystemState = {
    storageUnit: [],       // Represents the LIFO stack
    collectedResults: [],  // Stores items retrieved by 'pop'
    terminate: false       // Flag to signal termination
};

// Execute the instruction sequence using a functional reduction pattern.
const finalSystemState = instructionSequence.reduce(processingEngine, initialSystemState);

// Output the collected results, each on a new line.
console.log(finalSystemState.collectedResults.join('\n'));