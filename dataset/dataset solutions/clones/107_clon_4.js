let accumulatedInput = '';

const findMaximum = (valA, valB) => (valA > valB) ? valA : valB;

function processEventData() {
  const eventLines = accumulatedInput.split('\n').filter(Boolean);

  const GRID_DIMENSION = 14;
  const COORD_OFFSET = 2;

  const impactGrid = Array.from({ length: GRID_DIMENSION }, () => Array(GRID_DIMENSION).fill(0));

  const patternOneOffsets = [[1, 0], [0, -1], [0, 0], [0, 1], [-1, 0]];
  const patternTwoOffsets = [[1, -1], [1, 1], [-1, -1], [-1, 1]];
  const patternThreeOffsets = [[2, 0], [-2, 0], [0, -2], [0, 2]];

  const applyPatternToGrid = (grid, baseRow, baseCol, offsets) => {
    offsets.forEach(([deltaRow, deltaCol]) => {
      const targetRow = baseRow + deltaRow;
      const targetCol = baseCol + deltaCol;
      if (targetRow >= 0 && targetRow < GRID_DIMENSION && targetCol >= 0 && targetCol < GRID_DIMENSION) {
        grid[targetRow][targetCol]++;
      }
    });
  };

  eventLines.reverse().forEach(currentLine => {
    const baseCol = Number(currentLine[0]) + COORD_OFFSET;
    const baseRow = Number(currentLine[2]) + COORD_OFFSET;
    const eventType = Number(currentLine[4]);

    const patternsToApply = [];
    if (eventType >= 3) {
      patternsToApply.push(patternThreeOffsets);
    }
    if (eventType >= 2) {
      patternsToApply.push(patternTwoOffsets);
    }
    if (eventType >= 1) {
      patternsToApply.push(patternOneOffsets);
    }

    patternsToApply.forEach(pattern => {
      applyPatternToGrid(impactGrid, baseRow, baseCol, pattern);
    });
  });

  let emptyCellCount = 0;
  let highestImpact = 0;

  const activeAreaIndices = Array.from({ length: 10 }, (_, i) => i);

  activeAreaIndices.forEach(rowOffset => {
    activeAreaIndices.forEach(colOffset => {
      const cellValue = impactGrid[rowOffset + COORD_OFFSET][colOffset + COORD_OFFSET];
      if (cellValue === 0) {
        emptyCellCount++;
      }
      highestImpact = findMaximum(cellValue, highestImpact);
    });
  });

  console.log(emptyCellCount);
  console.log(highestImpact);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  accumulatedInput += chunk;
});
process.stdin.on('end', function() {
  processEventData();
});
