function solvePuzzle() {
    const visitedStates = {};
    const EMPTY_TILE_VALUE = 0;

    const deltaY = [-1, 0, 0, 1];
    const deltaX = [0, -1, 1, 0];

    const BOARD_ROWS = 2;
    const BOARD_COLS = 4;

    const get2DCoords = (flatIndex) => ({
        row: Math.floor(flatIndex / BOARD_COLS),
        col: flatIndex % BOARD_COLS
    });

    const isWithinBounds = (r, c) =>
        r >= 0 && c >= 0 && r < BOARD_ROWS && c < BOARD_COLS;

    const getBoardKey = (boardArray) => boardArray.join("");

    const initialBoard = [0, 1, 2, 3, 4, 5, 6, 7];
    const initialKey = getBoardKey(initialBoard);
    visitedStates[initialKey] = 0;

    const queue = [[initialBoard, 0]];

    while (queue.length > 0) {
        const [currentBoard, moveCount] = queue.shift();

        const zeroIndex = currentBoard.indexOf(EMPTY_TILE_VALUE);
        const { row: zeroRow, col: zeroCol } = get2DCoords(zeroIndex);

        const board2D = [];
        for (let r = 0; r < BOARD_ROWS; r++) {
            board2D.push(currentBoard.slice(r * BOARD_COLS, (r + 1) * BOARD_COLS));
        }

        for (let directionIdx = 0; directionIdx < 4; directionIdx++) {
            const newZeroRow = zeroRow + deltaY[directionIdx];
            const newZeroCol = zeroCol + deltaX[directionIdx];

            if (!isWithinBounds(newZeroRow, newZeroCol)) {
                continue;
            }

            const movedTileValue = board2D[newZeroRow][newZeroCol];
            board2D[zeroRow][zeroCol] = movedTileValue;
            board2D[newZeroRow][newZeroCol] = EMPTY_TILE_VALUE;

            const nextBoardFlat = board2D[0].concat(board2D[1]);
            const boardString = getBoardKey(nextBoardFlat);

            if (!visitedStates.hasOwnProperty(boardString)) {
                const nextMoveCount = moveCount + 1;
                visitedStates[boardString] = nextMoveCount;
                queue.push([nextBoardFlat, nextMoveCount]);
            }

            board2D[newZeroRow][newZeroCol] = movedTileValue;
            board2D[zeroRow][zeroCol] = EMPTY_TILE_VALUE;
        }
    }
    return visitedStates;
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

const puzzleSolutionMap = solvePuzzle();

inputLines.forEach(function(line) {
    const cleanedLine = line.replace(/\s/g, '');
    console.log(puzzleSolutionMap[cleanedLine]);
});
