'use strict';

const generateMoveSequences = (verticalSteps, horizontalSteps) => {
    const pathCombinations = [];

    const buildPathRecursively = (currentPathSegment, remainingVertical, remainingHorizontal) => {
        if (remainingVertical === 0 && remainingHorizontal === 0) {
            pathCombinations.push(currentPathSegment);
            return;
        }

        if (remainingVertical > 0) {
            buildPathRecursively(currentPathSegment + '1', remainingVertical - 1, remainingHorizontal);
        }
        if (remainingHorizontal > 0) {
            buildPathRecursively(currentPathSegment + '0', remainingVertical, remainingHorizontal - 1);
        }
    };

    buildPathRecursively('', verticalSteps, horizontalSteps);
    return pathCombinations;
};

const processGridPaths = (inputPayload) => {
    const rawInputLines = inputPayload.trim().split('\n');
    const gridDimensions = rawInputLines[0].split(' ').map(Number);
    const gridHeight = gridDimensions[0];
    const gridWidth = gridDimensions[1];

    const mapGrid = rawInputLines.slice(1, gridHeight + 1).map(lineContent => {
        return lineContent.split('').slice(0, gridWidth).map(charValue => (charValue === '.') ? 1 : 0);
    });

    const verticalMovesRequired = gridHeight - 1;
    const horizontalMovesRequired = gridWidth - 1;

    const allPossiblePaths = generateMoveSequences(verticalMovesRequired, horizontalMovesRequired);

    let minWallEncounters = Infinity;

    allPossiblePaths.forEach(pathSequence => {
        const initialTraversalState = {
            currentCol: 0,
            currentRow: 0,
            pathWallCount: (mapGrid[0][0] === 0) ? 1 : 0
        };

        const finalTraversalState = pathSequence.split('').reduce((accumulator, moveInstruction) => {
            if (moveInstruction === '1') {
                accumulator.currentRow++;
            } else {
                accumulator.currentCol++;
            }
            if (mapGrid[accumulator.currentRow][accumulator.currentCol] === 0) {
                accumulator.pathWallCount++;
            }
            return accumulator;
        }, initialTraversalState);

        if (finalTraversalState.pathWallCount < minWallEncounters) {
            minWallEncounters = finalTraversalState.pathWallCount;
        }
    });

    console.log(minWallEncounters);
};

processGridPaths(require('fs').readFileSync('/dev/stdin', 'utf8'));
