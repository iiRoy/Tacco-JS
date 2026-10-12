'use strict';

function calculateMaxPathLength(vertexCount, linkages) {
  const adjacencyMatrix = Array.from({ length: vertexCount + 1 }, () => []);
  const entryDegrees = new Array(vertexCount + 1).fill(0);

  for (const [sourceVertex, targetVertex] of linkages) {
    adjacencyMatrix[sourceVertex].push(targetVertex);
    entryDegrees[targetVertex]++;
  }

  const pathLengths = new Array(vertexCount + 1).fill(0);
  const processingQueue = [];

  for (let nodeIdentifier = 1; nodeIdentifier <= vertexCount; nodeIdentifier++) {
    if (entryDegrees[nodeIdentifier] === 0) {
      processingQueue.push(nodeIdentifier);
    }
  }

  let overallMaxPath = 0;
  let queueHead = 0;

  while (queueHead < processingQueue.length) {
    const currentVertex = processingQueue[queueHead++];

    for (const neighborVertex of adjacencyMatrix[currentVertex]) {
      pathLengths[neighborVertex] = Math.max(pathLengths[neighborVertex], pathLengths[currentVertex] + 1);
      overallMaxPath = Math.max(overallMaxPath, pathLengths[neighborVertex]);

      entryDegrees[neighborVertex]--;
      if (entryDegrees[neighborVertex] === 0) {
        processingQueue.push(neighborVertex);
      }
    }
  }

  return overallMaxPath;
}

function processGraphInput(rawInput) {
  const inputLines = rawInput.split("\n");
  const [nodeCountStr] = inputLines[0].split(' ');
  const nodeCount = parseInt(nodeCountStr);

  const graphLinkages = inputLines.slice(1).map(line =>
    line.split(' ').map(segment => parseInt(segment))
  );

  const finalResult = calculateMaxPathLength(nodeCount, graphLinkages);
  return finalResult;
}

processGraphInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
