const inputConfig = { input: '/dev/stdin', newline: '\n' };

const fileSystemModule = require('fs');

const rawInputData = fileSystemModule.readFileSync(inputConfig.input, 'ascii');
const processedInputLines = rawInputData.trim().split(inputConfig.newline);

const nodeCountString = processedInputLines.shift();
const totalNodes = Number(nodeCountString);

const adjacencyList = {};

for (const currentLineContent of processedInputLines) {
  const lineSegments = currentLineContent.split(' ');
  const sourceNodeKey = lineSegments.shift();
  lineSegments.shift(); // Discard the degree value
  const neighborNodeKeys = lineSegments;
  adjacencyList[sourceNodeKey] = neighborNodeKeys;
}

const compareNumericStrings = (valA, valB) => Number(valA) - Number(valB);

for (const nodeIdentifier in adjacencyList) {
  if (Object.prototype.hasOwnProperty.call(adjacencyList, nodeIdentifier)) {
    adjacencyList[nodeIdentifier].sort(compareNumericStrings);
  }
}

const discoveryTimes = {};
const finishTimes = {};
let globalTimeCounter = 1;
const dfsTraversalStack = [];
let activeNodeId = '1';

do {
  if (!discoveryTimes.hasOwnProperty(activeNodeId)) {
    discoveryTimes[activeNodeId] = globalTimeCounter;
  }

  let nextUnvisitedNeighbor = null;
  const currentNeighbors = adjacencyList[activeNodeId];

  if (currentNeighbors) {
    for (const neighborId of currentNeighbors) {
      if (!discoveryTimes.hasOwnProperty(neighborId)) {
        nextUnvisitedNeighbor = neighborId;
        break;
      }
    }
  }

  if (nextUnvisitedNeighbor !== null) {
    dfsTraversalStack.push(activeNodeId);
    activeNodeId = nextUnvisitedNeighbor;
    globalTimeCounter++;
  } else {
    globalTimeCounter++;
    finishTimes[activeNodeId] = globalTimeCounter;
    activeNodeId = dfsTraversalStack.pop();
  }
} while (dfsTraversalStack.length > 0);

globalTimeCounter++;
finishTimes[activeNodeId] = globalTimeCounter;

for (let nodeIndex = 1; nodeIndex <= totalNodes; nodeIndex++) {
  const currentNodeKey = String(nodeIndex);
  const discoveredAtTime = discoveryTimes[currentNodeKey];
  const finishedAtTime = finishTimes[currentNodeKey];
  console.log("%d %s %s", nodeIndex, discoveredAtTime, finishedAtTime);
}
