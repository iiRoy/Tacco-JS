(function processGraphData() {
  const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
  const dataLines = inputContent.split('\n');

  const dimension = Number(dataLines.shift());
  const adjacencyStore = new Array(dimension * dimension).fill(0);

  dataLines.forEach((currentLineSegment, currentVertexIndex) => {
    const lineParts = currentLineSegment.split(' ');
    const connectedVertices = lineParts.slice(2).map(Number);

    for (const targetVertexOneBased of connectedVertices) {
      const targetVertexZeroBased = targetVertexOneBased - 1;
      const flatIndex = currentVertexIndex * dimension + targetVertexZeroBased;
      adjacencyStore[flatIndex] = 1;
    }
  });

  const formattedOutputSegments = [];
  for (let r = 0; r < dimension; r++) {
    const rowValues = [];
    for (let c = 0; c < dimension; c++) {
      rowValues.push(adjacencyStore[r * dimension + c]);
    }
    formattedOutputSegments.push(rowValues.join(' '));
  }

  console.log(formattedOutputSegments.join('\n'));
})();
