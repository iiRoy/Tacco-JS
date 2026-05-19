let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  const inputLines = rawInputBuffer.split('\n');
  processInputAndSolve(inputLines);
});

function rotateMatrix(inputMatrix) {
  const matrixDimension = inputMatrix.length;
  const rotatedMatrix = Array.from({ length: matrixDimension }, () => Array(matrixDimension).fill(0));

  for (let r = 0; r < matrixDimension; r++) {
    for (let c = 0; c < matrixDimension; c++) {
      const targetColumnIndex = matrixDimension - c - 1;
      rotatedMatrix[r][targetColumnIndex] = inputMatrix[c][r];
    }
  }
  return rotatedMatrix;
}

function readAndParseLine(inputBufferRef) {
  return inputBufferRef.shift().split(/\s+/).map(parseFloat);
}

function checkSubMatrixMatchAndGetFirstCoord(
  imageStartRow, imageStartCol,
  currentSubMatrixVariant,
  subMatrixDimension,
  mainImageReference
) {
  let firstMatchXCoord = 0;
  let firstMatchYCoord = 0;

  for (let subRow = 0; subRow < subMatrixDimension; subRow++) {
    for (let subCol = 0; subCol < subMatrixDimension; subCol++) {
      const subMatrixElement = currentSubMatrixVariant[subRow][subCol];

      if (subMatrixElement === -1) {
        continue;
      }

      const imageElement = mainImageReference[imageStartRow + subRow][imageStartCol + subCol];

      if (subMatrixElement !== imageElement) {
        return null;
      }

      if (firstMatchXCoord === 0 && firstMatchYCoord === 0) {
        firstMatchXCoord = imageStartCol + subCol + 1;
        firstMatchYCoord = imageStartRow + subRow + 1;
      }
    }
  }
  return { col: firstMatchXCoord, row: firstMatchYCoord };
}

function processInputAndSolve(inputLines) {
  const NO_MATCH_SENTINEL_VALUE = 99999999;

  let mainImage;
  let currentSubMatrix;
  let allRotatedSubMatrices;

  let imageRowsCount, subMatrixDimension;
  let parsedLineData;

  while (true) {
    parsedLineData = readAndParseLine(inputLines);
    imageRowsCount = parsedLineData[0];
    subMatrixDimension = parsedLineData[1];

    if (imageRowsCount === 0 && subMatrixDimension === 0) {
      break;
    }

    mainImage = [];
    for (let r = 0; r < imageRowsCount; r++) {
      mainImage.push(readAndParseLine(inputLines));
    }

    currentSubMatrix = [];
    for (let r = 0; r < subMatrixDimension; r++) {
      currentSubMatrix.push(readAndParseLine(inputLines));
    }

    allRotatedSubMatrices = [];
    let tempSubMatrixForRotation = currentSubMatrix;
    for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
      allRotatedSubMatrices.push(tempSubMatrixForRotation);
      tempSubMatrixForRotation = rotateMatrix(tempSubMatrixForRotation);
    }

    let bestMatchCol = NO_MATCH_SENTINEL_VALUE;
    let bestMatchRow = NO_MATCH_SENTINEL_VALUE;

    for (let imgR = 0; imgR < imageRowsCount - subMatrixDimension; imgR++) {
      for (let imgC = 0; imgC < imageRowsCount - subMatrixDimension; imgC++) {
        for (let rotIdx = 0; rotIdx < 4; rotIdx++) {
          const currentRotatedVariant = allRotatedSubMatrices[rotIdx];

          const matchCoordinates = checkSubMatrixMatchAndGetFirstCoord(
            imgR, imgC,
            currentRotatedVariant,
            subMatrixDimension,
            mainImage
          );

          if (matchCoordinates !== null) {
            const currentMatchFirstCol = matchCoordinates.col;
            const currentMatchFirstRow = matchCoordinates.row;

            if (currentMatchFirstCol < bestMatchCol) {
              bestMatchCol = currentMatchFirstCol;
              bestMatchRow = currentMatchFirstRow;
            } else if (currentMatchFirstCol === bestMatchCol && currentMatchFirstRow < bestMatchRow) {
              bestMatchRow = currentMatchFirstRow;
            }
          }
        }
      }
    }

    if (bestMatchCol !== NO_MATCH_SENTINEL_VALUE && bestMatchRow !== NO_MATCH_SENTINEL_VALUE) {
      console.log(`${bestMatchCol} ${bestMatchRow}`);
    } else {
      console.log('NA');
    }
  }
}
