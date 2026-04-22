"use strict";

/**
 * Orchestrates the processing of tree-like data structures and score propagation.
 * @param {string} inputString - The raw input data from a source, typically stdin.
 */
const executeTreeScoreComputation = (inputString) => {
    // --- Input Validation and Preprocessing ---
    if (!inputString || typeof inputString !== 'string' || inputString.trim().length === 0) {
        console.error("Error: Input data is empty or invalid.");
        return; // Early exit for invalid input
    }

    const processedLines = inputString.trim().split("\n");
    if (processedLines.length === 0) {
        console.error("Error: No data lines found after trimming.");
        return;
    }

    // Attempt to parse the first line for global counts
    const [totalNodesStr, numOperationsStr] = processedLines[0].split(" ");
    const totalNodes = parseInt(totalNodesStr, 10);
    const numOperations = parseInt(numOperationsStr, 10);

    if (isNaN(totalNodes) || isNaN(numOperations) || totalNodes <= 0 || numOperations < 0) {
        console.error("Error: Invalid number of nodes or operations in the first line.");
        return;
    }
    
    // --- Data Extraction ---
    const edgeDefinitions = processedLines.slice(1, totalNodes).map(line => {
        const [parentStr, childStr] = line.split(" ");
        return [parseInt(parentStr, 10), parseInt(childStr, 10)];
    });

    const scoreAdjustments = processedLines.slice(totalNodes, totalNodes + numOperations + 1).map(line => {
        const [nodeIdStr, scoreDeltaStr] = line.split(" ");
        return [parseInt(nodeIdStr, 10), parseInt(scoreDeltaStr, 10)];
    });

    // --- Graph Construction ---
    // Initialize node collection with a dummy element at index 0 for 1-based indexing convenience
    const nodeCollection = new Array(totalNodes + 1).fill(null); 

    // Create graph vertices
    for (let k = 1; k <= totalNodes; k++) {
        nodeCollection[k] = new GraphVertex(k);
    }
    
    // Establish parent-child relationships (Added validation)
    for (const [parentID, childID] of edgeDefinitions) {
        const parentVertex = nodeCollection[parentID];
        const childVertex = nodeCollection[childID];

        if (!parentVertex || !childVertex) {
            console.warn(`Warning: Invalid node ID in edge definition: ${parentID} -> ${childID}. Skipping.`);
            continue; // Skip invalid edges
        }
        parentVertex.attachSuccessor(childVertex);
    }
    
    // Apply initial score adjustments to specific nodes (Added validation)
    for (const [targetNodeID, deltaScore] of scoreAdjustments) {
        const targetVertex = nodeCollection[targetNodeID];
        if (!targetVertex) {
            console.warn(`Warning: Attempted to adjust score for non-existent node ID: ${targetNodeID}. Skipping.`);
            continue; // Skip invalid adjustments
        }
        targetVertex.applyValueAdjustment(deltaScore);
    }
    
    // --- Score Propagation ---
    // Propagate scores from each node to its immediate children.
    // The original logic performs a single pass over all nodes in their creation order (1 to N).
    // This means a parent's score is passed to children, but those children's *newly received* scores
    // are NOT propagated further down within this same loop iteration.
    // This replicates the original code's specific propagation behavior.
    for (let currentIdx = 1; currentIdx <= totalNodes; currentIdx++) {
        const currentVertex = nodeCollection[currentIdx];
        if (currentVertex) { // Ensure the node exists before attempting to propagate
            currentVertex.distributeScoreToImmediateSuccessors();
        }
    }

    // --- Final Score Collection and Output ---
    const finalResults = nodeCollection.slice(1).map(vertex => vertex.accumulatedScore);
    
    // Use a different separator and add a prefix for Type III visibility
    console.log("Final Scores: " + finalResults.join(" | "));
};

/**
 * Represents a vertex (node) in the graph structure.
 * @class
 */
class GraphVertex {
    /**
     * Constructs a new GraphVertex.
     * @param {number} uniqueIdentifier - A unique numerical identifier for this vertex.
     */
    constructor(uniqueIdentifier) {
        this.identifier = uniqueIdentifier; // Unique ID for the vertex
        this.upLink = null;                 // Reference to the parent vertex (null if root)
        this.downLinks = [];                // Array of references to child vertices
        this.accumulatedScore = 0;          // The total score accumulated by this vertex
    }
    
    /**
     * Establishes a parent-child relationship by adding a successor.
     * @param {GraphVertex} successorEntity - The child vertex to attach.
     */
    attachSuccessor(successorEntity) {
        if (!successorEntity || !(successorEntity instanceof GraphVertex)) {
            console.warn(`Warning: Attempted to attach an invalid successor to node ${this.identifier}.`);
            return;
        }
        if (successorEntity === this) {
            console.warn(`Warning: Node ${this.identifier} attempted to attach itself as a child.`);
            return;
        }
        this.downLinks.push(successorEntity);
        successorEntity.upLink = this; // Set the parent reference for the child
    }
    
    /**
     * Increments the accumulated score of this vertex.
     * @param {*} adjustmentAmount - The value to add to the score. Will be parsed as an integer.
     */
    applyValueAdjustment(adjustmentAmount) {
        const parsedAmount = parseInt(adjustmentAmount, 10);
        if (isNaN(parsedAmount)) {
            console.warn(`Warning: Invalid score adjustment amount for node ${this.identifier}: ${adjustmentAmount}. Skipping.`);
            return;
        }
        this.accumulatedScore += parsedAmount;
    }
    
    /**
     * Distributes this vertex's current accumulated score to its immediate children.
     * This method implements a single-level propagation, reflecting the original code's behavior.
     */
    distributeScoreToImmediateSuccessors() {
        // Iterate over all direct children and apply this node's current score to them.
        // This is a direct replication of the original code's propagation behavior.
        for (const currentChild of this.downLinks) {
            currentChild.applyValueAdjustment(this.accumulatedScore);
        }
    }

    /**
     * Provides a string representation of the vertex. (Added helper method)
     * @returns {string} A string representing the vertex's identifier and score.
     */
    toString() {
        return `Vertex ID: ${this.identifier}, Score: ${this.accumulatedScore}`;
    }
}

// --- Entry Point ---
try {
    executeTreeScoreComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));
} catch (error) {
    console.error("An error occurred during execution:", error.message);
    // In a real-world scenario, you might log the full stack trace here.
}