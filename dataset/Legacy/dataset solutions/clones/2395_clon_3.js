const fileSystem = require('fs');
const inputRaw = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = inputRaw.split('\n');

const nodeCount = parseInt(inputLines.shift(), 10);

const graphNodes = Array.from({ length: nodeCount }, () => ({
    neighbors: [],
    incomingEdgeCount: 0,
    usedColors: {},
    lastColorHint: 0
}));

let maxDegree = 0;

const updateMaxDegreeForNode = (currentNodeData) => {
    const currentDegree = currentNodeData.neighbors.length + currentNodeData.incomingEdgeCount;
    if (currentDegree > maxDegree) {
        maxDegree = currentDegree;
    }
};

for (let edgeInputIdx = 0; edgeInputIdx < nodeCount - 1; edgeInputIdx++) {
    const edgeParts = inputLines[edgeInputIdx].split(' ');
    const nodeAIdx = parseInt(edgeParts[0], 10) - 1;
    const nodeBIdx = parseInt(edgeParts[1], 10) - 1;

    const nodeA = graphNodes[nodeAIdx];
    const nodeB = graphNodes[nodeBIdx];

    nodeA.neighbors.push({ neighborNodeIdx: nodeBIdx, edgeOriginalIdx: edgeInputIdx });
    nodeB.incomingEdgeCount++;

    updateMaxDegreeForNode(nodeA);
    updateMaxDegreeForNode(nodeB);
}

const edgeColorsResult = [];

const findNextAvailableColor = (nodeState, currentMaxDegree) => {
    let colorCandidate = nodeState.lastColorHint + 1;
    let foundColor = 0;

    while (colorCandidate <= currentMaxDegree) {
        if (!nodeState.usedColors[colorCandidate]) {
            foundColor = colorCandidate;
            break;
        }
        colorCandidate++;
    }

    if (foundColor === 0) {
        colorCandidate = 1;
        while (colorCandidate <= currentMaxDegree) {
            if (!nodeState.usedColors[colorCandidate]) {
                foundColor = colorCandidate;
                break;
            }
            colorCandidate++;
        }
    }
    return foundColor;
};

for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    const currentNode = graphNodes[nodeIdx];

    for (let neighborEdgeIdx = 0; neighborEdgeIdx < currentNode.neighbors.length; neighborEdgeIdx++) {
        const edgeDetails = currentNode.neighbors[neighborEdgeIdx];

        const assignedColor = findNextAvailableColor(currentNode, maxDegree);

        edgeDetails.assignedColor = assignedColor;

        currentNode.usedColors[assignedColor] = 1;
        currentNode.lastColorHint = assignedColor;

        const neighborNode = graphNodes[edgeDetails.neighborNodeIdx];
        neighborNode.usedColors[assignedColor] = 1;
        neighborNode.lastColorHint = assignedColor;

        edgeColorsResult[edgeDetails.edgeOriginalIdx] = assignedColor;
    }
}

console.log(maxDegree);
console.log(edgeColorsResult.join("\n"));
