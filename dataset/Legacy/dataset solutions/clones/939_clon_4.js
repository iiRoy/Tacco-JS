const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedLines = sourceData.trim().split('\n');
const totalVertices = Number(processedLines[0]);

const adjacencyGrid = Array.from({ length: totalVertices }, () =>
  Array.from({ length: totalVertices }, () => 0)
);

const finalAdjacencyGrid = processedLines.slice(1).reduce((currentGrid, lineContent) => {
  const numericValues = lineContent.split(' ').map(Number);
  const primaryVertex = numericValues[0];
  const connectedVertices = numericValues.slice(2);

  connectedVertices.forEach(targetVertex => {
    currentGrid[primaryVertex - 1][targetVertex - 1] = 1;
  });

  return currentGrid;
}, adjacencyGrid);

finalAdjacencyGrid.forEach(rowVector => {
  console.log(rowVector.join(' '));
});
