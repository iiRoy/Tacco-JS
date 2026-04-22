const getModule = require; // Alias for module loading utility
const NumericConvertor = Number; // Type conversion alias
const findMinimum = Math.min; // Alias for minimum value function
const outputToConsole = console.log; // Alias for console output

// --- Start of Main Program Logic ---

let rawData = getModule('fs').readTextFileSync('/dev/stdin', 'utf8'); // Acquire input content from standard input stream

const lineFragments = rawData.trim().split("\n"); // Normalize input and segment into an array of lines

while (true) { // Begin processing loop for multiple data sets
    // Extract and parse the N and M values for the current test case
    let currentPair = lineFragments.shift().split(" ").map(NumericConvertor);

    // Check for the termination condition "0 0"
    if (currentPair.join(" ") === "0 0") {
        break; // Exit the loop if the sentinel value is encountered
    }

    // Initialize problem parameters based on the current input pair
    const vertexCount = currentPair[0] + 100; // Adjusted maximum vertex index
    const edgeCount = currentPair[1]; // Number of edges in the graph
    const stateDimensions = 2; // Number of dimensions in the DP state (0, 1, 2)
    const sourceNode = 1; // The designated starting node
    const destinationNode = currentPair[0]; // The target node to reach

    let edgeList = []; // Array to store all graph edges (nodeA, nodeB, weight)
    // Read and parse all edge definitions from the input lines
    for (let idx = 0; idx < edgeCount; idx++) {
        edgeList.push(lineFragments.shift().split(" ").map(NumericConvertor));
    }

    // Initialize the dynamic programming table (minCostMatrix)
    // Each cell minCostMatrix[node][state] stores the minimum cost to reach 'node' in 'state'
    let minCostMatrix = [];
    for (let rowIdx = 0; rowIdx <= vertexCount; rowIdx++) {
        minCostMatrix[rowIdx] = []; // Create a new row for each node
        for (let colIdx = 0; colIdx <= stateDimensions; colIdx++) {
            minCostMatrix[rowIdx][colIdx] = Number.MAX_VALUE; // Initialize with a very large value (conceptual infinity)
        }
    }

    // Set the initial cost for the source node at the base state
    minCostMatrix[sourceNode][0] = 0;

    // Prepare for graph traversal using a queue (BFS-like approach)
    let explorationQueue = [sourceNode]; // Nodes to be processed
    let visitedNodes = {}; // Set to keep track of nodes already processed to avoid cycles/redundancy

    while (true) { // Graph traversal loop
        if (explorationQueue.length === 0) {
            break; // No more nodes to explore, exit traversal
        }

        let currentNode = explorationQueue.shift(); // Dequeue the next node for processing

        // If this node has already been fully processed, skip it
        if (visitedNodes.hasOwnProperty(currentNode)) {
            continue;
        }

        visitedNodes[currentNode] = true; // Mark the current node as processed

        // Iterate through all edges to find connections from/to the currentNode
        edgeList.forEach(function(currentEdge) {
            let nodeA = currentEdge[0]; // First endpoint of the edge
            let nodeB = currentEdge[1]; // Second endpoint of the edge
            let edgeWeight = currentEdge[2]; // Cost associated with traversing this edge

            // If nodeA is the currentNode, consider path from A to B
            if (nodeA === currentNode) {
                // Update DP states for nodeB
                minCostMatrix[nodeB][0] = findMinimum(minCostMatrix[nodeB][0], minCostMatrix[nodeA][0] + edgeWeight);
                minCostMatrix[nodeB][1] = findMinimum(minCostMatrix[nodeB][1], minCostMatrix[nodeA][0]);
                minCostMatrix[nodeB][2] = findMinimum(minCostMatrix[nodeB][2], minCostMatrix[nodeA][1]);
                minCostMatrix[nodeB][2] = findMinimum(minCostMatrix[nodeB][2], minCostMatrix[nodeA][2] + edgeWeight);
                explorationQueue.push(nodeB); // Enqueue nodeB for future exploration
            }
            // If nodeB is the currentNode, consider path from B to A (undirected graph logic)
            else if (nodeB === currentNode) {
                // Update DP states for nodeA
                minCostMatrix[nodeA][0] = findMinimum(minCostMatrix[nodeA][0], minCostMatrix[nodeB][0] + edgeWeight);
                minCostMatrix[nodeA][1] = findMinimum(minCostMatrix[nodeA][1], minCostMatrix[nodeB][0]);
                minCostMatrix[nodeA][2] = findMinimum(minCostMatrix[nodeA][2], minCostMatrix[nodeB][1]);
                minCostMatrix[nodeA][2] = findMinimum(minCostMatrix[nodeA][2], minCostMatrix[nodeB][2] + edgeWeight);
                explorationQueue.push(nodeA); // Enqueue nodeA for future exploration
            }
        });
    }

    let finalAnswer = Number.MAX_VALUE; // Initialize the result with a maximum possible value

    // Evaluate the minimum cost to reach the destination node across allowed states
    minCostMatrix[destinationNode].forEach(function(currentCost, index) {
        if (index !== 1) { // Exclude the state at index 1 from the final answer calculation
            finalAnswer = findMinimum(finalAnswer, currentCost); // Update the overall minimum
        }
    });

    outputToConsole(finalAnswer); // Display the computed minimum cost for the current test case
}
// --- End of Main Program Logic ---