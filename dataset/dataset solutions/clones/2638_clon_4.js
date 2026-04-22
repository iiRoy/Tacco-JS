module.exports = function(sourceInput) {
    const numericTokens = sourceInput.trim().split(/\s+/).map(token => parseInt(token, 10));

    let currentTokenIndex = 0;
    const fetchNextValue = () => numericTokens[currentTokenIndex++];

    const totalVertices = fetchNextValue();
    const totalOperations = fetchNextValue();

    const connections = new Map();
    for (let i = 0; i < totalVertices; ++i) {
        connections.set(i, new Set());
    }

    for (let i = 0; i < totalVertices - 1; ++i) {
        const [nodeOne, nodeTwo] = [fetchNextValue() - 1, fetchNextValue() - 1];
        connections.get(nodeOne).add(nodeTwo);
        connections.get(nodeTwo).add(nodeOne);
    }

    const vertexAccumulators = new Map();
    for (let i = 0; i < totalVertices; ++i) {
        vertexAccumulators.set(i, 0);
    }

    for (let i = 0; i < totalOperations; ++i) {
        const targetVertex = fetchNextValue() - 1;
        const effectMagnitude = fetchNextValue();
        vertexAccumulators.set(targetVertex, (vertexAccumulators.get(targetVertex) || 0) + effectMagnitude);
    }

    const traverseAndAggregate = (currentVertexId, previousVertexId, incomingSum) => {
        vertexAccumulators.set(currentVertexId, (vertexAccumulators.get(currentVertexId) || 0) + incomingSum);

        for (const connectedVertexId of connections.get(currentVertexId)) {
            if (connectedVertexId !== previousVertexId) {
                traverseAndAggregate(connectedVertexId, currentVertexId, vertexAccumulators.get(currentVertexId));
            }
        }
    };

    traverseAndAggregate(0, -1, 0);

    const finalOutput = Array.from({ length: totalVertices }, (_, index) => vertexAccumulators.get(index));
    return finalOutput.join(' ');
};