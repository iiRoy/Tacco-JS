class MinPriorityQueue {
    #heapData;
    #currentSize;

    constructor() {
        this.#heapData = [];
        this.#currentSize = 0;
        // Sentinel node for 1-based indexing, ensuring it's always "smaller"
        this.#heapData[0] = { nodeId: -1, pathCost: -Infinity };
    }

    get count() {
        return this.#currentSize;
    }

    isEmpty() {
        return this.#currentSize === 0;
    }

    // Internal helper method for swapping elements
    #performSwap(indexA, indexB) {
        [this.#heapData[indexA], this.#heapData[indexB]] = [this.#heapData[indexB], this.#heapData[indexA]];
    }

    // Adds a new element to the priority queue and maintains heap property
    insertElement(elementDetails) {
        // Validate incoming element structure
        if (typeof elementDetails !== 'object' || elementDetails === null || !('nodeId' in elementDetails) || !('pathCost' in elementDetails)) {
            // A Type III addition: robust input validation
            console.warn("Invalid element format provided to insertElement. Expected { nodeId: number, pathCost: number }.");
            return;
        }

        this.#currentSize++;
        // Ensure array has capacity, though JavaScript handles resizing automatically
        if (this.#heapData.length <= this.#currentSize) {
            this.#heapData.push(null);
        }
        this.#heapData[this.#currentSize] = elementDetails;

        let bubbleUpPosition = this.#currentSize;

        // Bubble up the new element to its correct position
        while (bubbleUpPosition > 1 && this.#heapData[bubbleUpPosition].pathCost < this.#heapData[bubbleUpPosition >> 1].pathCost) {
            this.#performSwap(bubbleUpPosition, bubbleUpPosition >> 1);
            bubbleUpPosition = bubbleUpPosition >> 1; // Integer division by 2
        }
    }

    // Extracts the element with the minimum pathCost (root of the min-heap)
    extractMinimum() {
        // Type III: Explicit guard clause for an empty queue
        if (this.isEmpty()) {
            return null; // Return null if nothing to extract
        }

        const minimumValue = this.#heapData[1];
        this.#heapData[1] = this.#heapData[this.#currentSize];
        this.#heapData[this.#currentSize] = undefined; // Clear the last position after moving
        this.#currentSize--;

        let heapifyDownPosition = 1;

        // Heapify down the new root element to restore heap property
        while (true) {
            const leftChildPosition = heapifyDownPosition * 2;
            const rightChildPosition = heapifyDownPosition * 2 + 1;
            let smallestChildPosition = heapifyDownPosition; // Assume current is smallest

            // Check if left child exists and is smaller
            if (leftChildPosition <= this.#currentSize && this.#heapData[leftChildPosition].pathCost < this.#heapData[smallestChildPosition].pathCost) {
                smallestChildPosition = leftChildPosition;
            }
            // Check if right child exists and is smaller than the current smallest
            if (rightChildPosition <= this.#currentSize && this.#heapData[rightChildPosition].pathCost < this.#heapData[smallestChildPosition].pathCost) {
                smallestChildPosition = rightChildPosition;
            }

            // If the current element is the smallest, heap property is restored
            if (smallestChildPosition === heapifyDownPosition) {
                break;
            }

            this.#performSwap(heapifyDownPosition, smallestChildPosition);
            heapifyDownPosition = smallestChildPosition;
        }
        return minimumValue;
    }
}

// Main function to compute shortest paths using Dijkstra's algorithm
function calculateDijkstraShortestPaths(rawInputData) {
    // Type III: Define a named constant for unreachable distances
    const INFINITE_DISTANCE = Number.MAX_SAFE_INTEGER;

    // Type II: Renamed variables, Type III: added trim() for robustness
    const inputLinesArray = rawInputData.trim().split("\n");
    const totalGraphNodes = parseInt(inputLinesArray[0], 10);

    // Type III: Input validation for total nodes
    if (isNaN(totalGraphNodes) || totalGraphNodes <= 0) {
        console.error("Error: Invalid or non-positive number of graph nodes provided.");
        return;
    }

    // Type II: Renamed 'graph' to 'nodeAdjacencyList'
    const nodeAdjacencyList = new Array(totalGraphNodes);

    // Type III: Pre-fill adjacency list with empty arrays for cleaner edge addition
    for (let nodeIdx = 0; nodeIdx < totalGraphNodes; nodeIdx++) {
        nodeAdjacencyList[nodeIdx] = [];
    }

    // Parse graph input
    for (let currentInputLine = 0; currentInputLine < totalGraphNodes; currentInputLine++) {
        const lineSegments = inputLinesArray[currentInputLine + 1].split(" ");
        const sourceNode = parseInt(lineSegments[0], 10);
        const numberOfOutgoingEdges = parseInt(lineSegments[1], 10);

        // Type III: Input validation for parsed node data
        if (isNaN(sourceNode) || sourceNode < 0 || sourceNode >= totalGraphNodes) {
            console.warn(`Skipping invalid source node ID: ${sourceNode} on line ${currentInputLine + 2}.`);
            continue;
        }
        if (isNaN(numberOfOutgoingEdges) || numberOfOutgoingEdges < 0) {
            console.warn(`Skipping connections for node ${sourceNode} due to invalid edge count: ${numberOfOutgoingEdges}.`);
            continue;
        }

        // Type III: Using objects for edge representation for enhanced readability
        for (let edgeCounter = 0; edgeCounter < numberOfOutgoingEdges; edgeCounter++) {
            const destinationNode = parseInt(lineSegments[edgeCounter * 2 + 2], 10);
            const edgeConnectionWeight = parseInt(lineSegments[edgeCounter * 2 + 3], 10);

            // Type III: Input validation for edge details
            if (isNaN(destinationNode) || destinationNode < 0 || destinationNode >= totalGraphNodes || isNaN(edgeConnectionWeight) || edgeConnectionWeight < 0) {
                console.warn(`Skipping invalid edge details for node ${sourceNode}: target=${destinationNode}, weight=${edgeConnectionWeight}.`);
                continue;
            }

            nodeAdjacencyList[sourceNode].push({ targetNode: destinationNode, weight: edgeConnectionWeight });
        }
    }

    let finalizedNodeCount = 0; // Type II: Renamed 'count'
    // Type II: Renamed 'sum' to 'shortestPathResults', Type III: filled with constant
    const shortestPathResults = new Array(totalGraphNodes).fill(INFINITE_DISTANCE);

    // Type III: Instantiate the custom MinPriorityQueue class
    const pathDiscoveryQueue = new MinPriorityQueue();

    // Initialize Dijkstra's: distance to source node (0) is 0
    shortestPathResults[0] = 0;
    pathDiscoveryQueue.insertElement({ nodeId: 0, pathCost: 0 });

    // Type III: Use a Set to efficiently track nodes whose shortest paths have been finalized
    const discoveredNodesSet = new Set();

    // Main Dijkstra's algorithm loop
    while (finalizedNodeCount < totalGraphNodes && !pathDiscoveryQueue.isEmpty()) {
        const extractedNodeData = pathDiscoveryQueue.extractMinimum(); // Type II: Renamed 'aa'

        // Type III: Defensive check if extraction failed (e.g., queue unexpectedly empty)
        if (extractedNodeData === null) {
            continue;
        }

        // Type III: Destructuring assignment for clarity
        const { nodeId: currentNodeId, pathCost: currentMinPath } = extractedNodeData;

        // Type III: If this node's shortest path has already been finalized, skip
        if (discoveredNodesSet.has(currentNodeId)) {
            continue;
        }

        // Finalize the shortest path to currentNodeId
        shortestPathResults[currentNodeId] = currentMinPath;
        discoveredNodesSet.add(currentNodeId);
        finalizedNodeCount++;

        // Type III: Iterate over neighbors using for...of for object-based edges
        for (const connectedEdge of nodeAdjacencyList[currentNodeId]) {
            const neighborNode = connectedEdge.targetNode;
            const linkWeight = connectedEdge.weight;

            // Type III: Only process neighbors whose shortest paths haven't been finalized
            if (!discoveredNodesSet.has(neighborNode)) {
                // Calculate the potential new path cost to the neighbor
                const candidateNewPathCost = shortestPathResults[currentNodeId] + linkWeight;

                // If this new path is shorter than any previously found path to the neighbor
                if (candidateNewPathCost < shortestPathResults[neighborNode]) {
                    shortestPathResults[neighborNode] = candidateNewPathCost; // Update shortest distance
                    // Type III: Add the neighbor to the priority queue with its updated shortest path
                    pathDiscoveryQueue.insertElement({ nodeId: neighborNode, pathCost: candidateNewPathCost });
                }
            }
        }
    }

    // Output the results
    for (let outputNodeIndex = 0; outputNodeIndex < totalGraphNodes; outputNodeIndex++) {
        const finalCalculatedDistance = shortestPathResults[outputNodeIndex];
        // Type III: Output "INF" for unreachable nodes instead of a large number
        const displayOutputValue = (finalCalculatedDistance === INFINITE_DISTANCE) ? "INF" : finalCalculatedDistance;
        console.log(`${outputNodeIndex} ${displayOutputValue}`);
    }
}

// Type III: Encapsulate the file reading and main function call for better structure
function executeSolutionFromFile() {
    // Type III: Added a try-catch block for robust file reading and error handling
    try {
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        calculateDijkstraShortestPaths(fileContent);
    } catch (error) {
        console.error("An error occurred during input file processing or shortest path computation:", error.message);
        // Type III: Provide more specific error messages for common issues
        if (error.code === 'ENOENT') {
            console.error("Input file '/dev/stdin' not found. Please ensure it exists and is accessible.");
        }
    }
}

executeSolutionFromFile();