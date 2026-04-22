const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const linesBuffer = sourceData.split('\n').filter(Boolean);

let cursor = 0;

const extractNextSection = () => {
    if (cursor >= linesBuffer.length) {
        return null;
    }
    return linesBuffer[cursor++];
};

const processedOutput = [];

while (true) {
    const dimensionDesignation = extractNextSection();
    if (!dimensionDesignation) {
        break;
    }

    const indicatorChar = dimensionDesignation[1];
    if (indicatorChar === undefined) {
        break;
    }

    const gridRowsCount = parseInt(indicatorChar);

    let currentMatrix = [];
    if (!isNaN(gridRowsCount) && gridRowsCount > 0) {
        for (let rowIter = 0; rowIter < gridRowsCount; rowIter++) {
            const mapRow = extractNextSection();
            if (!mapRow) {
                break;
            }
            currentMatrix.push(mapRow.split('').map(Number));
        }
    }

    const mapHeight = currentMatrix.length;
    const mapWidth = currentMatrix[0].length;

    let componentAccumulator = 0;

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    const exploreComponent = (initialY, initialX, workingMap) => {
        const explorationQueue = [[initialY, initialX]];
        workingMap[initialY][initialX] = 0;

        while (explorationQueue.length > 0) {
            const [currentY, currentX] = explorationQueue.shift();

            for (const [dy, dx] of directions) {
                const nextY = currentY + dy;
                const nextX = currentX + dx;

                if (nextY >= 0 && nextY < mapHeight &&
                    nextX >= 0 && nextX < mapWidth &&
                    workingMap[nextY][nextX] === 1) {
                    workingMap[nextY][nextX] = 0;
                    explorationQueue.push([nextY, nextX]);
                }
            }
        }
    };

    for (let yCoord = 0; yCoord < mapHeight; yCoord++) {
        for (let xCoord = 0; xCoord < mapWidth; xCoord++) {
            if (currentMatrix[yCoord][xCoord] === 1) {
                componentAccumulator++;
                exploreComponent(yCoord, xCoord, currentMatrix);
            }
        }
    }
    processedOutput.push(componentAccumulator);
}

processedOutput.forEach(value => console.log(value));