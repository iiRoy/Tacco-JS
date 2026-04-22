"use strict";

// --- Global Setup for Input Handling ---
// Ensure the input stream remains active for data reception.
process.stdin.resume();
// Configure the character encoding for incoming data.
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming standard input data.
let receivedInputBuffer = '';

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
    // Append each received data chunk to the buffer.
    receivedInputBuffer += dataChunk;
});

// Event listener for the end of the input stream.
process.stdin.on('end', function() {
    // Once all data is received, split it into lines and pass to the main processing function.
    processSimulation(receivedInputBuffer.split(/\r?\n/));
});

// --- Node Structure Helper ---
/**
 * Factory function to create a new process node for the circular linked list.
 * @param {string} id - The unique identifier of the process (e.g., "P1").
 * @param {number} value - The initial time required for the process to complete.
 * @returns {object} A new process node object with properties:
 *                   - `processId`: The process identifier.
 *                   - `timeRemaining`: The current remaining time for the process.
 *                   - `linkToNext`: A reference to the next node in the circular list.
 */
function createProcessNode(id, value) {
    return {
        processId: id,
        timeRemaining: value,
        linkToNext: null // This will be set during list construction.
    };
}

// --- Main Simulation Logic ---
/**
 * Executes the Round Robin scheduling simulation based on the provided input lines.
 * @param {string[]} inputDataLines - An array of strings, where each string is a line from standard input.
 */
function processSimulation(inputDataLines) {
    // --- Input Validation (Type III: Added Guard Clauses) ---
    if (!inputDataLines || inputDataLines.length < 2) {
        console.error("Error: Insufficient input data provided. Expected at least 2 lines.");
        return;
    }

    // --- Parse Initial Parameters (Type II: Renamed, Type III: Updated parsing) ---
    const initialParametersLine = inputDataLines[0].split(' ');
    const totalInitialProcesses = parseInt(initialParametersLine[0], 10);
    const timeQuantum = parseInt(initialParametersLine[1], 10);

    // Type III: Validate parsed numerical parameters.
    if (isNaN(totalInitialProcesses) || totalInitialProcesses <= 0 ||
        isNaN(timeQuantum) || timeQuantum <= 0) {
        console.error("Error: Invalid initial process count or time quantum. Both must be positive integers.");
        return;
    }

    // --- Build Process Nodes (Type III: Intermediate Array & Node Factory) ---
    // Use a temporary array to build individual nodes before linking them into a circular structure.
    const processNodesCollection = [];
    for (let currentLineIndex = 1; currentLineIndex <= totalInitialProcesses; currentLineIndex++) {
        // Type III: Guard against malformed or missing data lines.
        if (!inputDataLines[currentLineIndex]) {
            console.error(`Error: Missing data for process at input line ${currentLineIndex}.`);
            return;
        }
        const processDetails = inputDataLines[currentLineIndex].split(' ');
        const idValue = processDetails[0];
        const initialTime = parseInt(processDetails[1], 10);

        // Type III: Validate individual process details.
        if (!idValue || isNaN(initialTime) || initialTime <= 0) {
            console.error(`Error: Invalid process details at line ${currentLineIndex}. ID: '${idValue}', Value: '${initialTime}'. Both must be valid.`);
            return;
        }
        processNodesCollection.push(createProcessNode(idValue, initialTime));
    }

    // Type III: Handle edge case where no valid processes were initialized.
    if (processNodesCollection.length === 0) {
        console.error("No valid processes were successfully initialized for simulation. Exiting.");
        return;
    }

    // --- Create Circular Linked List (Type III: Explicit Linking Loop) ---
    // Link the nodes from the collection into a circular list.
    for (let i = 0; i < processNodesCollection.length; i++) {
        processNodesCollection[i].linkToNext = processNodesCollection[(i + 1) % processNodesCollection.length];
    }

    // Initialize pointers for simulation traversal.
    let currentProcessingNode = processNodesCollection[0]; // The node currently being processed.
    // The node that comes *before* `currentProcessingNode` in the circular list.
    let previousNodeInList = processNodesCollection[processNodesCollection.length - 1];

    // --- Simulation Variables (Type II: Renamed) ---
    let totalSimulatedTime = 0; // Accumulates the total time elapsed in the simulation.
    let activeProcessCount = totalInitialProcesses; // Tracks how many processes are still in the queue.

    // --- Safety Mechanism (Type III: Added Guard for Infinite Loops) ---
    let simulationIterationCounter = 0;
    const MAX_ALLOWED_ITERATIONS = 10000000; // A large, arbitrary limit to prevent runaway simulations.

    // --- Round Robin Simulation Loop (Type II & III Changes) ---
    // Continue as long as there are active processes.
    while (activeProcessCount > 0) {
        // Type III: Check for potential infinite loop.
        simulationIterationCounter++;
        if (simulationIterationCounter > MAX_ALLOWED_ITERATIONS) {
            console.error("Simulation exceeded maximum allowed iterations, indicating a potential logic error or infinite loop.");
            break; // Exit the loop to prevent application hang.
        }

        // Apply the time quantum to the current process.
        currentProcessingNode.timeRemaining -= timeQuantum;
        totalSimulatedTime += timeQuantum;

        // Type III: Introduce a boolean flag for improved readability of conditional logic.
        const isProcessCompleted = currentProcessingNode.timeRemaining <= 0;

        if (isProcessCompleted) {
            // Type III: Adjust `totalSimulatedTime` to reflect the exact completion time.
            // If `timeRemaining` is negative, it means the process finished before the full quantum.
            totalSimulatedTime += currentProcessingNode.timeRemaining;
            // Output the process ID and its completion time.
            console.log(`${currentProcessingNode.processId} ${totalSimulatedTime}`);

            // Type III: Remove the completed node from the circular linked list.
            // The `previousNodeInList` bypasses the `currentProcessingNode`.
            previousNodeInList.linkToNext = currentProcessingNode.linkToNext;

            // Move `currentProcessingNode` to the next item in the (now shorter) list.
            currentProcessingNode = currentProcessingNode.linkToNext;
            activeProcessCount--; // One less process remaining.
        } else {
            // If the process is not yet completed, it remains in the list.
            // Both pointers advance to the next node in the circular queue.
            previousNodeInList = currentProcessingNode;
            currentProcessingNode = currentProcessingNode.linkToNext;
        }
    }

    // --- Cleanup (Type III: Explicit Nullification for Memory Management) ---
    // Explicitly nullify references to aid garbage collection, especially for large lists.
    currentProcessingNode = null;
    previousNodeInList = null;
    // The `processNodesCollection` array itself will be garbage collected when `processSimulation` exits.
}