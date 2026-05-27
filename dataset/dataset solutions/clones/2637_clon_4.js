const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.split('\n');

const initialParams = contentLines.shift().split(' ');
const nodeCountVal = parseInt(initialParams[0], 10);
const queryCountVal = parseInt(initialParams[1], 10);

const adjMap = new Map();
const nodeValueAccumulators = new Array(nodeCountVal + 1).fill(0);
const finalOutputValues = new Array(nodeCountVal).fill(0);

for (let idx = 1; idx <= nodeCountVal; idx++) {
    adjMap.set(idx, []);
}

for (let idx = 0; idx < nodeCountVal - 1; idx++) {
    const edgeDefinition = contentLines[idx].split(' ').map(Number);
    const u = edgeDefinition[0];
    const v = edgeDefinition[1];
    adjMap.get(u).push(v);
    adjMap.get(v).push(u);
}

for (let idx = 0; idx < queryCountVal; idx++) {
    const updateDefinition = contentLines[nodeCountVal - 1 + idx].split(' ').map(Number);
    const targetNode = updateDefinition[0];
    const valueToAdd = updateDefinition[1];
    nodeValueAccumulators[targetNode] += valueToAdd;
}

const visitedSet = new Set();

function pathSumCalculator(currentNodeId, currentCumulativeSum) {
    visitedSet.add(currentNodeId);
    const newCumulativeSum = currentCumulativeSum + nodeValueAccumulators[currentNodeId];
    finalOutputValues[currentNodeId - 1] = newCumulativeSum;

    const neighbors = adjMap.get(currentNodeId);
    if (neighbors) {
        for (const adjacentNodeId of neighbors) {
            if (!visitedSet.has(adjacentNodeId)) {
                pathSumCalculator(adjacentNodeId, newCumulativeSum);
            }
        }
    }
}

pathSumCalculator(1, 0);

console.log(finalOutputValues.join(' '));
