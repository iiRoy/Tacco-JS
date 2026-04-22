const solveGridPath = (dimensionSize, mazeLayout) => {
    let pathHistory = new Set();
    let minSteps = "NO_SOLUTION_FOUND";

    let currentIterationStates = new Map();
    currentIterationStates.set("0_0", 0);
    currentIterationStates.set("1_0", 0);

    pathHistory.add("0_0");
    pathHistory.add("1_0");

    while (currentIterationStates.size > 0) {
        let nextIterationStates = new Map();

        for (const [positionKey, currentPathCost] of currentIterationStates.entries()) {
            const [currentR, currentC] = positionKey.split('_').map(Number);

            if (currentC === dimensionSize - 1 && mazeLayout[currentR][currentC] !== 2) {
                minSteps = currentPathCost;
                return minSteps;
            }

            let modifiedCol = currentC;
            const cellKind = mazeLayout[currentR][modifiedCol];

            if (cellKind === 1) {
                let tempScanCol = modifiedCol;
                while (true) {
                    tempScanCol++;
                    if (tempScanCol === dimensionSize - 1) {
                        minSteps = currentPathCost;
                        return minSteps;
                    }
                    if (tempScanCol >= dimensionSize || mazeLayout[currentR][tempScanCol] !== 1) {
                        tempScanCol--;
                        break;
                    }
                }
                modifiedCol = tempScanCol;
            } else if (cellKind === 2) {
                let tempScanCol = modifiedCol;
                while (true) {
                    tempScanCol--;
                    if (tempScanCol < 0 || mazeLayout[currentR][tempScanCol] !== 2) {
                        break;
                    }
                }
                modifiedCol = tempScanCol;
            }

            for (let offset = 0; offset <= 2; offset++) {
                const nextR = 1 - currentR;
                const nextC = modifiedCol + offset;
                const nextPositionKey = `${nextR}_${nextC}`;

                if (nextC >= 0 && nextC < dimensionSize) {
                    if (!pathHistory.has(nextPositionKey)) {
                        nextIterationStates.set(nextPositionKey, currentPathCost + 1);
                        pathHistory.add(nextPositionKey);
                    }
                }
            }
        }
        currentIterationStates = nextIterationStates;
    }

    return minSteps;
};

const fileSystem = require('node:fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputContent.trim().split("\n");

while (true) {
    let currentDimension = parseInt(inputLines.shift(), 10);
    if (currentDimension === 0) {
        break;
    }

    let currentMaze = [];
    currentMaze[0] = inputLines.shift().split(" ").map(Number);
    currentMaze[1] = inputLines.shift().split(" ").map(Number);

    console.log(solveGridPath(currentDimension, currentMaze));
}