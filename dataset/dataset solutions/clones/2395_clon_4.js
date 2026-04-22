const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const totalVertices = Number(inputDataLines.shift());

const vertexAttributes = Array.from({ length: totalVertices }, () => ({
    outboundConnections: [],
    inboundCount: 0,
    totalDegree: 0,
    assignedColors: new Set(),
    lastColorUsed: 0
}));

for (let currentLineIndex = 0; currentLineIndex < totalVertices - 1; currentLineIndex++) {
    const edgeComponents = inputDataLines[currentLineIndex].split(' ').map(Number);
    const firstVertex = edgeComponents[0] - 1;
    const secondVertex = edgeComponents[1] - 1;

    vertexAttributes[firstVertex].outboundConnections.push({
        targetVertex: secondVertex,
        originalEdgeIndex: currentLineIndex
    });
    vertexAttributes[secondVertex].inboundCount++;
}

let highestDegree = 0;
for (let vIdx = 0; vIdx < totalVertices; vIdx++) {
    const currentVertex = vertexAttributes[vIdx];
    currentVertex.totalDegree = currentVertex.outboundConnections.length + currentVertex.inboundCount;
    if (currentVertex.totalDegree > highestDegree) {
        highestDegree = currentVertex.totalDegree;
    }
}

const edgeColorOutput = new Array(totalVertices - 1);

const retrieveNextAvailableColor = (vertexIdentifier, maximumAllowedColor) => {
    const nodeInformation = vertexAttributes[vertexIdentifier];
    let candidateColor = nodeInformation.lastColorUsed + 1;
    let chosenColor = 0;

    for (; candidateColor < maximumAllowedColor; candidateColor++) {
        if (!nodeInformation.assignedColors.has(candidateColor)) {
            chosenColor = candidateColor;
            break;
        }
    }

    if (chosenColor === 0) {
        for (candidateColor = 1; candidateColor < maximumAllowedColor; candidateColor++) {
            if (!nodeInformation.assignedColors.has(candidateColor)) {
                chosenColor = candidateColor;
                break;
            }
        }
    }
    return chosenColor;
};

vertexAttributes.forEach((sourceVertexInfo, sourceVertexIndex) => {
    sourceVertexInfo.outboundConnections.forEach(edgeDetail => {
        const targetVertexIndex = edgeDetail.targetVertex;
        const originalInputOrder = edgeDetail.originalEdgeIndex;

        const allocatedColor = retrieveNextAvailableColor(sourceVertexIndex, highestDegree);

        sourceVertexInfo.assignedColors.add(allocatedColor);
        sourceVertexInfo.lastColorUsed = allocatedColor;

        vertexAttributes[targetVertexIndex].assignedColors.add(allocatedColor);
        vertexAttributes[targetVertexIndex].lastColorUsed = allocatedColor;

        edgeColorOutput[originalInputOrder] = allocatedColor;
    });
});

console.log(highestDegree);
console.log(edgeColorOutput.join('\n'));