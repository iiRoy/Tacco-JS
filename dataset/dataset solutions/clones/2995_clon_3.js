'use strict';

const parseNumericValue = (inputArray) => Number(inputArray.shift());

const colDeltaMap = { 'L': -1, 'R': 1, 'U': 0, 'D': 0 };
const rowDeltaMap = { 'U': -1, 'D': 1, 'L': 0, 'R': 0 };

const isRegionOutOfBounds = (minC, maxC, minR, maxR, gridW, gridH) => {
    return minC === 0 || maxC === gridW + 1 || minR === 0 || maxR === gridH + 1;
};

function solveGridTraversal(rawInput) {
    let inputTokens = rawInput.split(/\s+/);

    const gridHeight = parseNumericValue(inputTokens);
    const gridWidth = parseNumericValue(inputTokens);
    const numSteps = parseNumericValue(inputTokens);
    const startRow = parseNumericValue(inputTokens);
    const startCol = parseNumericValue(inputTokens);
    const playerMoveSequence = inputTokens.shift();
    const enemyMoveSequence = inputTokens.shift();

    const possibleRegionHistory = [[startCol, startCol, startRow, startRow]];

    for (let stepIdx = 0; stepIdx < numSteps; stepIdx++) {
        const previousBounds = possibleRegionHistory[stepIdx];
        const [prevMinCol, prevMaxCol, prevMinRow, prevMaxRow] = previousBounds;

        const currentPlayerMove = playerMoveSequence[stepIdx];
        const currentEnemyMove = enemyMoveSequence[stepIdx];

        let nextMinColAfterPlayer = prevMinCol + colDeltaMap[currentPlayerMove];
        let nextMaxColAfterPlayer = prevMaxCol + colDeltaMap[currentPlayerMove];
        let nextMinRowAfterPlayer = prevMinRow + rowDeltaMap[currentPlayerMove];
        let nextMaxRowAfterPlayer = prevMaxRow + rowDeltaMap[currentPlayerMove];

        const tempBoundsAfterPlayer = [
            nextMinColAfterPlayer,
            nextMaxColAfterPlayer,
            nextMinRowAfterPlayer,
            nextMaxRowAfterPlayer
        ];

        if (isRegionOutOfBounds(
            tempBoundsAfterPlayer[0],
            tempBoundsAfterPlayer[1],
            tempBoundsAfterPlayer[2],
            tempBoundsAfterPlayer[3],
            gridWidth,
            gridHeight
        )) {
            console.log('NO');
            return;
        }

        const finalMinColForStep = Math.min(tempBoundsAfterPlayer[0] + (currentEnemyMove === 'R' ? 1 : 0), gridWidth);
        const finalMaxColForStep = Math.max(tempBoundsAfterPlayer[1] - (currentEnemyMove === 'L' ? 1 : 0), 1);
        const finalMinRowForStep = Math.min(tempBoundsAfterPlayer[2] + (currentEnemyMove === 'D' ? 1 : 0), gridHeight);
        const finalMaxRowForStep = Math.max(tempBoundsAfterPlayer[3] - (currentEnemyMove === 'U' ? 1 : 0), 1);

        if (finalMinColForStep > finalMaxColForStep || finalMinRowForStep > finalMaxRowForStep) {
            console.log('NO');
            return;
        }

        possibleRegionHistory.push([
            finalMinColForStep,
            finalMaxColForStep,
            finalMinRowForStep,
            finalMaxRowForStep
        ]);
    }

    console.log('YES');
}

solveGridTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));
