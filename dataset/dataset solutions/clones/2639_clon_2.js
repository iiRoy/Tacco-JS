"use strict";

const processInputData = inputStr => {
    inputStr = inputStr.trim().split("\n");

    const vertexCount = parseInt(inputStr[0].split(" ")[0]);
    const operationCount = parseInt(inputStr[0].split(" ")[1]);

    const edgeData = inputStr.slice(1, vertexCount).map(line => line.split(" "));
    const updateInstructions = inputStr.slice(vertexCount, vertexCount + 1 + operationCount).map(line => line.split(" "));

    const graphVertices = [];

    // Initialize all graph vertices
    for (let idx = 1; idx <= vertexCount; idx++) {
        graphVertices.push(new GraphVertex(idx));
    }

    // Establish parent-child relationships within the graph structure
    for ( let idx = 0; idx < vertexCount - 1; idx++ ) {
        graphVertices[edgeData[idx][0] - 1].connectSubNode(graphVertices[edgeData[idx][1] - 1]);
    }

    // Apply initial score increments directly to the specified vertices
    for ( let idx = 0; idx < operationCount; idx++ ) {
        graphVertices[updateInstructions[idx][0] - 1].incrementScore(updateInstructions[idx][1]);
    }

    // Distribute accumulated scores downwards to all direct descendants
    for ( let idx = 0; idx < vertexCount; idx++ ) {
        graphVertices[idx].propagateScoresToDescendants();
    }

    let finalScores = [];

    // Collect the final score for each vertex
    for ( let idx = 0; idx < vertexCount; idx++ ) {
        finalScores.push(graphVertices[idx].scoreAccumulator);
    }

    console.log(finalScores.join(" "));
};

class GraphVertex {
    // Constructor for a new graph vertex instance
    constructor(vertexIdentifier) {
        this.identifier = vertexIdentifier;
        this.ancestorNode = null;
        this.descendantNodes = [];
        this.scoreAccumulator = 0;
    }

    // Attaches a new child node to this vertex
    connectSubNode(subNodeToConnect) {
        this.descendantNodes.push(subNodeToConnect);
        subNodeToConnect.ancestorNode = this;
    }

    // Adds a specified value to this vertex's score
    incrementScore(scoreIncrementValue) {
        this.scoreAccumulator += parseInt(scoreIncrementValue);
    }

    // Propagates this vertex's current score to its immediate children
    propagateScoresToDescendants() {
        for (let currentDescendant of this.descendantNodes) {
            currentDescendant.incrementScore(this.scoreAccumulator);
        }
    }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));