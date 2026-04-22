function explorePath(currentRow, currentCol, currentTotal) {
  if (currentRow === valueMatrix.length - 1) {
    highestSum = Math.max(highestSum, currentTotal);
  } else if ( ( valueMatrix.length - 1 ) / 2 > currentRow ) {
    explorePath(currentRow + 1, currentCol + 0, currentTotal + valueMatrix[currentRow + 1][currentCol]);
    explorePath(currentRow + 1, currentCol + 1, currentTotal + valueMatrix[currentRow + 1][currentCol + 1]);
  } else if ( ( valueMatrix.length - 1 ) / 2 <= currentRow ) {
    if (currentCol - 1 >= 0) explorePath(currentRow + 1, currentCol - 1, currentTotal + valueMatrix[currentRow + 1][currentCol - 1]);
    if (currentCol < valueMatrix[currentRow].length - 1) explorePath(currentRow + 1, currentCol + 0, currentTotal + valueMatrix[currentRow + 1][currentCol]);
  }
}

let streamInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = (streamInput.trim()).split('\n');

const valueMatrix = [];

dataLines.forEach( (rowString) => {
  const numericRow = rowString.split(',').map(Number);
  valueMatrix.push(numericRow);
});

let highestSum = 0;
explorePath(0, 0, valueMatrix[0][0]);
console.log(highestSum);