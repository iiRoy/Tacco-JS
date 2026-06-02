function processInputData(rawInputString) {
    const inputLines = rawInputString.trim().split("\n");

    const firstLineTokens = inputLines[0].split(" ");
    const initialElementCount = parseInt(firstLineTokens[0], 10);
    const numModificationOperations = parseInt(firstLineTokens[1], 10);

    const currentElements = [];
    const initialValuesStringTokens = inputLines[1].split(" ");
    for (let loopIndex = 0; loopIndex < initialElementCount; loopIndex++) {
        currentElements.push(parseInt(initialValuesStringTokens[loopIndex], 10));
    }

    const parseOperationDetails = (lineContent) => {
        const parts = lineContent.split(" ");
        return {
            count: parseInt(parts[0], 10),
            value: parseInt(parts[1], 10)
        };
    };

    for (let operationIndex = 2; operationIndex <= numModificationOperations + 1; operationIndex++) {
        const operationData = parseOperationDetails(inputLines[operationIndex]);
        const elementsToAddCount = operationData.count;
        const valueForAddition = operationData.value;

        for (let addLoopIndex = 0; addLoopIndex < elementsToAddCount; addLoopIndex++) {
            currentElements.push(valueForAddition);
        }
    }

    const swapArrayElements = (arr, indexA, indexB) => {
        const temporaryValue = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = temporaryValue;
    };

    const sortArrayPartition = (arrayRef, partitionStart, partitionEnd) => {
        const pivotMidIndex = Math.floor((partitionStart + partitionEnd) / 2);
        const pivotElementValue = arrayRef[pivotMidIndex];

        let leftCursor = partitionStart;
        let rightCursor = partitionEnd;

        while (true) {
            while (arrayRef[leftCursor] < pivotElementValue) {
                leftCursor++;
            }
            while (pivotElementValue < arrayRef[rightCursor]) {
                rightCursor--;
            }

            if (rightCursor <= leftCursor) {
                break;
            }

            swapArrayElements(arrayRef, leftCursor, rightCursor);
            leftCursor++;
            rightCursor--;
        }

        if (partitionStart < leftCursor - 1) {
            sortArrayPartition(arrayRef, partitionStart, leftCursor - 1);
        }
        if (rightCursor + 1 < partitionEnd) {
            sortArrayPartition(arrayRef, rightCursor + 1, partitionEnd);
        }
    };

    sortArrayPartition(currentElements, 0, currentElements.length);

    let finalSum = 0;
    let positiveElementsCollected = 0;

    for (let loopIndex = currentElements.length - 1; loopIndex >= 0; loopIndex--) {
        const currentElement = currentElements[loopIndex];
        if (currentElement > 0) {
            finalSum += currentElement;
            positiveElementsCollected++;
        }
        if (positiveElementsCollected === initialElementCount) {
            break;
        }
    }

    console.log(finalSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
