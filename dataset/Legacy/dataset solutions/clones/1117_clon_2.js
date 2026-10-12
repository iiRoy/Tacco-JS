const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8')
                                .split('\n');

/**
 * Maintains the max-heap property by sifting down an element at a given index.
 * This function assumes 1-based indexing for the heap structure internally,
 * converting to 0-based for array access.
 * @param {Array<number>} heapArray The array representing the heap.
 * @param {number} currentIndex The 1-based index of the node to heapify.
 */
const heapifyDown = (heapArray, currentIndex) => {
    const leftChildIndex = currentIndex * 2; // Calculate the 1-based index of the left child.
    const rightChildIndex = leftChildIndex + 1; // Calculate the 1-based index of the right child.
    let largestIndex; // Variable to hold the 1-based index of the largest element among parent and children.

    // Determine if the left child exists and is larger than the current node.
    if (leftChildIndex <= heapArray.length && heapArray[leftChildIndex - 1] > heapArray[currentIndex - 1]) {
        largestIndex = leftChildIndex;
    } else {
        largestIndex = currentIndex; // Assume current node is largest initially.
    }

    // Determine if the right child exists and is larger than the current largest.
    if (rightChildIndex <= heapArray.length && heapArray[rightChildIndex - 1] > heapArray[largestIndex - 1]) {
        largestIndex = rightChildIndex;
    }

    // If the largest element is not the current node, swap them and recursively heapify.
    if (largestIndex !== currentIndex) {
        const tempValue = heapArray[currentIndex - 1]; // Temporarily store the current node's value.
        heapArray[currentIndex - 1] = heapArray[largestIndex - 1]; // Move the largest child's value to the current node's position.
        heapArray[largestIndex - 1] = tempValue; // Move the original current node's value to the largest child's position.
        heapifyDown(heapArray, largestIndex); // Recursively call heapify on the subtree where the swap occurred.
    }
};

/**
 * Builds a max-heap from an arbitrary array by applying heapifyDown from the last non-leaf node upwards.
 * @param {Array<number>} dataCollection The array to be transformed into a max-heap.
 * @returns {Array<number>} The array, now structured as a max-heap.
 */
const constructMaxHeap = dataCollection => {
    // Iterate from the last non-leaf node up to the root (1-based indexing).
    for (let loopCounter = Math.floor(dataCollection.length / 2); loopCounter > 0; --loopCounter) {
        heapifyDown(dataCollection, loopCounter); // Apply heapifyDown to each subtree.
    }

    return dataCollection; // Return the heapified array.
};

/**
 * Inserts a new value into the max-heap. Note: This implementation is not a standard heap insert
 * (which typically involves adding to the end and heapifying up), but rather adds to the front
 * and potentially rebuilds the entire heap.
 * @param {Array<number>} targetHeap The max-heap array.
 * @param {number} newValue The value to be inserted.
 * @returns {Array<number>} The updated max-heap array.
 */
const addValueToHeap = (targetHeap, newValue) => {
    // If the new value is greater than the current maximum (first element),
    // or if the heap is empty, simply add it to the front.
    if (targetHeap.length === 0 || targetHeap[0] < newValue) {
        targetHeap.unshift(newValue);
        return targetHeap;
    } else {
        // Otherwise, add to the front and then rebuild the entire heap.
        targetHeap.unshift(newValue);
        return constructMaxHeap(targetHeap);
    }
};

/**
 * Extracts the maximum value (root) from the max-heap. Note: This implementation is not a standard
 * heap extract (which typically involves swapping root with last, popping last, then heapifying down).
 * It removes the first element, moves the last element to the front, and then rebuilds the entire heap.
 * @param {Array<number>} sourceHeap The max-heap array.
 * @returns {number} The extracted maximum value.
 */
const removeMaxFromHeap = sourceHeap => {
    const extractedValue = sourceHeap.shift(); // Remove the first element (which is the maximum).

    // If there are still elements left in the heap after removing the max.
    if (sourceHeap.length > 0) {
        sourceHeap.unshift(sourceHeap.pop()); // Move the last element to the front.
        constructMaxHeap(sourceHeap); // Rebuild the entire heap to restore the max-heap property.
    }
    return extractedValue; // Return the value that was extracted.
};

// Process each line from the input to perform heap operations.
const processedData = inputLines.reduce((accumulatorHeap, currentLine) => {
    const commandParts = currentLine.split(' '); // Split the line into command and its argument.
    switch (commandParts[0]) {
        case 'insert':
            // If the command is 'insert', add the specified number to the heap.
            return addValueToHeap(accumulatorHeap, Number(commandParts[1]));
        case 'extract':
            // If the command is 'extract', remove the maximum value and print it to the console.
            console.log(removeMaxFromHeap(accumulatorHeap));
            return accumulatorHeap; // Return the heap for the next operation.
        default:
            // For any other unrecognized command or empty lines, return the heap as is.
            return accumulatorHeap;
    }
}, []); // Initialize the heap as an empty array.
