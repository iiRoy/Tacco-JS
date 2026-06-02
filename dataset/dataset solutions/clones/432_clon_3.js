const isCellOccupied = (cellValue) => {
    return /[ABCD]/.test(cellValue);
};

let dataArray = [];
let arraySize = 0;

function findAndPlaceFirstEmpty(charToPlace) {
    const arrayLengthExcludingBoundaries = dataArray.length - 1;
    let placementAttemptSuccessful = false;
    for (let currentIdx = 1; currentIdx < arrayLengthExcludingBoundaries; currentIdx++) {
        if (dataArray[currentIdx] === 0) {
            dataArray[currentIdx] = charToPlace;
            placementAttemptSuccessful = true;
            break;
        }
    }
    return placementAttemptSuccessful;
}

function handleOperationAlpha(charToUse) {
    findAndPlaceFirstEmpty(charToUse);
}

function handleOperationBeta() {
    const lastSearchableIndex = dataArray.length - 2;
    let itemPlaced = false;
    for (let currentIdx = lastSearchableIndex; currentIdx >= 1; currentIdx--) {
        const previousCellContent = dataArray[currentIdx - 1];
        const currentCellContent = dataArray[currentIdx];
        const nextCellContent = dataArray[currentIdx + 1];

        if (previousCellContent !== "A" && currentCellContent === 0 && nextCellContent !== "A") {
            dataArray[currentIdx] = "B";
            itemPlaced = true;
            break;
        }
    }
    if (!itemPlaced) {
        handleOperationAlpha("B");
    }
}

function handleOperationGamma() {
    const arrayBoundaryIndex = dataArray.length - 1;
    let itemPlaced = false;
    for (let currentIdx = 1; currentIdx < arrayBoundaryIndex; currentIdx++) {
        const currentCellContent = dataArray[currentIdx];
        const nextCellContent = dataArray[currentIdx + 1];
        const previousCellContent = dataArray[currentIdx - 1];

        if (currentCellContent !== 0 && nextCellContent === 0) {
            dataArray[currentIdx + 1] = "C";
            itemPlaced = true;
            break;
        }
        if (currentCellContent !== 0 && previousCellContent === 0) {
            dataArray[currentIdx - 1] = "C";
            itemPlaced = true;
            break;
        }
    }

    if (!itemPlaced) {
        const calculateMiddlePlacementIndex = (size) => {
            return (size % 2 === 1) ? Math.floor((size - 1) / 2) + 1 : Math.floor(size / 2) + 1;
        };
        const targetIndex = calculateMiddlePlacementIndex(arraySize);
        dataArray[targetIndex] = "C";
    }
}

function handleOperationDelta() {
    let optimalPlacement = { index: 0, maxExpansionDistance: 0 };
    const arrayBoundaryIndex = dataArray.length - 1;

    for (let currentIdx = 1; currentIdx < arrayBoundaryIndex; currentIdx++) {
        if (dataArray[currentIdx] !== 0) {
            continue;
        }

        let leftPointer = currentIdx;
        let rightPointer = currentIdx;
        let currentExpansionRadius = 0;

        while (true) {
            if (dataArray[leftPointer] !== "X") {
                leftPointer--;
            }
            if (dataArray[rightPointer] !== "X") {
                rightPointer++;
            }

            const valueAtLeftPointer = dataArray[leftPointer];
            const valueAtRightPointer = dataArray[rightPointer];

            if (valueAtLeftPointer === "X" && valueAtRightPointer === "X") {
                break;
            }
            if (isCellOccupied(valueAtLeftPointer) || isCellOccupied(valueAtRightPointer)) {
                break;
            }

            currentExpansionRadius++;

            if (optimalPlacement.maxExpansionDistance < currentExpansionRadius) {
                optimalPlacement.index = currentIdx;
                optimalPlacement.maxExpansionDistance = currentExpansionRadius;
            }
        }
    }

    if (optimalPlacement.maxExpansionDistance !== 0) {
        dataArray[optimalPlacement.index] = "D";
    } else {
        handleOperationAlpha("D");
    }
}

const fileSystemModule = require('fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split("\n");

const operationDispatchMap = {
    "A": () => handleOperationAlpha("A"),
    "B": handleOperationBeta,
    "C": handleOperationGamma,
    "D": handleOperationDelta
};

const initializePaddedArray = (size) => {
    const newArray = [];
    for (let k = 0; k < size; k++) {
        newArray.push(0);
    }
    newArray.unshift("X");
    newArray.push("X");
    return newArray;
};

const formatFinalOutput = (processedArray) => {
    const contentWithoutBoundaries = processedArray.slice(1, processedArray.length - 1);
    return contentWithoutBoundaries.join("").replace(/0/g, "#");
};

while (true) {
    const dimensionAndOperations = inputLines.shift().split(" ").map(Number);
    arraySize = dimensionAndOperations[0];
    const numberOfOperations = dimensionAndOperations[1];

    if (arraySize === 0 && numberOfOperations === 0) {
        break;
    }

    dataArray = initializePaddedArray(arraySize);

    for (let opCounter = 0; opCounter < numberOfOperations; opCounter++) {
        const currentOperationType = inputLines.shift();
        const handlerFunction = operationDispatchMap[currentOperationType];
        if (handlerFunction) {
            handlerFunction();
        }
    }

    console.log(formatFinalOutput(dataArray));
}
