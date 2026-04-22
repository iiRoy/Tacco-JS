'use strict';
(function(rawData){
  const processLines = rawData.trim().split('\n');
  const vertexCount = Number(processLines[0]);

  const graphConnections = new Map();
  for (let idx = 1; idx <= vertexCount; ++idx) {
    graphConnections.set(idx, []);
  }

  processLines.slice(1).forEach(line => {
    const parts = line.split(/\s+/).map(Number);
    const originVertex = parts[0];
    const targetVertex = parts[1];
    const edgeParity = parts[2] % 2;
    graphConnections.get(originVertex).push({ destination: targetVertex, linkParity: edgeParity });
  });

  const assignedParities = new Array(vertexCount + 1).fill(-1);

  const traversalQueue = [];

  assignedParities[1] = 0;
  traversalQueue.push(1);

  let queuePointer = 0;
  while (queuePointer < traversalQueue.length) {
    const currentVertexIdentifier = traversalQueue[queuePointer++];
    const currentVertexParity = assignedParities[currentVertexIdentifier];

    const outgoingEdges = graphConnections.get(currentVertexIdentifier);

    if (outgoingEdges) {
      for (const edge of outgoingEdges) {
        const neighborVertexIdentifier = edge.destination;
        const connectionParity = edge.linkParity;
        const computedNeighborParity = currentVertexParity ^ connectionParity;

        if (assignedParities[neighborVertexIdentifier] === -1) {
          assignedParities[neighborVertexIdentifier] = computedNeighborParity;
          traversalQueue.push(neighborVertexIdentifier);
        }
      }
    }
  }

  const finalAssignments = [];
  for (let idx = 1; idx <= vertexCount; ++idx) {
    finalAssignments.push(assignedParities[idx]);
  }

  console.log(finalAssignments.join('\n'));

})(require('fs').readFileSync('/dev/stdin','utf8'));