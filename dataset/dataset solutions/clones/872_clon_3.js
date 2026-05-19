const fileSystemModule = require('fs');

const STDIN_FILE_DESCRIPTOR = process.stdin.fd;

let inputFileSize = fileSystemModule.fstatSync(STDIN_FILE_DESCRIPTOR).size;

let inputDataBuffer = Buffer.alloc(inputFileSize);

let bytesReadCount = fileSystemModule.readSync(STDIN_FILE_DESCRIPTOR, inputDataBuffer, 0, inputFileSize, 0);

let inputLines = inputDataBuffer.toString('utf8', 0, bytesReadCount).split('\n');

processGraphData();

function parseNumericLine(lineContent) {
  return lineContent.split(' ').map(Number);
}

function processGraphData() {
  const initialParameters = parseNumericLine(inputLines.shift());

  const nodeCount = initialParameters[0];
  const edgeCount = initialParameters[1];

  const adjacencyList = Array.from({ length: nodeCount }, () => []);

  const maxDistances = Array(nodeCount).fill(0);

  for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
    const currentEdgeData = parseNumericLine(inputLines[edgeIndex]);
    const sourceNode = currentEdgeData[0];
    const destinationNode = currentEdgeData[1];
    const edgeWeight = currentEdgeData[2];

    adjacencyList[sourceNode].push([destinationNode, edgeWeight]);
  }

  const processingStack = [0];

  const updateNeighborDistance = (currentVertex, neighborVertex, weightValue) => {
    const potentialNewDistance = maxDistances[currentVertex] + weightValue;
    if (maxDistances[neighborVertex] < potentialNewDistance) {
      maxDistances[neighborVertex] = potentialNewDistance;
      processingStack.push(neighborVertex);
    }
  };

  while (processingStack.length > 0) {
    const currentVertex = processingStack.pop();

    for (let neighborIndex = 0; neighborIndex < adjacencyList[currentVertex].length; neighborIndex++) {
      const neighborDetails = adjacencyList[currentVertex][neighborIndex];
      const neighborVertex = neighborDetails[0];
      const edgeWeight = neighborDetails[1];

      updateNeighborDistance(currentVertex, neighborVertex, edgeWeight);
    }
  }

  console.log(maxDistances[nodeCount - 1]);
}
