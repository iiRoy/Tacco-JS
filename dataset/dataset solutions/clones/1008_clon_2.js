const settings = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const inputLines = require('fs').readFileSync(settings.sourcePath, 'utf-8').split(settings.lineDelimiter);

const performSelectionSort = (dataArray) => {
    let swapCount = 0;
    for (let outerIndex = 0; outerIndex < dataArray.length; outerIndex++) {
        let minIndex = outerIndex;
        for (let innerIndex = outerIndex; innerIndex < dataArray.length; innerIndex++) {
            if (dataArray[innerIndex] < dataArray[minIndex]) {
                minIndex = innerIndex;
            }
        }
        const tempValue = dataArray[outerIndex];
        dataArray[outerIndex] = dataArray[minIndex];
        dataArray[minIndex] = tempValue;
        if (outerIndex !== minIndex) {
            swapCount++;
        }
    }
    
    console.log(dataArray.map(element => element.toString()).join(' '));

    return swapCount;
};

console.log(performSelectionSort(inputLines[1].split(' ').map(element => parseInt(element))));
