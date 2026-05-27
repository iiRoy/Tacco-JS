let inputBuffer = '';

function determineMax(valOne, valTwo) {
  const difference = valOne - valTwo;
  const signBit = (difference >> 31);
  return valOne - (difference & signBit);
}

function processInputAndCalculate() {
  const processedInputLines = inputBuffer.split('\n');

  const GRID_DIMENSION = 14;
  let impactGrid = Array.from({ length: GRID_DIMENSION }, () =>
    Array.from({ length: GRID_DIMENSION }, () => 0)
  );

  const COORD_OFFSET_VALUE = 2;
  const TYPE_CHAR_INDEX = 4;

  const type1RelativeOffsets = [
    [1, 0], [0, -1], [0, 0], [0, 1], [-1, 0]
  ];
  const type2RelativeOffsets = [
    [1, -1], [1, 1], [-1, -1], [-1, 1]
  ];
  const type3RelativeOffsets = [
    [2, 0], [-2, 0], [0, -2], [0, 2]
  ];

  const effectiveLineCount = processedInputLines.length - 1;

  for (let lineIndex = effectiveLineCount - 1; lineIndex >= 0; lineIndex--) {
    const currentInputLine = processedInputLines[lineIndex];

    const targetCol = parseInt(currentInputLine[0]) + COORD_OFFSET_VALUE;
    const targetRow = parseInt(currentInputLine[2]) + COORD_OFFSET_VALUE;

    let combinedOffsets = [];
    const impactTypeChar = currentInputLine[TYPE_CHAR_INDEX];

    switch (impactTypeChar) {
      case '3':
        combinedOffsets.push(...type3RelativeOffsets);
      case '2':
        combinedOffsets.push(...type2RelativeOffsets);
      case '1':
        combinedOffsets.push(...type1RelativeOffsets);
        break;
    }

    for (const [deltaY, deltaX] of combinedOffsets) {
      impactGrid[targetRow + deltaY][targetCol + deltaX]++;
    }
  }

  let zeroImpactCells = 0;
  let maxImpactValue = 0;

  const INNER_GRID_ITERATION_DIMENSION = 10;
  const GRID_CHECK_OFFSET = COORD_OFFSET_VALUE;

  for (let gridRowIdx = 0; gridRowIdx < INNER_GRID_ITERATION_DIMENSION; gridRowIdx++) {
    for (let gridColIdx = 0; gridColIdx < INNER_GRID_ITERATION_DIMENSION; gridColIdx++) {
      const currentCellValue = impactGrid[gridRowIdx + GRID_CHECK_OFFSET][gridColIdx + GRID_CHECK_OFFSET];

      if (currentCellValue === 0) {
        zeroImpactCells++;
      }
      maxImpactValue = determineMax(currentCellValue, maxImpactValue);
    }
  }

  console.log(zeroImpactCells);
  console.log(maxImpactValue);
}

function setupInputProcessing() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
  });
  process.stdin.on('end', () => {
    processInputAndCalculate();
  });
}

setupInputProcessing();
