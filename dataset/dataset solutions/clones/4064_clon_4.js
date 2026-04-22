function processInputData(sourceData) {
    const dataLines = sourceData.split("\n");
    const [vertexCountStr, edgeCountStr] = dataLines[0].split(" ");
    const totalVertices = parseInt(vertexCountStr);
    const totalEdges = parseInt(edgeCountStr);

    const edgeDefinitions = [];
    const connectionMap = new Map();

    // Initialize the connection map for all vertices
    for (let currentVertexIndex = 0; currentVertexIndex < totalVertices; currentVertexIndex++) {
        connectionMap.set(currentVertexIndex, []);
    }

    for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdges; currentEdgeIndex++) {
        const [firstVertexStr, secondVertexStr, distanceStr] = dataLines[currentEdgeIndex + 1].split(" ");
        const firstVertex = parseInt(firstVertexStr) - 1;
        const secondVertex = parseInt(secondVertexStr) - 1;
        const distance = parseInt(distanceStr);

        edgeDefinitions.push({
            originVertex: firstVertex,
            targetVertex: secondVertex,
            length: distance
        });

        // Add bidirectional connections to the graph representation
        connectionMap.get(firstVertex).push({ connectedTo: secondVertex, relativeLength: distance });
        connectionMap.get(secondVertex).push({ connectedTo: firstVertex, relativeLength: -distance });
    }

    const calculatedPositions = new Map();
    let finalEvaluation = "Yes";

    // Keep track of vertices that have not yet been assigned an absolute position
    const unplacedVertices = new Set();
    for (let currentVertexIndex = 0; currentVertexIndex < totalVertices; currentVertexIndex++) {
        unplacedVertices.add(currentVertexIndex);
    }

    // Process vertices component by component using a Breadth-First Search (BFS) like approach
    while (unplacedVertices.size > 0) {
        const currentComponentRoot = unplacedVertices.values().next().value; // Pick an arbitrary unplaced vertex
        const vertexTraversalQueue = [];

        // Assign an arbitrary position (0) to the root of the current connected component
        calculatedPositions.set(currentComponentRoot, 0);
        unplacedVertices.delete(currentComponentRoot);
        vertexTraversalQueue.push(currentComponentRoot);

        let queueReadPointer = 0;
        while (queueReadPointer < vertexTraversalQueue.length) {
            const currentTraversalVertex = vertexTraversalQueue[queueReadPointer++];
            const currentTraversalPosition = calculatedPositions.get(currentTraversalVertex);

            const adjacentConnections = connectionMap.get(currentTraversalVertex) || [];

            for (const connectionEntry of adjacentConnections) {
                const connectedVertex = connectionEntry.connectedTo;
                const requiredRelativeLength = connectionEntry.relativeLength;

                // If the connected vertex has not yet been placed in this component
                if (unplacedVertices.has(connectedVertex)) {
                    calculatedPositions.set(connectedVertex, currentTraversalPosition + requiredRelativeLength);
                    unplacedVertices.delete(connectedVertex);
                    vertexTraversalQueue.push(connectedVertex);
                }
            }
        }
    }

    // Final verification of all original edge definitions
    for (const definition of edgeDefinitions) {
        const positionOrigin = calculatedPositions.get(definition.originVertex);
        const positionTarget = calculatedPositions.get(definition.targetVertex);

        // All vertices should have an assigned position due to the BFS covering all components
        // If undefined, it indicates a logic error or an isolated node not handled,
        // but the BFS above ensures all nodes get a position (0 if isolated).
        if (positionOrigin === undefined || positionTarget === undefined) {
             finalEvaluation = "No"; // Should not be reached with correct logic
             break;
        }

        if (positionTarget - positionOrigin !== definition.length) {
            finalEvaluation = "No";
            break;
        }
    }

    console.log(finalEvaluation);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));