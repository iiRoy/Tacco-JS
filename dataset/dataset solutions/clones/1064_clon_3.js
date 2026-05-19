function processInput(rawInputData) {
    const trimmedInput = rawInputData.trim();
    const parsedLines = trimmedInput.split('\n');

    const arraySizeString = parsedLines.shift();
    const arraySize = Number(arraySizeString);

    const dataArrayString = parsedLines.shift();
    const dataArray = dataArrayString.split(' ').map(Number);

    const inversionCountContainer = { totalCount: 0 };

    sortAndCountInversions(dataArray, 0, arraySize, inversionCountContainer);

    console.log(inversionCountContainer.totalCount);
}

function sortAndCountInversions(targetArray, startIndex, endIndex, inversionCountContainer) {
    const minimumRangeSize = 2; // A range of 1 or 0 elements is already sorted
    if (endIndex - startIndex < minimumRangeSize) {
        return;
    }

    const currentRangeLength = endIndex - startIndex;
    const halfRangeLength = Math.ceil(currentRangeLength / 2);
    const middleIndex = startIndex + halfRangeLength;

    sortAndCountInversions(targetArray, startIndex, middleIndex, inversionCountContainer);
    sortAndCountInversions(targetArray, middleIndex, endIndex, inversionCountContainer);

    combineSortedHalves(targetArray, startIndex, middleIndex, endIndex, inversionCountContainer);
}

function combineSortedHalves(targetArray, startIndex, middleIndex, endIndex, inversionCountContainer) {
    const leftSubArrayLength = middleIndex - startIndex;
    const leftSubArray = new Array(leftSubArrayLength + 1);
    for (let k = 0; k < leftSubArrayLength; k++) {
        leftSubArray[k] = targetArray[startIndex + k];
    }

    const rightSubArrayLength = endIndex - middleIndex;
    const rightSubArray = new Array(rightSubArrayLength + 1);
    for (let k = 0; k < rightSubArrayLength; k++) {
        rightSubArray[k] = targetArray[middleIndex + k];
    }

    const SENTINEL_VALUE = Infinity;
    leftSubArray[leftSubArrayLength] = SENTINEL_VALUE;
    rightSubArray[rightSubArrayLength] = SENTINEL_VALUE;

    let leftPointer = 0;
    let rightPointer = 0;

    let currentWriteIndex = startIndex;
    const finalWriteIndex = endIndex;

    for (; currentWriteIndex < finalWriteIndex; currentWriteIndex++) {
        const currentLeftElement = leftSubArray[leftPointer];
        const currentRightElement = rightSubArray[rightPointer];

        if (currentLeftElement <= currentRightElement) {
            targetArray[currentWriteIndex] = currentLeftElement;
            leftPointer++;
        } else {
            targetArray[currentWriteIndex] = currentRightElement;
            rightPointer++;

            const elementsRemainingInLeft = leftSubArrayLength - leftPointer;
            inversionCountContainer.totalCount += elementsRemainingInLeft;
        }
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
