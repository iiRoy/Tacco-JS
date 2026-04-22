"use strict";

/**
 * Processes a sequence of connections to find the path length to a specific target node.
 * This function simulates a traversal through a directed graph where nodes are 1-indexed.
 * It determines the minimum number of hops required to reach a predefined target node (node 2)
 * starting from a predefined entry point (node 1), or indicates if the target is unreachable
 * due to cycles or invalid paths.
 *
 * @param {string} rawInputData - The raw input string containing the number of elements
 *                                and the connection array, separated by newlines.
 */
const processConnectionSequence = function (rawInputData) {
    // Split the input string into individual line segments, removing any leading/trailing whitespace.
    const inputLines = rawInputData.trim().split('\n');

    // The first line contains the total number of elements (nodes) in the system.
    // We parse it as an integer, specifying base 10 for safety.
    const totalNodesCount = parseInt(inputLines[0], 10);

    // --- Input Validation: Total Nodes Count ---
    // Ensure that the number of nodes is a valid positive integer.
    if (isNaN(totalNodesCount) || totalNodesCount <= 0) {
        console.log(-1); // Indicate an error for invalid node count.
        return;
    }

    // The subsequent lines contain the connections. We'll build a map
    // where `connectionMap[i]` stores the destination node from the node `i+1`.
    // This maintains a 0-indexed array for 1-indexed node logic.
    const connectionMap = [];
    for (let currentLineIndex = 1; currentLineIndex <= totalNodesCount; currentLineIndex++) {
        const destinationNode = parseInt(inputLines[currentLineIndex], 10);

        // --- Input Validation: Destination Nodes ---
        // Validate each destination node to ensure it's a valid positive integer
        // and falls within the expected range of nodes (1 to totalNodesCount).
        if (isNaN(destinationNode) || destinationNode < 1 || destinationNode > totalNodesCount) {
            console.log(-1); // Indicate an error for an invalid destination node.
            return;
        }
        connectionMap.push(destinationNode);
    }

    // --- Traversal Constants ---
    // Define the fixed starting and target nodes for this specific problem.
    const entryPointNode = 1;
    const terminalNode = 2;

    // --- Traversal State Initialization ---
    let currentPosition = entryPointNode; // Tracks the node currently being visited.
    let hopCount = 0;                     // Counts the number of steps taken to reach `currentPosition`.
    let foundTarget = false;              // A boolean flag to signal if the terminal node has been reached.

    // A Set is used for efficient storage and lookup of visited nodes to detect cycles.
    const pathTracer = new Set();
    // The entry point node is considered visited from the very beginning of the path.
    pathTracer.add(entryPointNode);

    // --- Path Traversal Loop ---
    // We use an infinite loop and rely on explicit break conditions for control flow.
    while (true) {
        // Calculate the 0-indexed array position corresponding to the 1-indexed `currentPosition`.
        const mapIndex = currentPosition - 1;

        // --- Robustness Check: Map Index Bounds ---
        // This guard ensures that `currentPosition` always refers to a valid node
        // within the `connectionMap` bounds. This handles cases where a node might
        // point to an out-of-range value if input validation was less strict.
        if (mapIndex < 0 || mapIndex >= connectionMap.length) {
            foundTarget = false; // An invalid path has been encountered.
            break;
        }

        // Determine the next node in the sequence based on the current position's mapping.
        const nextPosition = connectionMap[mapIndex];
        hopCount++; // Increment the step counter for this hop.

        // --- Target Node Check ---
        // If the `nextPosition` is the `terminalNode`, we've successfully reached the target.
        if (nextPosition === terminalNode) {
            foundTarget = true;
            break; // Exit the loop as the goal is achieved.
        }

        // --- Cycle Detection ---
        // Check if `nextPosition` has already been visited in the current path.
        // If so, a cycle has been detected, meaning the target is unreachable via a simple path.
        if (pathTracer.has(nextPosition)) {
            foundTarget = false; // Target is unreachable due to a loop.
            break; // Exit the loop.
        }

        // --- Continue Traversal ---
        // If no cycle was detected and the target wasn't reached, add the `nextPosition`
        // to our set of visited nodes and update `currentPosition` for the next iteration.
        pathTracer.add(nextPosition);
        currentPosition = nextPosition;

        // --- Safety Break (Type III Addition) ---
        // An additional safeguard to prevent excessively long or truly infinite loops
        // in pathological cases where cycle detection might theoretically fail or
        // if the path length is enormous. This is a heuristic.
        if (hopCount > totalNodesCount * 2) { // A generous multiplier to allow long paths.
             foundTarget = false; // Assume unreachable if path exceeds a reasonable length.
             break;
        }
    }

    // --- Output Result ---
    // Based on whether the `terminalNode` was found, print the appropriate result.
    if (foundTarget) {
        console.log(hopCount); // Print the total number of hops.
    } else {
        console.log(-1);       // Print -1 to indicate unreachable or error.
    }
};

// Execute the main processing function with data read from standard input.
// This assumes the environment provides 'fs' module and '/dev/stdin' for input.
processConnectionSequence(require('fs').readFileSync('/dev/stdin', 'utf-8'));