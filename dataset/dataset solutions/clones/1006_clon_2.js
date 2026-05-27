const dataInput = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);

let arraySize = Number(dataInput[0]);
let dataArray = dataInput[1].split(' ').map(Number);

let minIndex = 0;
let swapCount = 0;
let tempValue;

function performSelectionSort(arr, size) {
    // Iterate through the array from the first element up to the second-to-last.
    // The last element will automatically be in place after N-1 passes.
    for (let outerIndex = 0; outerIndex <= size - 1; outerIndex++) {
        // Assume the current element is the minimum in the unsorted part.
        minIndex = outerIndex;

        // Find the actual minimum element in the remaining unsorted portion.
        for (let innerIndex = outerIndex; innerIndex <= size - 1; innerIndex++) {
            // If a smaller element is found, update the index of the minimum.
            if (arr[innerIndex] < arr[minIndex]) {
                minIndex = innerIndex;
            }
        }

        // If the minimum element found is not at the current position, perform a swap.
        if (arr[outerIndex] !== arr[minIndex]) {
            // Use a temporary variable to swap the elements.
            tempValue = arr[outerIndex];
            arr[outerIndex] = arr[minIndex];
            arr[minIndex] = tempValue;
            // Increment the counter for performed swaps.
            swapCount++;
        }
    }
}

// Execute the selection sort algorithm on the provided data array.
performSelectionSort(dataArray, arraySize);

// Output the sorted array elements, joined by a single space.
console.log(dataArray.join(' '));

// Output the total number of swaps that occurred during the sorting process.
console.log(swapCount);
