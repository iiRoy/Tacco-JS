'use strict';

const processGrid = inputContent => {
    const rawLines = inputContent.trim().split('\n');
    const gridDimensions = rawLines[0].split(' ').map(Number);
    const rawGridData = rawLines.slice(1, gridDimensions[0] + 1);

    const obstacleMap = rawGridData.map(rowString =>
        rowString.slice(0, gridDimensions[1]).split('').map(cellChar => cellChar === '#')
    );

    const targetRowIndex = gridDimensions[0] - 1;
    const targetColIndex = gridDimensions[1] - 1;

    let minObstacleCount = Infinity;

    const pathExplorer = (currentRow, currentCol, currentPathObstacles) => {
        let obstaclesIncludingCurrent = currentPathObstacles;

        if (obstacleMap[currentRow][currentCol]) {
            obstaclesIncludingCurrent++;
        }

        if (obstaclesIncludingCurrent >= minObstacleCount) {
            return;
        }

        if (currentRow === targetRowIndex && currentCol === targetColIndex) {
            minObstacleCount = obstaclesIncludingCurrent;
            return;
        }

        if (currentCol < targetColIndex) {
            pathExplorer(currentRow, currentCol + 1, obstaclesIncludingCurrent);
        }

        if (currentRow < targetRowIndex) {
            pathExplorer(currentRow + 1, currentCol, obstaclesIncludingCurrent);
        }
    };

    pathExplorer(0, 0, 0);

    console.log(minObstacleCount);
};

processGrid(require('fs').readFileSync('/dev/stdin', 'utf8'));
