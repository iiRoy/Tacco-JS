const fileSystemModule = require('fs');

const readStdinContent = () => {
  const fileDescriptor = process.stdin.fd;
  const fileStats = fileSystemModule.fstatSync(fileDescriptor);
  const fileSize = fileStats.size;

  const dataBuffer = Buffer.alloc(fileSize);
  const actualBytesRead = fileSystemModule.readSync(fileDescriptor, dataBuffer, 0, fileSize, 0);

  return dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');
};

const inputLines = readStdinContent();

function findHamiltonianCycle(adjacencyList, currentNodeIndex, currentPath) {
  const pathLength = currentPath.length;
  const totalNodesInGraph = adjacencyList.length;

  if (pathLength === totalNodesInGraph) {
    const lastNodeVisited = currentPath[pathLength - 1];
    const firstNodeInCycle = currentPath[0];
    return adjacencyList[lastNodeVisited].includes(firstNodeInCycle);
  }

  const neighbors = adjacencyList[currentNodeIndex];
  for (let neighborIdx = 0; neighborIdx < neighbors.length; neighborIdx++) {
    const nextNodeCandidate = neighbors[neighborIdx];

    if (currentPath.includes(nextNodeCandidate)) {
      continue;
    }

    const extendedPath = currentPath.concat(nextNodeCandidate);
    if (findHamiltonianCycle(adjacencyList, nextNodeCandidate, extendedPath)) {
      return true;
    }
  }

  return false;
}

const buildAdjacencyList = (numberOfNodes, nodeStringValues) => {
  const graphAdjacency = new Array(numberOfNodes).fill(null).map(() => []);

  for (let sourceNodeIdx = 0; sourceNodeIdx < numberOfNodes; sourceNodeIdx++) {
    const sourceString = nodeStringValues[sourceNodeIdx];
    const sourceLastChar = sourceString[sourceString.length - 1];

    for (let targetNodeIdx = 0; targetNodeIdx < numberOfNodes; targetNodeIdx++) {
      if (sourceNodeIdx === targetNodeIdx) {
        continue;
      }

      const targetString = nodeStringValues[targetNodeIdx];
      const targetFirstChar = targetString[0];

      if (sourceLastChar === targetFirstChar) {
        graphAdjacency[sourceNodeIdx].push(targetNodeIdx);
      }
    }
  }
  return graphAdjacency;
};

(function processInputSequences() {
  let currentNumNodes;
  let sequenceOfNodeStrings;
  let graphRepresentation;

  while (inputLines[0] !== '0') {
    currentNumNodes = Number(inputLines.shift());
    sequenceOfNodeStrings = [];

    for (let nodeCounter = 0; nodeCounter < currentNumNodes; nodeCounter++) {
      sequenceOfNodeStrings.push(inputLines.shift());
    }

    graphRepresentation = buildAdjacencyList(currentNumNodes, sequenceOfNodeStrings);

    const hasCycle = findHamiltonianCycle(graphRepresentation, 0, [0]);

    console.log(hasCycle ? 'OK' : 'NG');
  }
})();
