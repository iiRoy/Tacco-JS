const rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain input data from the standard input stream.

const dataRows = rawData.split('\n'); // Divide the raw input into an array of lines.

let currentSegment = dataRows.shift().split(' '); // Extract the first line, split it by space, and store it.

const nodeCount = Number(currentSegment[0]); // Convert the first part of the segment to a number for node count.

const visitedNodes = []; // Initialize an array to track visited nodes during graph traversal.

const queryCount = Number(currentSegment[1]); // Convert the second part of the segment to a number for query count.

const adjList = {}; // Create an object to represent the adjacency list of the graph.

const nodeValues = []; // Initialize an array to store incremental values for each node.

const finalResults = []; // Initialize an array to hold the final accumulated values for each node.

// Populate initial data structures for nodes.
for (let idx = 1; idx <= nodeCount; ++idx) {
    adjList[idx] = []; // Assign an empty array for each node's neighbors.
    nodeValues[idx] = 0; // Set initial value for each node to zero.
    finalResults.push(0); // Add a zero placeholder for each node's final result.
}

// Construct the graph (tree) based on the provided edges.
for (let idx = 0; idx < nodeCount - 1; ++idx) {
    currentSegment = dataRows[idx].split(' '); // Parse an edge definition line.
    // Add bidirectional connections to the adjacency list.
    adjList[currentSegment[0]].push(currentSegment[1]);
    adjList[currentSegment[1]].push(currentSegment[0]);
}

// Apply value updates from queries to specific nodes.
for (let idx = nodeCount - 1; idx < nodeCount + queryCount -1; ++idx) {
    currentSegment = dataRows[idx].split(' '); // Parse a query line.
    // Increment the value of the specified node by the query amount.
    nodeValues[currentSegment[0]] += Number(currentSegment[1]);
}

const dfsStack = []; // Initialize a stack for performing Depth First Search.
let currentSum = 0; // Variable to accumulate sums during traversal.

dfsStack.push([1, 0]); // Begin DFS from node 1 with an initial accumulated sum of 0.

visitedNodes.length = 0; // Clear the visited nodes array (re-initialization as per original logic).
visitedNodes[1] = 1; // Mark the starting node (node 1) as visited.

// Execute the Depth First Search traversal.
while (dfsStack.length > 0) {
    const stackItem = dfsStack.pop(); // Retrieve the current node and its parent's accumulated sum from the stack.
    const currentNodeId = stackItem[0];
    currentSum = stackItem[1];

    currentSum += nodeValues[currentNodeId]; // Add the current node's own value to the running sum.
    finalResults[currentNodeId - 1] = currentSum; // Store the total accumulated sum for this node.

    // Iterate through all neighbors of the current node.
    for (let neighborIdx = 0; neighborIdx < adjList[currentNodeId].length; ++neighborIdx) {
        const neighborNode = adjList[currentNodeId][neighborIdx];
        // If the neighbor has not been visited yet.
        if (!visitedNodes[neighborNode]) {
            dfsStack.push([neighborNode, currentSum]); // Push the neighbor onto the stack with the current accumulated sum.
            visitedNodes[neighborNode] = 1; // Mark the neighbor as visited.
        }
    }
}

console.log(finalResults.join(' ')); // Output the final accumulated results for all nodes, separated by spaces.
