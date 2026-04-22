let totalNodesCount; // Represents the total number of vertices in the graph, formerly 'n'
let graphAdjacencyList; // Stores the graph's connections, formerly 'g'

/**
 * Orchestrates the processing of multiple graph scenarios.
 * Reads graph definitions and queries, then computes and outputs results.
 */
function initiateProcessing() {
    // Continuous loop to handle multiple test cases until a termination signal is received.
    // Using a 'for(;;)' construct for an infinite loop with an explicit break.
    for (;;) {
        const numberOfEdges = readNumericInput(); // Number of edges for the current graph, formerly 'm'
        totalNodesCount = readNumericInput();     // Number of nodes for the current graph, formerly 'n'

        // Termination condition: If both nodes and edges are zero, end execution.
        if (totalNodesCount === 0 && numberOfEdges === 0) {
            break; // Exit the main processing loop.
        }

        // Initialize the adjacency list. Each node gets an empty array to hold its neighbors.
        // This ensures every node index from 0 to totalNodesCount-1 is available.
        graphAdjacencyList = Array.from({ length: totalNodesCount }, () => []);

        // Populate the graph by reading edge information.
        // Replaced the custom 'rep' utility function with a standard 'for' loop.
        for (let edgeIndex = 0; edgeIndex < numberOfEdges; ++edgeIndex) {
            const firstNodeId = readNumericInput() - 1; // Node A, adjusted to be 0-indexed
            const secondNodeId = readNumericInput() - 1; // Node B, adjusted to be 0-indexed
            const costWeightType1 = readNumericInput(); // Cost C for the first type
            const costWeightType2 = readNumericInput(); // Cost D for the second type

            // For an undirected graph, add edges in both directions.
            // Edge information is stored as an object for clarity, instead of a raw array.
            const edgeToSecondNode = {
                targetVertex: secondNodeId,
                weightType1: costWeightType1,
                weightType2: costWeightType2
            };
            const edgeToFirstNode = {
                targetVertex: firstNodeId,
                weightType1: costWeightType1,
                weightType2: costWeightType2
            };

            graphAdjacencyList[firstNodeId].push(edgeToSecondNode);
            graphAdjacencyList[secondNodeId].push(edgeToFirstNode);
        }

        const numberOfQueries = readNumericInput(); // Number of pathfinding queries, formerly 'q'

        // Process each shortest path query for the current graph.
        for (let queryIndex = 0; queryIndex < numberOfQueries; ++queryIndex) {
            const startingNode = readNumericInput() - 1; // Start node, 0-indexed
            const destinationNode = readNumericInput() - 1; // Goal node, 0-indexed
            const selectedCostCriterion = readNumericInput(); // Type of cost to use (0 or 1)

            // Basic validation for the cost criterion. In competitive programming, inputs are often
            // guaranteed valid, but for a robust Type III clone, adding such checks is appropriate.
            if (selectedCostCriterion !== 0 && selectedCostCriterion !== 1) {
                // If an invalid type is provided, we can log an error or default.
                // For this example, we'll proceed, but a real application might throw.
                console.error(`Warning: Invalid cost criterion '${selectedCostCriterion}' for query ${queryIndex}. Expected 0 or 1.`);
                // The Dijkstra function will implicitly handle this by selecting a property that might be undefined or incorrect if not 0 or 1.
            }

            // Execute Dijkstra's algorithm to find the shortest path.
            const shortestPathLength = computeDijkstraShortestPath(
                startingNode,
                destinationNode,
                selectedCostCriterion
            );
            outputValue(shortestPathLength); // Display the computed shortest path.
        }
    }
}

/**
 * Computes the shortest path from a starting vertex to a target vertex
 * using Dijkstra's algorithm with a specified edge weight type.
 * @param {number} startVertex - The index of the starting node (0-indexed).
 * @param {number} targetVertex - The index of the destination node (0-indexed).
 * @param {number} weightSelectionIndex - 0 to use 'weightType1', 1 to use 'weightType2' from edges.
 * @returns {number} The minimum distance from startVertex to targetVertex, or Infinity if unreachable.
 */
function computeDijkstraShortestPath(startVertex, targetVertex, weightSelectionIndex) {
    // A custom-built Min-Priority Queue (Min-Heap) implementation.
    // Encapsulated within an object for better modularity.
    const pathPriorityQueue = {
        dataStore: [], // The array that holds the heap elements.

        /**
         * Adds a new path candidate to the priority queue.
         * Elements are objects: { distance: number, vertex: number }.
         * @param {{distance: number, vertex: number}} pathInfo - The path details to enqueue.
         */
        enqueue: function(pathInfo) {
            this.dataStore.push(pathInfo); // Add to the end.
            let currentIndex = this.dataStore.length - 1;

            // Bubble up the new element to maintain the heap property.
            while (currentIndex > 0) {
                const parentIndex = Math.floor((currentIndex - 1) / 2);
                // If parent's distance is less than or equal to current element's, we are in correct position.
                if (this.dataStore[parentIndex].distance <= pathInfo.distance) {
                    break;
                }
                // Swap current element with its parent.
                this.dataStore[currentIndex] = this.dataStore[parentIndex];
                currentIndex = parentIndex;
            }
            this.dataStore[currentIndex] = pathInfo; // Place the element in its final sorted position.
        },

        /**
         * Extracts and returns the element with the smallest distance (highest priority).
         * @returns {{distance: number, vertex: number} | undefined} The minimum element, or undefined if queue is empty.
         */
        dequeue: function() {
            if (this.isEmpty()) {
                return undefined;
            }

            const minPath = this.dataStore[0]; // The smallest element is always at the root.
            const lastPath = this.dataStore.pop(); // Remove the last element.

            // If the queue is not empty after popping, re-heapify.
            if (!this.isEmpty()) {
                this.dataStore[0] = lastPath; // Place the last element at the root temporarily.
                let currentIndex = 0;
                const currentHeapSize = this.dataStore.length;

                // Bubble down the new root element.
                while (true) {
                    const leftChildIdx = 2 * currentIndex + 1;
                    const rightChildIdx = 2 * currentIndex + 2;
                    let swapIdx = currentIndex; // Assume current element is in correct position.

                    // Find the smallest child.
                    if (leftChildIdx < currentHeapSize && this.dataStore[leftChildIdx].distance < this.dataStore[swapIdx].distance) {
                        swapIdx = leftChildIdx;
                    }
                    if (rightChildIdx < currentHeapSize && this.dataStore[rightChildIdx].distance < this.dataStore[swapIdx].distance) {
                        swapIdx = rightChildIdx;
                    }

                    // If no child is smaller than current, heap property is restored.
                    if (swapIdx === currentIndex) {
                        break;
                    }

                    // Swap current element with its smallest child.
                    [this.dataStore[currentIndex], this.dataStore[swapIdx]] = [this.dataStore[swapIdx], this.dataStore[currentIndex]];
                    currentIndex = swapIdx;
                }
            }
            return minPath;
        },

        /**
         * Checks if the priority queue contains any elements.
         * @returns {boolean} True if the queue is empty, false otherwise.
         */
        isEmpty: function() {
            return this.dataStore.length === 0;
        }
    };

    // Array to keep track of the minimum distance found so far from the startVertex to every other vertex.
    // Initialized to Infinity for all nodes, indicating they are unreachable initially.
    const minimumDistances = new Array(totalNodesCount).fill(Infinity);
    minimumDistances[startVertex] = 0; // Distance to the start node itself is zero.

    // Add the starting node to the priority queue.
    pathPriorityQueue.enqueue({ distance: 0, vertex: startVertex });

    // Dijkstra's main loop: continues as long as there are paths to explore.
    while (!pathPriorityQueue.isEmpty()) {
        // Extract the path with the smallest known distance.
        // Using destructuring assignment for cleaner access to properties.
        const { distance: currentPathDistance, vertex: currentVisitedVertex } = pathPriorityQueue.dequeue();

        // Optimization: If we've already found a shorter path to 'currentVisitedVertex'
        // than what's currently being processed, skip this stale entry from the queue.
        if (currentPathDistance > minimumDistances[currentVisitedVertex]) {
            continue;
        }

        // Iterate through all neighbors (edges) of the current vertex.
        // Replaced the custom 'rep' utility with the native 'forEach' method for arrays.
        graphAdjacencyList[currentVisitedVertex].forEach(connectedEdge => {
            // Determine which weight attribute to use based on 'weightSelectionIndex'.
            const edgeWeight = weightSelectionIndex === 0
                ? connectedEdge.weightType1
                : connectedEdge.weightType2;

            const candidateNeighborVertex = connectedEdge.targetVertex;
            const potentialNewDistance = currentPathDistance + edgeWeight;

            // If a shorter path to the 'candidateNeighborVertex' is found, update its distance
            // and add this new, shorter path to the priority queue.
            if (potentialNewDistance < minimumDistances[candidateNeighborVertex]) {
                minimumDistances[candidateNeighborVertex] = potentialNewDistance;
                pathPriorityQueue.enqueue({ distance: potentialNewDistance, vertex: candidateNeighborVertex });
            }
        });
    }

    // Return the shortest distance computed for the target vertex.
    return minimumDistances[targetVertex];
}

// --- Standard Input/Output Management ---

// Global variables to buffer and manage input data.
let bufferedInputData = '';
let inputReadPointer = 0; // Tracks the current position in the buffered input array.

// Resume standard input stream and set character encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener to accumulate incoming data chunks.
process.stdin.on('data', function(chunk) {
    bufferedInputData += chunk;
});

// Event listener for when the entire input stream has ended.
process.stdin.on('end', function() {
    // Process the accumulated input:
    // 1. Trim whitespace from start/end.
    // 2. Split by any sequence of whitespace characters.
    // 3. Filter out any empty strings that might result from splitting (e.g., multiple spaces).
    bufferedInputData = bufferedInputData.trim().split(/\s+/).filter(Boolean);
    initiateProcessing(); // Start the main logic after all input is prepared.
});

/**
 * Reads the next token from the buffered input array and converts it to an integer.
 * @returns {number} The parsed integer value of the next input token.
 */
function readNumericInput() {
    // Basic bounds check for robustness, though competitive programming inputs typically
    // guarantee that we won't read past the end of available data.
    if (inputReadPointer >= bufferedInputData.length) {
        console.error("Error: Attempted to read past the end of buffered input data.");
        return NaN; // Return Not-a-Number or throw an error in a real application.
    }
    const nextInputToken = bufferedInputData[inputReadPointer++];
    return parseInt(nextInputToken, 10); // Explicitly specify base 10 for parsing.
}

/**
 * Outputs a given value to the console, typically a result from a computation.
 * @param {*} value - The value to be printed to standard output.
 */
function outputValue(value) {
    console.log(value);
}