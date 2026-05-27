const settings = {
    sourcePath: '/dev/stdin', // Specifies the input file path
    lineSeparator: '\n'      // Defines the character used to separate lines in the input
};

// Read the entire content of the input file, decode it as UTF-8, and split it into an array of lines.
const inputLines = require('fs').readFileSync(settings.sourcePath, 'utf-8').split(settings.lineSeparator);

let swapCount = 0; // Global counter for element movements during the sorting process

/**
 * Performs a g-insertion sort on a given array. This is a sub-routine for Shell Sort.
 * @param {Array<number>} dataArray - The array of numbers to be partially sorted.
 * @param {number} gapValue - The gap (increment) to use for this pass of insertion sort.
 */
const insertionSortGap = (dataArray, gapValue) => {
    // Iterate through the array starting from the 'gapValue'-th element
    for (let currentIdx = gapValue; currentIdx < dataArray.length; currentIdx++) {
        const currentValue = dataArray[currentIdx]; // Store the current element to be inserted
        let compareIndex = currentIdx - gapValue;   // Initialize the index for comparison, 'gapValue' positions back

        // Shift elements that are greater than 'currentValue' to the right by 'gapValue' positions
        while (compareIndex >= 0 && dataArray[compareIndex] > currentValue) {
            dataArray[compareIndex + gapValue] = dataArray[compareIndex]; // Move element
            compareIndex -= gapValue;                                    // Move to the next element in the g-sublist
            swapCount++;                                                 // Increment the global movement counter
        }
        // Place 'currentValue' into its correct sorted position within the g-sublist
        dataArray[compareIndex + gapValue] = currentValue;
    }
};

/**
 * Implements the Shell Sort algorithm using a generated gap sequence.
 * @param {Array<number>} targetArray - The array of numbers to be sorted.
 * @returns {Array<number>} The array after it has been sorted.
 */
const performShellSort = (targetArray) => {
    // Generate the gap sequence (using Knuth's formula: h_k = 3*h_{k-1} + 1)
    const gapSequence = [1];
    for (let sequenceIdx = 1; sequenceIdx < targetArray.length; sequenceIdx++) {
        const nextGap = 3 * gapSequence[sequenceIdx - 1] + 1;
        if (nextGap > targetArray.length) {
            break; // Stop generating gaps if the next gap exceeds the array's length
        }
        gapSequence.push(nextGap);
    }

    // Output the number of gaps used and the gap sequence itself (reversed for sorting order)
    console.log(gapSequence.length);
    console.log(gapSequence.reverse().map(item => item.toString()).join(' '));

    // Apply insertion sort for each gap in the sequence, from largest to smallest
    for (let gapIdx = 0; gapIdx < gapSequence.length; gapIdx++) {
        insertionSortGap(targetArray, gapSequence[gapIdx]);
    }

    return targetArray; // Return the array after all sorting passes are complete
};

// Parse the number of elements from the first line of the input
const elementCount = parseInt(inputLines[0]);

// Extract the actual data elements from the subsequent lines and convert them to integers
const rawData = inputLines.slice(1, elementCount + 1).map(item => parseInt(item));

// Execute the Shell Sort algorithm on the prepared data
const finalSortedArray = performShellSort(rawData);

// Output the total number of element movements recorded during the sort
console.log(swapCount);

// Output the sorted array elements, each on a new line
console.log(finalSortedArray.map(item => item.toString()).join('\n'));
