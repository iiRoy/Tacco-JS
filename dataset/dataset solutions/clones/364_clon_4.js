const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const puzzleLines = rawData.trim().split("\n");

const rowChanges = [-1, 0, 0, 1];
const colChanges = [0, -1, 1, 0];

const finalBoardState = [0, 1, 2, 3, 4, 5, 6, 7];
const finalBoardIdentifier = JSON.stringify(finalBoardState);

puzzleLines.forEach((currentLine) => {
    const initialTiles = currentLine.split(" ").map(Number);

    const pendingConfigurations = [{ state: initialTiles, steps: 0 }];
    const exploredStates = new Set();

    while (pendingConfigurations.length > 0) {
        const currentConfiguration = pendingConfigurations.shift();
        const currentBoard = currentConfiguration.state;
        const currentMoveCount = currentConfiguration.steps;

        const boardIdentifier = JSON.stringify(currentBoard);

        if (boardIdentifier === finalBoardIdentifier) {
            console.log(currentMoveCount);
            break;
        }

        if (exploredStates.has(boardIdentifier)) {
            continue;
        }
        exploredStates.add(boardIdentifier);

        const blankIndex = currentBoard.indexOf(0);
        const blankRow = Math.floor(blankIndex / 4);
        const blankCol = blankIndex % 4;

        for (let k = 0; k < 4; ++k) {
            const nextRow = blankRow + rowChanges[k];
            const nextCol = blankCol + colChanges[k];

            if (nextRow < 0 || nextCol < 0 || nextRow >= 2 || nextCol >= 4) {
                continue;
            }

            const newBoard = [...currentBoard];
            const targetIndex = nextRow * 4 + nextCol;

            [newBoard[blankIndex], newBoard[targetIndex]] = [newBoard[targetIndex], newBoard[blankIndex]];

            const newBoardIdentifier = JSON.stringify(newBoard);

            if (!exploredStates.has(newBoardIdentifier)) {
                pendingConfigurations.push({ state: newBoard, steps: currentMoveCount + 1 });
            }
        }
    }
});