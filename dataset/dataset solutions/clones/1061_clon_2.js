const SYSTEM_SETTINGS = { dataSourcePath: '/dev/stdin', lineDelimiterChar: '\n' }; // Configuration for standard input processing

// Define byte constants for character comparison
const LINE_FEED_BYTE = 0x0a;  // ASCII Line Feed character byte value (decimal 10)
const ASCII_ZERO_BYTE = 0x30; // ASCII '0' character byte value (decimal 48)
const ASCII_NINE_BYTE = 0x39; // ASCII '9' character byte value (decimal 57)

// Acquire a file stream from the Node.js 'fs' module
const sourceReader = require('node:fs').createReadStream(SYSTEM_SETTINGS.dataSourcePath);

let aggregatedNumber = 0;
let lastCharWasNumeric = false;
const mainNumericCollection = []; // Stores parsed numbers from input

// Process incoming data chunks as they become available
sourceReader.on('readable', () => {
    let inputBuffer;
    let currentBytePosition;

    inputBuffer = sourceReader.read(); // Read available data from the stream
    if (inputBuffer === null) {
        return; // No data available, exit early
    }

    // Locate the last complete line within the buffer (if any)
    for (currentBytePosition = Math.min(20, inputBuffer.length - 1);
         currentBytePosition > 0 && inputBuffer[currentBytePosition - 1] !== LINE_FEED_BYTE;
         currentBytePosition--) {
        // Decrement position until a line feed or buffer start is found
    }

    // Iterate through the buffer to parse numbers
    for (; currentBytePosition < inputBuffer.length; currentBytePosition++) {
        const currentByte = inputBuffer[currentBytePosition];

        if (currentByte >= ASCII_ZERO_BYTE && currentByte <= ASCII_NINE_BYTE) {
            // It's a digit: accumulate the number
            aggregatedNumber = (10 * aggregatedNumber) + (currentByte - ASCII_ZERO_BYTE);
            lastCharWasNumeric = true;
        } else {
            // Not a digit: if a number was being accumulated, store it
            if (lastCharWasNumeric) {
                mainNumericCollection.push(aggregatedNumber);
            }
            aggregatedNumber = 0; // Reset for the next number
            lastCharWasNumeric = false;
        }
    }
});

// Handle the end of the input stream
sourceReader.on('end', () => {
    let temporaryList;

    // If the last characters formed a number, add it to the collection
    if (lastCharWasNumeric) {
        mainNumericCollection.push(aggregatedNumber);
    }

    // Create a shallow copy of the main collection for the merge sort auxiliary array
    temporaryList = [].concat(mainNumericCollection);

    // Perform merge sort with inversion counting and output the result
    console.log(calculateInversionsMergeSort(mainNumericCollection, temporaryList, 0, mainNumericCollection.length));
});

/**
 * Performs a merge sort algorithm while counting inversions in an array.
 * This function recursively sorts the 'targetArray' and uses 'auxiliaryArray' for merging.
 *
 * @param {number[]} targetArray - The array to be sorted and for which inversions are counted.
 * @param {number[]} auxiliaryArray - A temporary array used during the merge process.
 * @param {number} startIdx - The starting index of the current sub-array.
 * @param {number} endIdx - The ending index (exclusive) of the current sub-array.
 * @returns {number} The total count of inversions in the sub-array.
 */
function calculateInversionsMergeSort(targetArray, auxiliaryArray, startIdx, endIdx) {
    let totalInversionCount, swapValue, midPoint, leftPointer, rightPointer, mergePosition;

    // Base case: sub-array of 0 or 1 element is already sorted, 0 inversions
    if ((endIdx - startIdx) <= 1) {
        return 0;
    }

    // Base case: sub-array of 2 elements
    if ((endIdx - startIdx) === 2) {
        if (targetArray[startIdx] > targetArray[startIdx + 1]) {
            // Swap elements if out of order and count 1 inversion
            swapValue = targetArray[startIdx + 1];
            targetArray[startIdx + 1] = targetArray[startIdx];
            targetArray[startIdx] = swapValue;
            return 1;
        }
        return 0; // Already sorted
    }

    totalInversionCount = 0;
    midPoint = Math.floor((startIdx + endIdx) / 2); // Find the middle point

    // Recursively sort and count inversions in the left and right halves
    totalInversionCount += calculateInversionsMergeSort(auxiliaryArray, targetArray, startIdx, midPoint);
    totalInversionCount += calculateInversionsMergeSort(auxiliaryArray, targetArray, midPoint, endIdx);

    // Merge the two sorted halves and count inversions during merge
    leftPointer = startIdx;
    rightPointer = midPoint;
    for (mergePosition = startIdx; mergePosition < endIdx; mergePosition++) {
        if (leftPointer === midPoint) {
            // Left half exhausted, take from right half
            targetArray[mergePosition] = auxiliaryArray[rightPointer++];
        } else if (rightPointer === endIdx) {
            // Right half exhausted, take from left half
            targetArray[mergePosition] = auxiliaryArray[leftPointer++];
        } else if (auxiliaryArray[leftPointer] < auxiliaryArray[rightPointer]) {
            // Element from left half is smaller, no inversion
            targetArray[mergePosition] = auxiliaryArray[leftPointer++];
        } else {
            // Element from right half is smaller, an inversion is found
            targetArray[mergePosition] = auxiliaryArray[rightPointer++];
            totalInversionCount += (midPoint - leftPointer); // Count inversions
        }
    }
    return totalInversionCount;
}