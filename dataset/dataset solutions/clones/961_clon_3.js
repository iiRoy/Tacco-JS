var minHeapElements = [];
var currentHeapSize = 0;

minHeapElements[0] = [-1, -1]; // Sentinel value for heap root's parent

function getNumericValue(str) {
    return parseInt(str, 10);
}
 
function enqueuePriority(elementData) {
    minHeapElements[++currentHeapSize] = elementData;
 
    let currentElementIndex = currentHeapSize;
    let parentElementIndex;
 
    while (true) {
        parentElementIndex = Math.floor(currentElementIndex / 2);
        // If current element is at root or its value is not less than its parent's, stop
        if (parentElementIndex === 0 || minHeapElements[currentElementIndex][1] >= minHeapElements[parentElementIndex][1]) {
            break;
        }
 
        // Swap current element with its parent
        let temporarySwapBuffer = minHeapElements[currentElementIndex];
        minHeapElements[currentElementIndex] = minHeapElements[parentElementIndex];
        minHeapElements[parentElementIndex] = temporarySwapBuffer;
        currentElementIndex = parentElementIndex;
    }
}
 
function retrieveMinElement() {
    if (currentHeapSize <= 0) {
        return null; // Return null if heap is empty
    }
 
    const minimumValue = minHeapElements[1];
 
    // Move the last element to the root and decrease heap size
    minHeapElements[1] = minHeapElements[currentHeapSize--];
 
    let currentRootIndex = 1;
    let leftChildIndex, rightChildIndex;
    let smallestChildIndex;
    let swapOccurred;

    while (true) {
        swapOccurred = false;
        leftChildIndex = currentRootIndex * 2;
        rightChildIndex = currentRootIndex * 2 + 1;
        smallestChildIndex = currentRootIndex; // Assume current node is smallest

        // Check if left child exists and is smaller
        if (leftChildIndex <= currentHeapSize && minHeapElements[leftChildIndex][1] < minHeapElements[smallestChildIndex][1]) {
            smallestChildIndex = leftChildIndex;
        }

        // Check if right child exists and is smaller than current smallest
        if (rightChildIndex <= currentHeapSize && minHeapElements[rightChildIndex][1] < minHeapElements[smallestChildIndex][1]) {
            smallestChildIndex = rightChildIndex;
        }

        // If the smallest element is not the current root, swap them
        if (smallestChildIndex !== currentRootIndex) {
            let tempSwap = minHeapElements[currentRootIndex];
            minHeapElements[currentRootIndex] = minHeapElements[smallestChildIndex];
            minHeapElements[smallestChildIndex] = tempSwap;
            currentRootIndex = smallestChildIndex; // Move down to the swapped position
            swapOccurred = true;
        }

        if (!swapOccurred) {
            break; // Heap property is satisfied
        }
    }
    return minimumValue;
}


function processGraphData(rawData){
    const lines = rawData.split("\n");
    const nodeCount = getNumericValue(lines[0]);

    const adjacencyList = new Array(nodeCount);

    // Parse graph input
    for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
        const currentLineParts = lines[nodeIdx + 1].split(" ");
        const currentNodeId = getNumericValue(currentLineParts[0]);
        const edgeCount = getNumericValue(currentLineParts[1]);
        
        adjacencyList[currentNodeId] = new Array(edgeCount);
        for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
            adjacencyList[currentNodeId][edgeIdx] = new Array(2); // [destination, weight]
        }

        for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
            const destinationNode = getNumericValue(currentLineParts[edgeIdx * 2 + 2]);
            const edgeWeight = getNumericValue(currentLineParts[edgeIdx * 2 + 3]);
            adjacencyList[currentNodeId][edgeIdx][0] = destinationNode;
            adjacencyList[currentNodeId][edgeIdx][1] = edgeWeight;
        }
    }

    // Dijkstra's algorithm setup
    const MAX_DISTANCE_VALUE = 1000000000; // Represents infinity
    let processedNodeCount = 0;
    const minDistances = new Array(nodeCount);

    // Initialize distances
    for (let i = 0; i < nodeCount; i++) {
        minDistances[i] = MAX_DISTANCE_VALUE;
    }
    minDistances[0] = 0; // Distance to starting node (node 0) is zero

    // Add initial edges from the starting node to the priority queue
    const initialEdgesFromStart = adjacencyList[0];
    if (initialEdgesFromStart) {
        for (let i = 0; i < initialEdgesFromStart.length; i++) {
            // Create a copy to avoid modifying the original graph data
            const edgeToInsert = [initialEdgesFromStart[i][0], initialEdgesFromStart[i][1]];
            enqueuePriority(edgeToInsert);
        }
    }
    
    // Main Dijkstra's loop
    while (processedNodeCount < nodeCount) {
        const extractedEdge = retrieveMinElement();

        if (extractedEdge === null) { // Heap is empty, no more reachable nodes
            break;
        }

        const targetNode = extractedEdge[0];
        const currentPathWeight = extractedEdge[1];

        // If a shorter path to this node has already been found, skip
        if (minDistances[targetNode] < MAX_DISTANCE_VALUE) {
            continue;
        }

        minDistances[targetNode] = currentPathWeight;
        processedNodeCount++;

        // Explore neighbors of the newly processed node
        const neighborsOfTarget = adjacencyList[targetNode];
        if (neighborsOfTarget) {
            for (let i = 0; i < neighborsOfTarget.length; i++) {
                const neighborEdge = neighborsOfTarget[i];
                const neighborNode = neighborEdge[0];
                const originalNeighborWeight = neighborEdge[1];

                // Only consider if neighbor's distance is not yet finalized
                if (minDistances[neighborNode] === MAX_DISTANCE_VALUE) {
                    const newEdgeEntry = [neighborNode, originalNeighborWeight + minDistances[targetNode]];
                    enqueuePriority(newEdgeEntry);
                }
            }
        }
    }

    // Output the calculated minimum distances
    for (let i = 0; i < nodeCount; i++) {
        console.log(i + " " + minDistances[i]);
    }
}

processGraphData(require("fs").readFileSync("/dev/stdin","utf8"));
