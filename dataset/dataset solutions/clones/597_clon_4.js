class CustomQueue {
    constructor() {
        this.storage = [];
        this.front = 0;
    }

    add(item) {
        this.storage.push(item);
    }

    remove() {
        if (this.front < this.storage.length) {
            const item = this.storage[this.front];
            this.front++;
            return item;
        }
        return undefined;
    }

    peek() {
        if (this.front < this.storage.length) {
            return this.storage[this.front];
        }
        return undefined;
    }

    isEmpty() {
        return this.front >= this.storage.length;
    }

    size() {
        return this.storage.length - this.front;
    }
}

function deepCloneArray(arr) {
    return JSON.parse(JSON.stringify(arr));
}

function navigateMaze(startColumn, startRow, initialMapGrid, maxCollectibles, dimensions) {
    const movementDirections = [
        { dr: -1, dc: 0 }, // Up
        { dr: 0, dc: -1 }, // Left
        { dr: 0, dc: 1 },  // Right
        { dr: 1, dc: 0 }   // Down
    ];
    const width = dimensions[1];
    const height = dimensions[0];

    let minimumSteps = -1;

    const startingMapState = deepCloneArray(initialMapGrid);
    startingMapState[startRow][startColumn] = ".";

    const explorationQueue = new CustomQueue();
    const visitedConfigurations = new Map();

    const initialConfigurationKey = `${startColumn}:${startRow}:${1}:${JSON.stringify(startingMapState)}`;
    visitedConfigurations.set(initialConfigurationKey, true);
    explorationQueue.add({
        currentR: startRow,
        currentC: startColumn,
        currentCost: 0,
        nextObjective: 1,
        currentGrid: startingMapState
    });

    while (!explorationQueue.isEmpty()) {
        const currentExploration = explorationQueue.remove();

        const {
            currentR,
            currentC,
            currentCost,
            nextObjective,
            currentGrid
        } = currentExploration;

        if (nextObjective === maxCollectibles + 1) {
            minimumSteps = currentCost;
            break;
        }

        movementDirections.forEach(direction => {
            const neighborR = currentR + direction.dr;
            const neighborC = currentC + direction.dc;
            let newObjective = nextObjective;

            if (neighborR < 0 || neighborR >= height || neighborC < 0 || neighborC >= width) {
                return;
            }

            if (currentGrid[neighborR][neighborC] === "X") {
                return;
            }

            const nextGridState = deepCloneArray(currentGrid);

            if (nextGridState[neighborR][neighborC] === String(newObjective)) {
                newObjective++;
                nextGridState[neighborR][neighborC] = ".";
            }

            const nextConfigurationKey = `${neighborC}:${neighborR}:${newObjective}:${JSON.stringify(nextGridState)}`;

            if (!visitedConfigurations.has(nextConfigurationKey)) {
                visitedConfigurations.set(nextConfigurationKey, true);
                explorationQueue.add({
                    currentR: neighborR,
                    currentC: neighborC,
                    currentCost: currentCost + 1,
                    nextObjective: newObjective,
                    currentGrid: nextGridState
                });
            }
        });
    }

    return minimumSteps;
}

const rawDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawDataContent.trim().split("\n");

const gridInfo = lineSegments.shift().split(" ").map(Number);
const maxCollectibles = gridInfo[2];

const initialMapGrid = [];
let entryPoint = [];

for (let rIdx = 0; rIdx < gridInfo[0]; rIdx++) {
    const rowContent = lineSegments.shift().split("");
    const startColIdx = rowContent.indexOf("S");
    if (startColIdx !== -1) {
        entryPoint = [startColIdx, rIdx];
    }
    initialMapGrid.push(rowContent);
}

const finalResult = navigateMaze(entryPoint[0], entryPoint[1], initialMapGrid, maxCollectibles, gridInfo);
console.log(finalResult);