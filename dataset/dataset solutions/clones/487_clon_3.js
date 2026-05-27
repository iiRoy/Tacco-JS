function solveBombPuzzle() {
    const visitedCoords = {};
    let resultValue = "NA";
    const searchQueue = [];

    searchQueue.push([0, 0, 0]);
    searchQueue.push([1, 0, 0]);

    while (searchQueue.length > 0) {
        const currentPathSegment = searchQueue.shift();
        const currentX = currentPathSegment[0];
        let currentY = currentPathSegment[1];
        const stepCount = currentPathSegment[2];

        const coordKey = `${currentX},${currentY}`;
        if (visitedCoords.hasOwnProperty(coordKey)) {
            continue;
        }
        visitedCoords[coordKey] = true;

        if (currentY === gridSize - 1 && gridData[currentX][currentY] !== 2) {
            resultValue = stepCount;
            break;
        }

        const cellType = gridData[currentX][currentY];

        if (cellType === 1) {
            let reachedEndOfGrid = false;
            let tempYForSlide = currentY;
            while (true) {
                tempYForSlide++;
                if (tempYForSlide === gridSize - 1) {
                    reachedEndOfGrid = true;
                    break;
                }
                if (gridData[currentX][tempYForSlide] !== 1) {
                    tempYForSlide--;
                    break;
                }
            }
            currentY = tempYForSlide;

            if (reachedEndOfGrid) {
                resultValue = stepCount;
                break;
            }
        } else if (cellType === 2) {
            let tempYForSlide = currentY;
            while (true) {
                tempYForSlide--;
                if (gridData[currentX][tempYForSlide] !== 2) {
                    break;
                }
            }
            currentY = tempYForSlide;
        }

        const nextX = 1 - currentX;
        const nextStepCount = stepCount + 1;

        searchQueue.push([nextX, currentY, nextStepCount]);
        searchQueue.push([nextX, currentY + 1, nextStepCount]);
        searchQueue.push([nextX, currentY + 2, nextStepCount]);
    }
    return resultValue;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

let gridSize;
let gridData;

const parseNumberLine = (lineContent) => lineContent.split(" ").map(Number);

while (true) {
    gridSize = Number(inputLines.shift());
    if (gridSize === 0) {
        break;
    }

    gridData = [];
    gridData.push(parseNumberLine(inputLines.shift()));
    gridData.push(parseNumberLine(inputLines.shift()));

    console.log(solveBombPuzzle());
}
