'use strict';

const countSetBits = (binaryString) => (binaryString.match(/1/g) || []).length;

const generatePathPatterns = (startBinaryStr, endBinaryStr) => {
    const targetOneCount = countSetBits(startBinaryStr);
    const startValue = parseInt(startBinaryStr, 2);
    const endValue = parseInt(endBinaryStr, 2);
    const patternsList = [];
    const requiredLength = endBinaryStr.length;
    
    for (let currentNum = startValue; currentNum <= endValue; currentNum++) {
        const currentBinaryRepresentation = currentNum.toString(2);
        if (countSetBits(currentBinaryRepresentation) !== targetOneCount) {
            continue;
        }
        const paddedBinaryRepresentation = currentBinaryRepresentation.padStart(requiredLength, '0');
        patternsList.push(paddedBinaryRepresentation);
    }
    return patternsList;
};

const parseGridInput = (rawData) => {
    const lines = rawData.trim().split('\n');
    const [gridHeight, gridWidth] = lines[0].split(' ').map(Number);
    const gridRows = lines.slice(1, 1 + gridHeight);
    const processedGridData = gridRows.map(row => row.slice(0, gridWidth));
    return { gridHeight, gridWidth, processedGridData };
};

const findMinimumObstacles = (gridHeight, gridWidth, processedGridData) => {
    let minimumObstacleCount = Infinity;

    const targetRowIndex = gridHeight - 1;
    const targetColIndex = gridWidth - 1;

    const minPathSequence = '0'.repeat(targetColIndex) + '1'.repeat(targetRowIndex);
    const maxPathSequence = '1'.repeat(targetRowIndex) + '0'.repeat(targetColIndex);

    const allPossiblePathPatterns = generatePathPatterns(minPathSequence, maxPathSequence);

    const isObstacleCell = (y, x) => processedGridData[y][x] === '#';

    for (const pathPattern of allPossiblePathPatterns) {
        let currentPathObstacles = 0;
        let currentXPosition = 0;
        let currentYPosition = 0;

        if (isObstacleCell(currentYPosition, currentXPosition)) {
            currentPathObstacles++;
        }

        if (currentPathObstacles >= minimumObstacleCount) {
            continue;
        }

        for (const moveDirection of pathPattern) {
            if (moveDirection === '1') {
                currentYPosition++;
            } else {
                currentXPosition++;
            }

            if (isObstacleCell(currentYPosition, currentXPosition)) {
                currentPathObstacles++;
                if (currentPathObstacles >= minimumObstacleCount) {
                    break;
                }
            }
        }

        if (currentPathObstacles < minimumObstacleCount) {
            minimumObstacleCount = currentPathObstacles;
            if (minimumObstacleCount === 0) {
                break;
            }
        }
    }
    return minimumObstacleCount;
};

const main = (inputArgument) => {
    const { gridHeight, gridWidth, processedGridData } = parseGridInput(inputArgument);
    const finalResult = findMinimumObstacles(gridHeight, gridWidth, processedGridData);
    console.log(finalResult);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
