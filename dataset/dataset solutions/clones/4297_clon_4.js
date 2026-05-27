const processGrid = (sourceData) => {
  const gridLines = sourceData.split('\n').filter((lineContent, lineIndex) => lineIndex > 0 && lineContent.length > 0);
  const characterMatrix = gridLines.map((singleLine) => [...singleLine]);

  const neighborDisplacements = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  const transformedRows = characterMatrix.map((currentLineChars, rowIdx, completeMatrix) => {
    const processedCells = currentLineChars.map((cellValue, colIdx) => {
      if (cellValue === '#') {
        return '#';
      } else {
        const adjacentHashCount = neighborDisplacements.reduce((accumulator, [deltaRow, deltaCol]) => {
          const neighborRow = rowIdx + deltaRow;
          const neighborCol = colIdx + deltaCol;

          const isValidNeighbor = (
            neighborRow >= 0 && neighborRow < completeMatrix.length &&
            neighborCol >= 0 && completeMatrix[neighborRow] && neighborCol < completeMatrix[neighborRow].length
          );

          if (isValidNeighbor && completeMatrix[neighborRow][neighborCol] === '#') {
            return accumulator + 1;
          }
          return accumulator;
        }, 0);
        return adjacentHashCount.toString();
      }
    });
    return processedCells.join('');
  });

  return transformedRows.join('\n');
};

console.log(processGrid(require('fs').readFileSync('/dev/stdin', 'utf8')));
