'use strict';

function processGame(inputData) {
    const dataSegments = inputData.split(/\s+/);

    const gridHeight = Number(dataSegments.shift());
    const gridWidth = Number(dataSegments.shift());
    const totalSteps = Number(dataSegments.shift());
    const initialRow = Number(dataSegments.shift());
    const initialColumn = Number(dataSegments.shift());
    const playerPath = dataSegments.shift();
    const foePath = dataSegments.shift();

    const startingRegion = {
        minColumn: initialColumn,
        maxColumn: initialColumn,
        minRow: initialRow,
        maxRow: initialRow
    };

    const finalOutcome = Array.from({ length: totalSteps }).reduce((currentProgress, _, stepIdentifier) => {
        if (!currentProgress.canContinue) {
            return currentProgress;
        }

        const currentBoundary = currentProgress.currentBoundary;
        const playerAction = playerPath[stepIdentifier];
        const foeAction = foePath[stepIdentifier];

        let nextMinColumn = currentBoundary.minColumn;
        let nextMaxColumn = currentBoundary.maxColumn;
        let nextMinRow = currentBoundary.minRow;
        let nextMaxRow = currentBoundary.maxRow;

        switch (playerAction) {
            case 'L':
                nextMinColumn--;
                break;
            case 'R':
                nextMaxColumn++;
                break;
            case 'U':
                nextMinRow--;
                break;
            case 'D':
                nextMaxRow++;
                break;
        }

        if (nextMinColumn === 0 || nextMaxColumn === gridWidth + 1 || nextMinRow === 0 || nextMaxRow === gridHeight + 1) {
            return { currentBoundary: null, canContinue: false };
        }

        nextMinColumn = Math.min(nextMinColumn + (foeAction === 'R' ? 1 : 0), gridWidth);
        nextMaxColumn = Math.max(nextMaxColumn - (foeAction === 'L' ? 1 : 0), 1);
        nextMinRow = Math.min(nextMinRow + (foeAction === 'D' ? 1 : 0), gridHeight);
        nextMaxRow = Math.max(nextMaxRow - (foeAction === 'U' ? 1 : 0), 1);

        return {
            currentBoundary: {
                minColumn: nextMinColumn,
                maxColumn: nextMaxColumn,
                minRow: nextMinRow,
                maxRow: nextMaxRow
            },
            canContinue: true
        };

    }, { currentBoundary: startingRegion, canContinue: true });

    if (finalOutcome.canContinue) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

processGame(require('fs').readFileSync('/dev/stdin', 'utf8'));
