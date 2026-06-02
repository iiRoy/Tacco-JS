const fileSystemModule = require('fs');

function retrieveInputLines() {
  const inputBufferLength = fileSystemModule.fstatSync(process.stdin.fd).size;
  const dataBuffer = Buffer.alloc(inputBufferLength);
  const actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputBufferLength, 0);
  return dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
}

function processGraphData() {
  const rawInputLines = retrieveInputLines();

  const firstLineParts = rawInputLines.shift().split(' ');
  const nodeCount = Number(firstLineParts[0]);
  const edgeCount = Number(firstLineParts[1]);

  let adjacencyList = [];
  let maxPathSum = [];

  const setupGraphStructures = (count) => {
    for (let nodeIdx = 0; nodeIdx < count; nodeIdx++) {
      adjacencyList[nodeIdx] = [];
      maxPathSum[nodeIdx] = 0;
    }
  };
  setupGraphStructures(nodeCount);

  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    const currentEdgeData = rawInputLines[edgeIdx].split(' ');
    const sourceNodeId = Number(currentEdgeData[0]);
    const targetNodeId = Number(currentEdgeData[1]);
    const edgeWeight = Number(currentEdgeData[2]);
    adjacencyList[sourceNodeId].push([targetNodeId, edgeWeight]);
  }

  let nodesToVisitQueue = [0];
  while (nodesToVisitQueue.length > 0) {
    const activeNode = nodesToVisitQueue.pop();

    for (let neighborEdgeIdx = 0; neighborEdgeIdx < adjacencyList[activeNode].length; neighborEdgeIdx++) {
      const [neighborNodeId, weightToNeighbor] = adjacencyList[activeNode][neighborEdgeIdx];
      const potentialNewPathSum = maxPathSum[activeNode] + weightToNeighbor;

      if (maxPathSum[neighborNodeId] < potentialNewPathSum) {
        maxPathSum[neighborNodeId] = potentialNewPathSum;
        nodesToVisitQueue.push(neighborNodeId);
      }
    }
  }
  console.log(maxPathSum);
}

processGraphData();
