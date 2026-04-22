// Store for the min-priority queue elements
let elementStore = [],
    // Current size of the min-heap
    heapCurrentSize = 0;

// Initialize the first element as a sentinel with dummy values
elementStore[0] = [null, null];
elementStore[0][0] = -1;
elementStore[0][1] = -1;

// Function to add a new item to the priority queue
function placeElement(itemToInsert) {
    // Increment heap size and place the new item at the end
    elementStore[++heapCurrentSize] = itemToInsert;

    // Start with the newly added item's index
    let currentIndex = heapCurrentSize;

    // Perform up-heap (swim) operation to maintain heap property
    while (elementStore[currentIndex][1] < elementStore[Math.floor(currentIndex / 2)][1]) {
        // Swap the current element with its parent
        let temporaryHolder = elementStore[currentIndex];
        elementStore[currentIndex] = elementStore[Math.floor(currentIndex / 2)];
        elementStore[Math.floor(currentIndex / 2)] = temporaryHolder;
        // Move up to the parent's index
        currentIndex = Math.floor(currentIndex / 2);
    }
}

// Function to remove and return the minimum element from the priority queue
function removeMinElement() {
    // If the heap is empty, there's nothing to extract
    if (heapCurrentSize <= 0)
        return;

    // The minimum element is always at index 1
    const extractedValue = elementStore[1];

    // Move the last element to the root and decrement heap size
    elementStore[1] = elementStore[heapCurrentSize--];

    // Start down-heap (sink) operation from the root
    let parentIndex = 1;
    while ((parentIndex * 2 <= heapCurrentSize && elementStore[parentIndex][1] > elementStore[parentIndex * 2][1]) ||
           (parentIndex * 2 + 1 <= heapCurrentSize && elementStore[parentIndex][1] > elementStore[parentIndex * 2 + 1][1])) {

        // Calculate indices of left and right children
        let leftChildIndex = parentIndex * 2;
        let rightChildIndex = parentIndex * 2;
        // Adjust right child index if it exists
        if (parentIndex * 2 + 1 <= heapCurrentSize)
            rightChildIndex++;

        // Determine which child has the smaller value
        let minChildIdx = elementStore[leftChildIndex][1] <= elementStore[rightChildIndex][1] ? leftChildIndex : rightChildIndex;

        // Swap the parent with the smaller child
        let swapItem = elementStore[parentIndex];
        elementStore[parentIndex] = elementStore[minChildIdx];
        elementStore[minChildIdx] = swapItem;

        // Move down to the child's index
        parentIndex = minChildIdx;
    }
    // Return the element that was originally at the root
    return extractedValue;
}


// Main function to execute the graph algorithm (Dijkstra's)
function processGraphData(rawDataInput) {
    // Split the raw input string into lines
    rawDataInput = rawDataInput.split("\n");
    // Parse the number of vertices from the first line
    const numberOfVertices = parseInt(rawDataInput[0], 10);

    // Initialize an adjacency list to represent the graph
    let connectionMap = new Array(numberOfVertices);

    // Loop through each line of input to build the graph
    for (let currentLineIdx = 0; currentLineIdx < numberOfVertices; currentLineIdx++) {
        // Split the current line into components (vertex, degree, and edge details)
        rawDataInput[currentLineIdx + 1] = rawDataInput[currentLineIdx + 1].split(" ");
        // Parse the source vertex
        const currentVertexIdentifier = parseInt(rawDataInput[currentLineIdx + 1][0], 10);
        // Parse the number of outgoing edges from this vertex
        const edgesFromVertexCount = parseInt(rawDataInput[currentLineIdx + 1][1], 10);
        // Initialize an array for this vertex's neighbors
        connectionMap[currentVertexIdentifier] = new Array(edgesFromVertexCount);
        // Initialize each neighbor entry as an array of two elements (target, weight)
        for (let edgeIterator = 0; edgeIterator < edgesFromVertexCount; edgeIterator++)
            connectionMap[currentVertexIdentifier][edgeIterator] = new Array(2);
        // Populate neighbor details (target vertex and edge weight)
        for (let edgeIterator = 0; edgeIterator < edgesFromVertexCount; edgeIterator++) {
            connectionMap[currentVertexIdentifier][edgeIterator][0] = parseInt(rawDataInput[currentLineIdx + 1][edgeIterator * 2 + 2], 10);
            connectionMap[currentVertexIdentifier][edgeIterator][1] = parseInt(rawDataInput[currentLineIdx + 1][edgeIterator * 2 + 3], 10);
        }
    }

    // Initialize a counter for visited nodes, starting at 1 (for the source node)
    let visitedNodesCount = 1;
    // Array to store the shortest distances from the source to all other nodes
    let shortestPathDistances = new Array(numberOfVertices);
    // Initialize all distances to a large value (representing infinity)
    for (let vertexIndex = 0; vertexIndex < numberOfVertices; vertexIndex++)
        shortestPathDistances[vertexIndex] = 1000000000;
    // The distance to the source node itself is 0
    shortestPathDistances[0] = 0;

    // Add all edges from the source node (vertex 0) to the priority queue
    for (let edgeIndex = 0; edgeIndex < connectionMap[0].length; edgeIndex++) {
        placeElement(connectionMap[0][edgeIndex]);
    }

    // Main loop for Dijkstra's algorithm
    while (visitedNodesCount < numberOfVertices) {
        // Extract the edge with the smallest weight from the priority queue
        const currentMinEdge = removeMinElement();

        // If this node has already been finalized with a shorter path, skip
        if (shortestPathDistances[currentMinEdge[0]] < 1000000000)
            continue;

        // Finalize the shortest path to this node
        shortestPathDistances[currentMinEdge[0]] = currentMinEdge[1];
        // Increment the count of visited nodes
        visitedNodesCount++;

        // Explore neighbors of the newly finalized node
        for (let neighborEdgeIdx = 0; neighborEdgeIdx < connectionMap[currentMinEdge[0]].length; neighborEdgeIdx++) {
            // Update the neighbor's distance by adding the current node's finalized distance
            connectionMap[currentMinEdge[0]][neighborEdgeIdx][1] += shortestPathDistances[currentMinEdge[0]];
            // Add the updated neighbor edge to the priority queue
            placeElement(connectionMap[currentMinEdge[0]][neighborEdgeIdx]);
        }
    }

    // Output the shortest distances for each node
    for (let nodeOutputIndex = 0; nodeOutputIndex < numberOfVertices; nodeOutputIndex++) {
        console.log(nodeOutputIndex + " " + shortestPathDistances[nodeOutputIndex]);
    }
}

// Call the main processing function with input read from standard input
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));