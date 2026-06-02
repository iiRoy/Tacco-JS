const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
const nodeCount = Number(inputLines.shift());

const vertexData = new Array(nodeCount);
for (let vertexIndex = 0; vertexIndex < nodeCount; vertexIndex++) {
    vertexData[vertexIndex] = {
        outgoingEdges: [],
        incomingDegree: 0,
        assignedColors: new Set(),
        lastAssignedColor: 0
    };
}

let overallMaxDegree = 0;
const allEdges = [];

for (let edgeInputIndex = 0; edgeInputIndex < nodeCount - 1; edgeInputIndex++) {
    const edgeComponents = inputLines[edgeInputIndex].split(' ');
    const sourceVertexIndex = Number(edgeComponents[0]) - 1;
    const targetVertexIndex = Number(edgeComponents[1]) - 1;

    vertexData[sourceVertexIndex].outgoingEdges.push({
        destination: targetVertexIndex,
        originalInputPosition: edgeInputIndex
    });
    vertexData[targetVertexIndex].incomingDegree++;

    allEdges.push({
        source: sourceVertexIndex,
        target: targetVertexIndex,
        originalInputPosition: edgeInputIndex
    });

    const currentSourceDegree = vertexData[sourceVertexIndex].outgoingEdges.length + vertexData[sourceVertexIndex].incomingDegree;
    const currentTargetDegree = vertexData[targetVertexIndex].outgoingEdges.length + vertexData[targetVertexIndex].incomingDegree;
    
    if (overallMaxDegree < currentSourceDegree) {
        overallMaxDegree = currentSourceDegree;
    }
    if (overallMaxDegree < currentTargetDegree) {
        overallMaxDegree = currentTargetDegree;
    }
}

const edgeColorAssignments = new Array(nodeCount - 1);

function* colorSearchGenerator(startValue, limitValue, forbiddenColors) {
    for (let candidateColor = startValue; candidateColor < limitValue; candidateColor++) {
        if (!forbiddenColors.has(candidateColor)) {
            yield candidateColor;
        }
    }
}

for (const currentEdge of allEdges) {
    const sourceVertex = vertexData[currentEdge.source];
    const targetVertex = vertexData[currentEdge.target];

    let selectedColor = 0;

    const firstAttemptGenerator = colorSearchGenerator(sourceVertex.lastAssignedColor + 1, overallMaxDegree, sourceVertex.assignedColors);
    const firstResult = firstAttemptGenerator.next();

    if (!firstResult.done) {
        selectedColor = firstResult.value;
    } else {
        const secondAttemptGenerator = colorSearchGenerator(1, overallMaxDegree, sourceVertex.assignedColors);
        const secondResult = secondAttemptGenerator.next();
        if (!secondResult.done) {
            selectedColor = secondResult.value;
        }
    }

    edgeColorAssignments[currentEdge.originalInputPosition] = selectedColor;
    sourceVertex.assignedColors.add(selectedColor);
    sourceVertex.lastAssignedColor = selectedColor;
    targetVertex.assignedColors.add(selectedColor);
    targetVertex.lastAssignedColor = selectedColor;
}

console.log(overallMaxDegree);
console.log(edgeColorAssignments.join('\n'));
