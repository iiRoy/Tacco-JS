console.log((function(inputString) {
    const dataLines = inputString.trim().split('\n');
    const [vertexCount] = dataLines[0].split(' ').map(Number);
    const edgeRecords = dataLines.slice(1).map(line => line.split(' ').map(Number));

    const graphAdjacency = Array.from({ length: vertexCount }, () => []);

    for (let edgeIndex = 0; edgeIndex < vertexCount - 1; ++edgeIndex) {
        const [firstNode, secondNode, edgeWeight] = edgeRecords[edgeIndex];
        const weightParity = edgeWeight % 2;
        graphAdjacency[firstNode - 1].push([secondNode - 1, weightParity]);
        graphAdjacency[secondNode - 1].push([firstNode - 1, weightParity]);
    }

    const vertexColors = Array.from({ length: vertexCount }, () => null);
    vertexColors[0] = 0;

    const traversalQueue = [0];
    let queueHead = 0;

    while (queueHead < traversalQueue.length) {
        const currentVertex = traversalQueue[queueHead++];
        const currentVertexColor = vertexColors[currentVertex];

        for (const [adjacentVertex, connectionParity] of graphAdjacency[currentVertex]) {
            if (vertexColors[adjacentVertex] === null) {
                traversalQueue.push(adjacentVertex);
                if (connectionParity === 1) {
                    vertexColors[adjacentVertex] = 1 - currentVertexColor;
                } else {
                    vertexColors[adjacentVertex] = currentVertexColor;
                }
            }
        }
    }

    return vertexColors.join('\n');
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
