const swapElements = (targetArray, indexA, indexB) => {
    const temporaryValue = targetArray[indexA];
    targetArray[indexA] = targetArray[indexB];
    targetArray[indexB] = temporaryValue;
};

const heapifyDown = (heapArray, currentIndex) => {
    const currentHeapSize = heapArray.length;
    let largestIndex = currentIndex;

    const leftChildIndex = currentIndex * 2;
    const rightChildIndex = leftChildIndex + 1;

    if (leftChildIndex <= currentHeapSize && heapArray[leftChildIndex - 1] > heapArray[largestIndex - 1]) {
        largestIndex = leftChildIndex;
    }

    if (rightChildIndex <= currentHeapSize && heapArray[rightChildIndex - 1] > heapArray[largestIndex - 1]) {
        largestIndex = rightChildIndex;
    }

    if (largestIndex !== currentIndex) {
        swapElements(heapArray, currentIndex - 1, largestIndex - 1);
        heapifyDown(heapArray, largestIndex);
    }
};

const constructMaxHeap = heapArray => {
    const firstNonLeafNodeIndex = Math.floor(heapArray.length / 2);
    for (let i = firstNonLeafNodeIndex; i > 0; i--) {
        heapifyDown(heapArray, i);
    }
    return heapArray;
};

const insertElement = (heapArray, newValue) => {
    heapArray.unshift(newValue);
    return constructMaxHeap(heapArray);
};

const extractMax = heapArray => {
    const extractedValue = heapArray.shift();
    const lastElement = heapArray.pop();
    heapArray.unshift(lastElement);
    constructMaxHeap(heapArray);
    return extractedValue;
};

const parseCommand = (commandLineString) => {
    const commandParts = commandLineString.split(' ');
    return {
        type: commandParts[0],
        value: commandParts.length > 1 ? Number(commandParts[1]) : undefined
    };
};

const processHeapCommand = (currentHeap, commandLine) => {
    if (!commandLine.trim()) {
        return currentHeap;
    }

    const parsedCommand = parseCommand(commandLine);

    if (parsedCommand.type === 'insert') {
        return insertElement(currentHeap, parsedCommand.value);
    } else if (parsedCommand.type === 'extract') {
        const extractedResult = extractMax(currentHeap);
        console.log(extractedResult);
        return currentHeap;
    }
    return currentHeap;
};

const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const finalHeapState = inputLines.reduce(processHeapCommand, []);
