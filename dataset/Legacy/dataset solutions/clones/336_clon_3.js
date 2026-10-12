const RADIX_DECIMAL = 10;

function parseDimensions(lineString) {
  const dimensionParts = lineString.split(' ');
  const parsedWidth = parseInt(dimensionParts[0], RADIX_DECIMAL);
  const parsedHeight = parseInt(dimensionParts[1], RADIX_DECIMAL);
  return { width: parsedWidth, height: parsedHeight };
}

function calculateNextCoordinates(currentRowPosition, currentColPosition, directionIndicator) {
  let nextRowPosition = currentRowPosition;
  let nextColPosition = currentColPosition;

  switch (directionIndicator) {
    case '>':
      nextColPosition++;
      break;
    case '<':
      nextColPosition--;
      break;
    case 'v':
      nextRowPosition++;
      break;
    case '^':
      nextRowPosition--;
      break;
  }
  return { row: nextRowPosition, col: nextColPosition };
}

function processInputData() {
  let currentInputIndex;
  let gridRowIndex;
  let currentWidth;
  let currentHeight;
  let currentLineSegments;
  let visitedCellTracker;
  let mazeGrid;
  let loopDetectedFlag;

  const totalInputLines = rawDataInput.length;

  for (currentInputIndex = 0; currentInputIndex < totalInputLines; currentInputIndex++) {
    currentLineSegments = rawDataInput[currentInputIndex];
    const dimensions = parseDimensions(currentLineSegments);
    currentWidth = dimensions.width;
    currentHeight = dimensions.height;

    if (currentWidth === 0 && currentHeight === 0) {
      break;
    }

    mazeGrid = [];
    visitedCellTracker = {};

    for (gridRowIndex = 0; gridRowIndex < currentHeight; gridRowIndex++) {
      currentInputIndex++;
      mazeGrid[gridRowIndex] = rawDataInput[currentInputIndex];
    }

    let currentRowPosition = 0;
    let currentColPosition = 0;
    loopDetectedFlag = false;

    while (true) {
      const currentCellContent = mazeGrid[currentRowPosition].charAt(currentColPosition);

      if (currentCellContent === '.') {
        break;
      }

      const currentCellKey = currentRowPosition + ',' + currentColPosition;
      visitedCellTracker[currentCellKey] = true;

      const nextCoordinates = calculateNextCoordinates(currentRowPosition, currentColPosition, currentCellContent);
      currentRowPosition = nextCoordinates.row;
      currentColPosition = nextCoordinates.col;

      const nextCellKey = currentRowPosition + ',' + currentColPosition;
      if (visitedCellTracker[nextCellKey] === true) {
        loopDetectedFlag = true;
        break;
      }
    }

    const outputMessage = loopDetectedFlag ? 'LOOP' : [currentColPosition, currentRowPosition].join(' ');
    console.log(outputMessage);
  }
}

let rawDataInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawDataInput += dataChunk;
});
process.stdin.on('end', function() {
  rawDataInput = rawDataInput.split('\n');
  processInputData();
});
