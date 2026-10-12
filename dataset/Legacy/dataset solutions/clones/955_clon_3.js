class MinPriorityQueue {
    constructor() {
        this.elements = [];
        // Sentinel node at index 0 to simplify parent/child index calculations (1-based indexing)
        this.elements[0] = [-1, -1, -1];
        this.size = 0;
    }

    // Static constants for better readability of edge array structure
    static get DEST_NODE_ID() { return 0; }
    static get EDGE_WEIGHT() { return 1; }
    static get SOURCE_NODE_ID() { return 2; }

    // Adds an edge (represented as an array) to the min-priority queue
    add(edgeData) {
        this.elements[++this.size] = edgeData;
        let currentElementIndex = this.size;
        let parentElementIndex = Math.floor(currentElementIndex / 2);

        // Bubble up: maintain heap property by swapping with parent if current is smaller
        while (parentElementIndex > 0 && this.elements[currentElementIndex][MinPriorityQueue.EDGE_WEIGHT] < this.elements[parentElementIndex][MinPriorityQueue.EDGE_WEIGHT]) {
            let swapTemp = this.elements[currentElementIndex];
            this.elements[currentElementIndex] = this.elements[parentElementIndex];
            this.elements[parentElementIndex] = swapTemp;
            currentElementIndex = parentElementIndex;
            parentElementIndex = Math.floor(currentElementIndex / 2);
        }
    }

    // Retrieves and removes the minimum element (edge with smallest weight) from the queue
    retrieveMin() {
        if (this.size === 0) {
            return undefined;
        }

        const minimumElement = this.elements[1];
        // Move the last element to the root and decrement size
        this.elements[1] = this.elements[this.size--];

        let currentRootIndex = 1;
        let leftChildIndex, rightChildIndexEffective;
        let childToSwapIndex;

        // Bubble down: maintain heap property
        // The loop condition mirrors the original's logic for when to continue swapping
        while ((currentRootIndex * 2 <= this.size && this.elements[currentRootIndex][MinPriorityQueue.EDGE_WEIGHT] > this.elements[currentRootIndex * 2][MinPriorityQueue.EDGE_WEIGHT]) ||
               (currentRootIndex * 2 + 1 <= this.size && this.elements[currentRootIndex][MinPriorityQueue.EDGE_WEIGHT] > this.elements[currentRootIndex * 2 + 1][MinPriorityQueue.EDGE_WEIGHT])) {

            leftChildIndex = currentRootIndex * 2;
            rightChildIndexEffective = currentRootIndex * 2; // Initialize to left child index

            // If a right child exists, update rightChildIndexEffective
            if (currentRootIndex * 2 + 1 <= this.size) {
                rightChildIndexEffective++;
            }

            // Determine which child has the smaller weight (or if only left exists, pick left)
            if (this.elements[leftChildIndex][MinPriorityQueue.EDGE_WEIGHT] <= this.elements[rightChildIndexEffective][MinPriorityQueue.EDGE_WEIGHT]) {
                childToSwapIndex = leftChildIndex;
            } else {
                childToSwapIndex = rightChildIndexEffective;
            }

            // Perform the swap
            let swapTemp = this.elements[currentRootIndex];
            this.elements[currentRootIndex] = this.elements[childToSwapIndex];
            this.elements[childToSwapIndex] = swapTemp;
            currentRootIndex = childToSwapIndex;
        }
        return minimumElement;
    }

    // Helper to check if the priority queue is empty
    isEmpty() {
        return this.size === 0;
    }
}

// Helper function to create an edge entry array
function createEdgeEntry(destinationNodeId, edgeWeight, sourceNodeId) {
    return [destinationNodeId, edgeWeight, sourceNodeId];
}

// Helper function to parse input and build the adjacency matrix
function parseInputAndBuildGraph(inputString) {
    const lines = inputString.split("\n");
    const numNodes = parseInt(lines[0], 10);

    const adjacencyMatrix = [];
    for (let rowIndex = 0; rowIndex < numNodes; rowIndex++) {
        adjacencyMatrix[rowIndex] = new Array(numNodes);
        const rowValues = lines[rowIndex + 1].split(" ");
        for (let colIndex = 0; colIndex < numNodes; colIndex++) {
            adjacencyMatrix[rowIndex][colIndex] = parseInt(rowValues[colIndex + 1], 10);
        }
    }
    return { numNodes, adjacencyMatrix };
}

// Helper function to calculate the total weight of the MST
function calculateTotalMstWeight(mstResultMatrix, numNodes) {
    let totalMstWeight = 0;
    for (let rowIndex = 0; rowIndex < numNodes; rowIndex++) {
        for (let colIndex = 0; colIndex < numNodes; colIndex++) {
            // Only sum each edge once (e.g., for i < j) and if it's a valid MST edge
            if (rowIndex < colIndex && mstResultMatrix[rowIndex][colIndex] > -1) {
                totalMstWeight += mstResultMatrix[rowIndex][colIndex];
            }
        }
    }
    return totalMstWeight;
}

// Main function implementing Prim's algorithm
function solveMstProblem(problemInput) {
    const { numNodes, adjacencyMatrix } = parseInputAndBuildGraph(problemInput);

    const mstResultMatrix = [];
    for (let rowIndex = 0; rowIndex < numNodes; rowIndex++) {
        mstResultMatrix[rowIndex] = new Array(numNodes).fill(-1); // Initialize with -1
    }

    let nodesVisitedCount = 0;
    const isNodeIncludedInMst = new Array(numNodes).fill(false);

    // Initialize priority queue
    const edgePriorityQueue = new MinPriorityQueue();

    // Start Prim's from node 0
    isNodeIncludedInMst[0] = true;
    nodesVisitedCount++;

    // Add all edges from the starting node (node 0) to the priority queue
    for (let colIndex = 0; colIndex < numNodes; colIndex++) {
        if (adjacencyMatrix[0][colIndex] > -1) {
            const initialEdge = createEdgeEntry(colIndex, adjacencyMatrix[0][colIndex], 0);
            edgePriorityQueue.add(initialEdge);
        }
    }

    // Main loop for Prim's algorithm
    while (nodesVisitedCount < numNodes) {
        const extractedMinEdge = edgePriorityQueue.retrieveMin();

        // If queue is empty but not all nodes are visited, graph is disconnected.
        // The original code would effectively stop processing new edges.
        if (extractedMinEdge === undefined) {
            break;
        }

        const destinationNode = extractedMinEdge[MinPriorityQueue.DEST_NODE_ID];
        const edgeWeight = extractedMinEdge[MinPriorityQueue.EDGE_WEIGHT];
        const sourceNode = extractedMinEdge[MinPriorityQueue.SOURCE_NODE_ID];

        // If the destination node is already part of the MST, skip this edge
        if (isNodeIncludedInMst[destinationNode]) {
            continue;
        }

        // Add the new node and edge to the MST
        isNodeIncludedInMst[destinationNode] = true;
        mstResultMatrix[destinationNode][sourceNode] = edgeWeight;
        mstResultMatrix[sourceNode][destinationNode] = edgeWeight; // MST is undirected
        nodesVisitedCount++;

        // Add all edges from the newly added node to the priority queue
        for (let colIndex = 0; colIndex < numNodes; colIndex++) {
            if (adjacencyMatrix[destinationNode][colIndex] > -1 && !isNodeIncludedInMst[colIndex]) {
                const candidateEdge = createEdgeEntry(colIndex, adjacencyMatrix[destinationNode][colIndex], destinationNode);
                edgePriorityQueue.add(candidateEdge);
            }
        }
    }

    const totalMstWeight = calculateTotalMstWeight(mstResultMatrix, numNodes);
    console.log(totalMstWeight);
}

// Read input and execute the MST solver
solveMstProblem(require("fs").readFileSync("/dev/stdin","utf8"));
