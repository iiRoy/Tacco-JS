let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input into individual lines of data
const dataRows = rawData.split('\n');

// The first line contains the count of elements
const elementCount = dataRows[0];

// --- Bubble Sort Implementation ---
// Initialize an array for bubble sort from the second line of input
let bubbleSortedArray = dataRows[1].split(' ');

// Perform bubble sort to sort the array based on the second character of each element
for (let outerLoopIdx = 0; outerLoopIdx < elementCount; outerLoopIdx++) {
    for (let innerLoopIdx = elementCount - 1; innerLoopIdx > outerLoopIdx; innerLoopIdx--) {
        // Compare the second character (value) of adjacent elements
        if (bubbleSortedArray[innerLoopIdx].split('')[1] < bubbleSortedArray[innerLoopIdx - 1].split('')[1]) {
            // Swap elements if they are in the wrong order
            let tempCard = bubbleSortedArray[innerLoopIdx];
            bubbleSortedArray[innerLoopIdx] = bubbleSortedArray[innerLoopIdx - 1];
            bubbleSortedArray[innerLoopIdx - 1] = tempCard;
        }
    }
}

// Output the bubble-sorted array
console.log(bubbleSortedArray.join(' '));
// Bubble sort is inherently stable
console.log('Stable');


// --- Selection Sort Implementation ---
// Initialize another array for selection sort from the same input line
let selectionSortedArray = dataRows[1].split(' ');

// Perform selection sort
for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
    let minIndex = currentIdx; // Assume the current element is the minimum

    // Find the minimum element in the unsorted part of the array
    for (let scanIdx = currentIdx; scanIdx < elementCount; scanIdx++) {
        if (selectionSortedArray[scanIdx].split('')[1] < selectionSortedArray[minIndex].split('')[1]) {
            minIndex = scanIdx; // Update minimum index if a smaller element is found
        }
    }

    // If the minimum element is not at the current position, swap them
    if (minIndex === currentIdx) {
        continue; // No swap needed if already in place
    }

    let swapItem = selectionSortedArray[currentIdx];
    selectionSortedArray[currentIdx] = selectionSortedArray[minIndex];
    selectionSortedArray[minIndex] = swapItem;
}

// Output the selection-sorted array
console.log(selectionSortedArray.join(' '));

// Compare the stability of the two sorting algorithms
// If the sorted arrays are identical, selection sort is also considered stable for this input
console.log(bubbleSortedArray.join(' ') === selectionSortedArray.join(' ') ? 'Stable' : 'Not stable');
