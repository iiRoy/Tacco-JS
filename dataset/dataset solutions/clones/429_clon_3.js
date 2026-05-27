function findAndMarkA(workingArray) {
    for (let idx = 1; idx < workingArray.length - 1; idx++) {
        if (workingArray[idx] === 0) {
            workingArray[idx] = "A";
            return;
        }
    }
}

function findAndMarkB(workingArray) {
    for (let idx = workingArray.length - 2; idx >= 1; idx--) {
        const previousValue = workingArray[idx - 1];
        const currentValue = workingArray[idx];
        const nextValue = workingArray[idx + 1];

        if (previousValue !== "A" && currentValue === 0 && nextValue !== "A") {
            workingArray[idx] = "B";
            return;
        }
    }
    for (let idx = 1; idx < workingArray.length - 1; idx++) {
        if (workingArray[idx] === 0) {
            workingArray[idx] = "B";
            return;
        }
    }
}

function findAndMarkC(workingArray, originalArrayLength) {
    for (let idx = 1; idx < workingArray.length - 1; idx++) {
        const currentElement = workingArray[idx];
        const nextElement = workingArray[idx + 1];
        const previousElement = workingArray[idx - 1];

        if (currentElement !== 0 && nextElement === 0) {
            workingArray[idx + 1] = "C";
            return;
        }
        if (currentElement !== 0 && previousElement === 0) {
            workingArray[idx - 1] = "C";
            return;
        }
    }
    const targetIndex = Math.floor(originalArrayLength / 2) + 1;
    workingArray[targetIndex] = "C";
}

function findAndMarkD(workingArray) {
    let longestZeroBlockInfo = { index: 0, length: 0 };

    for (let centerIndex = 1; centerIndex < workingArray.length - 1; centerIndex++) {
        if (workingArray[centerIndex] !== 0) {
            continue;
        }

        let leftScanPointer = centerIndex;
        let rightScanPointer = centerIndex;
        let currentExpansionCount = 0;

        while (true) {
            if (workingArray[leftScanPointer] !== "X") {
                leftScanPointer--;
            }
            if (workingArray[rightScanPointer] !== "X") {
                rightScanPointer++;
            }

            if (workingArray[leftScanPointer] === "X" && workingArray[rightScanPointer] === "X") {
                break;
            }
            if (workingArray[leftScanPointer] !== "X" && workingArray[leftScanPointer] !== 0) {
                break;
            }
            if (workingArray[rightScanPointer] !== "X" && workingArray[rightScanPointer] !== 0) {
                break;
            }

            currentExpansionCount++;
            if (longestZeroBlockInfo.length < currentExpansionCount) {
                longestZeroBlockInfo = { index: centerIndex, length: currentExpansionCount };
            }
        }
    }

    if (longestZeroBlockInfo.index !== 0 && longestZeroBlockInfo.length !== 0) {
        workingArray[longestZeroBlockInfo.index] = "D";
        return;
    }

    for (let idx = 1; idx < workingArray.length - 1; idx++) {
        if (workingArray[idx] === 0) {
            workingArray[idx] = "D";
            return;
        }
    }
}

function formatAndPrintProcessedArray(processedArray) {
    processedArray.shift();
    processedArray.pop();
    console.log(processedArray.join("").replace(/0/g, "#"));
}

const operationDispatchMap = {
    "A": findAndMarkA,
    "B": findAndMarkB,
    "C": findAndMarkC,
    "D": findAndMarkD
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allInputLines = fileContent.trim().split("\n");

let currentLineIndex = 0;

while (true) {
    const currentDimensionsLine = allInputLines[currentLineIndex++];
    const [arraySize, numberOfOperations] = currentDimensionsLine.split(" ").map(Number);

    if (arraySize === 0 && numberOfOperations === 0) {
        break;
    }

    let dataArray = ["X", ...Array(arraySize).fill(0), "X"];

    for (let opCounter = 0; opCounter < numberOfOperations; opCounter++) {
        const operationKey = allInputLines[currentLineIndex++];
        const handler = operationDispatchMap[operationKey];

        if (operationKey === "C") {
            handler(dataArray, arraySize);
        } else {
            handler(dataArray);
        }
    }

    formatAndPrintProcessedArray(dataArray);
}
