const programOptions = {
    input: '/dev/stdin', // Specifies the input source, typically standard input
    newline: '\n'        // Defines the newline character for splitting input
};

// Read the entire input file, decode it as UTF-8, and split it into lines.
// The first line is ignored as per the problem's typical structure (often contains N).
// The second line is processed: split by space, then each part is transformed.
// Each part 'x' is converted into an array [parseInt(x[1]), x].
// x[1] is the second character of the string, parsed as an integer (e.g., "A1" -> 1).
// x is the original string (e.g., "A1").
const rawInputLines = require('fs').readFileSync(programOptions.input, 'utf-8').split(programOptions.newline);
const parsedElements = rawInputLines[1].split(' ').map(itemString => [parseInt(itemString[1]), itemString]);

/**
 * Performs a single recursive bubble-like swap step on an array segment.
 * It compares the first two elements and ensures the smaller (based on the integer value)
 * is at the front, then recursively processes the rest.
 * @param {Array<Array<number, string>>} currentSegment - The array segment to process.
 * @returns {Array<Array<number, string>>} A new array with the first two elements potentially swapped, and the rest recursively processed.
 */
const performRecursiveBubbleSwap = currentSegment => {
    // Base case: if the segment has 0 or 1 element, it's already "sorted" for this step.
    if (currentSegment.length <= 1) {
        return currentSegment;
    }

    // Extract the first two elements and the rest of the segment.
    const firstItemInSegment = currentSegment[0];
    const secondItemInSegment = currentSegment[1];
    const remainingSegmentItems = currentSegment.slice(2);

    // Compare the integer values of the first two elements.
    if (firstItemInSegment[0] > secondItemInSegment[0]) {
        // If the first is greater than the second, swap them and recursively process the tail
        // with the original first item now in the second position.
        return [secondItemInSegment, ...performRecursiveBubbleSwap([firstItemInSegment, ...remainingSegmentItems])];
    } else {
        // If the first is not greater, keep them in order and recursively process the tail
        // with the original second item now in the second position.
        return [firstItemInSegment, ...performRecursiveBubbleSwap([secondItemInSegment, ...remainingSegmentItems])];
    }
};

/**
 * Executes a full bubble sort algorithm on an array.
 * This implementation repeatedly calls `performRecursiveBubbleSwap` to "bubble up" the largest element
 * to the end of the current unsorted portion.
 * @param {Array<Array<number, string>>} inputArrayForBubble - The array to be sorted.
 * @returns {Array<Array<number, string>>} The sorted array.
 */
const executeFullBubbleSort = inputArrayForBubble => {
    // Base case: an empty array is already sorted.
    if (inputArrayForBubble.length === 0) {
        return [];
    }

    // Perform one pass of the bubble swap, which moves the largest element to the end.
    const partiallySortedArray = performRecursiveBubbleSwap(inputArrayForBubble);

    // Separate the head (all but the last element) and the last element.
    const headPortionOfArray = partiallySortedArray.slice(0, partiallySortedArray.length - 1);
    const lastSortedElement = partiallySortedArray[partiallySortedArray.length - 1];

    // Recursively sort the head portion and then append the last sorted element.
    return [...executeFullBubbleSort(headPortionOfArray), lastSortedElement];
};

/**
 * Executes a full selection sort algorithm on an array.
 * It finds the minimum element in the array, places it at the beginning,
 * and then recursively sorts the rest of the array.
 * @param {Array<Array<number, string>>} inputArrayForSelection - The array to be sorted.
 * @returns {Array<Array<number, string>>} The sorted array.
 */
const executeFullSelectionSort = inputArrayForSelection => {
    // Base case: an empty array is already sorted.
    if (inputArrayForSelection.length === 0) {
        return [];
    }

    // Find the minimum element in the current array based on its integer value.
    const minimumFoundElement = inputArrayForSelection.reduce((currentAccumulatedMin, elementToCompare) =>
        currentAccumulatedMin[0] > elementToCompare[0] ? elementToCompare : currentAccumulatedMin
    );

    // Get the first element of the current array.
    const firstElementInSelection = inputArrayForSelection[0];

    // Create a new array by filtering out the minimum element and replacing it with the original first element
    // if the minimum element was not the first element. This maintains stability for equal elements.
    const filteredRemainingElements = inputArrayForSelection.slice(1).map(processedElement =>
        processedElement[1] === minimumFoundElement[1] ? firstElementInSelection : processedElement
    );

    // Recursively sort the filtered remaining elements and prepend the minimum element.
    return [minimumFoundElement, ...executeFullSelectionSort(filteredRemainingElements)];
};

/**
 * Checks if a sorting algorithm is stable by comparing the original string values
 * of elements at corresponding positions in two sorted arrays.
 * @param {Array<Array<number, string>>} bubbleSortedCollection - The result of a bubble sort.
 * @param {Array<Array<number, string>>} selectionSortedCollection - The result of a selection sort.
 * @returns {boolean} True if the sorting is stable, false otherwise.
 */
const checkSortingStability = (bubbleSortedCollection, selectionSortedCollection) =>
    bubbleSortedCollection.every((currentElement, currentIndex) =>
        bubbleSortedCollection[currentIndex][1] === selectionSortedCollection[currentIndex][1]
    );

// Perform bubble sort on the parsed data.
const finalBubbleSortedResult = executeFullBubbleSort(parsedElements);
// Perform selection sort on the parsed data.
const finalSelectionSortedResult = executeFullSelectionSort(parsedElements);

// Output the results.
// Print the original string values of the bubble-sorted elements, joined by spaces.
console.log(finalBubbleSortedResult.map(outputItem => outputItem[1]).join(' '));
// Indicate that bubble sort is inherently stable.
console.log('Stable');
// Print the original string values of the selection-sorted elements, joined by spaces.
console.log(finalSelectionSortedResult.map(outputItem => outputItem[1]).join(' '));
// Check and print whether the selection sort result is stable compared to the bubble sort result.
console.log(checkSortingStability(finalBubbleSortedResult, finalSelectionSortedResult) ? 'Stable' : 'Not stable');
