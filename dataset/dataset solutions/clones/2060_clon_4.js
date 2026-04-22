'use strict'

const executeProgram = (rawInputContent) => {
    const linesOfInput = rawInputContent.trim().split('\n');
    const dimensionsArray = linesOfInput[0].split(' ').map(Number);
    const rowsCount = dimensionsArray[0];
    const colsCount = dimensionsArray[1];

    const areaLayout = linesOfInput.slice(1, rowsCount + 1).map(singleLine =>
        singleLine.split('').map(character => character === '.' ? 1 : 0)
    );

    let currentMinObstacles = Infinity;

    // Recursive function to explore paths and find the minimum obstacles
    // yCoordinate: current row position
    // xCoordinate: current column position
    // verticalStepsToGo: number of 'down' moves remaining to reach the destination
    // horizontalStepsToGo: number of 'right' moves remaining to reach the destination
    // totalObstaclesEncountered: obstacles encountered *before* evaluating the current cell (y, x)
    const findShortestObstaclePath = (yCoordinate, xCoordinate, verticalStepsToGo, horizontalStepsToGo, totalObstaclesEncountered) => {
        // Calculate obstacles after including the current cell's status
        const obstaclesAfterCurrentSpot = totalObstaclesEncountered + (areaLayout[yCoordinate][xCoordinate] === 0 ? 1 : 0);

        // Pruning: if current path already has more obstacles than the best found, stop exploring this path
        if (obstaclesAfterCurrentSpot >= currentMinObstacles) {
            return;
        }

        // Base case: destination reached (no more vertical or horizontal steps needed)
        if (verticalStepsToGo === 0 && horizontalStepsToGo === 0) {
            currentMinObstacles = Math.min(currentMinObstacles, obstaclesAfterCurrentSpot);
            return;
        }

        // Recursive call for moving down, if vertical moves are still available
        if (verticalStepsToGo > 0) {
            findShortestObstaclePath(yCoordinate + 1, xCoordinate, verticalStepsToGo - 1, horizontalStepsToGo, obstaclesAfterCurrentSpot);
        }

        // Recursive call for moving right, if horizontal moves are still available
        if (horizontalStepsToGo > 0) {
            findShortestObstaclePath(yCoordinate, xCoordinate + 1, verticalStepsToGo, horizontalStepsToGo - 1, obstaclesAfterCurrentSpot);
        }
    };

    // Initial call to start pathfinding from the top-left corner (0,0)
    // The target destination is (rowsCount - 1, colsCount - 1).
    // So, we need (rowsCount - 1) 'down' movements and (colsCount - 1) 'right' movements.
    // The initial `totalObstaclesEncountered` is 0, as the first cell's obstacle status will be added inside the function.
    findShortestObstaclePath(0, 0, rowsCount - 1, colsCount - 1, 0);

    console.log(currentMinObstacles);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));