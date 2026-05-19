const sourceConfig = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync(sourceConfig.sourcePath, 'utf-8');
const inputSegments = rawInputContent.split(sourceConfig.lineSeparator);

const parseInputEntries = (entryLine) => {
    return entryLine.split(' ').map(itemString => ({
        numericVal: Number.parseInt(itemString[1], 10),
        originalStr: itemString
    }));
};

const initialDataSet = parseInputEntries(inputSegments[1]);

const performInsertionSort = (collection) => {
    const mutableCollection = [...collection];
    for (let currentIdx = 1; currentIdx < mutableCollection.length; currentIdx++) {
        let elementToInsert = mutableCollection[currentIdx];
        let comparisonIdx = currentIdx - 1;

        while (comparisonIdx >= 0 && mutableCollection[comparisonIdx].numericVal > elementToInsert.numericVal) {
            mutableCollection[comparisonIdx + 1] = mutableCollection[comparisonIdx];
            comparisonIdx--;
        }
        mutableCollection[comparisonIdx + 1] = elementToInsert;
    }
    return mutableCollection;
};

const performQuickSort = (collection) => {
    const recursiveSort = (arr, lowBound, highBound) => {
        if (lowBound < highBound) {
            const pivotPosition = partitionArray(arr, lowBound, highBound);
            recursiveSort(arr, lowBound, pivotPosition - 1);
            recursiveSort(arr, pivotPosition + 1, highBound);
        }
    };

    const partitionArray = (arr, lowBound, highBound) => {
        const pivotElement = arr[highBound];
        let swapIndex = lowBound - 1;

        for (let currentIdx = lowBound; currentIdx < highBound; currentIdx++) {
            if (arr[currentIdx].numericVal <= pivotElement.numericVal) {
                swapIndex++;
                [arr[swapIndex], arr[currentIdx]] = [arr[currentIdx], arr[swapIndex]];
            }
        }
        [arr[swapIndex + 1], arr[highBound]] = [arr[highBound], arr[swapIndex + 1]];
        return swapIndex + 1;
    };

    const dataCopy = [...collection];
    recursiveSort(dataCopy, 0, dataCopy.length - 1);
    return dataCopy;
};

const checkOrderEquivalence = (firstArr, secondArr) => {
    if (firstArr.length !== secondArr.length) {
        return false;
    }
    for (let index = 0; index < firstArr.length; index++) {
        if (firstArr[index].originalStr !== secondArr[index].originalStr) {
            return false;
        }
    }
    return true;
};

const stableSortedResult = performInsertionSort(initialDataSet);
const unstableSortedResult = performQuickSort(initialDataSet);

console.log(stableSortedResult.map(item => item.originalStr).join(' '));
console.log('Stable');
console.log(unstableSortedResult.map(item => item.originalStr).join(' '));
console.log(checkOrderEquivalence(stableSortedResult, unstableSortedResult) ? 'Stable' : 'Not stable');
