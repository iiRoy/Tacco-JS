const _swapElements = (collection, firstIndex, secondIndex) => {
    const temp = collection[firstIndex];
    collection[firstIndex] = collection[secondIndex];
    collection[secondIndex] = temp;
};

const _heapifyDown = (heapStorage, currIdx) => {
    const count = heapStorage.length;
    while (true) {
        const leftCIdx = 2 * currIdx + 1;
        const rightCIdx = 2 * currIdx + 2;
        let largestCIdx = currIdx;

        if (leftCIdx < count && heapStorage[leftCIdx] > heapStorage[largestCIdx]) {
            largestCIdx = leftCIdx;
        }
        if (rightCIdx < count && heapStorage[rightCIdx] > heapStorage[largestCIdx]) {
            largestCIdx = rightCIdx;
        }

        if (largestCIdx !== currIdx) {
            _swapElements(heapStorage, currIdx, largestCIdx);
            currIdx = largestCIdx;
        } else {
            break;
        }
    }
};

const _heapifyUp = (heapStorage, currIdx) => {
    while (currIdx > 0) {
        const parentIdx = Math.floor((currIdx - 1) / 2);
        if (heapStorage[currIdx] > heapStorage[parentIdx]) {
            _swapElements(heapStorage, currIdx, parentIdx);
            currIdx = parentIdx;
        } else {
            break;
        }
    }
};

const addValue = (heapStorage, itemVal) => {
    heapStorage.push(itemVal);
    _heapifyUp(heapStorage, heapStorage.length - 1);
};

const removeMax = heapStorage => {
    if (heapStorage.length === 0) {
        return undefined;
    }
    if (heapStorage.length === 1) {
        return heapStorage.pop();
    }

    const extractedVal = heapStorage[0];
    heapStorage[0] = heapStorage.pop();
    _heapifyDown(heapStorage, 0);
    return extractedVal;
};

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const currentHeap = inputLines.reduce((accumulator, currentLine) => {
    const commandParts = currentLine.split(' ');
    switch(commandParts[0]) {
        case 'insert':
            addValue(accumulator, Number(commandParts[1]));
            break;
        case 'extract':
            console.log(removeMax(accumulator));
            break;
    }
    return accumulator;
}, []);
