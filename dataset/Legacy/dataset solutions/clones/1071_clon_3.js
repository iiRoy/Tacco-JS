const swapElements = (arr, idx1, idx2) => {
    const temp = arr[idx1];
    arr[idx1] = arr[idx2];
    arr[idx2] = temp;
};

function processInput(rawInputData) {
    const processedLines = rawInputData.trim().split('\n');

    const firstLineContent = processedLines.shift();
    const elementCount = Number(firstLineContent);

    const secondLineContent = processedLines.shift();
    const numberStrings = secondLineContent.split(' ');
    const dataArray = numberStrings.map(str => Number(str));

    const resultArr = rearrangeArray(dataArray, 0, elementCount);
    console.log(resultArr.join(' '));
}

function rearrangeArray(dataArray, startIndex, endIndex) {
    const pivotPosition = endIndex - 1;
    let pivotValue = dataArray[pivotPosition];
    let storeIndex = startIndex;

    for (let currentIndex = startIndex; currentIndex < pivotPosition; currentIndex++) {
        if (dataArray[currentIndex] <= pivotValue) {
            swapElements(dataArray, currentIndex, storeIndex);
            storeIndex++;
        }
    }

    swapElements(dataArray, storeIndex, pivotPosition);

    const formattedPivot = `[${pivotValue}]`;
    dataArray[storeIndex] = formattedPivot;

    return dataArray;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
