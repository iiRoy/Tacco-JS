const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

/**
 * Restores the max-heap property for a subtree rooted at 'currentIndex'.
 * Assumes that the children of 'currentIndex' are already max-heaps.
 * @param {Array<number>} heapArray The array representing the heap.
 * @param {number} currentIndex The 1-based index of the element to heapify.
 */
const heapifyDown = (heapArray, currentIndex) => {
    const leftChildIdx = currentIndex * 2;
    const rightChildIdx = leftChildIdx + 1;
    let largestElementIdx; // Stores the index of the largest among parent, left child, right child

    // Determine if the left child is larger than the current element
    if (leftChildIdx <= heapArray.length && heapArray[leftChildIdx - 1] > heapArray[currentIndex - 1]) {
        largestElementIdx = leftChildIdx;
    } else {
        largestElementIdx = currentIndex;
    }

    // Determine if the right child is larger than the current largest (parent or left child)
    if (rightChildIdx <= heapArray.length && heapArray[rightChildIdx - 1] > heapArray[largestElementIdx - 1]) {
        largestElementIdx = rightChildIdx;
    }

    // If the largest element is not the current element, swap and recursively heapify
    if (largestElementIdx !== currentIndex) {
        const tempValue = heapArray[currentIndex - 1];
        heapArray[currentIndex - 1] = heapArray[largestElementIdx - 1];
        heapArray[largestElementIdx - 1] = tempValue;
        heapifyDown(heapArray, largestElementIdx);
    }
};

/**
 * Inserts a new value into the max-heap, maintaining the heap property.
 * @param {Array<number>} heapCollection The array representing the heap.
 * @param {number} newValue The value to insert.
 */
const addValueToHeap = (heapCollection, newValue) => {
    heapCollection.push(newValue);

    // Helper function to bubble up the newly inserted element
    const bubbleUp = (elementIndex) => {
        if (elementIndex <= 1) {
            return; // Base case: reached the root or invalid index
        }
        const parentOfElementIdx = Math.floor(elementIndex / 2);

        // If the current element is greater than its parent, swap them
        if (heapCollection[elementIndex - 1] > heapCollection[parentOfElementIdx - 1]) {
            const swapHolder = heapCollection[elementIndex - 1];
            heapCollection[elementIndex - 1] = heapCollection[parentOfElementIdx - 1];
            heapCollection[parentOfElementIdx - 1] = swapHolder;
            bubbleUp(parentOfElementIdx); // Recursively bubble up from the parent's position
        }
    };

    bubbleUp(heapCollection.length); // Start bubbling up from the last element
};

/**
 * Extracts the maximum value (root) from the max-heap, maintaining the heap property.
 * @param {Array<number>} heapStructure The array representing the heap.
 * @returns {number} The maximum value extracted from the heap.
 */
const removeMaxFromHeap = heapStructure => {
    const extractedValue = heapStructure.shift(); // Remove the root (max element)
    // Move the last element to the root position, then heapify down
    heapStructure.unshift(heapStructure.pop());
    heapifyDown(heapStructure, 1); // Restore heap property starting from the new root
    return extractedValue;
};

// Process each line of input to perform heap operations
const processedHeapData = inputLines.reduce((currentHeapState, inputLine) => {
    const commandParts = inputLine.split(' ');

    switch (commandParts[0]) {
        case 'insert':
            addValueToHeap(currentHeapState, Number(commandParts[1]));
            break;
        case 'extract':
            console.log(removeMaxFromHeap(currentHeapState));
            break;
    }
    return currentHeapState;
}, []);
