// Importing necessary module for file system operations.
// Using 'fs/promises' for async operations is a possible Type III change,
// but for synchronous stdin, readFileSync is more direct.
// Let's stick to synchronous read for direct functional equivalence.
const fileSystem = require('fs');

// Function to maintain the max-heap property for a subtree rooted at 'parentIdx'.
// This is a 0-based indexed version of the original 'maxHeapify'.
// It ensures that the parent is always greater than or equal to its children.
// Parameters:
//   - heapContainer: The array representing the heap.
//   - parentIdx: The 0-based index of the node to heapify down from.
//   - currentHeapSize: The effective size of the heap within the array.
const percolateDown = (heapContainer, parentIdx, currentHeapSize) => {
    // Guard clause for invalid input or empty heap portion.
    if (!Array.isArray(heapContainer) || heapContainer.length === 0 || parentIdx < 0 || parentIdx >= currentHeapSize) {
        return;
    }

    let dominantNodeIdx = parentIdx; // Assume parent is the largest initially.
    const leftChildIdx = 2 * parentIdx + 1; // Calculate 0-based index of left child.
    const rightChildIdx = 2 * parentIdx + 2; // Calculate 0-based index of right child.

    // Check if left child exists and is larger than the current dominant node.
    if (leftChildIdx < currentHeapSize && heapContainer[leftChildIdx] > heapContainer[dominantNodeIdx]) {
        dominantNodeIdx = leftChildIdx;
    }

    // Check if right child exists and is larger than the current dominant node (could be parent or left child).
    if (rightChildIdx < currentHeapSize && heapContainer[rightChildIdx] > heapContainer[dominantNodeIdx]) {
        dominantNodeIdx = rightChildIdx;
    }

    // If the dominant node is not the parent, a swap is needed.
    if (dominantNodeIdx !== parentIdx) {
        // Perform swap using array destructuring for cleaner code, replacing a temporary variable.
        [heapContainer[parentIdx], heapContainer[dominantNodeIdx]] = [heapContainer[dominantNodeIdx], heapContainer[parentIdx]];

        // Recursively call percolateDown on the affected subtree to restore heap property.
        percolateDown(heapContainer, dominantNodeIdx, currentHeapSize);
    }
};

// Function to maintain the max-heap property by moving an element up the heap.
// This is a new helper function, replacing the less efficient `buildMaxHeap` call for insertion.
// Parameters:
//   - heapContainer: The array representing the heap.
//   - childIdx: The 0-based index of the node to heapify up from.
const siftUp = (heapContainer, childIdx) => {
    // If the element is already at the root, no sifting up is needed.
    if (childIdx <= 0) {
        return;
    }

    let currentChildIndex = childIdx;
    let parentIndex = Math.floor((currentChildIndex - 1) / 2); // Calculate 0-based index of parent.

    // Continue sifting up as long as the child is greater than its parent.
    while (currentChildIndex > 0 && heapContainer[currentChildIndex] > heapContainer[parentIndex]) {
        // Swap child and parent elements.
        [heapContainer[currentChildIndex], heapContainer[parentIndex]] = [heapContainer[parentIndex], heapContainer[currentChildIndex]];

        // Move up one level for the next iteration.
        currentChildIndex = parentIndex;
        parentIndex = Math.floor((currentChildIndex - 1) / 2);
    }
};

// Function to construct a max heap from an arbitrary array.
// Renamed from 'buildMaxHeap'.
// Parameters:
//   - sourceArray: The array to be transformed into a max heap.
// Returns the heapified array.
const initializeMaxHeap = (sourceArray) => {
    // Guard clause for empty or invalid input array.
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
        return [];
    }

    const currentHeapSize = sourceArray.length;
    // Start from the last non-leaf node and heapify upwards.
    // In 0-based indexing, the last non-leaf node is at index floor( (n/2) - 1 ).
    for (let i = Math.floor(currentHeapSize / 2) - 1; i >= 0; i--) {
        percolateDown(sourceArray, i, currentHeapSize);
    }
    return sourceArray;
};

// Function to insert a new element into the max heap.
// Renamed from 'insert' and completely rewritten for standard heap insertion.
// Parameters:
//   - heapCollection: The array representing the max heap.
//   - elementToPlace: The numerical value to be inserted.
// Returns the modified heap collection.
const insertIntoHeap = (heapCollection, elementToPlace) => {
    // Input validation.
    if (typeof elementToPlace !== 'number' || isNaN(elementToPlace)) {
        console.warn("Attempted to insert a non-numeric value. Skipping.");
        return heapCollection;
    }

    // Add the new element to the end of the array.
    heapCollection.push(elementToPlace);
    // Then, sift it up to its correct position to maintain the max-heap property.
    siftUp(heapCollection, heapCollection.length - 1);
    return heapCollection;
};

// Function to extract the maximum element (root) from the max heap.
// Renamed from 'extract' and rewritten for standard heap extraction.
// Parameters:
//   - heapCollection: The array representing the max heap.
// Returns the maximum element, or null if the heap is empty.
const fetchMaximum = (heapCollection) => {
    // Guard clause for an empty heap.
    if (heapCollection.length === 0) {
        // Returning null as an indicator of no element, could also throw an error.
        return null;
    }

    // If there's only one element, it's the max, just remove and return it.
    if (heapCollection.length === 1) {
        return heapCollection.pop();
    }

    // The maximum element is always at the root (index 0).
    const topValue = heapCollection[0];

    // Move the last element to the root position.
    heapCollection[0] = heapCollection.pop();

    // Restore the max-heap property by percolating down the new root.
    percolateDown(heapCollection, 0, heapCollection.length);

    // Return the extracted maximum value.
    return topValue;
};

// Main execution block.
// Reads input from standard input, processes commands, and prints results.

// Read all input lines from stdin.
// Replaced `line` with `inputLines` for better clarity.
// Added a trim() to each line for robustness.
const inputLines = fileSystem.readFileSync('/dev/stdin', 'utf-8')
                           .split('\n')
                           .map(lineContent => lineContent.trim()) // Trim whitespace from each line
                           .filter(lineContent => lineContent.length > 0); // Filter out empty lines

// Initialize the data structure that will hold our heap.
// Changed 'data' to 'processingHeapContainer' for descriptive naming.
let processingHeapContainer = [];

// Array to store output messages, instead of direct console.log within the loop.
const outputMessages = [];

// Process each input line. Replaced `reduce` with a `for...of` loop for imperative clarity.
for (const currentInputLine of inputLines) {
    // Split the command line into parts.
    const commandFragments = currentInputLine.split(/\s+/); // Use regex for robust splitting by any whitespace.
    const primaryCommand = commandFragments[0]; // The first part is the command itself.

    // Using a switch statement to handle different commands.
    switch (primaryCommand) {
        case 'insert':
            // Ensure there's a value to insert and it's a valid number.
            if (commandFragments.length > 1) {
                const numericValue = Number(commandFragments[1]);
                if (!isNaN(numericValue)) {
                    insertIntoHeap(processingHeapContainer, numericValue);
                } else {
                    console.warn(`Invalid number format for insert command: "${commandFragments[1]}". Skipping.`);
                }
            } else {
                console.warn("Insert command requires a numerical value. Skipping.");
            }
            break;

        case 'extract':
            const extractedItem = fetchMaximum(processingHeapContainer);
            // Only add to output if an item was successfully extracted.
            if (extractedItem !== null) {
                outputMessages.push(extractedItem.toString());
            } else {
                // Optionally log an error if trying to extract from an empty heap
                // console.error("Attempted to extract from an empty heap (already handled internally).");
            }
            break;

        case 'end': // Added a new command for explicit termination, though not strictly needed for this problem.
            // This could be a signal to stop processing further lines, but for simple stdin, it's just processed.
            // No action needed here, just demonstrating adding a new command fragment.
            break;

        default:
            // Handle unknown commands, providing a new guard clause/validation.
            console.warn(`Unknown or unsupported command: "${primaryCommand}". Skipping.`);
            break;
    }
}

// After processing all input, print all collected output messages.
outputMessages.forEach(msg => console.log(msg));