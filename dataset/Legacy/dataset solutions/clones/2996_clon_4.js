'use strict';

class GameTermination extends Error {
    constructor(message) {
        super(message);
        this.name = "GameTermination";
    }
}

const processGame = (rawData) => {
    const dataTokens = rawData.split(/\s+/);

    const gridHeight = Number(dataTokens.shift());
    const gridWidth = Number(dataTokens.shift());
    const totalSteps = Number(dataTokens.shift());
    const initialRow = Number(dataTokens.shift());
    const initialCol = Number(dataTokens.shift());
    const playerMoveSequence = dataTokens.shift();
    const trapActionSequence = dataTokens.shift();

    const playerMovementDeltas = {
        'L': { minCol: -1, maxCol: 0, minRow: 0, maxRow: 0 },
        'R': { minCol: 0, maxCol: 1, minRow: 0, maxRow: 0 },
        'U': { minCol: 0, maxCol: 0, minRow: -1, maxRow: 0 },
        'D': { minCol: 0, maxCol: 0, minRow: 0, maxRow: 1 }
    };

    let currentBoundary = {
        minCol: initialCol,
        maxCol: initialCol,
        minRow: initialRow,
        maxRow: initialRow
    };

    try {
        Array.from({ length: totalSteps }).reduce((currentArea, _, stepIdx) => {
            const playerAction = playerMoveSequence[stepIdx];
            const trapEffect = trapActionSequence[stepIdx];

            const playerDelta = playerMovementDeltas[playerAction] || { minCol: 0, maxCol: 0, minRow: 0, maxRow: 0 };

            let potentialMinCol = currentArea.minCol + playerDelta.minCol;
            let potentialMaxCol = currentArea.maxCol + playerDelta.maxCol;
            let potentialMinRow = currentArea.minRow + playerDelta.minRow;
            let potentialMaxRow = currentArea.maxRow + playerDelta.maxRow;

            if (potentialMinCol === 0 || potentialMaxCol === gridWidth + 1 ||
                potentialMinRow === 0 || potentialMaxRow === gridHeight + 1) {
                throw new GameTermination('NO');
            }

            const finalMinCol = Math.min(potentialMinCol + (trapEffect === 'R' ? 1 : 0), gridWidth);
            const finalMaxCol = Math.max(finalMinCol - (trapEffect === 'L' ? 1 : 0), 1);
            const finalMinRow = Math.min(finalMinCol + (trapEffect === 'D' ? 1 : 0), gridHeight);
            const finalMaxRow = Math.max(finalMinCol - (trapEffect === 'U' ? 1 : 0), 1);

            return {
                minCol: finalMinCol,
                maxCol: finalMaxCol,
                minRow: finalMinRow,
                maxRow: finalMaxRow
            };
        }, currentBoundary);

        console.log('YES');

    } catch (terminationSignal) {
        if (terminationSignal instanceof GameTermination) {
            console.log(terminationSignal.message);
        } else {
            throw terminationSignal;
        }
    }
};

processGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
