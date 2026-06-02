var inputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  inputBuffer += chunk;
});
process.stdin.on('end', function() {
  const allLines = inputBuffer.split('\n');
  processGridInstructions(allLines);
});

function* gridDataGenerator(sourceLines) {
  let currentLineIndex = 0;
  while (currentLineIndex < sourceLines.length) {
    const dimensions = sourceLines[currentLineIndex].split(' ').map(Number);
    const gridWidth = dimensions[0];
    const gridHeight = dimensions[1];

    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    const gridCells = new Map();
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
      const rowString = sourceLines[currentLineIndex + 1 + rowIdx];
      for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
        gridCells.set(`${rowIdx},${colIdx}`, rowString[colIdx]);
      }
    }

    yield {
      width: gridWidth,
      height: gridHeight,
      cells: gridCells
    };

    currentLineIndex += (gridHeight + 1);
  }
}

const moveDirections = new Map([
  ['>', { dr: 0, dc: 1 }],
  ['<', { dr: 0, dc: -1 }],
  ['v', { dr: 1, dc: 0 }],
  ['^', { dr: -1, dc: 0 }]
]);

function tracePath(currentR, currentC, currentGrid, visitedCells) {
  const { width: gridW, height: gridH, cells: gridCellsMap } = currentGrid;

  if (currentR < 0 || currentR >= gridH) {
    throw new TypeError("Cannot read properties of undefined (reading 'charAt')");
  }

  const currentCoordKey = `${currentR},${currentC}`;

  let currentCellChar = gridCellsMap.get(currentCoordKey);
  if (currentC < 0 || currentC >= gridW) {
      currentCellChar = '';
  }

  if (visitedCells.has(currentCoordKey)) {
    return { finalRow: currentR, finalCol: currentC, isLooped: true };
  }

  visitedCells.add(currentCoordKey);

  if (currentCellChar === '.') {
    return { finalRow: currentR, finalCol: currentC, isLooped: false };
  }

  const direction = moveDirections.get(currentCellChar);

  if (!direction) {
      return { finalRow: currentR, finalCol: currentC, isLooped: true };
  }

  const nextR = currentR + direction.dr;
  const nextC = currentC + direction.dc;

  return tracePath(nextR, nextC, currentGrid, visitedCells);
}


function processGridInstructions(allInputLines) {
  for (const gridInfo of gridDataGenerator(allInputLines)) {
    try {
      const pathResult = tracePath(0, 0, gridInfo, new Set());

      if (pathResult.isLooped) {
        console.log('LOOP');
      } else {
        console.log(`${pathResult.finalCol} ${pathResult.finalRow}`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === "Cannot read properties of undefined (reading 'charAt')") {
        throw error;
      }
      throw error;
    }
  }
}
