'use strict'

let nodeCount;
let edgeCount;
let adjacencyList;
let discoveryTimes;
let lowLinkValues;
let visitedStatus;
let timeTracker;
let bridgeCounter;

const findBridgesDFS = (currentNode, parentNode) => {
  visitedStatus[currentNode] = true;
  discoveryTimes[currentNode] = lowLinkValues[currentNode] = timeTracker++;

  for (const neighborNode of adjacencyList[currentNode]) {
    if (neighborNode === parentNode) {
      continue;
    }

    if (visitedStatus[neighborNode]) {
      lowLinkValues[currentNode] = Math.min(lowLinkValues[currentNode], discoveryTimes[neighborNode]);
    } else {
      findBridgesDFS(neighborNode, currentNode);
      lowLinkValues[currentNode] = Math.min(lowLinkValues[currentNode], lowLinkValues[neighborNode]);

      if (lowLinkValues[neighborNode] > discoveryTimes[currentNode]) {
        bridgeCounter++;
      }
    }
  }
};

function processGraphInput(rawInput) {
  const parsedLines = rawInput.split('\n').map(line => line.split(' ').map(Number));

  nodeCount = parsedLines[0][0];
  edgeCount = parsedLines[0][1];

  const edgeData = parsedLines.slice(1, -1);

  adjacencyList = Array.from({ length: nodeCount }, () => []);

  for (let k = 0; k < edgeCount; k++) {
    const nodeU = edgeData[k][0] - 1;
    const nodeV = edgeData[k][1] - 1;
    adjacencyList[nodeU].push(nodeV);
    adjacencyList[nodeV].push(nodeU);
  }

  discoveryTimes = Array(nodeCount).fill(-1);
  lowLinkValues = Array(nodeCount).fill(-1);
  visitedStatus = Array(nodeCount).fill(false);
  timeTracker = 0;
  bridgeCounter = 0;

  for (let i = 0; i < nodeCount; i++) {
    if (!visitedStatus[i]) {
      findBridgesDFS(i, -1);
    }
  }

  console.log(bridgeCounter);
}

processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
