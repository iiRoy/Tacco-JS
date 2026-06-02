process.stdin.resume();
process.stdin.setEncoding('utf8');

function quickSortObjects(dataCollection) {
    if (!dataCollection || dataCollection.length <= 1) {
        return dataCollection;
    }

    const performPartitionSort = (startIndex, endIndex) => {
        if (startIndex >= endIndex) {
            return;
        }

        let leftCursor = startIndex;
        let rightCursor = endIndex;
        const pivotMidIndex = Math.round((leftCursor + rightCursor) / 2);
        const pivotValue = dataCollection[pivotMidIndex].A;

        while (leftCursor < rightCursor) {
            if (dataCollection[leftCursor].A >= pivotValue) {
                while (rightCursor > leftCursor) {
                    if (dataCollection[rightCursor].A <= pivotValue) {
                        const temporaryHolder = dataCollection[leftCursor];
                        dataCollection[leftCursor] = dataCollection[rightCursor];
                        dataCollection[rightCursor] = temporaryHolder;
                        rightCursor--;
                        break;
                    }
                    rightCursor--;
                }
            }
            leftCursor++;
        }

        const finalRightElementValue = dataCollection[rightCursor].A;
        if (finalRightElementValue > pivotValue) {
            performPartitionSort(startIndex, rightCursor - 1);
            performPartitionSort(rightCursor, endIndex);
        } else if (finalRightElementValue < pivotValue) {
            performPartitionSort(startIndex, rightCursor);
            performPartitionSort(rightCursor + 1, endIndex);
        } else {
            performPartitionSort(startIndex, rightCursor - 1);
            performPartitionSort(rightCursor + 1, endIndex);
        }
    };

    performPartitionSort(0, dataCollection.length - 1);
    return dataCollection;
}

const ITERATIVE_GCD_LIMIT = 10;

function iterativeEuclideanGCD(num1, num2) {
    if (num2 > num1) {
        let tempSwap = num1;
        num1 = num2;
        num2 = tempSwap;
    }

    for (let currentIteration = 0; currentIteration < ITERATIVE_GCD_LIMIT; ++currentIteration) {
        let difference = num1 - num2;
        let isNum2GreaterThanDifference = num2 > difference;
        
        let nextNum1 = isNum2GreaterThanDifference ? num2 : difference;
        let nextNum2 = isNum2GreaterThanDifference ? difference : num2;
        
        num1 = nextNum1;
        num2 = nextNum2;

        if (num2 === 0) {
            return num1;
        }
    }
    return iterativeEuclideanGCD(num2, num1 % num2);
}

function getGreatestCommonDivisor(val1, val2) {
    return val1 > val2 ? iterativeEuclideanGCD(val1, val2) : iterativeEuclideanGCD(val2, val1);
}

const calculateArrayGCD = (numberArray) => {
    // Preserving original behavior: will throw an error if numberArray.length < 2
    let currentGCDResult = getGreatestCommonDivisor(numberArray[0], numberArray[1]);
    for (let loopIdx = 2; loopIdx < numberArray.length; loopIdx++) {
        currentGCDResult = getGreatestCommonDivisor(currentGCDResult, numberArray[loopIdx]);
    }
    return currentGCDResult;
};

const processInputAndCalculate = (rawInputString) => {
    const inputLines = rawInputString.split("\n");

    const elementCount = parseInt(inputLines[0].split(" ")[0]);
    const initialValues = inputLines[1].split(" ").map(Number);

    const indexedElements = [];
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        indexedElements.push({ originalIndex: currentIdx, A: initialValues[currentIdx] });
    }

    const sortedElements = quickSortObjects(indexedElements);

    let frontCursor = 1;
    let backCursor = elementCount;
    let totalSum = 0;

    for (let currentIdx = elementCount - 1; currentIdx >= 0; currentIdx--) {
        const currentElement = sortedElements[currentIdx];
        const currentElementOriginalIndex = currentElement.originalIndex;
        const currentElementValue = currentElement.A;

        const distanceNMinusOriginalIdx = elementCount - currentElementOriginalIndex;
        const distanceOriginalIdxPlusOne = currentElementOriginalIndex + 1;

        if (distanceNMinusOriginalIdx < distanceOriginalIdxPlusOne) {
            totalSum += currentElementValue * (currentElementOriginalIndex - frontCursor + 1);
            frontCursor++;
        } else if (distanceNMinusOriginalIdx > distanceOriginalIdxPlusOne) {
            totalSum += currentElementValue * (backCursor - currentElementOriginalIndex - 1);
            backCursor--;
        } else {
            // Tie-breaking condition, depends on the next element in the sorted array.
            // This will throw a TypeError if elementCount = 1 and this branch is reached,
            // as sortedElements[currentIdx + 1] would be out of bounds.
            // This behavior is preserved from the original code.
            const nextElementInSortedArray = sortedElements[currentIdx + 1];
            const nextElementOriginalIndex = nextElementInSortedArray.originalIndex;

            const nextDistanceNMinusOriginalIdx = elementCount - nextElementOriginalIndex;
            const nextDistanceOriginalIdxPlusOne = nextElementOriginalIndex + 1;

            if (nextDistanceNMinusOriginalIdx < nextDistanceOriginalIdxPlusOne) {
                totalSum += currentElementValue * (backCursor - currentElementOriginalIndex - 1);
                backCursor--;
            } else if (nextDistanceNMinusOriginalIdx > nextDistanceOriginalIdxPlusOne) {
                totalSum += currentElementValue * (currentElementOriginalIndex - frontCursor + 1);
                frontCursor++;
            }
        }
    }

    console.log(totalSum);
};

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
