'use strict';

/**
 * Helper function to safely parse a string into an array of numbers.
 * It handles potential non-numeric values by filtering them out.
 * @param {string} lineString - The string line to parse.
 * @param {string} [delimiter=' '] - The character used to split the string.
 * @returns {number[]} An array of parsed numbers.
 */
const extractNumericValues = (lineString, delimiter = ' ') => {
    if (typeof lineString !== 'string' || !lineString.trim()) {
        return [];
    }
    // Split the string by the delimiter, convert each part to a Number,
    // and filter out any results that are Not-a-Number (NaN).
    return lineString.split(delimiter).map(valueStr => Number(valueStr)).filter(num => !isNaN(num));
};

/**
 * Processes the raw input content to simulate score propagation in a tree structure.
 * This function parses input, builds an adjacency list, applies initial score updates,
 * and then performs a Breadth-First Search (BFS) to propagate scores from parents to children.
 * @param {string} rawInputData - The entire input content as a single string.
 */
function calculatePropagatedScores(rawInputData) {
    // Normalize input: trim leading/trailing whitespace and split into individual lines.
    const inputLines = rawInputData.trim().split('\n');

    // The first line contains the total number of nodes (N) and queries (Q).
    const [numberOfNodes, numberOfQueries] = extractNumericValues(inputLines.shift());

    // --- Input Validation for Node and Query Counts ---
    if (isNaN(numberOfNodes) || isNaN(numberOfQueries) || numberOfNodes < 1 || numberOfQueries < 0) {
        console.error("Error: Invalid number of nodes or queries provided. Please check the input format.");
        return; // Terminate execution if initial counts are invalid.
    }

    // --- Data Structure Initialization ---
    // `nodeRelationships`: A Map to store the tree's adjacency list.
    // Keys are parent node IDs, values are arrays of child node IDs.
    // Using a Map allows for more robust key handling compared to plain objects.
    const nodeRelationships = new Map();
    for (let nodeId = 1; nodeId <= numberOfNodes; nodeId++) {
        nodeRelationships.set(nodeId, []); // Initialize each node with an empty list of children.
    }

    // `accumulatedNodeScores`: An array to hold the scores for each node.
    // Using 1-based indexing for convenience (index 0 will remain unused).
    const accumulatedNodeScores = new Array(numberOfNodes + 1).fill(0);

    // The first `numberOfNodes - 1` lines define the tree edges (connections).
    const edgeDefinitionLinesCount = numberOfNodes - 1;

    // --- Phase 1: Process Tree Edge Definitions ---
    // Iterate through the lines that describe the parent-child relationships.
    for (let lineIndex = 0; lineIndex < edgeDefinitionLinesCount; lineIndex++) {
        const currentLineValues = extractNumericValues(inputLines[lineIndex]);

        // Ensure the line has at least two numbers (parent and child node IDs).
        if (currentLineValues.length >= 2) {
            const [parentNodeIdentifier, childNodeIdentifier] = currentLineValues;

            // Validate node IDs to be within the expected range.
            if (nodeRelationships.has(parentNodeIdentifier) &&
                childNodeIdentifier >= 1 && childNodeIdentifier <= numberOfNodes) {
                // Add the child to the parent's list of connected nodes.
                nodeRelationships.get(parentNodeIdentifier).push(childNodeIdentifier);
            } else {
                // Log a warning for malformed edge definitions, but continue processing.
                console.warn(`Warning: Malformed or out-of-range edge definition on line ${lineIndex + 2}. Skipping.`);
            }
        }
    }

    // --- Phase 2: Process Initial Query Updates ---
    // The remaining lines (`numberOfQueries` of them) contain score updates for specific nodes.
    // These lines start from `edgeDefinitionLinesCount` index in `inputLines`.
    for (let lineIndex = edgeDefinitionLinesCount; lineIndex < inputLines.length; lineIndex++) {
        const currentLineValues = extractNumericValues(inputLines[lineIndex]);

        // Ensure the line has at least two numbers (target node ID and value to add).
        if (currentLineValues.length >= 2) {
            const [targetNodeIdentifier, valueIncrement] = currentLineValues;

            // Apply the increment to the target node's score if the node ID is valid.
            if (targetNodeIdentifier >= 1 && targetNodeIdentifier <= numberOfNodes) {
                accumulatedNodeScores[targetNodeIdentifier] += valueIncrement;
            } else {
                console.warn(`Warning: Out-of-range target node for update on line ${lineIndex + 2}. Skipping.`);
            }
        }
    }

    // --- Phase 3: Breadth-First Search (BFS) for Score Propagation ---
    // Initialize a queue for BFS traversal, starting from the root node (node 1).
    const bfsTraversalQueue = [1];
    let queueReadPointer = 0; // A pointer to manually manage queue elements, avoiding `shift()` for performance.

    // Continue as long as there are nodes in the queue to process.
    while (queueReadPointer < bfsTraversalQueue.length) {
        const currentNodeToProcess = bfsTraversalQueue[queueReadPointer++]; // Dequeue the next node.

        // Retrieve the children of the current node from the adjacency list.
        const childrenOfCurrentNode = nodeRelationships.get(currentNodeToProcess);

        // If the current node has children, propagate its score to them.
        if (childrenOfCurrentNode && childrenOfCurrentNode.length > 0) {
            const scoreFromParent = accumulatedNodeScores[currentNodeToProcess];

            // Iterate over each child node.
            for (const childNodeId of childrenOfCurrentNode) {
                // Add the parent's accumulated score to the child's score.
                accumulatedNodeScores[childNodeId] += scoreFromParent;
                // Enqueue the child node to ensure its children also receive propagated scores.
                bfsTraversalQueue.push(childNodeId);
            }
        }
    }

    // --- Final Output Preparation ---
    // The 0th element of `accumulatedNodeScores` is unused (due to 1-based indexing).
    // Slice the array to get only the relevant scores from index 1 onwards.
    const finalScoresForOutput = accumulatedNodeScores.slice(1);

    // Print the final scores, joined by spaces, to standard output.
    console.log(finalScoresForOutput.join(' '));
}

// --- Entry Point: Read Input and Execute ---
try {
    // Dynamically import the 'fs' (file system) module for reading input.
    const fileSystemModule = require('fs');
    // Define the path to standard input, common in competitive programming environments.
    const standardInputFilePath = '/dev/stdin';

    // Read the entire content of the standard input file as a UTF-8 string.
    const inputContentFromFile = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

    // Call the main processing function with the read input.
    calculatePropagatedScores(inputContentFromFile);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An error occurred during program execution:", executionError.message);
    // Exit with a non-zero status code to indicate an error to the operating system.
    process.exit(1);
}