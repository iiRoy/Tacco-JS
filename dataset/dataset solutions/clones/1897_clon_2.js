const ProcessInput = (rawData) => {

    // Split the entire input string into individual lines
    let lineCollection = rawData.split('\n');

    // Extract the first line for dimensions (N and M)
    const dimensions = lineCollection.shift().split(' ').map(val => parseInt(val, 10));

    // Extract the second line for heights
    const heights = lineCollection.shift().split(' ').map(val => parseInt(val, 10));

    // Remove the last (potentially empty or problematic) line
    lineCollection.pop(); // This often removes an empty string at the end of input

    // Process remaining lines for connections data
    const connections = lineCollection.map(lineItem =>
        lineItem.split(' ').map(numStr => parseInt(numStr, 10))
    );

    // For debugging purposes, uncomment these lines
    // console.log('Parsed Dimensions: ', dimensions);
    // console.log('Parsed Heights: ', heights);
    // console.log('Parsed Connections: ', connections);

    // Call the core logic function with parsed data and log its result
    console.log(CalculateResult(dimensions[0], dimensions[1], heights, connections));
};


const CalculateResult = (nodeCount, edgeCount, nodeHeights, edgeList) => {

    // Initialize an adjacency list to represent connections between nodes
    let adjacencyList = [];

    // Populate the adjacency list with empty arrays for each node
    for (let nodeIndex = 0; nodeIndex <= nodeCount; nodeIndex++) {
        adjacencyList.push([]);
    }

    // Fill the adjacency list based on the provided edge list
    // Each connection is bidirectional
    for (let connectionIndex = 0; connectionIndex < edgeCount; connectionIndex++) {
        const firstNode = edgeList[connectionIndex][0];
        const secondNode = edgeList[connectionIndex][1];
        adjacencyList[firstNode].push(secondNode);
        adjacencyList[secondNode].push(firstNode);
    }

    let goodSpotCount = 0; // Counter for nodes that meet the criteria

    // Optional: Log the constructed adjacency list for verification
    // console.log('Constructed Adjacency List: ', adjacencyList);

    // Iterate through each node (starting from 1, assuming 1-indexed nodes)
    for (let currNodeIdx = 1; currNodeIdx <= nodeCount; currNodeIdx++) {

        // Optional: Log current node being processed
        // console.log('Processing Node: ', currNodeIdx, ' with neighbors: ', adjacencyList[currNodeIdx]);

        // If a node has no connections, it automatically qualifies
        if (adjacencyList[currNodeIdx].length === 0) {
            goodSpotCount++;
            continue; // Move to the next node
        }

        let maxNeighborHeight = 0; // Track the maximum height among neighbors

        // Iterate through all neighbors of the current node
        adjacencyList[currNodeIdx].forEach(neighborNodeIdx => {
            // Adjust index for 0-based array access for heights
            if (nodeHeights[neighborNodeIdx - 1] > maxNeighborHeight) {
                maxNeighborHeight = nodeHeights[neighborNodeIdx - 1];
            }
        });

        // If the current node's height is strictly greater than all its neighbors' heights
        // (represented by maxNeighborHeight), it qualifies.
        // Adjust index for 0-based array access for current node's height
        if (maxNeighborHeight < nodeHeights[currNodeIdx - 1]) {
            goodSpotCount++;
        }
    }

    return goodSpotCount; // Return the total count of qualifying nodes
};

// Do not modify the following line; it handles standard input/output and invokes the primary processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));