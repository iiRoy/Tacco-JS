const printArrayState = (arr) => {
    console.log(arr.join(' '));
};

const performInsertion = (arr, targetIndex, valueToInsert) => {
    let shiftPointer = targetIndex - 1;
    while (shiftPointer >= 0 && arr[shiftPointer] > valueToInsert) {
        arr[shiftPointer + 1] = arr[shiftPointer];
        shiftPointer = shiftPointer - 1;
    }
    arr[shiftPointer + 1] = valueToInsert;
};

function processInputAndSort(rawData) {
    const lines = rawData.trim().split('\n');
    
    const arraySize = Number(lines[0]);
    const dataArray = lines[1].split(' ').map(Number);

    printArrayState(dataArray);

    for (let currentIndex = 1; currentIndex < arraySize; currentIndex++) {
        printArrayState(dataArray);

        const currentValue = dataArray[currentIndex];
        
        performInsertion(dataArray, currentIndex, currentValue);
    }

    printArrayState(dataArray);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
processInputAndSort(require('fs').readFileSync('/dev/stdin', 'utf8'));
