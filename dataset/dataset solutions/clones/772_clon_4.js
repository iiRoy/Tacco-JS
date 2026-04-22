const motionMappings = new Map([
    ['N', { deltaX: 0, deltaY: 1 }],
    ['S', { deltaX: 0, deltaY: -1 }],
    ['E', { deltaX: 1, deltaY: 0 }],
    ['W', { deltaX: -1, deltaY: 0 }]
]);

const stringifyCoords = (c_x, c_y) => `${c_x},${c_y}`;

function processPuzzleInput(rawPuzzleData) {
    const puzzleLines = rawPuzzleData.split('\n');
    let currentLineIndex = 0;
    const finalResults = [];

    while (true) {
        const itemsToCollectCount = Number(puzzleLines[currentLineIndex++]);

        if (itemsToCollectCount === 0) {
            break;
        }

        const initialGatheringPoints = new Set();
        for (let i = 0; i < itemsToCollectCount; i++) {
            const [xCoord, yCoord] = puzzleLines[currentLineIndex++].split(' ').map(Number);
            initialGatheringPoints.add(stringifyCoords(xCoord, yCoord));
        }

        const movementCommandCount = Number(puzzleLines[currentLineIndex++]);
        const movementCommands = [];
        for (let i = 0; i < movementCommandCount; i++) {
            const [directionIdentifier, distanceValue] = puzzleLines[currentLineIndex++].split(' ');
            movementCommands.push({
                direction: directionIdentifier,
                distance: Number(distanceValue)
            });
        }

        const startingPosition = { x: 10, y: 10 };

        const allVisitedCoordinates = movementCommands.reduce((pathAccumulator, currentInstruction) => {
            const lastPoint = pathAccumulator[pathAccumulator.length - 1];
            let currentX = lastPoint.x;
            let currentY = lastPoint.y;
            const { deltaX, deltaY } = motionMappings.get(currentInstruction.direction);

            const segmentPoints = Array.from({ length: currentInstruction.distance }, () => {
                currentX += deltaX;
                currentY += deltaY;
                return { x: currentX, y: currentY };
            });
            return pathAccumulator.concat(segmentPoints);
        }, [{ x: startingPosition.x, y: startingPosition.y }]);

        const collectionState = allVisitedCoordinates.reduce((state, currentPoint) => {
            const pointKey = stringifyCoords(currentPoint.x, currentPoint.y);
            if (state.remainingItems.has(pointKey)) {
                state.remainingItems.delete(pointKey);
                state.collectedCount++;
            }
            return state;
        }, {
            collectedCount: 0,
            remainingItems: new Set(initialGatheringPoints)
        });

        finalResults.push(collectionState.collectedCount === itemsToCollectCount ? "Yes" : "No");
    }

    console.log(finalResults.join('\n'));
}

processPuzzleInput(require("fs").readFileSync("/dev/stdin","utf8"));