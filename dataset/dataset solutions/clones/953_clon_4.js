const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');

const graphData = new Map();

for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
    const currentLine = inputLines[lineIndex].trim();
    if (!currentLine) continue;

    const values = currentLine.split(' ');
    const connections = [];

    for (let edgeIndex = 0; edgeIndex < values.length; edgeIndex++) {
        const valueStr = values[edgeIndex];
        const edgeWeight = Number(valueStr);

        if (edgeWeight !== -1) {
            connections.push({ targetIdentifier: edgeIndex, edgeCost: edgeWeight });
        }
    }
    graphData.set(lineIndex - 1, connections);
}

const totalVertexCount = graphData.size;

const computeMinimumSpanningTree = (adjacencyMapParam, numVertices) => {
    const visitedVertices = new Set();
    const spanningTreeEdges = [];
    const candidateEdges = []; // Stores {cost, destination, source}

    visitedVertices.add(0); // Start Prim's from vertex 0
    const initialConnections = adjacencyMapParam.get(0);
    if (initialConnections) {
        for (const connection of initialConnections) {
            candidateEdges.push({
                cost: connection.edgeCost,
                destination: connection.targetIdentifier,
                source: 0
            });
        }
    }

    // Loop until N-1 edges are found or no more candidates
    while (spanningTreeEdges.length < numVertices - 1 && candidateEdges.length > 0) {
        let cheapestEdgeIndex = -1;
        let minCost = Infinity;

        // Find the cheapest edge that connects to an unvisited vertex
        for (let i = 0; i < candidateEdges.length; i++) {
            const currentCandidate = candidateEdges[i];
            if (!visitedVertices.has(currentCandidate.destination)) {
                if (currentCandidate.cost < minCost) {
                    minCost = currentCandidate.cost;
                    cheapestEdgeIndex = i;
                }
            }
        }

        if (cheapestEdgeIndex === -1) {
            break; // No valid edge found, graph might be disconnected or all remaining candidates lead to visited nodes
        }

        const chosenEdge = candidateEdges[cheapestEdgeIndex];
        candidateEdges.splice(cheapestEdgeIndex, 1); // Remove the chosen edge

        spanningTreeEdges.push(chosenEdge); // Add to MST
        const newVertex = chosenEdge.destination;
        visitedVertices.add(newVertex); // Mark new vertex as visited

        // Add new candidate edges from the newly visited vertex
        const newVertexConnections = adjacencyMapParam.get(newVertex);
        if (newVertexConnections) {
            for (const connection of newVertexConnections) {
                if (!visitedVertices.has(connection.targetIdentifier)) {
                    candidateEdges.push({
                        cost: connection.edgeCost,
                        destination: connection.targetIdentifier,
                        source: newVertex
                    });
                }
            }
        }
    }

    return spanningTreeEdges;
};

const finalMst = computeMinimumSpanningTree(graphData, totalVertexCount);
const totalMstWeight = finalMst.reduce((sum, edge) => sum + edge.cost, 0);

console.log(totalMstWeight);
