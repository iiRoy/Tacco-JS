'use strict';

// A very large number, effectively infinity for practical purposes
const MAX_VAL = 900719925474099;

/**
 * Parses a space-separated string of numbers into an array of integers.
 * @param {string} inputString - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers.
 */
function parseNumbers(inputString) {
    return inputString.split(' ').map((val) => parseInt(val, 10));
}

/**
 * Main function to solve the problem.
 * Reads input, processes a graph, and prints the result.
 * @param {string} rawInput - The complete input string from stdin.
 */
function Main(rawInput) {
    // Split the input into individual lines and remove leading/trailing whitespace
    let linesOfInput = rawInput.trim().split('\n');

    // Parse the first line to get node and edge counts
    let firstLineVals = parseNumbers(linesOfInput[0]);
    let nodeCount = firstLineVals[0]; // Number of nodes in the graph
    let edgeCount = firstLineVals[1]; // Number of edges in the graph

    // Initialize an adjacency list for the graph
    // Each node starts with an empty array of neighbors
    let adjacencyList = [...new Array(nodeCount)].map(() => new Array(0));
    // Initialize an array to store the step at which each node was visited
    // -1 indicates not visited
    let visitedSteps = new Array(nodeCount).fill(-1);

    let idxA, idxB; // Loop counters

    // Populate the adjacency list with edges
    // Edges are 1-indexed in input, convert to 0-indexed
    for (idxA = 1; idxA <= edgeCount; idxA++) {
        let currentEdge = parseNumbers(linesOfInput[idxA]);
        adjacencyList[currentEdge[0] - 1].push(currentEdge[1] - 1);
    }

    // Parse the line containing the start and target nodes
    let startEndNodes = parseNumbers(linesOfInput[edgeCount + 1]);
    let startNodeIdx = startEndNodes[0] - 1; // Start node (0-indexed)
    let targetNodeIdx = startEndNodes[1] - 1; // Target node (0-indexed)

    // Initialize BFS queue with the starting node
    let currentQueue = [startNodeIdx];
    visitedSteps[startNodeIdx] = 0; // Mark start node as visited at step 0

    let queueLength = 1; // Current size of the queue
    let currentStep = 0; // Current step count in the BFS
    let foundTarget = false; // Flag to indicate if target was found

    // Set to store nodes for the next iteration of the BFS
    let nextQueueSet = new Set();

    let neighborCount, neighborNode; // Variables for iterating through neighbors

    // Perform a modified BFS
    while (queueLength > 0) {
        nextQueueSet.clear(); // Clear the set for the next level of nodes
        currentStep++; // Increment the step counter for the current level

        // Iterate through all nodes in the current queue level
        for (idxA = 0; idxA < queueLength; idxA++) {
            // Get the number of neighbors for the current node
            neighborCount = adjacencyList[currentQueue[idxA]].length;

            // Iterate through each neighbor of the current node
            for (idxB = 0; idxB < neighborCount; idxB++) {
                neighborNode = adjacencyList[currentQueue[idxA]][idxB];

                // Check if the target node is reached on a step divisible by 3
                if (currentStep % 3 === 0 && neighborNode === targetNodeIdx) {
                    foundTarget = true;
                    break; // Target found, exit inner loop
                }

                // If the neighbor has not been visited yet
                if (visitedSteps[neighborNode] < 0) {
                    nextQueueSet.add(neighborNode); // Add to next queue
                    visitedSteps[neighborNode] = currentStep; // Mark with current step
                } else {
                    // If visited, check if the difference in steps is not a multiple of 3
                    // This allows revisiting nodes if it leads to a valid path
                    if ((currentStep - visitedSteps[neighborNode]) % 3 !== 0) {
                        nextQueueSet.add(neighborNode); // Add to next queue
                        visitedSteps[neighborNode] = currentStep; // Update visited step
                    }
                }
            }
            if (foundTarget) break; // Target found, exit outer loop
        }
        if (foundTarget) break; // Target found, exit while loop

        // Update the current queue with nodes from the next level
        currentQueue = [...nextQueueSet];
        queueLength = currentQueue.length; // Update queue length
    }

    // Output the result based on whether the target was found
    if (foundTarget) {
        console.log(currentStep / 3); // Print the number of full 3-step cycles
    } else {
        console.log(-1); // Target not reachable under the given conditions
    }
}

// Standard input reading and Main function invocation
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
