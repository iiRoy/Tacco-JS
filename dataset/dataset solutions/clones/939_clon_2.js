const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = rawData.trim().split('\n');
const vertexCount = Number(processedLines[0]);
const adjacencyListRaw = processedLines.slice(1).map((lineStr) => lineStr.split(' ').map(Number));

const graphMatrix = (new Array(vertexCount)).fill(0).map(() => (new Array(vertexCount)).fill(0));

for (let rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
  const currentVertex = adjacencyListRaw[rowIdx][0];
  const neighborCount = adjacencyListRaw[rowIdx][1];
  const neighborVertices = adjacencyListRaw[rowIdx].slice(2);

  for (let colIdx = 0; colIdx < neighborCount; colIdx++) {
    graphMatrix[currentVertex - 1][neighborVertices[colIdx] - 1] = 1;
  }
}

for (let matrixRowIdx = 0; matrixRowIdx < graphMatrix.length; matrixRowIdx++) {
  console.log(graphMatrix[matrixRowIdx].join(' '));
}
