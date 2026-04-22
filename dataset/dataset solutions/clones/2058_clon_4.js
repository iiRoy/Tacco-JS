'use strict'

const performCalculation = (inputData) => {
    const rawLines = inputData.trim().split('\n');
    const pathDimensions = rawLines[0].split(' ').map(Number);
    const gridHeight = pathDimensions[0];
    const gridWidth = pathDimensions[1];

    const terrainLayout = rawLines.slice(1, gridHeight + 1).map(lineSegment =>
        lineSegment.split('').map(charToken => charToken === '#')
    );

    const verticalMoveCount = gridHeight - 1;
    const horizontalMoveCount = gridWidth - 1;

    const allSequences = [];

    const recurseForMoves = (
        downMovesRemaining,
        rightMovesRemaining,
        currentPathString
    ) => {
        if (downMovesRemaining === 0 && rightMovesRemaining === 0) {
            allSequences.push(currentPathString);
            return;
        }

        if (downMovesRemaining > 0) {
            recurseForMoves(
                downMovesRemaining - 1,
                rightMovesRemaining,
                currentPathString + '1'
            );
        }

        if (rightMovesRemaining > 0) {
            recurseForMoves(
                downMovesRemaining,
                rightMovesRemaining - 1,
                currentPathString + '0'
            );
        }
    };

    recurseForMoves(verticalMoveCount, horizontalMoveCount, '');

    let leastObstacles = Infinity;

    for (const pathSequence of allSequences) {
        let currentObstaclesForPath = 0;
        let currentPathY = 0;
        let currentPathX = 0;
        let pathAbortedDueToHighObstacles = false;

        if (terrainLayout[0][0]) {
            currentObstaclesForPath = 1;
        }

        for (const singleMove of pathSequence) {
            if (singleMove === '1') {
                currentPathY++;
            } else {
                currentPathX++;
            }

            if (terrainLayout[currentPathY][currentPathX]) {
                currentObstaclesForPath++;
                if (currentObstaclesForPath >= leastObstacles) {
                    pathAbortedDueToHighObstacles = true;
                    break;
                }
            }
        }

        if (!pathAbortedDueToHighObstacles && currentObstaclesForPath < leastObstacles) {
            leastObstacles = currentObstaclesForPath;
            if (leastObstacles === 0) {
                break;
            }
        }
    }

    console.log(leastObstacles);
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));