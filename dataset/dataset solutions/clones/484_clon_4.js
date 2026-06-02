var fileSystem = require('fs');

const allInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = allInputContent.split('\n');
let currentInputLinePointer = 0;

function retrieveNextInputLine() {
    return inputLinesArray[currentInputLinePointer++];
}

function determineHamiltonianCycle(graphStructure, startingNodeIdentifier) {
    const totalVertexCount = graphStructure.length;
    if (totalVertexCount === 0) return false;

    // Stack elements: [currentNodeIndex, visitedNodesSet, currentPathSequence]
    // visitedNodesSet provides O(1) lookup for visited status.
    // currentPathSequence maintains order and allows checking path length and first node.
    const traversalStack = [[startingNodeIdentifier, new Set([startingNodeIdentifier]), [startingNodeIdentifier]]];

    while (traversalStack.length > 0) {
        const [currentNodeIndex, visitedNodesSet, currentPathSequence] = traversalStack.pop();

        // If all vertices have been visited in the current path
        if (currentPathSequence.length === totalVertexCount) {
            // Check if the last vertex connects back to the first vertex to complete the cycle
            if (graphStructure[currentNodeIndex].includes(currentPathSequence[0])) {
                return true;
            }
            continue; // Path completed, but no cycle back to the start
        }

        // Explore adjacent vertices
        for (const adjacentVertex of graphStructure[currentNodeIndex]) {
            // Only proceed if the adjacent vertex has not been visited in the current path
            if (!visitedNodesSet.has(adjacentVertex)) {
                const updatedVisitedSet = new Set(visitedNodesSet);
                updatedVisitedSet.add(adjacentVertex);
                traversalStack.push([adjacentVertex, updatedVisitedSet, [...currentPathSequence, adjacentVertex]]);
            }
        }
    }
    return false; // No Hamiltonian cycle found from the starting node
}

(function executeProcessingRounds() {
    let numberOfWords;
    while ((numberOfWords = parseInt(retrieveNextInputLine(), 10)) !== 0) {
        const wordCollection = [];
        for (let k = 0; k < numberOfWords; k++) {
            wordCollection.push(retrieveNextInputLine());
        }

        // Construct the adjacency list representation of the graph
        // Each word is a node. An edge exists from word A to word B if A's last char == B's first char.
        const adjacencyMatrix = wordCollection.map((sourceWordEntry, sourceIndex) => {
            const finalCharOfSource = sourceWordEntry.slice(-1);
            return wordCollection.reduce((accumulator, targetWordEntry, targetIndex) => {
                if (sourceIndex !== targetIndex && finalCharOfSource === targetWordEntry[0]) {
                    accumulator.push(targetIndex);
                }
                return accumulator;
            }, []);
        });

        // Determine an initial vertex to begin the cycle search from.
        // The original code uses the vertex with the minimum number of outgoing edges as an optimization.
        let initialVertexForSearch = 0;
        if (numberOfWords > 0) {
            initialVertexForSearch = adjacencyMatrix.reduce((minEdgeCountIndex, currentEdges, currentIndex, allEdges) => {
                return (currentEdges.length < allEdges[minEdgeCountIndex].length) ? currentIndex : minEdgeCountIndex;
            }, 0);
        }

        // Perform the Hamiltonian cycle detection
        const cycleFound = determineHamiltonianCycle(adjacencyMatrix, initialVertexForSearch);
        console.log(cycleFound ? 'OK' : 'NG');
    }
})();
