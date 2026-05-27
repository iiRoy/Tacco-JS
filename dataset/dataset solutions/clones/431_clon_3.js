function findAndFillFirstZero(valueToInsert) {
    const lastValidIndex = currentGrid.length - 1;
    for (let idx = 1; idx < lastValidIndex; idx++) {
        if (currentGrid[idx] === 0) {
            currentGrid[idx] = valueToInsert;
            return;
        }
    }
}

function attemptPlaceB() {
    const secondToLastIndex = currentGrid.length - 2;
    for (let currentIdx = secondToLastIndex; currentIdx >= 1; currentIdx--) {
        const prevElement = currentGrid[currentIdx - 1];
        const currentElement = currentGrid[currentIdx];
        const nextElement = currentGrid[currentIdx + 1];

        const isPrevNotA = (prevElement !== "A");
        const isCurrentZero = (currentElement === 0);
        const isNextNotA = (nextElement !== "A");

        if (isPrevNotA && isCurrentZero && isNextNotA) {
            currentGrid[currentIdx] = "B";
            return;
        }
    }
    findAndFillFirstZero("B");
}

function executePlaceC() {
    const boundary = currentGrid.length - 1;
    let placed = false;
    for (let scanIdx = 1; scanIdx < boundary; scanIdx++) {
        const currentVal = currentGrid[scanIdx];
        const nextVal = currentGrid[scanIdx + 1];
        const prevVal = currentGrid[scanIdx - 1];

        if (currentVal !== 0 && nextVal === 0) {
            currentGrid[scanIdx + 1] = "C";
            placed = true;
            break;
        }
        if (currentVal !== 0 && prevVal === 0) {
            currentGrid[scanIdx - 1] = "C";
            placed = true;
            break;
        }
    }

    if (!placed) {
        const targetIndex = Math.floor(gridSize / 2) + 1;
        currentGrid[targetIndex] = "C";
    }
}

function processAndPlaceD() {
    let bestSpot = [0, 0];
    const gridEnd = currentGrid.length - 1;

    for (let currentPos = 1; currentPos < gridEnd; currentPos++) {
        if (currentGrid[currentPos] !== 0) {
            continue;
        }

        let leftPtr = currentPos;
        let rightPtr = currentPos;
        let currentCount = 0;

        let searchActive = true;
        while (searchActive) {
            if (currentGrid[leftPtr] !== "X") {
                leftPtr--;
            }
            if (currentGrid[rightPtr] !== "X") {
                rightPtr++;
            }

            const leftIsBoundary = (currentGrid[leftPtr] === "X");
            const rightIsBoundary = (currentGrid[rightPtr] === "X");
            if (leftIsBoundary && rightIsBoundary) {
                searchActive = false;
                continue;
            }

            const leftHasOccupant = /[ABCD]/.test(currentGrid[leftPtr]);
            const rightHasOccupant = /[ABCD]/.test(currentGrid[rightPtr]);
            if (leftHasOccupant || rightHasOccupant) {
                searchActive = false;
                continue;
            }

            currentCount++;
            if (bestSpot[1] < currentCount) {
                bestSpot = [currentPos, currentCount];
            }
        }
    }

    if (bestSpot[1] !== 0) {
        currentGrid[bestSpot[0]] = "D";
        return;
    }
    findAndFillFirstZero("D");
}

const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

let gridSize = 0;
let operationsCount = 0;
let currentGrid = [];

while (true) {
    const dimensionsString = inputLines.shift();
    const dimensions = dimensionsString.split(" ").map(Number);
    gridSize = dimensions[0];
    operationsCount = dimensions[1];

    if (gridSize === 0 && operationsCount === 0) {
        break;
    }

    currentGrid = ["X", ...Array(gridSize).fill(0), "X"];

    for (let opIdx = 0; opIdx < operationsCount; opIdx++) {
        const operationType = inputLines.shift();

        switch (operationType) {
            case "A":
                findAndFillFirstZero("A");
                break;
            case "B":
                attemptPlaceB();
                break;
            case "C":
                executePlaceC();
                break;
            case "D":
                processAndPlaceD();
                break;
        }
    }

    const finalGridContent = currentGrid.slice(1, -1);

    console.log(finalGridContent.join("").replace(/0/g, "#"));
}
