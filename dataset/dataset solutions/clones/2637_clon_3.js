const parseLineToNumbers = (lineString) => lineString.split(' ').map(Number);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.split('\n');

const [numNodes, numQueries] = parseLineToNumbers(contentLines.shift());

const adjList = Array.from({ length: numNodes + 1 }, () => []);
const nodeValues = new Array(numNodes + 1).fill(0);
const cumulativeSums = new Array(numNodes + 1).fill(0);

const numEdges = numNodes - 1;
for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    const [nodeA, nodeB] = parseLineToNumbers(contentLines[edgeIdx]);
    adjList[nodeA].push(nodeB);
    adjList[nodeB].push(nodeA);
}

for (let queryIdx = 0; queryIdx < numQueries; queryIdx++) {
    const [targetNodeId, updateValue] = parseLineToNumbers(contentLines[numEdges + queryIdx]);
    nodeValues[targetNodeId] += updateValue;
}

const dfsStack = [];
const visitedNodesSet = new Set();

const startingNodeId = 1;
const initialPathSum = 0;
dfsStack.push([startingNodeId, initialPathSum]);
visitedNodesSet.add(startingNodeId);

while (dfsStack.length > 0) {
    const [currentNodeId, pathSumFromParent] = dfsStack.pop();

    const currentTotalSum = pathSumFromParent + nodeValues[currentNodeId];
    cumulativeSums[currentNodeId] = currentTotalSum;

    for (const neighborId of adjList[currentNodeId]) {
        if (!visitedNodesSet.has(neighborId)) {
            visitedNodesSet.add(neighborId);
            dfsStack.push([neighborId, currentTotalSum]);
        }
    }
}

console.log(cumulativeSums.slice(1).join(' '));
