const inputSource = require('node:fs').readFileSync(0, 'utf8'); // Read all input from standard input
const rawCommands = inputSource.trim().split('\n'); // Split input into individual command lines, trimming potential trailing newlines

/**
 * Ensures the max-heap property is maintained for a subtree rooted at parentIdx.
 * This function sifts down an element that might be smaller than its children.
 *
 * @param {number[]} workingCollection - The array representing the heap. (1-based indexing logic for nodes)
 * @param {number} parentIdx - The 1-based index of the node to heapify down from.
 */
const restoreHeapProperty = (workingCollection, parentIdx) => {
    // Determine the current size of the heap
    const collectionSize = workingCollection.length;

    // Guard clause: if the index is out of valid bounds, do nothing.
    if (parentIdx < 1 || parentIdx > collectionSize) {
        return;
    }

    let largestValIdx = parentIdx; // Assume the current node is the largest initially.
    const leftChildIdx = parentIdx * 2;
    const rightChildIdx = leftChildIdx + 1;

    // Check if the left child exists within the heap boundaries and is larger than the current largest.
    if (leftChildIdx <= collectionSize && workingCollection[leftChildIdx - 1] > workingCollection[largestValIdx - 1]) {
        largestValIdx = leftChildIdx; // Update largest index to left child.
    }

    // Check if the right child exists within the heap boundaries and is larger than the current largest.
    if (rightChildIdx <= collectionSize && workingCollection[rightChildIdx - 1] > workingCollection[largestValIdx - 1]) {
        largestValIdx = rightChildIdx; // Update largest index to right child.
    }

    // If the largest element is not the current parent, a swap is necessary.
    if (largestValIdx !== parentIdx) {
        // Perform the swap using a temporary variable for efficiency.
        const tempHolder = workingCollection[parentIdx - 1];
        workingCollection[parentIdx - 1] = workingCollection[largestValIdx - 1];
        workingCollection[largestValIdx - 1] = tempHolder;

        // Recursively call to sift down the swapped element further if needed.
        restoreHeapProperty(workingCollection, largestValIdx);
    }
};

/**
 * Sifts an element up the heap to maintain the max-heap property after insertion.
 *
 * @param {number[]} heapArr - The array representing the heap.
 * @param {number} childIdx - The 1-based index of the newly inserted element.
 */
const siftUpElement = (heapArr, childIdx) => {
    let currentIdx = childIdx;
    // Continue moving up as long as we haven't reached the root and the child is larger than its parent.
    while (currentIdx > 1) {
        const parentOfCurrent = Math.floor(currentIdx / 2);

        // If the current element is greater than its parent, swap them.
        if (heapArr[currentIdx - 1] > heapArr[parentOfCurrent - 1]) {
            const swapTemp = heapArr[currentIdx - 1];
            heapArr[currentIdx - 1] = heapArr[parentOfCurrent - 1];
            heapArr[parentOfCurrent - 1] = swapTemp;
            currentIdx = parentOfCurrent; // Move to the parent's position to continue sifting up.
        } else {
            // If the heap property is satisfied, no more sifting up is needed.
            break;
        }
    }
};

/**
 * Inserts a new element into the max-heap.
 *
 * @param {number[]} targetHeap - The array representing the heap.
 * @param {number} elementValue - The numeric value to insert.
 */
const addToHeap = (targetHeap, elementValue) => {
    // Input validation: ensure the element is a valid finite number.
    if (!Number.isFinite(elementValue)) {
        return; // Skip insertion if the value is invalid.
    }
    
    // Add the new element to the very end of the heap array.
    targetHeap.push(elementValue);
    // Then, call siftUpElement to move it to its correct position.
    siftUpElement(targetHeap, targetHeap.length);
};

/**
 * Extracts and returns the maximum element (root) from the max-heap.
 *
 * @param {number[]} heapStructure - The array representing the heap.
 * @returns {number|undefined} The maximum element, or undefined if the heap is empty.
 */
const retrieveLargest = (heapStructure) => {
    // Guard clause: if the heap is empty, there's nothing to extract.
    if (heapStructure.length === 0) {
        return undefined;
    }

    // If there's only one element, it's the max, so just remove and return it.
    if (heapStructure.length === 1) {
        return heapStructure.pop();
    }

    // Store the maximum element (which is always at the root, index 0).
    const maxElement = heapStructure[0];

    // Move the last element of the heap to the root position.
    heapStructure[0] = heapStructure.pop();

    // Restore the heap property by sifting down the new root element.
    restoreHeapProperty(heapStructure, 1); // Start heapifying from the root (1-based index).

    return maxElement;
};

// Initialize the primary data structure that will act as our max-heap.
const activeHeap = [];

// Iterate through each command line provided in the input.
for (const instructionLine of rawCommands) {
    // Skip any empty lines that might occur from input processing.
    if (!instructionLine.trim()) {
        continue;
    }

    // Split the line into parts, using one or more spaces as delimiters.
    const operationParts = instructionLine.split(/\s+/);
    const commandType = operationParts[0]; // The first part is the command type.

    // Process the command based on its type.
    switch (commandType) {
        case 'insert':
            // Validate that an argument for insertion is present.
            if (operationParts.length < 2) {
                continue; // Skip if value is missing.
            }
            // Parse the value, ensuring it's an integer.
            const valueToInsert = parseInt(operationParts[1], 10);
            // Validate that the parsed value is a valid number.
            if (isNaN(valueToInsert)) {
                continue; // Skip if the value is not a number.
            }
            addToHeap(activeHeap, valueToInsert); // Perform the insertion.
            break;
        case 'extract':
            const extractedValue = retrieveLargest(activeHeap); // Retrieve the largest element.
            // Only print if a valid element was actually extracted (i.e., heap wasn't empty).
            if (extractedValue !== undefined) {
                console.log(extractedValue);
            }
            break;
        default:
            // Handle any unrecognized commands gracefully by doing nothing.
            break;
    }
}