const filesystem = require('fs');
const rawInput = filesystem.readFileSync('/dev/stdin', 'utf8');
const lineData = rawInput.trim().split('\n');

function executeProgram() {
  const segment = lineData.shift().split(' ');
  const vertexCount = +segment[0];
  const edgeCount = +segment[1];

  const adjacencies = new Map();
  const incomingDegrees = new Map();
  const pathLengths = new Map();

  for (let idx = 0; idx < vertexCount; idx++) {
    adjacencies.set(idx, []);
    incomingDegrees.set(idx, 0);
    pathLengths.set(idx, 0);
  }

  for (let idx = 0; idx < edgeCount; idx++) {
    const edgeSegment = lineData[idx].split(' ');
    const sourceNode = +edgeSegment[0];
    const targetNode = +edgeSegment[1];
    const edgeWeight = +edgeSegment[2];

    adjacencies.get(sourceNode).push({ destination: targetNode, value: edgeWeight });
    incomingDegrees.set(targetNode, incomingDegrees.get(targetNode) + 1);
  }

  const taskQueue = [];

  for (let idx = 0; idx < vertexCount; idx++) {
    if (incomingDegrees.get(idx) === 0) {
      taskQueue.push(idx);
    }
  }

  let currentVertex;
  while (taskQueue.length > 0) {
    currentVertex = taskQueue.shift();

    for (const connection of adjacencies.get(currentVertex)) {
      const neighborVertex = connection.destination;
      const weightValue = connection.value;

      const currentPathToNeighbor = pathLengths.get(neighborVertex);
      const newPathFromCurrent = pathLengths.get(currentVertex) + weightValue;

      if (newPathFromCurrent > currentPathToNeighbor) {
        pathLengths.set(neighborVertex, newPathFromCurrent);
      }

      incomingDegrees.set(neighborVertex, incomingDegrees.get(neighborVertex) - 1);

      if (incomingDegrees.get(neighborVertex) === 0) {
        taskQueue.push(neighborVertex);
      }
    }
  }

  console.log(pathLengths.get(vertexCount - 1));
}

executeProgram();