"use strict";

const readRawData = require("fs").readFileSync("/dev/stdin", "utf8");
const allInputTokens = readRawData.split(/ |\n/); // Replicates original splitting behavior including empty strings

let currentTokenIndex = 0;
function getNextNumericValue() {
    return Number(allInputTokens[currentTokenIndex++]);
}

function getNextNumericPair() {
    const val1 = Number(allInputTokens[currentTokenIndex++]);
    const val2 = Number(allInputTokens[currentTokenIndex++]);
    return [val1, val2];
}

function analyzeGraphComponents() {
    const numberOfVertices = getNextNumericValue();
    const numberOfEdges = getNextNumericValue();

    const adjacencyList = new Map(); // Stores connections: Vertex -> Set<Neighbors>

    // Initialize all vertices in the adjacency list to ensure even isolated nodes are handled.
    // Node IDs are typically 1-indexed in competitive programming, but 0 might appear
    // if input parsing results in empty strings converted to 0.
    for (let v = 0; v <= numberOfVertices; ++v) { // Iterate from 0 to N to cover potential 0-indexed nodes if input produces them
        adjacencyList.set(v, new Set());
    }

    // Populate the adjacency list with edges
    for (let e = 0; e < numberOfEdges; ++e) {
        const [u, v] = getNextNumericPair();
        // Ensure u and v are valid keys in the map, extending if necessary for 0 or very large values
        if (!adjacencyList.has(u)) adjacencyList.set(u, new Set());
        if (!adjacencyList.has(v)) adjacencyList.set(v, new Set());
        adjacencyList.get(u).add(v);
        adjacencyList.get(v).add(u); // Graph is undirected
    }

    let largestComponentSize = 0;
    const discoveredNodes = new Set(); // Keep track of nodes already visited in any component

    // Iterate through all possible starting nodes from 0 to numberOfVertices
    // This covers nodes 1 to N, and also node 0 if it was created by malformed input.
    for (let i = 0; i <= numberOfVertices; ++i) {
        // Only proceed if the node actually exists in our graph (has edges or was explicitly initialized)
        // and hasn't been visited yet.
        if (adjacencyList.has(i) && !discoveredNodes.has(i)) {
            // Start a new Breadth-First Search (BFS) if this node hasn't been visited yet
            let currentComponentVertexCount = 0;
            const traversalQueue = []; // FIFO queue for BFS
            traversalQueue.push(i);
            discoveredNodes.add(i); // Mark as discovered

            let queuePointer = 0; // Manual pointer for efficient queue operations (avoids array.shift())
            while (queuePointer < traversalQueue.length) {
                const focusVertex = traversalQueue[queuePointer++];
                currentComponentVertexCount++;

                const connectedPeers = adjacencyList.get(focusVertex);
                if (connectedPeers) { // Ensure the vertex exists in the map (should always for initialized nodes)
                    for (const peer of connectedPeers) {
                        if (!discoveredNodes.has(peer)) {
                            discoveredNodes.add(peer);
                            traversalQueue.push(peer);
                        }
                    }
                }
            }
            largestComponentSize = Math.max(largestComponentSize, currentComponentVertexCount);
        }
    }
    return largestComponentSize;
}

const computedResult = analyzeGraphComponents();
if (computedResult !== undefined) {
    console.log(String(computedResult));
}