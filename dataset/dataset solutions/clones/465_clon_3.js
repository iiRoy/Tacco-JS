function rotateSquareMatrix(sourceMatrix) {
  const dim = sourceMatrix.length;
  const rotatedMatrix = Array.from({ length: dim }, () => Array(dim).fill(0));

  for (let r = 0; r < dim; r++) {
    for (let c = 0; c < dim; c++) {
      const targetCol = dim - 1 - r;
      rotatedMatrix[c][targetCol] = sourceMatrix[r][c];
    }
  }
  return rotatedMatrix;
}

function parseLineOfFloats(lineString) {
  return lineString.split(/\s+/).map(parseFloat);
}

function readMatrixFromBuffer(numRows, inputBuffer) {
  const matrix = [];
  for (let i = 0; i < numRows; i++) {
    matrix.push(parseLineOfFloats(inputBuffer.shift()));
  }
  return matrix;
}

function updateMinCoordinates(currentX, currentY, existingMinX, existingMinY) {
  if (currentY < existingMinY) {
    return [currentX, currentY];
  }
  if (currentY === existingMinY && currentX < existingMinX) {
    return [currentX, currentY];
  }
  return [existingMinX, existingMinY];
}

function executePatternMatching() {
  const INITIAL_COORD_VALUE = 99999999;
  let minXCoord = INITIAL_COORD_VALUE;
  let minYCoord = INITIAL_COORD_VALUE;

  while (true) {
    const dimensionsLine = parseLineOfFloats(rawInputBuffer.shift());
    const imageDim = dimensionsLine[0];
    const patternDim = dimensionsLine[1];

    if (imageDim === 0 && patternDim === 0) {
      break;
    }

    const mainImage = readMatrixFromBuffer(imageDim, rawInputBuffer);
    let currentPatternMatrix = readMatrixFromBuffer(patternDim, rawInputBuffer);

    const allRotatedPatterns = [];
    for (let rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
      allRotatedPatterns.push(currentPatternMatrix);
      currentPatternMatrix = rotateSquareMatrix(currentPatternMatrix);
    }

    minXCoord = INITIAL_COORD_VALUE;
    minYCoord = INITIAL_COORD_VALUE;

    searchOuterLoop:
    for (let rowOffset = 0; rowOffset < imageDim - patternDim; rowOffset++) {
      for (let colOffset = 0; colOffset < imageDim - patternDim; colOffset++) {
        for (let rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
          const currentRotatedPattern = allRotatedPatterns[rotationIdx];
          let isCurrentPatternMatch = true;
          let firstMatchX = 0;
          let firstMatchY = 0;

          checkInnerLoop:
          for (let pRow = 0; pRow < patternDim; pRow++) {
            for (let pCol = 0; pCol < patternDim; pCol++) {
              const patternValue = currentRotatedPattern[pRow][pCol];

              if (patternValue === -1) {
                continue;
              }

              const imageValue = mainImage[rowOffset + pRow][colOffset + pCol];

              if (patternValue !== imageValue) {
                isCurrentPatternMatch = false;
                break checkInnerLoop;
              }

              if (firstMatchX === 0 && firstMatchY === 0) {
                firstMatchX = colOffset + pCol + 1;
                firstMatchY = rowOffset + pRow + 1;
              }
            }
          }

          if (isCurrentPatternMatch) {
            [minXCoord, minYCoord] = updateMinCoordinates(firstMatchX, firstMatchY, minXCoord, minYCoord);
          }
        }
      }
    }

    if (minXCoord !== INITIAL_COORD_VALUE && minYCoord !== INITIAL_COORD_VALUE) {
      console.log(minXCoord + ' ' + minYCoord);
    } else {
      console.log('NA');
    }
  }
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
  rawInputBuffer = rawInputBuffer.split('\n').filter(line => line.trim() !== '');
  executePatternMatching();
});
