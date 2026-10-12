function executeDijkstra() {
    // Priority queue implementation using a simple JavaScript array that is kept sorted.
    // This approach is less efficient than a binary heap (O(N log N) for enqueue, O(N) for dequeue),
    // but represents a substantially different implementation strategy for the core data structure.
    let nodeDistancesQueue = [];

    // Adds an item [distance, nodeId] to the priority queue and re-sorts it.
    function enqueueNode(itemEntry) {
        nodeDistancesQueue.push(itemEntry);
        // Sort by the distance (first element of the tuple) in ascending order.
        nodeDistancesQueue.sort((a, b) => a[0] - b[0]);
    }

    // Removes and returns the item with the minimum distance from the front of the queue.
    function dequeueMin() {
        return nodeDistancesQueue.shift();
    }

    // Read graph parameters from input.
    const nodeCount = readInputToken();
    const edgeCount = readInputToken();
    const startNodeId = readInputToken();

    // Graph representation: A Map where keys are node IDs and values are arrays of edge objects.
    // Each edge object contains a 'target' node ID and a 'cost' (weight).
    const graphAdjacency = new Map();
    for (let i = 0; i < nodeCount; ++i) {
        graphAdjacency.set(i, []);
    }

    // Populate the graph with edges based on input.
    for (let i = 0; i < edgeCount; ++i) {
        const sourceId = readInputToken();
        const destinationId = readInputToken();
        const edgeWeight = readInputToken();

        graphAdjacency.get(sourceId).push({ target: destinationId, cost: edgeWeight });
    }

    // Array to store the shortest path distances from the start node to all other nodes.
    // Initialized with positive infinity for all nodes.
    const shortestPaths = new Array(nodeCount).fill(Number.POSITIVE_INFINITY);

    // Set the distance to the start node as 0 and add it to the priority queue.
    shortestPaths[startNodeId] = 0;
    enqueueNode([0, startNodeId]);

    // Main loop for Dijkstra's algorithm. Continues as long as there are nodes to process in the queue.
    while (nodeDistancesQueue.length > 0) {
        const [currentDistance, currentVertexId] = dequeueMin();

        // If a shorter path to this vertex has already been found and processed, skip.
        if (currentDistance > shortestPaths[currentVertexId]) {
            continue;
        }

        // Iterate over all neighbors of the current vertex.
        // Using `for...of` loop for iteration over edges.
        for (const edge of graphAdjacency.get(currentVertexId) || []) {
            const neighborId = edge.target;
            const weight = edge.cost;
            const newPathDistance = shortestPaths[currentVertexId] + weight;

            // If a shorter path to the neighbor is found through the current vertex, update its distance
            // and add the neighbor to the priority queue.
            if (shortestPaths[neighborId] > newPathDistance) {
                shortestPaths[neighborId] = newPathDistance;
                enqueueNode([newPathDistance, neighborId]);
            }
        }
    }

    // Output the calculated shortest path distances.
    // Replace `Number.POSITIVE_INFINITY` with the string 'INF' as per requirements.
    for (let i = 0; i < nodeCount; ++i) {
        outputValue(shortestPaths[i] !== Number.POSITIVE_INFINITY ? shortestPaths[i] : 'INF');
    }
}

// Standard input processing setup.
process.stdin.resume();
process.stdin.setEncoding('utf8');

let rawInputData = '';
let tokenPointer = 0;

// Function to read tokens from the processed input array.
function readInputToken(dataType) {
    if (dataType === 'string') {
        return rawInputData[tokenPointer++];
    } else {
        return +rawInputData[tokenPointer++];
    }
}

// Function to output values to the console.
function outputValue(value) {
    console.log(value);
}

// Event listener for incoming data from stdin.
process.stdin.on('data', function(chunk) {
    rawInputData += chunk;
});

// Event listener for the end of stdin input.
process.stdin.on('end', function() {
    // Split the entire input by whitespace into an array of tokens.
    rawInputData = rawInputData.split(/\s+/);
    // Execute the main Dijkstra's algorithm logic.
    executeDijkstra();
});
