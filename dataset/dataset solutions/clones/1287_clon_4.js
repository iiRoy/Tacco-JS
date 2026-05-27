const processMatrixData = (rawData) => {
  const lineSegments = rawData.split('\n');
  const [matrixHeightStr, matrixWidthStr] = lineSegments[0].split(' ');
  const matrixHeight = parseInt(matrixHeightStr);
  const matrixWidth = parseInt(matrixWidthStr);

  const matrixRows = lineSegments.slice(1, 1 + matrixHeight).map(rowStr =>
    rowStr.split(' ').map(Number)
  );

  const coefficientVector = lineSegments.slice(
    1 + matrixHeight,
    1 + matrixHeight + matrixWidth - 1
  ).map(Number);

  matrixRows.forEach(currentRow => {
    const rowProductSum = currentRow.reduce((accumulator, currentElement, colIndex) => {
      const coefficient = coefficientVector[colIndex];
      return accumulator + (currentElement * coefficient);
    }, 0);
    console.log(rowProductSum);
  });
};

const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf-8');
processMatrixData(inputData);
