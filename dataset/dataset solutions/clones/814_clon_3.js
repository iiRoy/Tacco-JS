const fileSystemModule = require('fs');

// Path to read standard input from.
const standardInFilePath = '/dev/stdin';

/**
 * Helper function to parse a string line into an array of numbers.
 * Assumes numbers are space-separated.
 * @param {string} lineStr - The string line to parse.
 * @returns {number[]} An array of numbers.
 */
const extractNumbersFromLine = (lineStr) => {
    // Ensure the line is trimmed before splitting to handle erratic whitespace.
    return lineStr.trim().split(' ').map(Number);
};

// Read the entire content of the standard input file as a UTF-8 string.
const inputContentString = fileSystemModule.readFileSync(standardInFilePath, 'utf8');

// Split the input into individual lines, removing any blank lines or
// surrounding whitespace from the entire block first.
const processedInputLines = inputContentString.trim().split('\n');

// Initialize a cursor to keep track of the current line being processed in the input array.
let lineReadCursor = 0;

// Outer loop to process multiple test cases present in the input.
// Each iteration handles one set of N, M, and their subsequent dependencies.
while (true) {
    // Read the N (totalNodes) and M (totalEdges) values for the current test case.
    const currentCaseParameters = extractNumbersFromLine(processedInputLines[lineReadCursor]);
    lineReadCursor++; // Move the cursor to the next line.

    const totalNodes = currentCaseParameters[0];
    const totalEdges = currentCaseParameters[1];

    // Check for the termination condition (N=0 and M=0).
    if (totalNodes === 0 && totalEdges === 0) {
        break; // Exit the processing loop.
    }

    // Initialize an array to maintain the state of each node.
    // 'true' implies the node is "active" or "pending".
    // 'false' implies the node is "inactive" or "resolved".
    // All nodes are initially set to active.
    const nodeStateFlags = new Array(totalNodes).fill(true);

    // The first node (index 0) is special; it starts in an "inactive" state.
    const startingInactiveNode = 0;
    nodeStateFlags[startingInactiveNode] = false;

    // An array to store all relationships (dependencies) as triplets:
    // [eventTimestamp, originNodeIndex, terminalNodeIndex].
    const orderedRelationships = [];

    // Read all the dependency lines for the current test case.
    for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
        const relationshipDatum = extractNumbersFromLine(processedInputLines[lineReadCursor]);
        lineReadCursor++; // Advance the cursor.

        const eventTimestamp = relationshipDatum[0];
        // Adjust node indices from 1-based (input) to 0-based (array).
        const originNode = relationshipDatum[1] - 1;
        const terminalNode = relationshipDatum[2] - 1;

        // Add the processed relationship to our list.
        orderedRelationships.push([eventTimestamp, originNode, terminalNode]);
    }

    // Sort the relationships based on their event timestamp in ascending order.
    // This ensures dependencies are processed chronologically.
    orderedRelationships.sort((relA, relB) => relA[0] - relB[0]);

    // Iterate through the sorted relationships to propagate "inactive" states.
    for (const relationshipTuple of orderedRelationships) {
        const originIndex = relationshipTuple[1];
        const terminalIndex = relationshipTuple[2];

        // Determine if the origin node is currently in an "inactive" state.
        const originIsInactive = !nodeStateFlags[originIndex];

        // If the origin node is inactive, then its connected terminal node also becomes inactive.
        if (originIsInactive) {
            nodeStateFlags[terminalIndex] = false;
        }
    }

    // Count how many nodes have ended up in the "inactive" state after processing all dependencies.
    let inactiveNodeCount = 0;
    for (const nodeStatus of nodeStateFlags) {
        if (!nodeStatus) { // If the node's flag is false, it's inactive.
            inactiveNodeCount++;
        }
    }

    // Output the final count of inactive nodes for the current test case.
    console.log(inactiveNodeCount);
}