const retrieveExtrema = (elementCollection) => {
    let currentMinimumValue = Infinity;
    let currentMaximumValue = -Infinity;
    let minimumValueIndex = -1;
    let maximumValueIndex = -1;

    elementCollection.forEach((currentElement, elementPosition) => {
        if (currentElement > currentMaximumValue) {
            currentMaximumValue = currentElement;
            maximumValueIndex = elementPosition;
        }
        if (currentElement < currentMinimumValue) {
            currentMinimumValue = currentElement;
            minimumValueIndex = elementPosition;
        }
    });
    return { minimumValue: currentMinimumValue, maximumValue: currentMaximumValue, minimumIndex: minimumValueIndex, maximumIndex: maximumValueIndex };
};

const performAscendingSort = (targetArray, operationLog) => {
    let currentPosition = 0;
    while (currentPosition < targetArray.length) {
        if (currentPosition > 0 && targetArray[currentPosition] < targetArray[currentPosition - 1]) {
            operationLog.push([currentPosition, currentPosition + 1]);
            targetArray[currentPosition] = targetArray[currentPosition - 1] + targetArray[currentPosition];
        }
        currentPosition++;
    }
};

const performDescendingSort = (targetArray, operationLog) => {
    let currentPosition = targetArray.length - 1;
    while (currentPosition >= 0) {
        if (currentPosition < targetArray.length - 1 && targetArray[currentPosition] > targetArray[currentPosition + 1]) {
            operationLog.push([currentPosition + 1, currentPosition]);
            targetArray[currentPosition] = targetArray[currentPosition + 1] + targetArray[currentPosition];
        }
        currentPosition--;
    }
};

const applyMaximumValueAddition = (targetArray, operationLog, maxValue, maxIdx) => {
    Array.from({ length: targetArray.length }, (_, elementPosition) => elementPosition).forEach(currentElementPosition => {
        if (maxIdx !== currentElementPosition) {
            operationLog.push([maxIdx, currentElementPosition]);
            targetArray[currentElementPosition] = targetArray[currentElementPosition] + maxValue;
        }
    });
};

const applyMinimumValueAddition = (targetArray, operationLog, minValue, minIdx) => {
    Array.from({ length: targetArray.length }, (_, elementPosition) => elementPosition).forEach(currentElementPosition => {
        if (minIdx !== currentElementPosition) {
            operationLog.push([minIdx, currentElementPosition]);
            targetArray[currentElementPosition] = targetArray[currentElementPosition] + minValue;
        }
    });
};

function processInputData(inputContent) {
    const contentLines = inputContent.split("\n");
    const arraySize = Number(contentLines[0].split(" ")[0]);
    const initialNumericElements = contentLines[1].split(" ").map(Number);

    const mutableArray = [...initialNumericElements];
    const recordedOperations = [];

    const { minimumValue, maximumValue, minimumIndex, maximumIndex } = retrieveExtrema(initialNumericElements);

    if (minimumValue >= 0) {
        performAscendingSort(mutableArray, recordedOperations);
    } else if (maximumValue < 0) {
        performDescendingSort(mutableArray, recordedOperations);
    } else if (maximumValue > Math.abs(minimumValue)) {
        applyMaximumValueAddition(mutableArray, recordedOperations, maximumValue, maximumIndex);
        performAscendingSort(mutableArray, recordedOperations);
    } else if (Math.abs(minimumValue) > maximumValue) {
        applyMinimumValueAddition(mutableArray, recordedOperations, minimumValue, minimumIndex);
        performDescendingSort(mutableArray, recordedOperations);
    }

    const resultLines = [recordedOperations.length.toString()];
    recordedOperations.forEach(opEntry => resultLines.push(`${opEntry[0]} ${opEntry[1]}`));
    console.log(resultLines.join('\n'));
}

function Main(input) {
    processInputData(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
