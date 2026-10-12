let inputBuffer = '';

const parseNumericLine = (sourceBuffer) => sourceBuffer.shift().split(/\s+/).map(parseFloat);

const spinMatrix = (sourceMatrix) => {
  const matrixSize = sourceMatrix.length;
  return Array.from({ length: matrixSize }, (_, newRowIndex) =>
    Array.from({ length: matrixSize }, (__, newColIndex) =>
      sourceMatrix[matrixSize - 1 - newColIndex][newRowIndex]
    )
  );
};

const evaluateSubgridMatch = (mainGrid, currentTemplate, gridRowOffset, gridColOffset) => {
  let initialMatchCol = 0;
  let initialMatchRow = 0;

  const isMatchFound = currentTemplate.every((templateRowData, templateRIndex) =>
    templateRowData.every((templateValue, templateCIndex) => {
      if (templateValue === -1) {
        return true;
      }

      const gridValue = mainGrid[gridRowOffset + templateRIndex][gridColOffset + templateCIndex];
      if (templateValue !== gridValue) {
        return false;
      }

      if (initialMatchCol === 0 && initialMatchRow === 0) {
        initialMatchCol = gridColOffset + templateCIndex + 1;
        initialMatchRow = gridRowOffset + templateRIndex + 1;
      }
      return true;
    })
  );

  return isMatchFound ? { col: initialMatchCol, row: initialMatchRow } : null;
};

const processInputSequence = () => {
  let gridDimension, templateDimension;
  let currentInputLine;

  for (;;) {
    currentInputLine = parseNumericLine(inputBuffer);
    gridDimension = currentInputLine[0];
    templateDimension = currentInputLine[1];

    if (gridDimension === 0 && templateDimension === 0) {
      break;
    }

    const gridData = Array.from({ length: gridDimension }, () =>
      parseNumericLine(inputBuffer)
    );

    let templateShape = Array.from({ length: templateDimension }, () =>
      parseNumericLine(inputBuffer)
    );

    const shapeOrientations = Array.from({ length: 4 }).reduce((accumulator) => {
      const lastShape = accumulator.length === 0 ? templateShape : spinMatrix(accumulator[accumulator.length - 1]);
      accumulator.push(lastShape);
      return accumulator;
    }, []);

    const potentialMatches = Array.from({ length: gridDimension - templateDimension + 1 }).flatMap((_, rOffset) =>
      Array.from({ length: gridDimension - templateDimension + 1 }).flatMap((__, cOffset) =>
        shapeOrientations.map((currentOrientation) =>
          evaluateSubgridMatch(gridData, currentOrientation, rOffset, cOffset)
        )
      )
    ).filter(Boolean);

    let bestFoundMatch = null;

    if (potentialMatches.length > 0) {
      bestFoundMatch = potentialMatches.reduce((minCoord, currentCoord) => {
        if (currentCoord.col < minCoord.col) {
          return currentCoord;
        }
        if (currentCoord.col === minCoord.col && currentCoord.row < minCoord.row) {
          return currentCoord;
        }
        return minCoord;
      }, potentialMatches[0]);
    }

    if (bestFoundMatch) {
      console.log(`${bestFoundMatch.col} ${bestFoundMatch.row}`);
    } else {
      console.log('NA');
    }
  }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  inputBuffer += chunk;
});
process.stdin.on('end', () => {
  inputBuffer = inputBuffer.split('\n');
  processInputSequence();
});
