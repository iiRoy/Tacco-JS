function findShortestPath(levelMap, gridDimension) {
    const visitedStates = new Map();
    let resultSteps = "NA";
    const pathQueue = [];

    pathQueue.push({ r: 0, c: 0, s: 0 });
    pathQueue.push({ r: 1, c: 0, s: 0 });

    while (pathQueue.length > 0) {
        const { r: currentRow, c: currentCol, s: currentSteps } = pathQueue.shift();
        const stateKey = `${currentRow},${currentCol}`;

        if (visitedStates.has(stateKey)) {
            continue;
        }
        visitedStates.set(stateKey, true);

        if (currentCol === gridDimension - 1 && levelMap[currentRow][currentCol] !== 2) {
            resultSteps = currentSteps;
            break;
        }

        let effectiveCol = currentCol;
        const cellValue = levelMap[currentRow][currentCol];

        if (cellValue === 1) {
            let slideColumn = currentCol;
            let reachedGridBoundary = false;
            while (true) {
                slideColumn++;
                if (slideColumn === gridDimension) {
                    reachedGridBoundary = true;
                    slideColumn = gridDimension - 1;
                    break;
                }
                if (levelMap[currentRow][slideColumn] !== 1) {
                    slideColumn--;
                    break;
                }
            }
            if (reachedGridBoundary) {
                resultSteps = currentSteps;
                break;
            }
            effectiveCol = slideColumn;
        } else if (cellValue === 2) {
            let slideColumn = currentCol;
            while (true) {
                slideColumn--;
                if (slideColumn < 0 || levelMap[currentRow][slideColumn] !== 2) {
                    break;
                }
            }
            effectiveCol = slideColumn;
        }

        [0, 1, 2].forEach(offset => {
            pathQueue.push({ r: 1 - currentRow, c: effectiveCol + offset, s: currentSteps + 1 });
        });
    }
    return resultSteps;
}

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputData.trim().split("\n");

let segmentIndex = 0;
while (true) {
    const currentDimension = Number(lineSegments[segmentIndex++]);
    if (currentDimension === 0) {
        break;
    }

    const currentLevelMap = [];
    currentLevelMap[0] = lineSegments[segmentIndex++].split(" ").map(Number);
    currentLevelMap[1] = lineSegments[segmentIndex++].split(" ").map(Number);

    console.log(findShortestPath(currentLevelMap, currentDimension));
}
