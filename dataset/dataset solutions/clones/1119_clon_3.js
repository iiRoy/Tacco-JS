const fileSystem = require('fs');

// Helper function to swap elements in an array
const swapElements = (array, indexA, indexB) => {
    const temp = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = temp;
};

const heapifyMax = (heapArray, currentIndex) => {
    const heapSize = heapArray.length;
    const leftChildIndex = currentIndex * 2;
    const rightChildIndex = leftChildIndex + 1;
    let largestIndex = currentIndex; // Assume current node is largest initially

    // Check if left child exists and is larger than current largest
    if (leftChildIndex <= heapSize && heapArray[leftChildIndex - 1] > heapArray[largestIndex - 1]) {
        largestIndex = leftChildIndex;
    }

    // Check if right child exists and is larger than current largest
    if (rightChildIndex <= heapSize && heapArray[rightChildIndex - 1] > heapArray[largestIndex - 1]) {
        largestIndex = rightChildIndex;
    }

    // If largest is not the current node, swap and recursively heapify
    if (largestIndex !== currentIndex) {
        swapElements(heapArray, currentIndex - 1, largestIndex - 1);
        heapifyMax(heapArray, largestIndex);
    }
};

const insertValue = (heapArray, newValue) => {
    heapArray.push(newValue);
    const currentHeapSize = heapArray.length;

    // Helper function to bubble up the new element
    const bubbleUp = (childIndex) => {
        if (childIndex <= 1) { // Base case: reached root or invalid index
            return;
        }
        const parentIdx = Math.floor(childIndex / 2);
        const childValue = heapArray[childIndex - 1];
        const parentValue = heapArray[parentIdx - 1];

        if (childValue > parentValue) {
            swapElements(heapArray, childIndex - 1, parentIdx - 1);
            bubbleUp(parentIdx); // Recurse upwards
        }
    };
    bubbleUp(currentHeapSize);
};

const extractMax = (heapArray) => {
    // Store the root element to be returned
    const extractedRoot = heapArray.shift();

    // Replicate the original's behavior of moving the last element to the front.
    // This includes handling cases where heapArray becomes empty or contains undefined
    // after the shift operation.
    const lastElement = heapArray.pop(); // Can be undefined if heapArray was empty after shift
    heapArray.unshift(lastElement); // Puts lastElement (or undefined) at the front

    // If the heap is not empty (or not just [undefined]), heapify from the root.
    // The original maxHeapify handles empty/single-element arrays gracefully.
    heapifyMax(heapArray, 1);
    return extractedRoot;
};

// Helper to parse each command line
const parseCommand = (lineString) => {
    const parts = lineString.split(' ');
    const commandType = parts[0];
    const commandValue = parts.length > 1 ? Number(parts[1]) : undefined;
    return { type: commandType, value: commandValue };
};

const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf-8').split('\n');

const currentHeap = inputLines.reduce((accumulatorHeap, inputLine) => {
    const command = parseCommand(inputLine);

    switch (command.type) {
        case 'insert':
            insertValue(accumulatorHeap, command.value);
            break;
        case 'extract':
            console.log(extractMax(accumulatorHeap));
            break;
        default:
            // No operation for unknown commands, preserving original behavior
            break;
    }
    return accumulatorHeap;
}, []);
