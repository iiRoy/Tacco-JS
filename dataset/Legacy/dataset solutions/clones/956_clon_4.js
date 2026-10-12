const [UNVISITED, IN_MST] = [0, 1];

(function processGraph() {
  const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const vertexCount = Number(inputData.shift());
  const adjacencyMatrix = inputData.map(line =>
    line.trim().split(' ').map(val => (val == -1 ? Infinity : Number(val)))
  );

  const minimumConnectionCosts = Array.from({ length: vertexCount }, () => Infinity);
  const vertexStates = Array.from({ length: vertexCount }, () => UNVISITED);

  minimumConnectionCosts[0] = 0;

  let totalMstWeight = 0;
  let currentVertexIndex;
  let currentMinEdge;

  for (let iteration = 0; iteration < vertexCount; iteration++) {
    currentMinEdge = Infinity;
    currentVertexIndex = -1;

    for (let vIdx = 0; vIdx < vertexCount; vIdx++) {
      if (vertexStates[vIdx] === UNVISITED && minimumConnectionCosts[vIdx] < currentMinEdge) {
        currentMinEdge = minimumConnectionCosts[vIdx];
        currentVertexIndex = vIdx;
      }
    }

    if (currentVertexIndex === -1) {
      break;
    }

    totalMstWeight += currentMinEdge;
    vertexStates[currentVertexIndex] = IN_MST;

    for (let neighborIdx = 0; neighborIdx < vertexCount; neighborIdx++) {
      if (vertexStates[neighborIdx] === UNVISITED && adjacencyMatrix[currentVertexIndex][neighborIdx] < minimumConnectionCosts[neighborIdx]) {
        minimumConnectionCosts[neighborIdx] = adjacencyMatrix[currentVertexIndex][neighborIdx];
      }
    }
  }

  console.log(totalMstWeight);
})();
