function processBingoGame(rawInputString) {
  const inputLines = rawInputString.split('\n');

  const GRID_DIMENSION = 3;
  const START_OF_CALLED_NUMBERS_DATA = 4;

  const retrieveGameBoard = (lines) => {
    const boardLayout = [];
    for (let r = 0; r < GRID_DIMENSION; r++) {
      boardLayout.push(lines[r].split(' '));
    }
    return boardLayout;
  };

  const extractCalledNumbers = (lines, dataStartIndex) => {
    const totalCalledNumbers = parseInt(lines[dataStartIndex - 1], 10);
    const numbersSet = new Set();
    for (let n = 0; n < totalCalledNumbers; n++) {
      numbersSet.add(lines[dataStartIndex + n]);
    }
    return numbersSet;
  };

  const gameBoard = retrieveGameBoard(inputLines);
  const calledNumbersSet = extractCalledNumbers(inputLines, START_OF_CALLED_NUMBERS_DATA);

  const markedStatus = [];
  for (let r = 0; r < GRID_DIMENSION; r++) {
    markedStatus.push(new Array(GRID_DIMENSION).fill(0));
  }

  const applyMarksToGrid = (board, numbersToMark, statusGrid) => {
    for (let rIdx = 0; rIdx < GRID_DIMENSION; rIdx++) {
      for (let cIdx = 0; cIdx < GRID_DIMENSION; cIdx++) {
        if (numbersToMark.has(board[rIdx][cIdx])) {
          statusGrid[rIdx][cIdx] = 1;
        }
      }
    }
  };

  applyMarksToGrid(gameBoard, calledNumbersSet, markedStatus);

  let bingoFoundFlag = false;

  for (let rIdx = 0; rIdx < GRID_DIMENSION; rIdx++) {
    let currentHorizontalMarks = 0;
    let currentVerticalMarks = 0;
    let tempDiagRightMarks = 0;
    let tempDiagLeftMarks = 0;

    for (let cIdx = 0; cIdx < GRID_DIMENSION; cIdx++) {
      if (markedStatus[rIdx][cIdx] === 1) {
        currentHorizontalMarks++;
      }
      if (markedStatus[cIdx][rIdx] === 1) {
        currentVerticalMarks++;
      }
    }

    if (markedStatus[rIdx][rIdx] === 1) {
      tempDiagRightMarks++;
    }
    if (markedStatus[rIdx][GRID_DIMENSION - 1 - rIdx] === 1) {
      tempDiagLeftMarks++;
    }

    if (currentHorizontalMarks === GRID_DIMENSION) {
      console.log('Yes');
      bingoFoundFlag = true;
      break;
    }
    if (currentVerticalMarks === GRID_DIMENSION) {
      console.log('Yes');
      bingoFoundFlag = true;
      break;
    }
    if (tempDiagRightMarks === GRID_DIMENSION) {
      console.log('Yes');
      bingoFoundFlag = true;
      break;
    }
    if (tempDiagLeftMarks === GRID_DIMENSION) {
      console.log('Yes');
      bingoFoundFlag = true;
      break;
    }
  }

  if (!bingoFoundFlag) {
    console.log('No');
  }
}

processBingoGame(require("fs").readFileSync("/dev/stdin", "utf8"));
