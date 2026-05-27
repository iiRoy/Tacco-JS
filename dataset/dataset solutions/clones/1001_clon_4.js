function processInput(rawData) {
    const inputLines = rawData.split('\n');
    const initialSize = Number(inputLines[0]);
    const numericalSequence = inputLines[1].split(' ').map(Number);

    const auxiliaryStorage = new Array(initialSize);

    const swapTally = sortAndCountInversions(numericalSequence, auxiliaryStorage, 0, initialSize - 1);

    console.log(numericalSequence.join(' '));
    console.log(swapTally);
}

function sortAndCountInversions(mainArray, tempArray, startIndex, endIndex) {
    let currentInversions = 0;
    if (startIndex < endIndex) {
        const middleIndex = Math.floor((startIndex + endIndex) / 2);
        currentInversions += sortAndCountInversions(mainArray, tempArray, startIndex, middleIndex);
        currentInversions += sortAndCountInversions(mainArray, tempArray, middleIndex + 1, endIndex);
        currentInversions += mergeSubarrays(mainArray, tempArray, startIndex, middleIndex, endIndex);
    }
    return currentInversions;
}

function mergeSubarrays(mainArray, tempArray, lowBound, midPoint, highBound) {
    let leftCursor = lowBound;
    let rightCursor = midPoint + 1;
    let writeCursor = lowBound;
    let mergeInversions = 0;

    for (let k = lowBound; k <= highBound; k++) {
        tempArray[k] = mainArray[k];
    }

    while (leftCursor <= midPoint && rightCursor <= highBound) {
        if (tempArray[leftCursor] <= tempArray[rightCursor]) {
            mainArray[writeCursor++] = tempArray[leftCursor++];
        } else {
            mergeInversions += (midPoint - leftCursor + 1);
            mainArray[writeCursor++] = tempArray[rightCursor++];
        }
    }

    while (leftCursor <= midPoint) {
        mainArray[writeCursor++] = tempArray[leftCursor++];
    }
    while (rightCursor <= highBound) {
        mainArray[writeCursor++] = tempArray[rightCursor++];
    }
    return mergeInversions;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
