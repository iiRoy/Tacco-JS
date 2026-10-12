settings = { input: '/dev/stdin', newline: '\n' }; // Configuration for input source and line separator

// Read the input file, remove leading/trailing whitespace, and split into an array of lines
let inputLines = require('fs').readFileSync(settings.input, 'ascii')
                   .trim()
                   .split(settings.newline);

// The first line contains the total number of nodes, parse it and remove it from the array
let nodeCount = Number(inputLines.shift());

// Initialize an object to store vertex data (id, current shortest distance, predecessor)
let vertexData = {};

// Initialize an object to store the adjacency list with edge weights
let adjacencyWeights = {};

/**
 * Helper function to add or update an edge weight in the adjacency list.
 * @param {object} targetGraph - The graph object to modify (e.g., adjacencyWeights).
 * @param {number} sourceIdentifier - The ID of the source node.
 * @param {number} destinationIdentifier - The ID of the destination node.
 * @param {number} edgeCost - The weight/cost of the edge.
 */
function assignWeight(targetGraph, sourceIdentifier, destinationIdentifier, edgeCost) {
    // Ensure the source node entry exists in the graph
    if (!targetGraph.hasOwnProperty(sourceIdentifier)) {
        targetGraph[sourceIdentifier] = {};
    }
    // Assign the weight for the edge from source to destination
    targetGraph[sourceIdentifier][destinationIdentifier] = edgeCost;
}

// Process each remaining line to populate vertex data and adjacency weights
for (let lineIndex in inputLines) {
    // Parse the current line into an array of numbers
    let parsedLine = inputLines[lineIndex].split(' ').map(Number);
    let currentVertexId = parsedLine[0];

    // Initialize data for the current vertex
    vertexData[currentVertexId] = {
        'identifier': currentVertexId,
        'distance': Number.POSITIVE_INFINITY, // Set initial distance to infinity
        'predecessor': null // No predecessor initially
    };

    // Iterate through the rest of the parsed line to find adjacent nodes and their weights
    // The format is: u v1 c1 v2 c2 ...
    for (let subIndex = 2; subIndex < parsedLine.length; subIndex += 2) {
        // Add the edge to the adjacency weights object
        assignWeight(adjacencyWeights, currentVertexId, parsedLine[subIndex], parsedLine[subIndex + 1]);
    }
}

// Find the starting node (assumed to be node 0) and set its distance to 0
for (let vertexKey in vertexData) {
    if (vertexData[vertexKey].identifier === 0) {
        vertexData[vertexKey].distance = 0;
        break; // Found the source node, no need to check further
    }
}

/**
 * Attempts to relax an edge (u, v) to potentially find a shorter path to v.
 * @param {object} sourceVertex - The source vertex object (u).
 * @param {object} targetVertex - The target vertex object (v).
 * @param {object} allGraphWeights - The complete adjacency weights object.
 */
function updateDistance(sourceVertex, targetVertex, allGraphWeights) {
    // Check if the path through sourceVertex offers a shorter distance to targetVertex
    if (targetVertex.distance > sourceVertex.distance + allGraphWeights[sourceVertex.identifier][targetVertex.identifier]) {
        targetVertex.distance = sourceVertex.distance + allGraphWeights[sourceVertex.identifier][targetVertex.identifier];
        targetVertex.predecessor = sourceVertex; // Update predecessor to sourceVertex
    }
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from a source node
 * (node with distance 0) to all other nodes in the graph.
 * @param {object} graphEdgeWeights - The adjacency list representing the graph with edge weights.
 */
function findShortestPaths(graphEdgeWeights) {
    let processedNodes = []; // Stores nodes for which the shortest path has been finalized
    let priorityQueue = []; // Stores nodes to be visited, ordered by their current shortest distance
    let currentProcessingNode; // The node with the smallest distance extracted from the queue

    // Initialize the priority queue with all vertices from the graph
    for (let vertexKey in vertexData) {
        priorityQueue.push(vertexData[vertexKey]);
    }

    // Continue the algorithm as long as there are nodes in the priority queue
    while (priorityQueue.length !== 0) {
        // Sort the queue by distance in descending order to easily pop the minimum distance node
        priorityQueue.sort(function (nodeA, nodeB) {
            return nodeB.distance - nodeA.distance;
        });

        currentProcessingNode = priorityQueue.pop(); // Extract the node with the smallest distance
        processedNodes.push(currentProcessingNode); // Add it to the set of processed nodes

        // Iterate over all neighbors of the current processing node
        for (let neighborIdKey in graphEdgeWeights[currentProcessingNode.identifier]) {
            let neighborVertex = vertexData[neighborIdKey]; // Get the actual neighbor vertex object
            updateDistance(currentProcessingNode, neighborVertex, graphEdgeWeights); // Attempt to relax the edge
        }
    }
}

// Execute Dijkstra's algorithm using the populated adjacency weights
findShortestPaths(adjacencyWeights);

// Output the shortest distance from the source node (0) to every other node
for (let vertexKey in vertexData) {
    console.log("%s %d", vertexKey, vertexData[vertexKey].distance);
}
