const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const trimmedInputLines = rawInputData.trim().split('\n');
const totalNodes = parseInt(trimmedInputLines[0], 10);

const rawAdjacencyData = trimmedInputLines.slice(1).map(lineStr => {
    const parts = lineStr.split(' ');
    return parts.map(Number);
});

const graphMatrix = [];
for (let r = 0; r < totalNodes; r++) {
    const row = new Array(totalNodes).fill(0);
    graphMatrix.push(row);
}

for (let nodeEntryIndex = 0; nodeEntryIndex < totalNodes; nodeEntryIndex++) {
    const currentEntry = rawAdjacencyData[nodeEntryIndex];
    const sourceNodeId = currentEntry[0];
    const numberOfNeighbors = currentEntry[1];
    const neighborIdList = currentEntry.slice(2);

    const zeroBasedSourceNode = sourceNodeId - 1;

    for (let neighborListIndex = 0; neighborListIndex < numberOfNeighbors; neighborListIndex++) {
        const targetNodeId = neighborIdList[neighborListIndex];
        const zeroBasedTargetNode = targetNodeId - 1;
        graphMatrix[zeroBasedSourceNode][zeroBasedTargetNode] = 1;
    }
}

for (let matrixRowIndex = 0; matrixRowIndex < graphMatrix.length; matrixRowIndex++) {
    const rowToPrint = graphMatrix[matrixRowIndex];
    console.log(rowToPrint.join(' '));
}
