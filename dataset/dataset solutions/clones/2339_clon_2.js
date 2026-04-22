'use strict'

function ProcessInput(rawData) {
    // Cleanse input data: remove leading/trailing whitespace and split into individual lines
    let  trimmedLines  =  rawData.trim().split('\n');

    // Parse the first line to extract key parameters
    const initialParams = trimmedLines[0].split(' ').map(strVal => Number.parseInt(strVal, 10));

    // Extract graph properties
    const nodeCount = initialParams[0]; // Total number of nodes in the graph
    const startNodeA = initialParams[1]; // Starting point for the first traversal
    const startNodeB = initialParams[2]; // Starting point for the second traversal

    // Process the remaining lines, which represent edges
    const remainingLines = trimmedLines.slice(1);

    // Convert edge strings into arrays of integers
    const edgeData = remainingLines.map(lineStr => {
        return lineStr.split(' ').map(subStr => Number.parseInt(subStr, 10));
    });

    // Initialize an adjacency list to represent the graph structure
    let adjacencyList = {};
    
    // Populate the adjacency list with edges
    for (let edgeIdx = 0; edgeIdx < nodeCount - 1; ++edgeIdx) {
        const currentEdge = edgeData[edgeIdx];
        const nodeX = currentEdge[0];
        const nodeY = currentEdge[1];

        // Ensure both nodes have an entry in the adjacency list
        if (!adjacencyList[nodeX]) {
            adjacencyList[nodeX] = [];
        }
        if (!adjacencyList[nodeY]) {
            adjacencyList[nodeY] = [];
        }
        
        // Add bidirectional connections
        adjacencyList[nodeX].push(nodeY);
        adjacencyList[nodeY].push(nodeX);
    }

    // Initialize distance arrays for two separate DFS traversals
    let distancesFromA = Array(nodeCount + 1);
    distancesFromA.fill(0);  // All distances initially zero

    let distancesFromB = Array(nodeCount + 1);
    distancesFromB.fill(0);  // All distances initially zero

    // Define a Depth-First Search function to calculate distances from a source node
    const traverseGraph = (currentNode, previousNode, currentDepth, distanceArray) => {
        // Record the calculated depth for the current node
        distanceArray[currentNode] = currentDepth; 
        
        // Iterate through all neighbors of the current node
        for (let neighborIndex in adjacencyList[currentNode]) {
            const nextNode = Number.parseInt(adjacencyList[currentNode][neighborIndex], 10);
            
            // Avoid going back to the parent node in the DFS path
            if (nextNode !== previousNode) {
                traverseGraph(nextNode, currentNode, currentDepth + 1, distanceArray);
            }
        }
    };

    // Execute DFS from the first designated start node
    traverseGraph(startNodeA, null, 0, distancesFromA);
    // Execute DFS from the second designated start node
    traverseGraph(startNodeB, null, 0, distancesFromB);

    // Determine the maximum distance for nodes where distance from A is less than distance from B
    let greatestDistance = 0;
    for (let nodeIdentifier = 0; nodeIdentifier < nodeCount + 1; ++nodeIdentifier) {
        // Check if node's distance from A is shorter than from B
        if (distancesFromA[nodeIdentifier] < distancesFromB[nodeIdentifier]) {
            greatestDistance = Math.max(greatestDistance, distancesFromA[nodeIdentifier]);
        }
    }
    // Output the final calculated maximum distance
    console.log(greatestDistance);
}

// Invoke the main processing function with data read from standard input
ProcessInput(require('node:fs').readFileSync('/dev/stdin', 'utf8'));