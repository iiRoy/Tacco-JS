const ioSettings = { /* Configuration for input/output operations */
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const inputLines = require('fs') .readFileSync(ioSettings.sourcePath, 'utf-8') .split(ioSettings.lineDelimiter);

let swapOperations = 0; /* Counts the total number of swaps/comparisons during sorting */

/*
 * Executes a gapped insertion sort on the provided array.
 * @param {Array<number>} targetArray - The array to be sorted.
 * @param {number} gapSize - The gap (interval) for the insertion sort.
 */
const gappedInsertionSort = (targetArray, gapSize) => {
    for (let currentElementIndex = gapSize; currentElementIndex < targetArray.length; currentElementIndex++) {
        const currentValue = targetArray[currentElementIndex]; // Store the current element
        let scanIndex = currentElementIndex - gapSize;          // Initialize scan position

        // Move elements greater than currentValue forward by gapSize
        while (scanIndex >= 0 && targetArray[scanIndex] > currentValue) {
            targetArray[scanIndex + gapSize] = targetArray[scanIndex]; // Shift element
            scanIndex -= gapSize;                                    // Move scan position
            swapOperations++;                                        // Increment operation counter
        }
        targetArray[scanIndex + gapSize] = currentValue; // Place currentValue in its correct position
    }
};

/*
 * Performs the Shell Sort algorithm on an array of numbers.
 * @param {Array<number>} inputCollection - The array to be sorted.
 * @returns {Array<number>} The sorted array.
 */
const performShellSort = (inputCollection) => {

    const gapSequence = [1]; // Initial gap value
    /* Generate Knuth's gap sequence: h_k = 3 * h_{k-1} + 1 */
    for (let sequenceIndex = 1; sequenceIndex < inputCollection.length; sequenceIndex++) {
        const nextGapValue = 3 * gapSequence[sequenceIndex - 1] + 1;
        if (nextGapValue > inputCollection.length) {
            break; // Stop if the next gap is too large
        }
        gapSequence.push(nextGapValue);
    }

    // Output information about the generated gap sequence
    console.log(gapSequence.length);
    console.log(gapSequence.reverse().map(elementValue => elementValue.toString()).join(' '));

    /* Apply gapped insertion sort for each gap in the sequence */
    for (let gapIteration = 0; gapIteration < gapSequence.length; gapIteration++) {
        gappedInsertionSort(inputCollection, gapSequence[gapIteration]);
    }

    return inputCollection; // Return the sorted collection
};

// Parse the number of elements from the first line of input
const numberOfElements = parseInt(inputLines[0]);
// Extract the numerical data from subsequent lines
const rawNumbers = inputLines.slice(1, numberOfElements + 1).map(elementValue => parseInt(elementValue));

// Sort the extracted numerical data using Shell Sort
const finalSortedArray = performShellSort(rawNumbers);

// Output the total number of operations performed during sorting
console.log(swapOperations);
// Output the final sorted array, each number on a new line
console.log(finalSortedArray.map(elementValue => elementValue.toString()).join('\n'));