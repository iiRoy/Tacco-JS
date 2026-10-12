"use strict";

// Initialize standard input stream processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming data from stdin
let receivedData = '';

// Event handler for 'data' chunks received from stdin
process.stdin.on('data', function (chunk) {
    receivedData += chunk; // Append the current data chunk to the buffer
});

/**
 * Parses a string line containing space-separated numeric values into an array of numbers.
 * Leading and trailing whitespace are trimmed before splitting.
 * @param {string} currentLine - The input string to parse.
 * @returns {number[]} An array where each element is a number.
 */
const parseNumbers = function (currentLine) {
    // Remove any leading or trailing whitespace, then split the string by spaces
    let numArray = currentLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    // Iterate through the array and convert each string element to a number
    for (let idx = 0; idx < numArray.length; ++idx) {
        numArray[idx] = +numArray[idx]; // Using unary plus for type conversion
    }
    return numArray;
};

/**
 * Parses a string line containing space-separated string values into an array of strings.
 * Leading and trailing whitespace are trimmed before splitting.
 * Note: This function is defined but not utilized in the main logic flow.
 * @param {string} currentLine - The input string to parse.
 * @returns {string[]} An array where each element is a string.
 */
const parseStrings = function (currentLine) {
    // Remove any leading or trailing whitespace, then split the string by spaces
    let strArray = currentLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    // No explicit type conversion needed as elements are already strings
    for (let k = 0; k < strArray.length; ++k) {
        strArray[k] = strArray[k]; // Redundant assignment, but maintains original structure
    }
    return strArray;
};

// Event handler for the 'end' of the stdin stream
process.stdin.on('end', function () {
    // Split the entire accumulated input data into an array of lines
    const inputLines = receivedData.split('\n');

    // Parse the first line to extract the total number of nodes (N) and edges (M)
    const dimensions = parseNumbers(inputLines[0]);
    const nodeCount = dimensions[0]; // N
    const edgeCount = dimensions[1]; // M (not used further, but preserved)

    // Process the remaining lines to get the initial list of edges
    // Each line is parsed into an array representing an edge [u, v]
    let initialEdges = inputLines.splice(1).map(currentLine => parseNumbers(currentLine));

    // Initialize an array of adjacency lists to represent the graph
    // adjacencyLists[i] will store all nodes directly connected to node i
    let adjacencyLists = new Array(nodeCount + 1);
    for (let nodeIdx = 0; nodeIdx < nodeCount + 1; ++nodeIdx) {
        adjacencyLists[nodeIdx] = []; // Each node's list starts empty
    }

    // Populate the adjacency lists based on the provided initial edges
    // Node indices are converted from 1-based (input) to 0-based (internal processing)
    for (let currentEdge of initialEdges) {
        currentEdge[0]--; // Decrement the first node's index
        currentEdge[1]--; // Decrement the second node's index
        adjacencyLists[currentEdge[0]].push(currentEdge[1]); // Add connection for the first node
        adjacencyLists[currentEdge[1]].push(currentEdge[0]); // Add connection for the second node (undirected graph)
    }

    // Array to store all detected cycles in the graph
    let foundCycles = [];

    // Iterate through each node to find cycles originating from it
    for (let startNode = 0; startNode < nodeCount; ++startNode) {
        // Initialize paths starting from 'startNode' to its immediate neighbors
        // Each path is represented as an array of nodes, e.g., [neighborNode]
        let currentPaths = [].concat(adjacencyLists[startNode].map(neighborNode => [neighborNode]));
        
        // A set to keep track of nodes visited during the current BFS-like traversal
        let visitedNodes = new Set();

        // Perform a breadth-first search (BFS) to discover paths and cycles
        while (currentPaths.length > 0) {
            let extendedPaths = []; // Paths to be explored in the next iteration
            visitedNodes.add(startNode); // Mark the starting node as visited for this specific search

            // Process each path segment from the current iteration
            for (let pathSegment of currentPaths) {
                const pathEnd = pathSegment[pathSegment.length - 1]; // The last node in the current path
                let secondToLast = -1; // Placeholder for the second-to-last node

                // Determine the second-to-last node if the path has at least two nodes
                if (pathSegment.length >= 2) { 
                    secondToLast = pathSegment[pathSegment.length - 2];
                }

                // Identify potential next nodes from 'pathEnd'
                // Filter criteria:
                // 1. The candidate node must not already be in the current path.
                // 2. The candidate node must not be the 'pathEnd' itself.
                // 3. The candidate node must not have been visited in this traversal,
                //    UNLESS it is the 'startNode' (which signifies a cycle completion).
                const potentialNextNodes = adjacencyLists[pathEnd].filter(candidateNode =>
                    pathSegment.indexOf(candidateNode) < 0 && // Ensure no immediate self-loop or revisiting within path
                    candidateNode !== pathEnd && // Avoid trivial self-loops
                    (!visitedNodes.has(candidateNode) || candidateNode === startNode) // Check visited status
                );

                // Extend the current paths with these potential next nodes
                potentialNextNodes.forEach(nextNodeInPath => {
                    visitedNodes.add(nextNodeInPath); // Mark the new node as visited
                    let tempPath = [].concat(pathSegment); // Create a new path by copying the current segment
                    tempPath.push(nextNodeInPath); // Append the new node

                    // If the new node is not the starting node, continue exploring this path
                    if (nextNodeInPath !== startNode) {
                        extendedPaths.push(tempPath);
                    } else {
                        // If the new node is the starting node, a cycle has been found
                        foundCycles.push(tempPath);   
                    }
                });
            }
            currentPaths = extendedPaths; // Update current paths for the next iteration
        }
    }
    
    // Filter the found cycles to include only those with a length greater than 2.
    // A cycle path [A, B, C, A] has length 4. A path [A, B, A] has length 3.
    // This ensures cycles involve at least 3 distinct nodes (e.g., A-B-C-A).
    foundCycles = foundCycles.filter(cyclePath => cyclePath.length > 2);

    // Iterate through each detected cycle to remove its constituent edges from the initial list
    for (let currentCycle of foundCycles) {
        // NOTE: The original code contains a subtle bug in the loop increment: `++l` instead of `++i`.
        // This means `currentCycle` (the array itself) will be incremented.
        // In JavaScript, `++array` attempts to convert the array to a number, resulting in `NaN`.
        // Consequently, `currentCycle.length` becomes `undefined`, causing the loop to terminate
        // after the first iteration (when `pathIndex` is 0).
        // This exact behavior, including the bug, is preserved as per Type II cloning rules.
        for (let pathIndex = 0; pathIndex < currentCycle.length; ++currentCycle) { // Preserving original behavior
            // Determine the current node and the next node in the cycle segment.
            // NOTE: The original code uses `i+1%l.length`. Due to operator precedence, this evaluates to `i + (1 % l.length)`.
            // If `l.length` is greater than 1, `1 % l.length` is `1`. So, it effectively becomes `i + 1`.
            // For the last element of the cycle, this will attempt to access `currentCycle[currentCycle.length]`, which is `undefined`.
            // This specific behavior is preserved to maintain strict equivalence.
            const nodeA = currentCycle[pathIndex];
            const nodeB = currentCycle[pathIndex + 1 % currentCycle.length]; // Preserving original behavior

            // Filter out edges from `initialEdges` that match the current cycle segment (nodeA, nodeB)
            // This checks for the edge in both directions (nodeA -> nodeB and nodeB -> nodeA)
            initialEdges = initialEdges.filter(remainingEdge =>
                !(remainingEdge[1] === nodeB && remainingEdge[0] === nodeA) && // Check if edge is [nodeA, nodeB]
                !(remainingEdge[0] === nodeB && remainingEdge[1] === nodeA)    // Check if edge is [nodeB, nodeA]
            );
        }
    }

    // Output the final count of edges remaining after removing all cycle edges
    console.log(initialEdges.length);
});
