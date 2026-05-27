const storageGrid = Array.from({ length: 4 }, () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 10 }, () => 0)
  )
);

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.split('\n');

inputLines.slice(1).forEach(lineSegment => {
  const numericParts = lineSegment.split(' ').map(Number);
  const [majorIdx, minorIdx, blockIdx, quantity] = numericParts.map((val, idx) => idx < 3 ? val - 1 : val);
  
  storageGrid[majorIdx][minorIdx][blockIdx] += quantity;
});

const outputSegments = [];
storageGrid.forEach((majorDimension, outerIndex) => {
  majorDimension.forEach(minorDimension => {
    outputSegments.push(minorDimension.join(' '));
  });
  if (outerIndex < storageGrid.length - 1) {
    outputSegments.push('####################');
  }
});

console.log(outputSegments.join('\n'));
