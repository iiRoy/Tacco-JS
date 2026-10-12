const BOARD_DIMENSION = 8;
const BOUNDARY_MARKER = 'f';
const EMPTY_SPACE = '.';

const DIRECTION_VECTORS = [
    { rowDelta: -1, colDelta: -1 }, { rowDelta: -1, colDelta: 0 }, { rowDelta: -1, colDelta: 1 },
    { rowDelta: 0, colDelta: -1 },                                { rowDelta: 0, colDelta: 1 },
    { rowDelta: 1, colDelta: -1 }, { rowDelta: 1, colDelta: 0 }, { rowDelta: 1, colDelta: 1 }
];

function initializeGameGrid(rawInputString) {
    const contentRows = rawInputString.trim().split('\n');
    const gameGrid = [];

    gameGrid.push(Array(BOARD_DIMENSION + 2).fill(BOUNDARY_MARKER));

    contentRows.forEach(line => {
        gameGrid.push([BOUNDARY_MARKER, ...line.split(''), BOUNDARY_MARKER]);
    });

    gameGrid.push(Array(BOARD_DIMENSION + 2).fill(BOUNDARY_MARKER));

    return gameGrid;
}

function traceDirectionalPath(gridState, startRow, startCol, rowDelta, colDelta) {
    const pathSegments = [];
    let currentRow = startRow + rowDelta;
    let currentCol = startCol + colDelta;

    while (true) {
        const cellContent = gridState[currentRow]?.[currentCol];
        if (cellContent === BOUNDARY_MARKER || cellContent === undefined) {
            break;
        }
        pathSegments.push({ r: currentRow, c: currentCol, val: cellContent });
        currentRow += rowDelta;
        currentCol += colDelta;
    }
    return pathSegments;
}

function calculatePotentialFlips(gridState, targetRow, targetCol, activePlayerToken, opposingPlayerToken) {
    if (gridState[targetRow][targetCol] !== EMPTY_SPACE) {
        return 0;
    }

    let totalFlipCount = 0;

    DIRECTION_VECTORS.forEach(({ rowDelta, colDelta }) => {
        const path = traceDirectionalPath(gridState, targetRow, targetCol, rowDelta, colDelta);
        let currentDirectionFlipCandidates = 0;
        let terminatingPlayerTokenFound = false;

        for (const segment of path) {
            if (segment.val === opposingPlayerToken) {
                currentDirectionFlipCandidates++;
            } else if (segment.val === activePlayerToken) {
                terminatingPlayerTokenFound = true;
                break;
            } else {
                break;
            }
        }

        if (terminatingPlayerTokenFound && currentDirectionFlipCandidates > 0) {
            totalFlipCount += currentDirectionFlipCandidates;
        }
    });

    return totalFlipCount;
}

function applyPlayerMove(gridState, targetRow, targetCol, activePlayerToken, opposingPlayerToken) {
    gridState[targetRow][targetCol] = activePlayerToken;

    DIRECTION_VECTORS.forEach(({ rowDelta, colDelta }) => {
        const path = traceDirectionalPath(gridState, targetRow, targetCol, rowDelta, colDelta);
        const segmentsToFlip = [];
        let terminatingPlayerTokenFound = false;

        for (const segment of path) {
            if (segment.val === opposingPlayerToken) {
                segmentsToFlip.push(segment);
            } else if (segment.val === activePlayerToken) {
                terminatingPlayerTokenFound = true;
                break;
            } else {
                break;
            }
        }

        if (terminatingPlayerTokenFound && segmentsToFlip.length > 0) {
            segmentsToFlip.forEach(segment => {
                gridState[segment.r][segment.c] = activePlayerToken;
            });
        }
    });
}

function generateAllBoardPositions(ascendingOrder = true) {
    const positions = [];
    for (let r = 1; r <= BOARD_DIMENSION; r++) {
        for (let c = 1; c <= BOARD_DIMENSION; c++) {
            positions.push({ r, c });
        }
    }
    return ascendingOrder ? positions : positions.reverse();
}

function determineBestPlacement(currentGrid, playerToken, opponentToken, positionTraversalOrder) {
    let topScore = 0;
    let topPosition = [];

    for (const { r, c } of positionTraversalOrder) {
        const currentScore = calculatePotentialFlips(currentGrid, r, c, playerToken, opponentToken);
        if (currentScore > topScore) {
            topScore = currentScore;
            topPosition = [r, c];
        }
    }
    return topPosition;
}

function runReversiSimulation(initialBoardInput) {
    let currentBoard = initializeGameGrid(initialBoardInput);
    let consecutiveNoMoves = 0;

    const playerOne = { token: 'o', opponent: 'x', moveOrder: generateAllBoardPositions(true) };
    const playerTwo = { token: 'x', opponent: 'o', moveOrder: generateAllBoardPositions(false) };

    let activePlayer = playerOne;
    let activeOpponent = playerTwo;

    while (consecutiveNoMoves < 2) {
        const chosenMove = determineBestPlacement(currentBoard, activePlayer.token, activeOpponent.token, activePlayer.moveOrder);

        if (chosenMove.length === 0) {
            consecutiveNoMoves++;
        } else {
            consecutiveNoMoves = 0;
            applyPlayerMove(currentBoard, chosenMove[0], chosenMove[1], activePlayer.token, activeOpponent.token);
        }

        [activePlayer, activeOpponent] = [activeOpponent, activePlayer];
    }

    const finalDisplayRows = currentBoard.slice(1, BOARD_DIMENSION + 1).map(row =>
        row.slice(1, BOARD_DIMENSION + 1).join('')
    );
    return finalDisplayRows.join('\n');
}

const initialGameInput = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

const gameResult = runReversiSimulation(initialGameInput);
console.log(gameResult);
