console.log(((sourceData) => {
  const processRawInput = (textBlock) => {
    const allLines = textBlock.trim().split('\n');
    const [sizeData, ...gridContent] = allLines;
    const [rowsCount, colsCount, _] = sizeData.split(' ').map(v => 0|v);
    const initialCellValues = gridContent.map(oneLine => oneLine.split(''));
    return { fieldRows: rowsCount, fieldCols: colsCount, fieldContent: initialCellValues };
  };

  const calculateLabeledGrid = (inputInfo) => {
    const totalFieldRows = inputInfo.fieldRows;
    const totalFieldCols = inputInfo.fieldCols;
    const currentFieldState = new Map();
    let nextUniqueLabel = 0;
    const propagationFrontier = new Set();

    for (let rIndex = 0; rIndex < totalFieldRows; rIndex++) {
      for (let cIndex = 0; cIndex < totalFieldCols; cIndex++) {
        const cellKey = `${rIndex},${cIndex}`;
        if (inputInfo.fieldContent[rIndex][cIndex] === '#') {
          nextUniqueLabel++;
          currentFieldState.set(cellKey, nextUniqueLabel);
          propagationFrontier.add(cellKey);
        } else {
          currentFieldState.set(cellKey, 0);
        }
      }
    }

    const adjacentOffsets = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0]
    ];

    while (propagationFrontier.size > 0) {
      const newPropagationFrontier = new Set();

      for (const currentCellIdentifier of propagationFrontier) {
        const [currentRow, currentCol] = currentCellIdentifier.split(',').map(v => 0|v);
        const currentCellIdentifierValue = currentFieldState.get(currentCellIdentifier);

        for (const [rowOffset, colOffset] of adjacentOffsets) {
          const neighborRow = currentRow + rowOffset;
          const neighborCol = currentCol + colOffset;

          if (neighborRow >= 0 && neighborRow < totalFieldRows && 
              neighborCol >= 0 && neighborCol < totalFieldCols) {
            const neighborIdentifier = `${neighborRow},${neighborCol}`;
            const neighborIdentifierValue = currentFieldState.get(neighborIdentifier);

            if (neighborIdentifierValue === 0 && currentCellIdentifierValue !== 0) {
              currentFieldState.set(neighborIdentifier, currentCellIdentifierValue);
              newPropagationFrontier.add(neighborIdentifier);
            }
          }
        }
      }
      propagationFrontier.clear();
      for (const keyToMove of newPropagationFrontier) {
        propagationFrontier.add(keyToMove);
      }
    }

    let resultLines = [];
    for (let rIndex = 0; rIndex < totalFieldRows; rIndex++) {
      let rowSegmentValues = [];
      for (let cIndex = 0; cIndex < totalFieldCols; cIndex++) {
        rowSegmentValues.push(currentFieldState.get(`${rIndex},${cIndex}`));
      }
      resultLines.push(rowSegmentValues.join(' '));
    }
    return resultLines.join('\n');
  };

  const parsedInput = processRawInput(sourceData);
  return calculateLabeledGrid(parsedInput);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));