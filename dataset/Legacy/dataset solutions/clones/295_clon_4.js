const fileSystem = require('node:fs');
const inputString = fileSystem.readFileSync('/dev/stdin', 'utf8');

const lineSegments = inputString.trim().split('\n');

const processedPyramid = lineSegments.reduce((accumulator, lineContent) => {
  const numericValues = lineContent.split(',').map(Number);
  accumulator.push(numericValues);
  return accumulator;
}, []).slice(0, 9);

const totalRows = processedPyramid.length;

const pathAccumulators = Array.from({ length: totalRows }, (_, rowIndex) =>
  Array(processedPyramid[rowIndex].length).fill(-Infinity)
);

pathAccumulators[0][0] = processedPyramid[0][0];

const midpointThreshold = (totalRows - 1) / 2;

for (let currentRow = 0; currentRow < totalRows - 1; currentRow++) {
  const nextRow = currentRow + 1;
  const isExpandingPhase = currentRow < midpointThreshold;

  for (let currentCol = 0; currentCol < processedPyramid[currentRow].length; currentCol++) {
    if (pathAccumulators[currentRow][currentCol] === -Infinity) {
      continue;
    }

    const currentPathValue = pathAccumulators[currentRow][currentCol];

    if (isExpandingPhase) {
      // Option 1: Move to (nextRow, currentCol)
      if (currentCol < processedPyramid[nextRow].length) {
        pathAccumulators[nextRow][currentCol] = Math.max(
          pathAccumulators[nextRow][currentCol],
          currentPathValue + processedPyramid[nextRow][currentCol]
        );
      }
      // Option 2: Move to (nextRow, currentCol+1)
      if (currentCol + 1 < processedPyramid[nextRow].length) {
        pathAccumulators[nextRow][currentCol + 1] = Math.max(
          pathAccumulators[nextRow][currentCol + 1],
          currentPathValue + processedPyramid[nextRow][currentCol + 1]
        );
      }
    } else {
      // Option 1: Move to (nextRow, currentCol-1)
      if (currentCol - 1 >= 0 && currentCol - 1 < processedPyramid[nextRow].length) {
        pathAccumulators[nextRow][currentCol - 1] = Math.max(
          pathAccumulators[nextRow][currentCol - 1],
          currentPathValue + processedPyramid[nextRow][currentCol - 1]
        );
      }
      // Option 2: Move to (nextRow, currentCol)
      if (currentCol < processedPyramid[currentRow].length - 1 && currentCol < processedPyramid[nextRow].length) {
        pathAccumulators[nextRow][currentCol] = Math.max(
          pathAccumulators[nextRow][currentCol],
          currentPathValue + processedPyramid[nextRow][currentCol]
        );
      }
    }
  }
}

let overallMaximum = -Infinity;
const lastRowIndex = totalRows - 1;

// The original code would crash if processedPyramid is empty (e.g., empty input file).
// This clone maintains that behavior by attempting to access pathAccumulators[0][0]
// and then potentially pathAccumulators[lastRowIndex].
for (let col = 0; col < pathAccumulators[lastRowIndex].length; col++) {
  overallMaximum = Math.max(overallMaximum, pathAccumulators[lastRowIndex][col]);
}

console.log(overallMaximum);
