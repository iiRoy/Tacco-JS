const sourceData = (function(inputLines) {
    let currentPosition = 0;
    return {
        retrieveNumericValue: () => parseInt(inputLines[currentPosition++]),
        retrieveCharacterSequence: () => inputLines[currentPosition++].split('')
    };
})(inLine); // Assumes 'inLine' is provided by the surrounding boilerplate

const performGraphAnalysis = () => {
    const totalVertices = sourceData.retrieveNumericValue();

    // Graph representation: an array where each element is an object
    // representing a vertex, containing its unique identifier and a Set
    // of identifiers of vertices it has directed connections to.
    const vertexCollection = Array.from({ length: totalVertices }, (_, id) => ({
        uniqueID: id,
        directedLinks: new Set()
    }));

    // Populate the graph based on the adjacency matrix input.
    for (let currentVertexId = 0; currentVertexId < totalVertices; currentVertexId++) {
        const rowCharacters = sourceData.retrieveCharacterSequence();
        rowCharacters.forEach((charValue, targetVertexId) => {
            if (currentVertexId !== targetVertexId && charValue === '1') {
                vertexCollection[currentVertexId].directedLinks.add(targetVertexId);
            }
        });
    }

    // Function to conduct a Breadth-First Search (BFS) from a specified starting point.
    // It determines path lengths (levels) from the start and the maximum level reached.
    const calculateReachability = (startPoint, graphEntities) => {
        // Initialize traversal states for all vertices: not yet visited, and path length 1 (as per original logic).
        const reachabilityMap = new Map(
            graphEntities.map(entity => [entity.uniqueID, { wasVisited: false, currentLevel: 1 }])
        );
        const explorationQueue = [startPoint];
        reachabilityMap.get(startPoint).wasVisited = true;

        let maxAchievedLevel = 0;
        let queueCursor = 0; // Simulates queue.shift() for performance and different syntax

        while (queueCursor < explorationQueue.length) {
            const currentVertex = explorationQueue[queueCursor++];
            const currentState = reachabilityMap.get(currentVertex);
            maxAchievedLevel = Math.max(maxAchievedLevel, currentState.currentLevel);

            for (const connectedVertex of graphEntities[currentVertex].directedLinks) {
                const connectedState = reachabilityMap.get(connectedVertex);
                if (!connectedState.wasVisited) {
                    connectedState.wasVisited = true;
                    connectedState.currentLevel = currentState.currentLevel + 1;
                    explorationQueue.push(connectedVertex);
                }
            }
        }
        // Returns the highest level found in this traversal and the final state of all vertices.
        return { peakLevel: maxAchievedLevel, finalVertexStates: reachabilityMap };
    };

    let globalPeakLevel = -1;
    let finalScanStates; // To store the states from the very last BFS traversal.

    // Execute a BFS from each vertex to find the overall maximum path length.
    for (let initialVertex = 0; initialVertex < totalVertices; initialVertex++) {
        const { peakLevel, finalVertexStates } = calculateReachability(initialVertex, vertexCollection);
        globalPeakLevel = Math.max(globalPeakLevel, peakLevel);
        if (initialVertex === totalVertices - 1) { // Store states from the BFS starting at the last vertex
            finalScanStates = finalVertexStates;
        }
    }

    let satisfiesBipartiteCondition = true;
    // Check for "bipartiteness" based on the last BFS's path lengths.
    // This part iterates through unique pairs of vertices (i, j) where i < j.
    for (let firstVertexIndex = 0; firstVertexIndex < totalVertices - 1; firstVertexIndex++) {
        for (let secondVertexIndex = firstVertexIndex + 1; secondVertexIndex < totalVertices; secondVertexIndex++) {
            const firstNode = vertexCollection[firstVertexIndex];
            const secondNode = vertexCollection[secondVertexIndex];

            // Verify if there's a symmetric edge between the two vertices.
            const areMutuallyConnected = firstNode.directedLinks.has(secondVertexIndex) &&
                                         secondNode.directedLinks.has(firstVertexIndex);

            if (areMutuallyConnected) {
                const firstPathLength = finalScanStates.get(firstVertexIndex).currentLevel;
                const secondPathLength = finalScanStates.get(secondVertexIndex).currentLevel;

                // If path lengths from the last BFS's root have the same parity,
                // it violates the condition (implies an odd cycle relative to that BFS tree).
                if (firstPathLength % 2 === secondPathLength % 2) {
                    satisfiesBipartiteCondition = false;
                    break;
                }
            }
        }
        if (!satisfiesBipartiteCondition) {
            break;
        }
    }

    // Output the result.
    if (!satisfiesBipartiteCondition) {
        sendOutputValue(-1);
    } else {
        sendOutputValue(globalPeakLevel);
    }
};

// Wrapper for console.log, mimicking the original's `myout`.
const sendOutputValue = (val) => console.log(val);

// Initiate the graph analysis process.
performGraphAnalysis();