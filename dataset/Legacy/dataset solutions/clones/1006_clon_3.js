const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.split('\n').filter(line => line.trim() !== '');
const arraySize = Number(inputLines[0]);
const dataArray = inputLines[1].split(' ').map(Number);

function swapElements(array, indexA, indexB) {
    if (indexA === indexB) {
        return;
    }
    const tempVal = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = tempVal;
}

function performSelectionSort(arr, size) {
    let totalSwaps = 0;

    if (size <= 1) {
        return totalSwaps;
    }

    const lastValidIndex = size - 1;

    for (let i = 0; i <= lastValidIndex; i++) {
        let currentMinimumIndex = i;

        for (let j = i + 1; j <= lastValidIndex; j++) {
            if (arr[j] < arr[currentMinimumIndex]) {
                currentMinimumIndex = j;
            }
        }

        if (i !== currentMinimumIndex) {
            swapElements(arr, i, currentMinimumIndex);
            totalSwaps++;
        }
    }
    return totalSwaps;
}

const finalSwapCount = performSelectionSort(dataArray, arraySize);
console.log(dataArray.join(' '));
console.log(finalSwapCount);
