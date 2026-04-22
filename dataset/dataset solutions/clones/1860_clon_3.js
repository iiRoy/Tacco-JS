"use strict";
// This module handles file system operations for input acquisition.
const fileSystemAccess = require("node:fs");

// Read raw input data from the standard input stream.
const rawInputData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");

// Prepare input tokens by trimming whitespace and splitting by any sequence of whitespace characters.
const inputTokens = rawInputData.trim().split(/\s+/);
// Initialize an index to track the current token being processed.
let tokenPointer = 0;

/**
 * Retrieves the next token from the input stream.
 * @returns {string} The next available input token.
 */
const fetchNextToken = () => inputTokens[tokenPointer++];

/**
 * Main function to orchestrate the graph traversal and predecessor determination.
 * This implements a Breadth-First Search (BFS) starting from node 1
 * to find the immediate parent (predecessor) for all other reachable nodes.
 */
const executeGraphSearch = () => {
    // Read the total number of vertices (nodes) in the graph.
    const totalVertices = Number(fetchNextToken());
    // Read the total number of edges (connections) in the graph.
    const totalConnections = Number(fetchNextToken());

    // Initialize an adjacency list to represent the graph.
    // Each index 'i' in the array corresponds to vertex 'i',
    // and its value is a list of vertices connected to 'i'.
    const adjacencyStructure = Array.from({ length: totalVertices + 1 }, () => []);

    // Populate the adjacency list based on the provided edges.
    // The graph is undirected, so each edge (u, v) means v is connected to u, and u is connected to v.
    for (let currentEdge = 0; currentEdge < totalConnections; ++currentEdge) {
        const vertexA = Number(fetchNextToken()); // Starting vertex of an edge
        const vertexB = Number(fetchNextToken()); // Ending vertex of an edge

        // Add connections to both vertices' lists.
        adjacencyStructure[vertexA].push(vertexB);
        adjacencyStructure[vertexB].push(vertexA);
    }

    // Array to store the predecessor of each vertex during BFS.
    // Initialized with 0, as vertices are 1-indexed, 0 can signify no predecessor yet.
    const parentTracker = new Array(totalVertices + 1).fill(0);

    // A Set to keep track of all vertices that have not yet been visited.
    const unvisitedVertexRegistry = new Set();
    // Add all vertices from 2 to N to the unvisited set. Vertex 1 is our starting point.
    for (let vId = 2; vId <= totalVertices; ++vId) {
        unvisitedVertexRegistry.add(vId);
    }

    // Initialize the BFS queue with the starting vertex (node 1).
    let currentLevelFrontier = [1];

    // Continue BFS as long as there are unvisited nodes and the current frontier is not empty.
    // The `currentLevelFrontier.length > 0` check acts as a guard for disconnected graphs.
    while (unvisitedVertexRegistry.size > 0 && currentLevelFrontier.length > 0) {
        // Prepare the queue for the next level of traversal.
        let nextLevelFrontier = [];

        // Process all vertices in the current level's frontier.
        for (const processingVertex of currentLevelFrontier) {
            // Explore all neighbors of the current vertex.
            for (const neighborCandidate of adjacencyStructure[processingVertex]) {
                // If the neighbor has not been visited yet:
                if (unvisitedVertexRegistry.has(neighborCandidate)) {
                    // Record the current vertex as the predecessor of the neighbor.
                    parentTracker[neighborCandidate] = processingVertex;
                    // Mark the neighbor as visited by removing it from the unvisited set.
                    unvisitedVertexRegistry.delete(neighborCandidate);
                    // Add the neighbor to the queue for the next level.
                    nextLevelFrontier.push(neighborCandidate);
                }
            }
        }
        // Move to the next level of the BFS.
        currentLevelFrontier = nextLevelFrontier;
    }

    // Prepare the final output array.
    const outputLines = [];
    // The problem format expects "Yes" as the first line.
    outputLines.push("Yes");

    // Collect predecessors for nodes 2 through N.
    // Node 1 does not have a predecessor in this context (it's the root).
    for (let i = 2; i <= totalVertices; ++i) {
        outputLines.push(parentTracker[i]);
    }

    // Print all collected lines, separated by newlines.
    console.log(outputLines.join('\n'));
};

// Initiate the graph search process.
executeGraphSearch();