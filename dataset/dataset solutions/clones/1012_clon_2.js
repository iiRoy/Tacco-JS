// This script processes input data to demonstrate sorting algorithms and stability.
let dataSource = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input content
let dataRows = dataSource.split('\n'); // Divide input into separate lines
let itemQuantity = dataRows[0]; // The first line specifies the number of items to process

// --- Bubble Sort Implementation ---
// Initialize the first array for sorting with the second line of input
let firstArray = dataRows[1].split(' ');
/*
 * Outer loop for the bubble sort.
 * Iterates through each element in the array.
 */
for (let outerIndex = 0; outerIndex < itemQuantity; outerIndex++) {
    // Inner loop for comparisons and swaps.
    // Elements are 'bubbled' up to their correct position.
    for (let innerIndex = itemQuantity - 1; innerIndex > outerIndex; innerIndex--) {
        // Compare elements based on their second character.
        // This is a custom comparison logic for stability check.
        if (firstArray[innerIndex].split('')[1] < firstArray[innerIndex - 1].split('')[1]) {
            // Swap elements if they are in the wrong order.
            let tempValue = firstArray[innerIndex];
            firstArray[innerIndex] = firstArray[innerIndex - 1];
            firstArray[innerIndex - 1] = tempValue;
        }
    }
}
// Output the sorted array from the bubble sort.
console.log(firstArray.join(' '));
// Bubble sort is inherently stable for this comparison method.
console.log('Stable');

// --- Selection Sort Implementation ---
// Re-initialize a second array with the original input for selection sort
let secondArray = dataRows[1].split(' ');
/*
 * Outer loop of the selection sort.
 * Finds the minimum element and places it at the correct position.
 */
for (let idx1 = 0; idx1 < itemQuantity; idx1++) {
    let smallestIdx = idx1; // Assume the current element is the smallest
    // Inner loop to find the actual smallest element in the unsorted portion
    for (let idx2 = idx1; idx2 < itemQuantity; idx2++) {
        // Custom comparison: based on the second character of the string
        if (secondArray[idx2].split('')[1] < secondArray[smallestIdx].split('')[1])
            smallestIdx = idx2; // Update index of the smallest element found
    }

    // If the smallest element is already in place, skip the swap
    if (smallestIdx === idx1)
        continue;

    // Swap the current element with the smallest element found
    let swapHold = secondArray[idx1];
    secondArray[idx1] = secondArray[smallestIdx];
    secondArray[smallestIdx] = swapHold;
}

// Output the sorted array from the selection sort.
console.log(secondArray.join(' '));
// Compare the results of the two sorts to check for stability.
// If the joined strings are identical, both sorts maintained relative order of equal elements.
console.log(firstArray.join(' ') === secondArray.join(' ') ? 'Stable' : 'Not stable');