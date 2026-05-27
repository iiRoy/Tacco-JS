"use strict"
process.stdin.resume();
process.stdin.setEncoding('utf8');
let rawDataBuffer = '';

process.stdin.on('data', function (chunk) {
    rawDataBuffer += chunk;
});

const parseNumericLine = function (lineContent) {
    const stringParts = lineContent.trim().split(" ");
    const numericArray = new Array(stringParts.length);
    for (let k = 0; k < stringParts.length; ++k) {
        numericArray[k] = +stringParts[k];
    }
    return numericArray;
};

// The original `space_input_char` function was unused and has been removed as non-essential.

process.stdin.on('end', function () {
    const inputLines = rawDataBuffer.split('\n');
    
    const graphParameters = parseNumericLine(inputLines[0]);
    const nodeCount = graphParameters[0];
    const edgeCount = graphParameters[1];

    // Parse initial edges from input lines, adjusting for 0-indexing later
    let initialEdges = inputLines.slice(1).map(line => parseNumericLine(line));
    
    // Initialize adjacency list for 0-indexed nodes (0 to nodeCount-1)
    // The original code used N+1 size, which meant pts[N] was unused.
    // Using nodeCount size is equivalent for 0-indexed nodes 0 to N-1.
    const adjacencyList_0_indexed = Array.from({ length: nodeCount }, () => []);

    // Populate adjacency list with 0-indexed nodes
    for (let currentEdge of initialEdges) {
        const u = currentEdge[0] - 1; // Convert to 0-indexed
        const v = currentEdge[1] - 1; // Convert to 0-indexed
        adjacencyList_0_indexed[u].push(v);
        adjacencyList_0_indexed[v].push(u);
    }

    let foundCycles = [];
    const START_NODE_INDEX = 0;
    const END_NODE_INDEX = nodeCount;

    // Iterate through each node to find cycles starting from its neighbors
    for (let startNode = START_NODE_INDEX; startNode < END_NODE_INDEX; ++startNode) {
        // Initial paths start with direct neighbors of 'startNode'.
        // Each path is a sequence of nodes, e.g., [neighbor1, nodeX, nodeY, ...]
        let pathsToExplore = adjacencyList_0_indexed[startNode].map(neighbor => [neighbor]);
        
        // This set tracks nodes that have been added to 'nextPaths' or 'foundCycles'
        // for the current 'startNode' search, preventing redundant paths at the same BFS level.
        let visitedNodesInCurrentSearch = new Set();

        while (pathsToExplore.length > 0) {
            let nextPaths = [];
            
            // Replicating the original's behavior of adding 'startNode' to 'done' repeatedly.
            // This is harmless because 'startNode' is always allowed to be revisited by the filter condition.
            visitedNodesInCurrentSearch.add(startNode);
            
            for (let currentPath of pathsToExplore) {
                const pathEndNode = currentPath[currentPath.length - 1];
                
                const neighborsOfEndNode = adjacencyList_0_indexed[pathEndNode];
                
                const possibleNextNodes = neighborsOfEndNode.filter(neighbor => {
                    const isNeighborAlreadyInCurrentPath = currentPath.includes(neighbor);
                    const isNeighborSameAsPathEndNode = neighbor === pathEndNode; // Prevents self-loops at end node
                    const hasNeighborBeenVisitedInThisSearch = visitedNodesInCurrentSearch.has(neighbor);
                    const isNeighborTheStartNode = neighbor === startNode;

                    // A neighbor is a possible next node if:
                    // 1. It's not already in the current path (to avoid immediate cycles or going back and forth).
                    // 2. It's not the path's end node itself (to avoid self-loops).
                    // 3. It hasn't been visited in this BFS level, OR it is the original start node (to close a cycle).
                    return !isNeighborAlreadyInCurrentPath && !isNeighborSameAsPathEndNode && (!hasNeighborBeenVisitedInThisSearch || isNeighborTheStartNode);
                });

                possibleNextNodes.forEach(nextNodeInPath => {
                    // Mark this node as visited for the current search level.
                    // This prevents adding redundant paths to the same node at the same BFS level.
                    visitedNodesInCurrentSearch.add(nextNodeInPath);
                    
                    let extendedPath = [...currentPath]; // Create a new array for the extended path
                    extendedPath.push(nextNodeInPath);

                    if (nextNodeInPath !== startNode) {
                        nextPaths.push(extendedPath);
                    } else {
                        foundCycles.push(extendedPath);
                    }
                });
            }
            pathsToExplore = nextPaths;
        }
    }
    
    // Filter out cycles that are too short (e.g., A-B-A, which would be [B,A] length 2)
    foundCycles = foundCycles.filter(cyclePath => cyclePath.length > 2);

    // Edge removal logic - replicating the original bug (++l)
    // The original code had a typo: `++l` instead of `++i` in the inner loop.
    // This will cause a TypeError at runtime because `cyclePath` is an array and cannot be incremented.
    // This exact observable behavior (a runtime error) must be preserved.
    for (let cyclePath of foundCycles) {
        for (let idx = 0; idx < cyclePath.length; ++cyclePath) { // This `++cyclePath` is the bug from the original code.
            const currentSegmentStart = cyclePath[idx];
            const currentSegmentEnd = cyclePath[(idx + 1) % cyclePath.length]; // Use modulo for wrapping around

            // Filter out edges that form part of the detected cycle
            initialEdges = initialEdges.filter(existingEdge => {
                const edgeU_0_indexed = existingEdge[0] - 1; // Adjust for 0-indexing
                const edgeV_0_indexed = existingEdge[1] - 1; // Adjust for 0-indexing

                // Check if the existing edge matches the current cycle segment in either direction
                const isForwardMatch = (edgeU_0_indexed === currentSegmentStart && edgeV_0_indexed === currentSegmentEnd);
                const isBackwardMatch = (edgeU_0_indexed === currentSegmentEnd && edgeV_0_indexed === currentSegmentStart);
                
                return !(isForwardMatch || isBackwardMatch);
            });
        }
    }
    
    console.log(initialEdges.length);
});
