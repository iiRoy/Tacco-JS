const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const swapElements = (collection, firstIdx, secondIdx) => {
    const tempVal = collection[firstIdx];
    collection[firstIdx] = collection[secondIdx];
    collection[secondIdx] = tempVal;
};

const maintainMaxOrder = (heapArray, rootIdx, currentHeapSize) => {
    let current = rootIdx;
    while (true) {
        const leftChild = (current * 2) + 1;
        const rightChild = (current * 2) + 2;
        let largest = current;

        if (leftChild < currentHeapSize && heapArray[leftChild] > heapArray[largest]) {
            largest = leftChild;
        }
        if (rightChild < currentHeapSize && heapArray[rightChild] > heapArray[largest]) {
            largest = rightChild;
        }

        if (largest !== current) {
            swapElements(heapArray, current, largest);
            current = largest;
        } else {
            break;
        }
    }
};

const establishMaxHeap = (sourceArray) => {
    const arrayLength = sourceArray.length;
    for (let i = Math.floor(arrayLength / 2) - 1; i >= 0; i--) {
        maintainMaxOrder(sourceArray, i, arrayLength);
    }
    return sourceArray;
};

const addValueToHeap = (currentHeap, newValue) => {
    if (currentHeap.length === 0 || currentHeap[0] < newValue) {
        currentHeap.unshift(newValue);
        return currentHeap;
    } else {
        currentHeap.unshift(newValue);
        return establishMaxHeap(currentHeap);
    }
};

const retrieveMaxValue = (currentHeap) => {
    const extractedVal = currentHeap.shift();
    if (currentHeap.length > 0) {
        currentHeap.unshift(currentHeap.pop());
        establishMaxHeap(currentHeap);
    }
    return extractedVal;
};

const processedData = inputLines.reduce((accumulator, currentLine) => {
    const commandParts = currentLine.split(' ');
    const operation = commandParts[0];

    switch(operation) {
        case 'insert':
            return addValueToHeap(accumulator, Number(commandParts[1]));
        case 'extract':
            console.log(retrieveMaxValue(accumulator));
            return accumulator;
        default:
            return accumulator;
    }
}, []);
