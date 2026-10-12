process.stdin.resume();
process.stdin.setEncoding('utf8');

// Variable to accumulate all incoming data from stdin
let rawInputData = '';

// Event listener for incoming data chunks
process.stdin.on('data', function (chunkOfData) {
    rawInputData += chunkOfData; // Append the chunk to the main input string
});

/**
 * Parses a space-separated string into an array of numbers.
 * Removes leading/trailing whitespace before splitting.
 * @param {string} currentLine - The input string line.
 * @returns {number[]} An array of numbers.
 */
const parseNumericLine = function (currentLine) {
    // Trim whitespace and split by space
    let parsedElements = currentLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    // Convert each element to a number
    for (let idx = 0; idx < parsedElements.length; ++idx) {
        parsedElements[idx] = +parsedElements[idx];
    }
    return parsedElements;
};

/**
 * Parses a space-separated string into an array of strings.
 * Removes leading/trailing whitespace before splitting.
 * (Note: This function is defined but not used in the provided logic.)
 * @param {string} currentLine - The input string line.
 * @returns {string[]} An array of strings.
 */
const parseStringLine = function (currentLine) {
    // Trim whitespace and split by space
    let parsedElements = currentLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    // No type conversion needed, elements remain strings
    for (let idx = 0; idx < parsedElements.length; ++idx) {
        parsedElements[idx] = parsedElements[idx]; // Explicitly keep as string
    }
    return parsedElements;
};

// Event listener for the end of input stream
process.stdin.on('end', function () {
    // Split the accumulated input data into individual lines
    const inputLines = rawInputData.split('\n');

    // Parse the first line to get graph dimensions (N and M)
    const graphDimensions = parseNumericLine(inputLines[0]);
    const numNodes = graphDimensions[0]; // Number of nodes
    const numEdges = graphDimensions[1]; // Number of edges

    // Process the remaining lines to get the list of edges
    // Each line represents an edge [u, v]
    let edgeList = inputLines.splice(1).map(singleLine => parseNumericLine(singleLine));

    // Initialize adjacency lists for each node
    // adjacencyLists[i] will store an array of neighbors for node i
    let adjacencyLists = new Array(numNodes + 1);
    for (let nodeIdx = 0; nodeIdx < numNodes + 1; ++nodeIdx) {
        adjacencyLists[nodeIdx] = []; // Each node gets an empty list of neighbors
    }

    // Populate adjacency lists based on the edge list
    // Adjust node indices to be 0-based for internal processing
    for (let currentEdge of edgeList) {
        currentEdge[0]--; // Decrement first node index
        currentEdge[1]--; // Decrement second node index
        adjacencyLists[currentEdge[0]].push(currentEdge[1]); // Add neighbor for first node
        adjacencyLists[currentEdge[1]].push(currentEdge[0]); // Add neighbor for second node (undirected graph)
    }

    // Array to store all found cycles
    let foundCycles = [];

    // Iterate through each node to find cycles starting from it
    for (let startNodeIdx = 0; startNodeIdx < numNodes; ++startNodeIdx) {
        // Initialize paths to explore: each path starts with a direct neighbor of startNodeIdx
        // Each element in 'pathsToExplore' is an array representing a path, e.g., [startNodeIdx, neighbor]
        let pathsToExplore = [].concat(adjacencyLists[startNodeIdx].map(neighbor => [startNodeIdx, neighbor]));
        
        // Set to keep track of visited nodes within the current BFS/DFS-like traversal
        // This 'visitedNodes' set is reset for each starting node, but also updated within the while loop
        let visitedNodes = new Set();

        // Perform a modified BFS/DFS to find cycles
        while (pathsToExplore.length > 0) {
            let nextPathsToExplore = []; // Paths for the next iteration
            visitedNodes.add(startNodeIdx); // Mark the starting node as visited for this traversal

            for (let currentPath of pathsToExplore) {
                const pathEndNode = currentPath[currentPath.length - 1]; // Get the last node in the current path
                let secondToLastNode = -1; // Initialize second-to-last node (unused in filter logic, but present in original)

                if (currentPath.length >= 2) {
                    secondToLastNode = currentPath[currentPath.length - 2]; // Get the second-to-last node
                }

                // Find potential next nodes for the current path:
                // - Must be a neighbor of pathEndNode
                // - Must not already be in the current path (to avoid immediate back-tracking)
                // - Must not be the pathEndNode itself
                // - Must not have been visited in this traversal, UNLESS it's the startNodeIdx (which indicates a cycle)
                const possibleNextNodes = adjacencyLists[pathEndNode].filter(neighborNode =>
                    currentPath.indexOf(neighborNode) < 0 && // Neighbor not already in path
                    neighborNode !== pathEndNode && // Neighbor is not the end node itself
                    (!visitedNodes.has(neighborNode) || neighborNode === startNodeIdx) // Not visited, or is the start node
                );

                // Extend paths with possible next nodes
                possibleNextNodes.forEach(nextNodeInPath => {
                    visitedNodes.add(nextNodeInPath); // Mark the new node as visited
                    let tempPath = [].concat(currentPath); // Create a new path by copying the current one
                    tempPath.push(nextNodeInPath); // Add the next node to the new path

                    if (nextNodeInPath !== startNodeIdx) {
                        // If the next node is not the start node, continue exploring this path
                        nextPathsToExplore.push(tempPath);
                    } else {
                        // If the next node IS the start node, a cycle has been found
                        foundCycles.push(tempPath);
                    }
                });
            }
            pathsToExplore = nextPathsToExplore; // Update paths for the next iteration
        }
    }
    
    // Filter out cycles that are too short (e.g., A-B-A is length 3, but considered length 2 edge)
    // A true cycle must have at least 3 distinct nodes (path length > 2)
    foundCycles = foundCycles.filter(cyclePath => cyclePath.length > 2);

    // Remove edges that are part of any found cycle
    // WARNING: The original code contains a likely typo in the inner loop: `++l` instead of `++i`.
    // This clone preserves the original behavior, which would likely cause a runtime error
    // (e.g., TypeError: Cannot read properties of NaN (reading 'length'))
    // because 'l' (now 'cyclePath') is an array and incrementing it results in NaN.
    for (let cyclePath of foundCycles) {
        for (let idx = 0; idx < cyclePath.length; ++cyclePath) { // Preserving original `++l` (now `++cyclePath`)
            const nodeA = cyclePath[idx];
            const nodeB = cyclePath[(idx + 1) % cyclePath.length]; // Get the next node in the cycle (wrapping around)

            // Filter out edges from the edgeList if they match the current segment of the cycle
            edgeList = edgeList.filter(edgeEntry =>
                !( (edgeEntry[1] === nodeA && edgeEntry[0] === nodeB) || // Check for edge [B, A]
                   (edgeEntry[0] === nodeA && edgeEntry[1] === nodeB) )   // Check for edge [A, B]
            );
        }
    }
    
    // Output the count of remaining edges
    console.log(edgeList.length);
});
