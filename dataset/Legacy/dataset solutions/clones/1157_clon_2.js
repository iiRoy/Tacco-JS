function primaryExecution() {
    // A min-priority queue to store [distance, vertex] pairs.
    let priorityQueue = [];

    // Inserts an element into the min-priority queue.
    function enqueueElement(itemToInsert) {
        let currentIndex = priorityQueue.length;

        // Bubble up the new element to maintain heap property.
        while (currentIndex > 0) {
            // Calculate parent index using bitwise right shift.
            let parentIndex = (currentIndex - 1) >>> 1;

            // If parent is less than or equal to the new item, heap property is satisfied.
            if (priorityQueue[parentIndex][0] <= itemToInsert[0]) {
                break;
            }

            // Move parent down.
            priorityQueue[currentIndex] = priorityQueue[parentIndex];
            // Move current index up.
            currentIndex = parentIndex;
        }
        // Place the new item in its final position.
        priorityQueue[currentIndex] = itemToInsert;
    }

    // Removes and returns the smallest element from the min-priority queue.
    function dequeueMin() {
        // The minimum element is always at the root.
        let minElement = priorityQueue[0];

        // Take the last element to replace the root.
        let lastElement = priorityQueue.pop();

        // If the queue is now empty, return the min element directly.
        if (!priorityQueue.length) {
            return minElement;
        }

        // Start bubbling down from the root.
        let currentPos = 0;
        // Continue as long as there's at least a left child.
        while (currentPos * 2 + 1 < priorityQueue.length) {
            let leftChild = currentPos * 2 + 1;
            let rightChild = currentPos * 2 + 2;

            // Find the smaller child.
            if (rightChild < priorityQueue.length && priorityQueue[rightChild][0] < priorityQueue[leftChild][0]) {
                leftChild = rightChild;
            }

            // If the smaller child is greater than or equal to the last element, stop bubbling down.
            if (priorityQueue[leftChild][0] >= lastElement[0]) {
                break;
            }

            // Move the smaller child up.
            priorityQueue[currentPos] = priorityQueue[leftChild];
            // Move current position down to the child's index.
            currentPos = leftChild;
        }
        // Place the last element in its final position.
        priorityQueue[currentPos] = lastElement;

        return minElement;
    }

    // Read the number of nodes.
    let nodeCount = readInput();
    // Read the number of edges.
    let edgeCount = readInput();
    // Read the starting node.
    let startNode = readInput();

    // Adjacency list representation of the graph.
    let adjacencyList = [];
    // Initialize adjacency list for each node.
    iterateRange(nodeCount, function(loopIndex) {
        adjacencyList[loopIndex] = [];
    });
    // Read and add edges to the graph.
    iterateRange(edgeCount, function() {
        let sourceNode = readInput();
        let targetNode = readInput();
        let weightValue = readInput();

        // Add edge from source to target with its weight.
        adjacencyList[sourceNode].push([targetNode, weightValue]);
    });

    // Array to store shortest distances from the start node.
    let distances = [];
    // Initialize all distances to infinity.
    iterateRange(nodeCount, function(loopIndex) {
        distances[loopIndex] = Infinity;
    });

    // Distance to the start node is 0.
    distances[startNode] = 0;
    // Add the start node with distance 0 to the priority queue.
    enqueueElement([0, startNode]);
    // Dijkstra's algorithm main loop.
    while (priorityQueue.length) {
        // Get the vertex with the smallest distance from the priority queue.
        let currentVertexData = dequeueMin();

        // If we found a shorter path to this vertex already, skip.
        if (currentVertexData[0] > distances[currentVertexData[1]]) {
            continue;
        }

        // Iterate over all neighbors of the current vertex.
        iterateRange(adjacencyList[currentVertexData[1]].length, function(loopIndex) {
            let currentEdge = adjacencyList[currentVertexData[1]][loopIndex];
            // If a shorter path to the neighbor is found.
            if (distances[currentEdge[0]] > distances[currentVertexData[1]] + currentEdge[1]) {
                // Update the distance.
                distances[currentEdge[0]] = distances[currentVertexData[1]] + currentEdge[1];
                // Add the neighbor to the priority queue with its new distance.
                enqueueElement([distances[currentEdge[0]], currentEdge[0]]);
            }
        });
    }

    // Output the shortest distances for all nodes.
    iterateRange(nodeCount, function(loopIndex) {
        outputValue(distances[loopIndex] !== Infinity ? distances[loopIndex] : 'INF');
    });
}
 
// A utility function for looping.
function iterateRange(startVal, endVal, callbackFn) {
    // Handle overloaded function signature (e.g., iterateRange(count, callback) vs iterateRange(start, end, callback)).
    if (callbackFn === undefined) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    // Loop from startVal (inclusive) to endVal (exclusive).
    for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
        callbackFn(loopIndex);
    }
}
 
// Keep the standard input stream open.
process.stdin.resume();
// Set the encoding for input data.
process.stdin.setEncoding('utf8');
 
// Buffer to accumulate input data.
let rawData = '';
// Pointer to the current position in the parsed input array.
let dataPointer = 0;
 
// Function to read and parse input values.
function readInput(dataType) {
    // If 'string' type is requested, return the next raw string.
    if (dataType === 'string') {
        return rawData[dataPointer++];
    }
    // Otherwise, parse as a number.
    else {
        return +rawData[dataPointer++];
    }
}
 
// Function to output values to the console.
function outputValue(val) {
    console.log(val);
}
 
// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
    rawData += dataChunk;
});
// Event listener for end of input stream.
process.stdin.on('end', function() {
    // Split the accumulated input by whitespace into an array.
    rawData = rawData.split(/\s+/);
    // Execute the main logic.
    primaryExecution();
});
