const EMPTY_SLOT = '.';
const PLAYER_MARKER_ONE = 'x';
const PLAYER_MARKER_TWO = 'o';
const GRID_DIMENSION = 8;

const DIRECTION_VECTORS = [
  { rowDelta: -1, colDelta: -1 }, { rowDelta: -1, colDelta: 0 }, { rowDelta: -1, colDelta: 1 },
  { rowDelta: 0, colDelta: -1 }, { rowDelta: 0, colDelta: 1 },
  { rowDelta: 1, colDelta: -1 }, { rowDelta: 1, colDelta: 0 }, { rowDelta: 1, colDelta: 1 }
];

const isValidPosition = (r, c) => r >= 0 && r < GRID_DIMENSION && c >= 0 && c < GRID_DIMENSION;

const duplicateBoard = (originalBoard) => originalBoard.map(row => [...row]);

const calculateFlipCandidatesInDirection = (currentBoardState, startR, startC, rowDelta, colDelta, activePlayer, foePlayer) => {
  const potentialFlips = [];
  let currentR = startR + rowDelta;
  let currentC = startC + colDelta;

  while (isValidPosition(currentR, currentC)) {
    const cellValue = currentBoardState[currentR][currentC];
    if (cellValue === foePlayer) {
      potentialFlips.push({ r: currentR, c: currentC });
    } else if (cellValue === activePlayer) {
      return potentialFlips;
    } else {
      break;
    }
    currentR += rowDelta;
    currentC += colDelta;
  }
  return [];
};

const gatherAllFlipCandidates = (currentBoardState, r, c, activePlayer, foePlayer) => {
  if (currentBoardState[r][c] !== EMPTY_SLOT) {
    return null;
  }

  const allFlips = DIRECTION_VECTORS.flatMap(({ rowDelta, colDelta }) =>
    calculateFlipCandidatesInDirection(currentBoardState, r, c, rowDelta, colDelta, activePlayer, foePlayer)
  );

  return allFlips.length > 0 ? allFlips : null;
};

const generateForwardScanSequence = () => {
  const sequence = [];
  for (let r = 0; r < GRID_DIMENSION; r++) {
    for (let c = 0; c < GRID_DIMENSION; c++) {
      sequence.push({ r, c });
    }
  }
  return sequence;
};

const generateBackwardScanSequence = () => {
  const sequence = [];
  for (let r = GRID_DIMENSION - 1; r >= 0; r--) {
    for (let c = GRID_DIMENSION - 1; c >= 0; c--) {
      sequence.push({ r, c });
    }
  }
  return sequence;
};

const identifyBestPlacement = (currentBoardState, activePlayer, foePlayer, scanSequence) => {
  let highestFlipScore = 0;
  let chosenMoveDetails = null;

  for (const { r, c } of scanSequence) {
    const potentialFlips = gatherAllFlipCandidates(currentBoardState, r, c, activePlayer, foePlayer);

    if (potentialFlips && potentialFlips.length > highestFlipScore) {
      highestFlipScore = potentialFlips.length;
      chosenMoveDetails = { row: r, col: c, flips: potentialFlips };
    }
  }
  return chosenMoveDetails;
};

const applyGameTurn = (currentBoardState, placementR, placementC, activePlayer, flipsToApply) => {
  const newBoardState = duplicateBoard(currentBoardState);
  newBoardState[placementR][placementC] = activePlayer;

  flipsToApply.forEach(({ r, c }) => {
    newBoardState[r][c] = activePlayer;
  });
  return newBoardState;
};

const simulateOthelloGame = (initialBoard, currentActivePlayer, currentConsecutivePasses) => {
  if (currentConsecutivePasses >= 2) {
    return initialBoard;
  }

  const opponentPlayer = (currentActivePlayer === PLAYER_MARKER_ONE) ? PLAYER_MARKER_TWO : PLAYER_MARKER_ONE;
  const moveScanSequence = (currentActivePlayer === PLAYER_MARKER_TWO) ? generateForwardScanSequence() : generateBackwardScanSequence();

  const optimalPlacement = identifyBestPlacement(initialBoard, currentActivePlayer, opponentPlayer, moveScanSequence);

  let nextBoardState = initialBoard;
  let nextConsecutivePasses = currentConsecutivePasses;

  if (optimalPlacement) {
    nextBoardState = applyGameTurn(initialBoard, optimalPlacement.row, optimalPlacement.col, currentActivePlayer, optimalPlacement.flips);
    nextConsecutivePasses = 0;
  } else {
    nextConsecutivePasses++;
  }

  return simulateOthelloGame(nextBoardState, opponentPlayer, nextConsecutivePasses);
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const initialGameGrid = rawInputData.trim().split("\n").map(line => line.split(""));

const finalGameGrid = simulateOthelloGame(initialGameGrid, PLAYER_MARKER_TWO, 0);

const outputString = finalGameGrid.map(row => row.join("")).join("\n");

console.log(outputString);