const graphProcessor = (() => {
    // Acquire all input content synchronously, then prepare for sequential access.
    const inputContent = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;

    // Utility to parse the next line into an array of numbers.
    const retrieveNumericLine = () => {
        return inputContent[currentLineIndex++].split(' ').map(Number);
    };

    // Main execution function for graph analysis.
    const processGraphData = () => {
        // First line contains total number of vertices and edges.
        const [vertexCount, edgeCount] = retrieveNumericLine();

        // Initialize adjacency list using a Map for vertex-to-neighbor mappings.
        const adjacencyStructure = new Map();
        for (let i = 0; i < vertexCount; i++) {
            adjacencyStructure.set(i, new Set()); // Each vertex maps to a Set of its connected neighbors.
        }

        // Populate the adjacency structure with edge information.
        for (let i = 0; i < edgeCount; i++) {
            const [nodeA, nodeB] = retrieveNumericLine();
            // Convert 1-based input to 0-based indexing.
            const idxA = nodeA - 1;
            const idxB = nodeB - 1;
            adjacencyStructure.get(idxA).add(idxB);
            adjacencyStructure.get(idxB).add(idxA); // Undirected graph.
        }

        // Keep track of visited nodes using a Set.
        const visitedNodesRegistry = new Set();
        let componentCounter = 0; // Counts the number of distinct connected components.

        // Iterate through all potential vertices to find unvisited ones and start traversals.
        for (let vertexIdentifier = 0; vertexIdentifier < vertexCount; vertexIdentifier++) {
            if (!visitedNodesRegistry.has(vertexIdentifier)) {
                componentCounter++; // Found a new connected component.
                
                // Perform Breadth-First Search (BFS) to explore this component.
                const discoveryQueue = [vertexIdentifier];
                visitedNodesRegistry.add(vertexIdentifier); // Mark starting node as visited.

                while (discoveryQueue.length > 0) {
                    const activeVertex = discoveryQueue.shift(); // Get next vertex to explore.
                    
                    // Explore all neighbors of the active vertex.
                    for (const neighborIdentifier of adjacencyStructure.get(activeVertex)) {
                        if (!visitedNodesRegistry.has(neighborIdentifier)) {
                            visitedNodesRegistry.add(neighborIdentifier); // Mark neighbor as visited.
                            discoveryQueue.push(neighborIdentifier); // Add neighbor to queue for further exploration.
                        }
                    }
                }
            }
        }
        // Output the final count of connected components.
        console.log(componentCounter);
    };

    // Expose the main processing function.
    return { commence: processGraphData };
})();

// Initiate the graph analysis.
graphProcessor.commence();