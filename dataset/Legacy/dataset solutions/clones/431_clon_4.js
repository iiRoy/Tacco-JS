const slotFiller = (targetItem, gridState, currentIndex = 1) => {
    if (currentIndex >= gridState.length - 1) {
        return;
    }
    if (gridState[currentIndex] === 0) {
        gridState[currentIndex] = targetItem;
        return;
    }
    slotFiller(targetItem, gridState, currentIndex + 1);
};

const locateAndFillB = (gridState) => {
    const searchBackwards = (currentIdx) => {
        if (currentIdx < 1) {
            return false;
        }
        if (gridState[currentIdx] === 0 && gridState[currentIdx - 1] !== "A" && gridState[currentIdx + 1] !== "A") {
            gridState[currentIdx] = "B";
            return true;
        }
        return searchBackwards(currentIdx - 1);
    };

    if (!searchBackwards(gridState.length - 2)) {
        slotFiller("B", gridState);
    }
};

const insertAdjacentOrCentralC = (gridState, totalCells) => {
    const findAndPlaceAdjacent = (idx) => {
        if (idx >= gridState.length - 1) {
            return false;
        }
        if (gridState[idx] !== 0) {
            if (gridState[idx + 1] === 0) {
                gridState[idx + 1] = "C";
                return true;
            }
            if (gridState[idx - 1] === 0) {
                gridState[idx - 1] = "C";
                return true;
            }
        }
        return findAndPlaceAdjacent(idx + 1);
    };

    if (!findAndPlaceAdjacent(1)) {
        gridState[Math.floor(totalCells / 2) + 1] = "C";
    }
};

const calculateRadiusScore = (centerIdx, gridState) => {
    if (gridState[centerIdx] !== 0) return 0;

    let currentJLeft = centerIdx;
    let currentJRight = centerIdx;
    let currentScore = 0;

    while (true) {
        if (gridState[currentJLeft] !== "X") {
            currentJLeft--;
        }
        if (gridState[currentJRight] !== "X") {
            currentJRight++;
        }

        if (gridState[currentJLeft] === "X" && gridState[currentJRight] === "X") {
            break;
        }
        if (/[ABCD]/.test(gridState[currentJLeft]) || /[ABCD]/.test(gridState[currentJRight])) {
            break;
        }
        
        currentScore++;
    }
    return currentScore;
};

const strategicallyPlaceD = (gridState) => {
    let bestPlacement = [0, 0];

    for (let currentIdx = 1; currentIdx < gridState.length - 1; ++currentIdx) {
        if (gridState[currentIdx] === 0) {
            const currentScore = calculateRadiusScore(currentIdx, gridState);
            if (currentScore > bestPlacement[1]) {
                bestPlacement = [currentIdx, currentScore];
            }
        }
    }

    if (bestPlacement[1] !== 0) {
        gridState[bestPlacement[0]] = "D";
    } else {
        slotFiller("D", gridState);
    }
};

const processInputData = (rawInputContent) => {
    const inputLines = rawInputContent.trim().split("\n");
    let currentLineIndex = 0;

    const commandExecutors = {
        "A": (grid, cellCount) => slotFiller("A", grid),
        "B": (grid, cellCount) => locateAndFillB(grid),
        "C": (grid, cellCount) => insertAdjacentOrCentralC(grid, cellCount),
        "D": (grid, cellCount) => strategicallyPlaceD(grid)
    };

    const collectedOutputs = [];

    while (currentLineIndex < inputLines.length) {
        const currentDimensions = inputLines[currentLineIndex++].split(" ").map(Number);
        const cellCount = currentDimensions[0];
        const operationCount = currentDimensions[1];

        if (cellCount === 0 && operationCount === 0) {
            break;
        }

        const workingGrid = Array(cellCount).fill(0);
        workingGrid.unshift("X");
        workingGrid.push("X");

        for (let opCounter = 0; opCounter < operationCount; opCounter++) {
            const currentCommand = inputLines[currentLineIndex++];
            commandExecutors[currentCommand](workingGrid, cellCount);
        }

        workingGrid.shift();
        workingGrid.pop();
        collectedOutputs.push(workingGrid.join("").replace(/0/g, "#"));
    }
    return collectedOutputs;
};

const fileSystem = require('fs');
const rawInputSource = fileSystem.readFileSync('/dev/stdin', 'utf8');
const finalResults = processInputData(rawInputSource);
finalResults.forEach(resultLine => console.log(resultLine));