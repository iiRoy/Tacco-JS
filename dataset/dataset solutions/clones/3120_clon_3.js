"use strict";

// Represents a utility for parsing structured input data line by line, token by token.
function DataStreamParser(sourceText, tokenConverter) {
    if (typeof sourceText !== 'string') {
        throw new Error('Input source must be a string.');
    }
    // Store all lines from the input source.
    this.sourceLines = sourceText.split('\n');
    // Pointer to the current token within the current line.
    this.tokenPointer = 0;
    // Pointer to the current line being processed.
    this.linePointer = 0;
    // Function to convert string tokens to desired data types, defaults to Number.
    this.valueTransformer = tokenConverter || Number;

    // A private helper to get the current line's tokens.
    // This is an intermediate step, not directly exposed.
    this._getCurrentLineTokens = function() {
        const currentLineContent = this.sourceLines[this.linePointer];
        // Handle empty lines or end of stream gracefully.
        if (currentLineContent === undefined || currentLineContent.trim() === '') {
            return []; // Return an empty array if no content or empty line
        }
        // Split by one or more spaces, and filter out any empty strings from multiple spaces.
        return currentLineContent.trim().split(/\s+/).filter(Boolean);
    };
}

// Retrieves and processes the next available token from the data stream.
DataStreamParser.prototype.extractNextValue = function() {
    let currentLineTokens = this._getCurrentLineTokens();

    // If current line is exhausted or empty, advance to the next non-empty line.
    while (this.tokenPointer >= currentLineTokens.length) {
        this.linePointer++;
        this.tokenPointer = 0; // Reset token pointer for the new line.
        if (this.linePointer >= this.sourceLines.length) {
            // No more lines to process.
            return undefined; // Or throw an error, depending on desired behavior.
        }
        currentLineTokens = this._getCurrentLineTokens();
    }

    const nextToken = currentLineTokens[this.tokenPointer];
    this.tokenPointer++; // Move to the next token for the subsequent call.

    // Apply the configured transformation function to the extracted token.
    return this.valueTransformer(nextToken);
};

// Reads all tokens from the current line, processes them, and advances to the next line.
DataStreamParser.prototype.readAllLineValues = function() {
    const tokensOnCurrentLine = this._getCurrentLineTokens();
    if (this.linePointer >= this.sourceLines.length) {
        return []; // No more lines to read.
    }

    // Reset token pointer for the next line, and advance line pointer.
    this.tokenPointer = 0;
    this.linePointer++;

    // Map all tokens on the line using the configured transformer.
    return tokensOnCurrentLine.map(this.valueTransformer);
};

// Export the parser for use as a module.
module.exports = DataStreamParser;


// This function analyzes a graph described by the input data
// to determine if it meets specific structural criteria.
function analyzeNetworkTopology(rawInputData) {
    // Helper function to check if a number is odd.
    const isOdd = (num) => num % 2 !== 0;

    // Initialize the custom parser for the input data.
    const inputReader = new DataStreamParser(rawInputData);

    // Read graph dimensions: total number of nodes (vertices) and edges.
    const totalNodes = inputReader.extractNextValue();
    const numEdges = inputReader.extractNextValue();

    // --- Input Validation (Type III Addition) ---
    if (isNaN(totalNodes) || totalNodes < 1) {
        console.error("Error: Invalid number of nodes specified.");
        if (totalNodes < 1) { // If N is less than 1, it's an invalid graph for this problem.
            console.log("No");
            return;
        }
    }
    if (isNaN(numEdges) || numEdges < 0) {
        console.error("Error: Invalid number of edges specified.");
        if (numEdges < 0) { // If M is negative, it's an invalid graph.
            console.log("No");
            return;
        }
    }

    // Initialize the adjacency list for graph representation.
    // Using `Array.from` for a more functional initialization.
    const graphConnections = Array.from({ length: totalNodes + 1 }, () => []);

    // Populate the graph with edges based on input.
    // Each edge connects two nodes bidirectionally.
    for (let currentEdgeIndex = 0; currentEdgeIndex < numEdges; currentEdgeIndex++) {
        const firstNodeId = inputReader.extractNextValue();
        const secondNodeId = inputReader.extractNextValue();

        // Basic validation for node IDs (Type III Addition)
        if (isNaN(firstNodeId) || isNaN(secondNodeId) ||
            firstNodeId < 1 || firstNodeId > totalNodes ||
            secondNodeId < 1 || secondNodeId > totalNodes) {
            console.error(`Warning: Invalid node ID(s) encountered for edge ${currentEdgeIndex + 1}. Skipping.`);
            continue; // Skip this edge and proceed.
        }

        graphConnections[firstNodeId].push(secondNodeId);
        graphConnections[secondNodeId].push(firstNodeId);
    }

    // --- Analyze graph properties ---
    let foundNodeWithHighDegree = false; // Corresponds to 'six'
    let countNodesWithModerateDegree = 0; // Corresponds to 'four'
    let allNodeDegreesAreEven = true; // Corresponds to 'flag2'

    // Iterate through all nodes (from 1 to totalNodes, as graph is 1-indexed).
    for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
        const currentNodeDegree = graphConnections[nodeIdentifier].length;

        // Check if any node has a degree of 6 or more.
        if (currentNodeDegree >= 6) {
            foundNodeWithHighDegree = true;
        }

        // Count nodes with a degree of 4 or more. (Re-enabled and renamed from original comment)
        if (currentNodeDegree >= 4) {
            countNodesWithModerateDegree++;
        }

        // Check if all node degrees are even.
        if (isOdd(currentNodeDegree)) {
            allNodeDegreesAreEven = false;
            // Note: An early exit (break) here for `allNodeDegreesAreEven`
            // would be an optimization, but for full clone fidelity and
            // to ensure `countNodesWithModerateDegree` and `foundNodeWithHighDegree`
            // are fully computed, we continue the loop.
        }
    }

    // --- Final Decision Logic (Type III - Rewriting/Intermediate variables) ---
    // The original condition: ((six || four>=2) && flag2)
    const conditionA = foundNodeWithHighDegree; // Evaluates 'six'
    const conditionB = countNodesWithModerateDegree >= 2; // Evaluates 'four >= 2'
    const conditionC = allNodeDegreesAreEven; // Evaluates 'flag2'

    const finalResult = (conditionA || conditionB) && conditionC;

    // Output the result.
    console.log(finalResult ? "Yes" : "No");
}

// Entry point for execution: Read input from standard input and pass to the analyzer.
// Uses the exported DataStreamParser from the module.
analyzeNetworkTopology(require("fs").readFileSync("/dev/stdin", "utf8"));